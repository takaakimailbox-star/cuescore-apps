import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync} from "node:fs";
import {stage1Fixtures} from "./helpers/match-sharing-stage1-fixtures.mjs";

const require=createRequire(import.meta.url);
const adapters=require("../match-sharing-adapters-v1.js");
const persistence=require("../match-sharing-persistence-v1.js");
const playerDrafts=require("../match-sharing-player-drafts-v1.js");
const transaction=require("../match-sharing-transaction-v1.js");
const {createRecordPolicy}=require("../record-access-v1.js");
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const nativeBuild=readFileSync(new URL("../scripts/build-native-web.mjs",import.meta.url),"utf8");
const serviceWorker=readFileSync(new URL("../sw.js",import.meta.url),"utf8");

const NOW=Date.UTC(2026,8,28,12,0,0);
const clone=value=>structuredClone(value);
const localPlayer=(id,name,extra={})=>({id,name,memo:"",avatar:{type:"default",id:"default_silhouette"},createdAt:NOW,updatedAt:NOW,lastUsed:null,...extra});

function logicalFor(fixture=stage1Fixtures()[0]){
  return adapters.buildSharedMatchV1(fixture.source,{sharedMatchId:fixture.sharedMatchId});
}

function mappingFor(logical,first="existing",second="existing"){
  return {
    bySide:{
      1:first==="existing"?{kind:"existing",playerId:"local-self"}:{kind:"new",pendingKey:"side-1",draft:{name:logical.players[1].name}},
      2:second==="existing"?{kind:"existing",playerId:"local-opponent"}:{kind:"new",pendingKey:"side-2",draft:{name:logical.players[2].name}},
    },
  };
}

function makeHarness({logical=logicalFor(),players,failAt="",readbackMutator=null,onReadMatches=null}={}){
  const state={
    players:clone(players??[localPlayer("local-self",logical.players[1].name,{isPrimary:true}),localPlayer("local-opponent",logical.players[2].name)]),
    matches:[],
  };
  let reads=0,writes=0;
  const before=()=>clone(state);
  const storage={
    readPlayers(){
      const value=clone(state.players);
      return typeof readbackMutator==="function"?readbackMutator("players",value,reads):value;
    },
    readMatches(){
      reads+=1;
      if(typeof onReadMatches==="function"){
        const value=onReadMatches(reads,clone(state.matches));
        if(value)return value;
      }
      const value=clone(state.matches);
      return typeof readbackMutator==="function"?readbackMutator("matches",value,reads):value;
    },
    adapter:{
      perform(nextPlayers,nextMatches){
        const snapshot=before();
        try{
          writes+=1;
          if(failAt==="player-write")throw new Error("player write failed");
          state.players=clone(nextPlayers);
          if(failAt==="match-write"||failAt==="rollback-verification")throw new Error("match write failed");
          if(failAt==="quota")throw new DOMException("quota","QuotaExceededError");
          state.matches=clone(nextMatches);
          if(failAt==="raw-verification")throw new Error("raw verification mismatch");
          return {snapshot};
        }catch(error){
          if(failAt==="rollback-verification"){
            error.restoreRollbackVerified=false;
          }else{
            state.players=clone(snapshot.players);state.matches=clone(snapshot.matches);
            error.restoreRollbackVerified=true;
          }
          throw error;
        }
      },
      restore(snapshot){
        if(failAt==="outer-rollback-verification")return false;
        state.players=clone(snapshot.players);state.matches=clone(snapshot.matches);return true;
      },
      matchesSnapshot(snapshot){return JSON.stringify(state)===JSON.stringify(snapshot);},
    },
  };
  return {state,storage,before,writes:()=>writes,reads:()=>reads};
}

function importWith(harness,logical,mapping,ids=["new-player-1","new-player-2"],matchId="receiver-match-1"){
  let index=0;
  return transaction.importSharedMatch({
    logicalMatch:logical,mappingPlan:mapping,
    readPlayers:harness.storage.readPlayers,readMatches:harness.storage.readMatches,
    transaction:harness.storage.adapter,playerIdFactory:()=>ids[index++],matchIdFactory:()=>matchId,
    now:NOW,appVersion:"1.0",recordSchemaVersion:4,eventSchemaVersion:5,analysisSchemaVersion:2,
  });
}

