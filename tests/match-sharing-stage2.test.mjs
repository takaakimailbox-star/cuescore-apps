import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const require=createRequire(import.meta.url);
const {createRecordPolicy}=require("../record-access-v1.js");
const persistence=require("../match-sharing-persistence-v1.js");
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const nativeBuild=readFileSync(new URL("../scripts/build-native-web.mjs",import.meta.url),"utf8");
const serviceWorker=readFileSync(new URL("../sw.js",import.meta.url),"utf8");

const records=Array.from({length:27},(_,index)=>({
  id:`match-${String(index+1).padStart(2,"0")}`,
  endedAt:new Date(Date.UTC(2026,0,index+1)).toISOString(),
  gameType:index%2?"nineBall":"tenBall",
  result:"win",winner:1,
  players:{1:{name:"A"},2:{name:"B"}}
}));
const UUID_A="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const UUID_B="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function completed(id,extra={}){
  return {id,endedAt:"2026-09-28T00:00:00.000Z",result:"win",winner:1,players:{1:{name:"A"},2:{name:"B"}},...extra};
}

test("Free basic Statistics starts from the global newest 20 before discipline filters",()=>{
  const policy=createRecordPolicy(()=>false);
  const eligible=policy.getEligibleRecords(records);
  assert.equal(eligible.length,20);
  assert.equal(eligible[0].id,"match-27");
  assert.equal(eligible.at(-1).id,"match-08");
  assert.deepEqual(
    eligible.filter(record=>record.gameType==="nineBall"),
    records.slice().sort(policy.stableNewest).slice(0,20).filter(record=>record.gameType==="nineBall")
  );
  const filterBlock=html.slice(html.indexOf('const rawRecords=()=>{'),html.indexOf('const read=()=>',html.indexOf('const rawRecords=()=>{')));
  assert.match(filterBlock,/CueScoreRecordAccess\?\.getEligibleRecords\(validRecords\)/);
});

test("Free boundaries 19, 20, 21 and 27 use one global access policy while Pro sees 27",()=>{
  const free=createRecordPolicy(()=>false),pro=createRecordPolicy(()=>true);
  assert.equal(free.getEligibleRecords(records.slice(0,19)).length,19);
  assert.equal(free.getEligibleRecords(records.slice(0,20)).length,20);
  assert.equal(free.getEligibleRecords(records.slice(0,21)).length,20);
  assert.equal(free.getEligibleRecords(records).length,20);
  assert.equal(pro.getEligibleRecords(records).length,27);
});

test("invalid records are excluded before the global Free limit and Demo storage remains separate",()=>{
  const filterBlock=html.slice(html.indexOf('const rawRecords=()=>{'),html.indexOf('const read=()=>',html.indexOf('const rawRecords=()=>{')));
  assert.match(filterBlock,/const validRecords=records\.filter/);
  assert.match(html,/activeCueScoreDataKeyV1\(MATCH_RECORDS_KEY\)/);
  assert.match(html,/CueScoreDemoData\?\.resolveKey/);
});

test("legacy records get one persisted UUID v4 lazily and repeat sharing reuses it",()=>{
  let stored=[completed("legacy")],writes=0;
  const api={readRecords:()=>structuredClone(stored),replaceRecords:next=>{writes+=1;stored=structuredClone(next)},uuidFactory:()=>UUID_A};
  assert.equal(persistence.ensureSharedMatchId({matchId:"legacy",...api}),UUID_A);
  assert.equal(stored[0].sharedMatchId,UUID_A);
  assert.equal(persistence.ensureSharedMatchId({matchId:"legacy",...api}),UUID_A);
  assert.equal(writes,1);
  assert.equal(persistence.isUuidV4(stored[0].sharedMatchId),true);
});

test("valid existing ID is reused and malformed existing ID is rejected without writes",()=>{
  let writes=0;
  assert.equal(persistence.ensureSharedMatchId({matchId:"m1",readRecords:()=>[completed("m1",{sharedMatchId:UUID_A})],replaceRecords:()=>{writes+=1}}),UUID_A);
  assert.equal(writes,0);
  assert.throws(()=>persistence.ensureSharedMatchId({matchId:"m2",readRecords:()=>[completed("m2",{sharedMatchId:"bad"})],replaceRecords:()=>{writes+=1},uuidFactory:()=>UUID_A}),error=>error.code==="MALFORMED_SHARED_MATCH_ID");
  assert.equal(writes,0);
});