test("Player drafts preserve the current 20-character, duplicate-name, avatar and non-primary contract",()=>{
  const existing=[localPlayer("p1","Existing",{isPrimary:true})];
  assert.equal(playerDrafts.validatePlayerDraft({name:" New Player "},existing).name,"New Player");
  assert.throws(()=>playerDrafts.validatePlayerDraft({name:""},existing),error=>error.code==="PLAYER_NAME_REQUIRED");
  assert.throws(()=>playerDrafts.validatePlayerDraft({name:"123456789012345678901"},existing),error=>error.code==="PLAYER_NAME_TOO_LONG");
  assert.throws(()=>playerDrafts.validatePlayerDraft({name:"existing"},existing),error=>error.code==="DUPLICATE_PLAYER_NAME");
  const draft=playerDrafts.createLocalPlayerDraft({name:"New Player"},{existingPlayers:existing,now:NOW,idFactory:()=>"new-id"});
  assert.deepEqual(draft.avatar,{type:"default",id:"default_silhouette"});
  assert.equal(draft.memo,"");assert.equal(Object.hasOwn(draft,"isPrimary"),false);
  assert.equal(existing[0].isPrimary,true);
});

test("mapping plan requires explicit distinct Player 1/2 mappings and rejects the legacy self/opponent contract",()=>{
  const logical=logicalFor();
  assert.throws(()=>transaction.validateMappingPlan({},logical),error=>error.code==="MISSING_MAPPING");
  assert.throws(()=>transaction.validateMappingPlan({bySide:{1:{kind:"existing",playerId:"a"}}},logical),error=>error.code==="MISSING_MAPPING");
  assert.throws(()=>transaction.validateMappingPlan({bySide:{2:{kind:"existing",playerId:"b"}}},logical),error=>error.code==="MISSING_MAPPING");
  assert.throws(()=>transaction.validateMappingPlan({selectedSide:1,self:{kind:"existing",playerId:"a"},opponent:{kind:"existing",playerId:"b"}},logical),error=>error.code==="LEGACY_MAPPING_PLAN");
  assert.throws(()=>transaction.validateMappingPlan({bySide:{1:{kind:"existing",playerId:"same"},2:{kind:"existing",playerId:"same"}}},logical),error=>error.code==="SAME_LOCAL_PLAYER");
  assert.throws(()=>transaction.validateMappingPlan({bySide:{1:{kind:"new",pendingKey:"same",draft:{name:"A"}},2:{kind:"new",pendingKey:"same",draft:{name:"B"}}}},logical),error=>error.code==="SAME_PENDING_PLAYER");
  assert.throws(()=>transaction.validateMappingPlan({bySide:{1:{name:logical.players[1].name},2:{name:logical.players[2].name}}},logical),error=>error.code==="MISSING_MAPPING");
});

test("symmetric Player 1/2 mapping is independent of the receiver main Player",()=>{
  const logical=logicalFor();
  const players=[localPlayer("main","貴章",{isPrimary:true}),localPlayer("side-1",logical.players[1].name),localPlayer("side-2",logical.players[2].name)];
  const harness=makeHarness({logical,players});
  importWith(harness,logical,{bySide:{1:{kind:"existing",playerId:"side-1"},2:{kind:"existing",playerId:"side-2"}}});
  assert.equal(harness.state.matches[0].players[1].registeredPlayerId,"side-1");
  assert.equal(harness.state.matches[0].players[2].registeredPlayerId,"side-2");
  assert.equal(harness.state.players.find(player=>player.id==="main").isPrimary,true);
  assert.equal(harness.state.matches[0].players[1].registeredPlayerId==="main",false);
  assert.equal(harness.state.matches[0].players[2].registeredPlayerId==="main",false);
});