test("Demo and incomplete Matches are rejected before persistence",()=>{
  let writes=0;
  const adapter={readRecords:()=>[completed("m1")],replaceRecords:()=>{writes+=1},uuidFactory:()=>UUID_A};
  assert.throws(()=>persistence.ensureSharedMatchId({matchId:"m1",demoMode:true,...adapter}),error=>error.code==="DEMO_EXPORT_REJECTED");
  assert.throws(()=>persistence.ensureSharedMatchId({matchId:"m1",readRecords:()=>[{id:"m1",players:{1:{},2:{}}}],replaceRecords:()=>{writes+=1},uuidFactory:()=>UUID_A}),error=>error.code==="INELIGIBLE_MATCH");
  assert.equal(writes,0);
});

test("persistence failure restores the original collection and reports rollback",()=>{
  const original=[completed("m1")];let stored=structuredClone(original),attempt=0;
  assert.throws(()=>persistence.ensureSharedMatchId({
    matchId:"m1",readRecords:()=>structuredClone(stored),uuidFactory:()=>UUID_A,
    replaceRecords:next=>{attempt+=1;stored=structuredClone(next);if(attempt===1)throw new DOMException("quota","QuotaExceededError")}
  }),error=>error.name==="QuotaExceededError"&&error.sharedMatchRollbackVerified===true);
  assert.deepEqual(stored,original);
});

test("semantic read-back mismatch also restores the original collection",()=>{
  const original=[completed("m1")];let stored=structuredClone(original),reads=0;
  assert.throws(()=>persistence.persistSharedMatchId({
    matchId:"m1",sharedMatchId:UUID_A,
    readRecords:()=>{reads+=1;return reads===2?[completed("m1")]:structuredClone(stored)},
    replaceRecords:next=>{stored=structuredClone(next)}
  }),error=>error.code==="PERSISTENCE_READBACK_FAILED"&&error.sharedMatchRollbackVerified===true);
  assert.deepEqual(stored,original);
});

test("duplicate lookup scans hidden full records and excludes pending, invalid, deleted and Demo",()=>{
  const hidden=completed("hidden",{endedAt:"2020-01-01T00:00:00.000Z",sharedMatchId:UUID_A});
  const full=[...records,hidden,{id:"pending",sharedMatchId:UUID_A,players:{1:{},2:{}}},{id:"invalid",sharedMatchId:"bad"}];
  assert.equal(createRecordPolicy(()=>false).getEligibleRecords(full).some(item=>item.id==="hidden"),false);
  assert.equal(persistence.findDuplicateSharedMatchId(full,UUID_A)?.id,"hidden");
  assert.equal(persistence.findDuplicateSharedMatchId(full,UUID_A,{excludeLocalId:"hidden"}),null);
  assert.match(html,/if \(window\.CueScoreDemoData\?\.isDemo\?\.\(\)\) return null/);
});

test("Backup schema 2 accepts missing IDs, preserves valid IDs and rejects malformed or duplicate IDs",()=>{
  const start=html.indexOf("function validateBackup(value)");
  const end=html.indexOf("async function importBackupFile(file)",start);
  const context=vm.createContext({
    BACKUP_FORMAT:"cuescore-apps-backup",LEGACY_BACKUP_FORMAT:"rotation-scoreboard-backup",BACKUP_SCHEMA_VERSION:2,
    window:{CueScoreMatchSharingPersistenceV1:persistence,cueScoreNormalizePlayersToDefaultAvatarV4:value=>value},
    normalizeMatchRecordV680:record=>({...record,gameType:record.gameType||"rotation",recordSchemaVersion:Number(record.recordSchemaVersion)||1,createdByAppVersion:record.createdByAppVersion||"legacy"})
  });
  vm.runInContext(`${html.slice(start,end)};globalThis.backupApi={validateBackup,migrateBackupToCanonicalV170};`,context);
  const base={format:"cuescore-apps-backup",schemaVersion:2,players:[{id:"p1",name:"A"}],matchRecords:[completed("m1")]};
  assert.equal(context.backupApi.validateBackup(base),true);
  const withId={...base,matchRecords:[completed("m1",{sharedMatchId:UUID_A})]};
  assert.equal(context.backupApi.validateBackup(withId),true);
  assert.equal(context.backupApi.migrateBackupToCanonicalV170(withId).matchRecords[0].sharedMatchId,UUID_A);
  assert.equal(context.backupApi.validateBackup({...base,matchRecords:[completed("m1",{sharedMatchId:"bad"})]}),false);
  assert.equal(context.backupApi.validateBackup({...base,matchRecords:[completed("m1",{sharedMatchId:UUID_A}),completed("m2",{sharedMatchId:UUID_A})]}),false);
});