test("third-party ゆな vs かいと import keeps main 貴章 unchanged and outside both mapped sides",()=>{
  const logical=logicalFor();
  logical.players[1].name="ゆな";logical.players[2].name="かいと";
  const players=[localPlayer("main-takaaki","貴章",{isPrimary:true}),localPlayer("local-yuna","ゆな"),localPlayer("local-kaito","かいと")];
  const harness=makeHarness({logical,players}),before=clone(players[0]);
  importWith(harness,logical,{bySide:{1:{kind:"existing",playerId:"local-yuna"},2:{kind:"existing",playerId:"local-kaito"}}});
  const imported=harness.state.matches[0];
  assert.deepEqual(harness.state.players.find(player=>player.id==="main-takaaki"),before);
  assert.equal(imported.players[1].registeredPlayerId,"local-yuna");
  assert.equal(imported.players[2].registeredPlayerId,"local-kaito");
  assert.equal(Object.values(imported.players).some(player=>player.registeredPlayerId==="main-takaaki"),false);
});

test("third-party import contributes to both mapped Player collections and not to the receiver main Player",()=>{
  const logical=logicalFor();
  logical.players[1].name="ゆな";logical.players[2].name="かいと";
  const players=[localPlayer("main-takaaki","貴章",{isPrimary:true}),localPlayer("local-yuna","ゆな"),localPlayer("local-kaito","かいと")];
  const harness=makeHarness({logical,players});
  importWith(harness,logical,{bySide:{1:{kind:"existing",playerId:"local-yuna"},2:{kind:"existing",playerId:"local-kaito"}}});
  const recordsFor=playerId=>harness.state.matches.filter(record=>[1,2].some(side=>record.players?.[side]?.registeredPlayerId===playerId));
  assert.equal(recordsFor("local-yuna").length,1);
  assert.equal(recordsFor("local-kaito").length,1);
  assert.equal(recordsFor("main-takaaki").length,0);
});

for(const [selfKind,opponentKind] of [["existing","existing"],["new","existing"],["existing","new"],["new","new"]]){
  test(`atomic import supports ${selfKind}/${opponentKind} Player mapping`,()=>{
    const logical=logicalFor();
    const initial=[];
    if(selfKind==="existing")initial.push(localPlayer("local-self",logical.players[1].name,{isPrimary:true}));
    if(opponentKind==="existing")initial.push(localPlayer("local-opponent",logical.players[2].name));
    const harness=makeHarness({logical,players:initial});
    const result=importWith(harness,logical,mappingFor(logical,selfKind,opponentKind));
    assert.equal(result.success,true);assert.equal(result.importedLocalMatchId,"receiver-match-1");
    assert.equal(result.sharedMatchId,logical.sharedMatchId);
    assert.equal(result.createdPlayerIds.length,(selfKind==="new")+(opponentKind==="new"));
    assert.equal(harness.state.matches.length,1);
    assert.equal(harness.state.matches[0].players[1].registeredPlayerId,selfKind==="new"?"new-player-1":"local-self");
    assert.equal(harness.state.matches[0].players[2].registeredPlayerId,opponentKind==="new"?(selfKind==="new"?"new-player-2":"new-player-1"):"local-opponent");
  });
}

test("missing, deleted, invalid, duplicate-name, long-name and colliding generated Player mappings reject before writes",()=>{
  const logical=logicalFor(),base=makeHarness({logical});
  const cases=[
    [{bySide:{1:{kind:"existing",playerId:"missing"},2:{kind:"existing",playerId:"local-opponent"}}},"INVALID_LOCAL_PLAYER"],
    [{bySide:{1:{kind:"existing",playerId:"broken"},2:{kind:"existing",playerId:"local-opponent"}}},"INVALID_LOCAL_PLAYER",[...base.state.players,{id:"broken",name:""}]],
    [mappingFor(logical,"new","existing"),"DUPLICATE_PLAYER_NAME",[...base.state.players,localPlayer("same-name",logical.players[1].name)]],
    [{bySide:{...mappingFor(logical,"new","existing").bySide,1:{kind:"new",draft:{name:"123456789012345678901"}}}},"PLAYER_NAME_TOO_LONG"],
  ];
  for(const [mapping,code,players] of cases){
    const harness=makeHarness({logical,players:players??base.state.players}),snapshot=harness.before();
    assert.throws(()=>importWith(harness,logical,mapping),error=>error.code===code);
    assert.deepEqual(harness.state,snapshot);assert.equal(harness.writes(),0);
  }
  const collision=makeHarness({logical,players:[localPlayer("local-opponent",logical.players[2].name)]});
  assert.throws(()=>importWith(collision,logical,mappingFor(logical,"new","existing"),["local-opponent"]),error=>error.code==="PLAYER_ID_COLLISION");
  assert.equal(collision.writes(),0);
});

test("all 6 disciplines and 18 Stage 1 fixtures reconstruct receiver-local records with semantic parity",()=>{
  const seen=new Set();
  for(const fixture of stage1Fixtures()){
    const logical=logicalFor(fixture);seen.add(logical.gameType);
    const harness=makeHarness({logical});
    const result=importWith(harness,logical,mappingFor(logical),[],`receiver-${fixture.fixtureId}`);
    const imported=harness.state.matches[0];
    assert.equal(result.sharedMatchId,fixture.sharedMatchId);
    assert.notEqual(imported.id,fixture.source.id);
    assert.equal(imported.sharedMatchId,fixture.sharedMatchId);
    assert.equal(JSON.stringify(imported).includes("sender-player-"),false);
    assert.deepEqual(adapters.buildSharedMatchV1(imported,{sharedMatchId:fixture.sharedMatchId}),logical);
  }
  assert.deepEqual([...seen].sort(),["jpa9Ball","nineBall","rotation","straightPool","tenBall","threeCushion"]);
});

test("receiver-local reconstruction uses empty local-only defaults and contains no sender privacy data",()=>{
  const fixture=stage1Fixtures()[0],logical=logicalFor(fixture),harness=makeHarness({logical});
  importWith(harness,logical,mappingFor(logical));
  const record=harness.state.matches[0],text=JSON.stringify(record);
  assert.equal(record.category,"");assert.equal(record.season,"");assert.deepEqual(record.playerReflections,{});assert.equal(record.reflection,null);
  for(const forbidden of ["sender-player-a","sender-player-b","Private category","Private season","Private reflection","sender-device","data:image"]){
    assert.equal(text.includes(forbidden),false);
  }
  assert.deepEqual(record.eventLog.journal,[]);assert.equal(record.eventLog.undoCount,0);
});

test("duplicate protection rejects first-gate, final-gate, Free-hidden and restored duplicates without creating Players",()=>{
  const logical=logicalFor(),duplicate={id:"dup",sharedMatchId:logical.sharedMatchId,endedAt:logical.endedAt,result:"win",winner:1,players:{1:{name:"A"},2:{name:"B"}}};
  const first=makeHarness({logical,players:[]});first.state.matches.push(duplicate);const firstSnapshot=first.before();
  assert.throws(()=>importWith(first,logical,mappingFor(logical,"new","new")),error=>error.code==="DUPLICATE_SHARED_MATCH_ID");
  assert.deepEqual(first.state,firstSnapshot);assert.equal(first.writes(),0);

  const final=makeHarness({logical,players:[],onReadMatches:(count,current)=>count===2?[...current,duplicate]:current});
  assert.throws(()=>importWith(final,logical,mappingFor(logical,"new","new")),error=>error.code==="DUPLICATE_SHARED_MATCH_ID");
  assert.equal(final.state.players.length,0);assert.equal(final.writes(),0);

  const many=Array.from({length:21},(_,index)=>({id:`m${index}`,endedAt:new Date(NOW+index).toISOString(),result:"win",winner:1,players:{1:{name:"A"},2:{name:"B"}}}));
  many[0]=duplicate;
  assert.equal(createRecordPolicy(()=>false).getEligibleRecords(many).some(record=>record.id==="dup"),false);
  assert.equal(persistence.findDuplicateSharedMatchId(many,logical.sharedMatchId)?.id,"dup");
  const restored=persistence.mergeMatchRecords([],many).value;
  assert.equal(persistence.findDuplicateSharedMatchId(restored,logical.sharedMatchId)?.id,"dup");
});