test("old schema 1 Backup remains replace-compatible without generating shared IDs",()=>{
  assert.match(html,/const BACKUP_SCHEMA_VERSION = 2/);
  assert.match(html,/if \(!\[1, 2\]\.includes\(schemaVersion\)\)/);
  assert.match(html,/matchRecords: safelyReadArray\(DATA_RECORD_KEY\)/);
  const legacy=completed("old");
  assert.equal(Object.hasOwn(legacy,"sharedMatchId"),false);
});

test("Merge prefers shared identity, falls back to local identity and rejects local/shared conflicts",()=>{
  let result=persistence.mergeMatchRecords([completed("local-a",{sharedMatchId:UUID_A})],[completed("local-b",{sharedMatchId:UUID_A})]);
  assert.equal(result.value.length,1);assert.equal(result.added,0);
  result=persistence.mergeMatchRecords([completed("same")],[completed("same")]);
  assert.equal(result.value.length,1);assert.equal(result.added,0);
  result=persistence.mergeMatchRecords([completed("a")],[completed("b")]);
  assert.equal(result.value.length,2);assert.equal(result.added,1);
  assert.throws(()=>persistence.mergeMatchRecords([completed("same",{sharedMatchId:UUID_A})],[completed("same",{sharedMatchId:UUID_B})]),error=>error.code==="LOCAL_SHARED_ID_CONFLICT");
});

test("Backup restore identity remains visible to duplicate protection",()=>{
  const restored=persistence.mergeMatchRecords([], [completed("restored",{sharedMatchId:UUID_A})]).value;
  assert.equal(persistence.findDuplicateSharedMatchId(restored,UUID_A)?.id,"restored");
  assert.match(html,/CueScoreMatchSharingPersistenceV1\.mergeMatchRecords\(current\.records,backup\.matchRecords\)/);
});

test("production adapters use full normal storage and do not add UI or schema migration",()=>{
  assert.match(html,/match-sharing-persistence-v1\.js/);
  assert.match(nativeBuild,/match-sharing-persistence-v1\.js/);
  assert.match(serviceWorker,/match-sharing-persistence-v1\.js/);
  assert.match(html,/window\.cueScorePrepareSharedMatchIdV1 = prepareSharedMatchIdV1/);
  assert.match(html,/window\.cueScorePersistSharedMatchIdV1 = persistSharedMatchIdV1/);
  assert.match(html,/readRecords: readMatchRecords/);
  assert.match(html,/replaceRecords: persistMatchRecordsOnlyV161/);
  assert.match(html,/uuidFactory: \(\) => crypto\.randomUUID\(\)/);
  assert.doesNotMatch(html,/sharedMatchId[^\n]*(badge|Imported|受信)/i);
});

test("History, Player aggregate and normal Detail retain the common access contract",()=>{
  assert.match(html,/sourceRecords = window\.CueScoreRecordAccess\?\.getEligibleRecords\(allSavedRecordsV1\)/);
  assert.match(html,/eligibleRecordsV1 = window\.CueScoreRecordAccess\?\.getEligibleRecords\(allSavedRecordsV1\)/);
  assert.match(html,/options\?\.source==="result"\?allSavedRecordsV1:\(window\.CueScoreRecordAccess\?\.getEligibleRecords\(allSavedRecordsV1\)/);
});