test("first import succeeds and a second import of the same sharedMatchId creates no Player or Match",()=>{
  const logical=logicalFor(),harness=makeHarness({logical,players:[]});
  importWith(harness,logical,mappingFor(logical,"new","new"));
  const snapshot=harness.before(),writes=harness.writes();
  assert.throws(()=>importWith(harness,logical,mappingFor(logical,"new","new"),["later-a","later-b"],"receiver-match-2"),error=>error.code==="DUPLICATE_SHARED_MATCH_ID");
  assert.deepEqual(harness.state,snapshot);assert.equal(harness.writes(),writes);
});

test("deleted active Match can be re-imported with existing local Players and becomes duplicate again",()=>{
  const logical=logicalFor(),harness=makeHarness({logical,players:[]});
  const first=importWith(harness,logical,mappingFor(logical,"new","new"),["first-a","first-b"],"first-match");
  const deletionBackup=clone(harness.state.matches);
  harness.state.matches=[];
  assert.equal(persistence.findDuplicateSharedMatchId(harness.state.matches,logical.sharedMatchId),null);
  assert.equal(persistence.findDuplicateSharedMatchId(deletionBackup,logical.sharedMatchId)?.id,"first-match");
  const reimport=importWith(harness,logical,{bySide:{1:{kind:"existing",playerId:"first-a"},2:{kind:"existing",playerId:"first-b"}}},[],"reimported-match");
  assert.equal(first.sharedMatchId,reimport.sharedMatchId);
  assert.notEqual(first.importedLocalMatchId,reimport.importedLocalMatchId);
  assert.equal(harness.state.matches.length,1);
  assert.equal(harness.state.players.length,2);
  assert.throws(()=>importWith(harness,logical,{bySide:{1:{kind:"existing",playerId:"first-a"},2:{kind:"existing",playerId:"first-b"}}},[],"third-match"),error=>error.code==="DUPLICATE_SHARED_MATCH_ID");
});

test("restoring a deleted active Match makes its sharedMatchId duplicate again",()=>{
  const logical=logicalFor(),harness=makeHarness({logical,players:[]});
  importWith(harness,logical,mappingFor(logical,"new","new"),["restore-a","restore-b"],"restored-match");
  const deletionBackup=clone(harness.state.matches);
  harness.state.matches=[];
  assert.equal(persistence.findDuplicateSharedMatchId(harness.state.matches,logical.sharedMatchId),null);
  harness.state.matches=persistence.mergeMatchRecords(harness.state.matches,deletionBackup).value;
  assert.equal(persistence.findDuplicateSharedMatchId(harness.state.matches,logical.sharedMatchId)?.id,"restored-match");
  const snapshot=harness.before(),writes=harness.writes();
  assert.throws(()=>importWith(harness,logical,{bySide:{1:{kind:"existing",playerId:"restore-a"},2:{kind:"existing",playerId:"restore-b"}}},[],"blocked-match"),error=>error.code==="DUPLICATE_SHARED_MATCH_ID");
  assert.deepEqual(harness.state,snapshot);assert.equal(harness.writes(),writes);
});

test("all 6 disciplines support active delete then existing-Player re-import with a new local Match ID",()=>{
  const fixturesByDiscipline=new Map();
  for(const fixture of stage1Fixtures()){
    const gameType=logicalFor(fixture).gameType;
    if(!fixturesByDiscipline.has(gameType))fixturesByDiscipline.set(gameType,fixture);
  }
  for(const fixture of fixturesByDiscipline.values()){
    const logical=logicalFor(fixture),harness=makeHarness({logical,players:[]});
    importWith(harness,logical,mappingFor(logical,"new","new"),[`${fixture.fixtureId}-a`,`${fixture.fixtureId}-b`],`${fixture.fixtureId}-first`);
    harness.state.matches=[];
    const result=importWith(harness,logical,{bySide:{1:{kind:"existing",playerId:`${fixture.fixtureId}-a`},2:{kind:"existing",playerId:`${fixture.fixtureId}-b`}}},[],`${fixture.fixtureId}-reimport`);
    assert.equal(result.importedLocalMatchId,`${fixture.fixtureId}-reimport`,fixture.gameType);
    assert.equal(harness.state.matches.length,1,fixture.gameType);
    assert.equal(harness.state.players.length,2,fixture.gameType);
  }
  assert.equal(fixturesByDiscipline.size,6);
});

test("receiver local Match ID must be new and separate from sharedMatchId",()=>{
  const logical=logicalFor(),existingHarness=makeHarness({logical});
  existingHarness.state.matches.push({id:"taken",endedAt:logical.endedAt,result:"win",winner:1,players:{1:{name:"A"},2:{name:"B"}}});
  assert.throws(()=>importWith(existingHarness,logical,mappingFor(logical),[],"taken"),error=>error.code==="LOCAL_MATCH_ID_COLLISION");
  const sharedHarness=makeHarness({logical});
  assert.throws(()=>importWith(sharedHarness,logical,mappingFor(logical),[],logical.sharedMatchId),error=>error.code==="LOCAL_MATCH_ID_COLLISION");
  assert.equal(existingHarness.writes(),0);assert.equal(sharedHarness.writes(),0);
});

for(const failure of ["player-write","match-write","quota","raw-verification"]){
  test(`${failure} leaves zero partial Player or Match state`,()=>{
    const logical=logicalFor(),harness=makeHarness({logical,players:[],failAt:failure}),snapshot=harness.before();
    assert.throws(()=>importWith(harness,logical,mappingFor(logical,"new","new")),error=>["TRANSACTION_WRITE_FAILED","QUOTA_EXCEEDED"].includes(error.code));
    assert.deepEqual(harness.state,snapshot);
  });
}

test("semantic read-back mismatch rolls both collections back",()=>{
  const logical=logicalFor();let mutated=false;
  const harness=makeHarness({logical,players:[],readbackMutator:(kind,value)=>{
    if(kind==="matches"&&value.length&&!mutated){mutated=true;value[0].winner=2;}
    return value;
  }}),snapshot=harness.before();
  assert.throws(()=>importWith(harness,logical,mappingFor(logical,"new","new")),error=>error.code==="READBACK_MISMATCH");
  assert.deepEqual(harness.state,snapshot);
});

test("rollback verification failure is classified as critical",()=>{
  const logical=logicalFor(),inner=makeHarness({logical,players:[],failAt:"rollback-verification"});
  assert.throws(()=>importWith(inner,logical,mappingFor(logical,"new","new")),error=>error.code==="ROLLBACK_VERIFICATION_FAILED");
  const outer=makeHarness({logical,players:[],failAt:"outer-rollback-verification",readbackMutator:(kind,value)=>{
    if(kind==="matches"&&value.length)value[0].winner=2;return value;
  }});
  assert.throws(()=>importWith(outer,logical,mappingFor(logical,"new","new")),error=>error.code==="ROLLBACK_VERIFICATION_FAILED");
});

test("Demo import rejects before any storage read or write and preserves normal and Demo snapshots",()=>{
  const logical=logicalFor();let reads=0,writes=0;
  assert.throws(()=>transaction.importSharedMatch({
    logicalMatch:logical,mappingPlan:mappingFor(logical),demoMode:true,
    readPlayers:()=>{reads+=1;return[]},readMatches:()=>{reads+=1;return[]},
    transaction:{perform(){writes+=1},restore(){},matchesSnapshot(){}},
  }),error=>error.code==="DEMO_IMPORT_REJECTED");
  assert.equal(reads,0);assert.equal(writes,0);
});

test("Free Case C one-shot access is exact-ID, consume-before-open, memory-only and non-propagating",()=>{
  const access=transaction.createOneShotImportedDetailAccess(),records=[{id:"old-import"},{id:"other"}];
  access.grant("old-import");
  assert.equal(access.consume("wrong",id=>records.find(record=>record.id===id)),null);
  assert.equal(access.has("old-import"),true);
  assert.equal(access.consume("old-import",id=>records.find(record=>record.id===id))?.id,"old-import");
  assert.equal(access.consume("old-import",()=>records[0]),null);
  access.grant("old-import");
  assert.throws(()=>access.consume("old-import",()=>{throw new Error("render failed")}),/render failed/);
  assert.equal(access.consume("old-import",()=>records[0]),null);
  access.grant("old-import");access.clear();assert.equal(access.has("old-import"),false);
  assert.equal(transaction.createOneShotImportedDetailAccess().has("old-import"),false);
});

test("Free Cases A, B and C save to the full collection while only Case C needs exact-ID one-shot access",()=>{
  const policy=createRecordPolicy(()=>false);
  const runCase=({count,existingStart,importedAt,id})=>{
    const logical=logicalFor();
    logical.startedAt=new Date(importedAt-60000).toISOString();logical.endedAt=new Date(importedAt).toISOString();
    const harness=makeHarness({logical});
    harness.state.matches=Array.from({length:count},(_,index)=>({
      id:`existing-${id}-${index}`,endedAt:new Date(existingStart+index).toISOString(),result:"win",winner:1,
      players:{1:{name:"A"},2:{name:"B"}},
    }));
    const result=importWith(harness,logical,mappingFor(logical),[],id);
    return {result,harness,eligible:policy.getEligibleRecords(harness.state.matches)};
  };
  const caseA=runCase({count:19,existingStart:NOW-100000,importedAt:NOW,id:"case-a"});
  assert.equal(caseA.harness.state.matches.length,20);assert.equal(caseA.eligible.some(record=>record.id==="case-a"),true);
  const caseB=runCase({count:20,existingStart:NOW-100000,importedAt:NOW,id:"case-b"});
  assert.equal(caseB.harness.state.matches.length,21);assert.equal(caseB.eligible.some(record=>record.id==="case-b"),true);
  const caseC=runCase({count:20,existingStart:NOW,importedAt:NOW-100000,id:"case-c"});
  assert.equal(caseC.harness.state.matches.length,21);assert.equal(caseC.eligible.some(record=>record.id==="case-c"),false);
  const access=transaction.createOneShotImportedDetailAccess();access.grant(caseC.result.importedLocalMatchId);
  assert.equal(access.consume("case-c",wanted=>caseC.harness.state.matches.find(record=>record.id===wanted))?.id,"case-c");
  assert.equal(access.consume("case-c",()=>caseC.harness.state.matches.at(-1)),null);
});

test("Import result supports Stage 2 Backup identity and restored duplicate detection",()=>{
  const logical=logicalFor(),harness=makeHarness({logical});
  const result=importWith(harness,logical,mappingFor(logical));
  const backup=clone(harness.state.matches);
  assert.equal(backup[0].sharedMatchId,result.sharedMatchId);
  harness.state.matches=[];
  harness.state.matches=persistence.mergeMatchRecords(harness.state.matches,backup).value;
  assert.equal(persistence.findDuplicateSharedMatchId(harness.state.matches,result.sharedMatchId)?.id,result.importedLocalMatchId);
});

test("production wiring preserves Stage 3 Restore safety when Stage 5B connects the adopted import UI",()=>{
  for(const file of ["match-sharing-validation-v1.js","match-sharing-adapters-v1.js","match-sharing-player-drafts-v1.js","match-sharing-transaction-v1.js"]){
    assert.match(html,new RegExp(file.replaceAll(".","\\.")));
    assert.match(nativeBuild,new RegExp(file.replaceAll(".","\\.")));
    assert.match(serviceWorker,new RegExp(file.replaceAll(".","\\.")));
  }
  assert.match(html,/performLocalRestoreTransactionV160\([\s\S]*PLAYER_LIBRARY_KEY,MATCH_RECORDS_KEY/);
  assert.match(html,/window\.cueScoreImportSharedMatchV1 = importSharedMatchV1/);
  assert.match(html,/window\.cueScoreConsumeImportedMatchDetailOnceV1 = consumeImportedMatchDetailOnceV1/);
  assert.match(html,/id="matchSharingReceiverV1"/);
  assert.match(html,/id="matchSharingScannerStateV1"/);
  assert.match(html,/id="matchSharingFlowV1"/);
  assert.match(html,/flow\.commit\(\)/);
  assert.match(html,/cueScoreOpenImportedMatchDetailOnceV1/);
});
