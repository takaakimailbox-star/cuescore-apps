import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

function extractFunction(name){
  const start=html.indexOf(`function ${name}(`);
  assert.notEqual(start,-1,`missing ${name}`);
  const brace=html.indexOf("{",start);
  let depth=0;
  for(let index=brace;index<html.length;index+=1){
    if(html[index]==="{")depth+=1;
    if(html[index]==="}"&&--depth===0)return html.slice(start,index+1);
  }
  throw new Error(`unterminated ${name}`);
}

const identitySource=`${extractFunction("recordsForRegisteredPlayer")}\n${extractFunction("playerSideInRecord")}`;

function identityHarness(players,records){
  const context=vm.createContext({
    readPlayerLibrary:()=>structuredClone(players),
    readMatchRecords:()=>structuredClone(records),
    window:{CueScoreRecordAccess:{getEligibleRecords:value=>value}}
  });
  vm.runInContext(identitySource,context);
  return context;
}

function deleteHarness({players,inProgress=null}){
  const state={players:structuredClone(players),backups:[],refreshes:[],notices:[]};
  const context=vm.createContext({
    readPlayerLibrary:()=>structuredClone(state.players),
    writePlayerLibrary:value=>{state.players=structuredClone(value);},
    createDestructiveBackupV132:(...args)=>state.backups.push(structuredClone(args)),
    refreshAfterDestructiveChangeV132:value=>state.refreshes.push(value),
    showPlayerDeleteNoticeV1:(...args)=>state.notices.push(args),
    showPlayerDeleteConfirmationV1:()=>{},
    showPlayerLibraryMain:()=>{},
    readInProgressMatchV1:()=>inProgress,
    currentGameSessionIdV104:null,
    gameEnded:false,
    currentGameRecordSaved:false,
    selectedRegisteredPlayer:{1:null,2:null},
    raceValueToStep:value=>value,
    el:()=>null
  });
  vm.runInContext(extractFunction("deletePlayerByIdV1"),context);
  return {state,deletePlayer:id=>context.deletePlayerByIdV1(id,{confirmed:true})};
}

test("Registration has no Delete; Edit has Delete; Player Detail has no Delete",()=>{
  assert.match(html,/class="player-editor-delete hidden"[^>]*id="playerEditorDeleteBtn"/);
  assert.match(html,/playerEditorDeleteBtn"\)\.classList\.toggle\("hidden", !player\)/);
  assert.doesNotMatch(html,/data-player-detail-delete/);
  assert.doesNotMatch(html,/\.player-editor-delete\s*\{\s*display:\s*none\s*!important/);
});

test("Player ID is absent from visible UI and retained as internal identity",()=>{
  assert.doesNotMatch(html,/id="playerEditorIdV1"/);
  assert.doesNotMatch(html,/>Player ID</);
  assert.match(html,/\{id:makePlayerId\(\), name/);
  assert.match(html,/registeredPlayerId:selectedRegisteredPlayer\[1\]\|\|null/);
  assert.match(html,/normalized\.registeredPlayerId = String\(normalized\.registeredPlayerId\)\.trim\(\)/);
});

test("hard delete removes only the registry Player and preserves completed historical records",()=>{
  const players=[{id:"a",name:"A",isPrimary:false},{id:"b",name:"B",isPrimary:false}];
  const records=Array.from({length:10},(_,index)=>({id:`m${index}`,winner:index%2?1:2,players:{1:{registeredPlayerId:"a",name:"A",score:index},2:{registeredPlayerId:"b",name:"B",score:index+1}},eventLog:{events:[{type:"score"}]},analysis:{progress:[index]}}));
  const before=structuredClone(records);
  const harness=deleteHarness({players});
  assert.equal(harness.deletePlayer("b"),true);
  assert.deepEqual(harness.state.players.map(player=>player.id),["a"]);
  assert.deepEqual(records,before);
  assert.equal(records.length,10);
  assert.equal(records.every(record=>record.players[2].name==="B"),true);
  assert.equal(records.every(record=>record.eventLog.events.length===1&&record.analysis.progress.length===1),true);
});

test("remaining Player analytics, outcomes, discipline data and VS retain deleted opponent matches",()=>{
  const playerA={id:"a",name:"A"};
  const records=[
    {id:"m1",disciplineId:"9ball",winner:1,players:{1:{registeredPlayerId:"a",name:"A",score:7},2:{registeredPlayerId:"deleted-b",name:"B",score:5}}},
    {id:"m2",disciplineId:"10ball",winner:2,players:{1:{registeredPlayerId:"a",name:"A",score:3},2:{registeredPlayerId:"deleted-b",name:"B",score:5}}}
  ];
  const context=identityHarness([playerA],records);
  const matched=context.recordsForRegisteredPlayer(playerA);
  assert.equal(matched.length,2);
  assert.deepEqual([...matched].map(record=>record.disciplineId).sort(),["10ball","9ball"]);
  assert.equal(matched.filter(record=>record.winner===context.playerSideInRecord(record,playerA)).length,1);
  assert.equal(matched.every(record=>record.players[context.playerSideInRecord(record,playerA)===1?2:1].name==="B"),true);
});

test("ID-bearing records use exact ID; only ID-less Legacy records may use name fallback",()=>{
  const old={id:"old-yamada",name:"山田太郎"};
  const replacement={id:"new-yamada",name:"山田太郎"};
  const idRecord={id:"old",players:{1:{registeredPlayerId:old.id,name:old.name},2:{registeredPlayerId:"x",name:"X"}}};
  const legacyRecord={id:"legacy",players:{1:{name:replacement.name},2:{name:"Legacy Opponent"}}};
  const context=identityHarness([replacement],[idRecord,legacyRecord]);
  assert.equal(context.playerSideInRecord(idRecord,replacement),null);
  assert.equal(context.playerSideInRecord(legacyRecord,replacement),1);
  assert.deepEqual(context.recordsForRegisteredPlayer(replacement).map(record=>record.id),["legacy"]);
});

test("deleting the Main Player permits zero Main Players and does not auto-promote",()=>{
  const harness=deleteHarness({players:[{id:"main",name:"Main",isPrimary:true},{id:"other",name:"Other",isPrimary:false}]});
  assert.equal(harness.deletePlayer("main"),true);
  assert.equal(harness.state.players.length,1);
  assert.equal(harness.state.players.filter(player=>player.isPrimary===true).length,0);
});

test("an in-progress participant is blocked before confirmation, backup or registry write",()=>{
  const harness=deleteHarness({
    players:[{id:"active",name:"Active",isPrimary:false}],
    inProgress:{schemaVersion:1,state:{currentGameSessionIdV104:"session",gameEnded:false,currentGameRecordSaved:false,selectedRegisteredPlayer:{1:"active",2:"other"}}}
  });
  assert.equal(harness.deletePlayer("active"),false);
  assert.equal(harness.state.players.length,1);
  assert.equal(harness.state.backups.length,0);
  assert.deepEqual(harness.state.notices[0],["blocked","プレーヤーを削除できません","このプレーヤーは中断中の試合で使用されています。試合を終了または破棄してから削除してください。"]);
});

test("completed-match participant deletion is allowed and keeps beforeDelete safety backup",()=>{
  const harness=deleteHarness({players:[{id:"done",name:"Done",isPrimary:false}],inProgress:null});
  assert.equal(harness.deletePlayer("done"),true);
  assert.equal(harness.state.players.length,0);
  assert.equal(harness.state.backups.length,1);
  assert.equal(harness.state.backups[0][0],"delete-player");
  assert.equal(harness.state.backups[0][2].players[0].id,"done");
  assert.deepEqual(harness.state.backups[0][2].matchRecords,[]);
});

test("deleted historical avatar resolves through neutral fallback without schema rewrite",()=>{
  assert.match(html,/function historicalPlayerProfileV1\(data, registeredPlayers = readPlayerLibrary\(\)\)/);
  assert.match(html,/registeredId\s*\? registeredPlayers\.find\(player => String\(player\?\.id \|\| ""\)\.trim\(\) === registeredId\)\s*:\s*registeredPlayers\.find\(player => String\(player\?\.name \|\| ""\)\.trim\(\)\.toLocaleLowerCase\("ja"\) === normalizedName\)/);
  assert.match(html,/return registered \|\| \{\.\.\.source, avatar:\{\.\.\.DEFAULT_PLAYER_AVATAR_V4\}\}/);
  assert.match(html,/const recordPlayerV3 = data => historicalPlayerProfileV1\(data, recordPlayersV3\)/);
  assert.match(html,/const opponentLibrary = data => historicalPlayerProfileV1\(data,readPlayerLibrary\(\)\)/);
  assert.match(html,/const DEFAULT_PLAYER_AVATAR_ID_V4 = "default_silhouette"/);
  assert.match(html,/const DEFAULT_PLAYER_AVATAR_SOURCE_V4 = "assets\/icons\/avatar\/default\/avatar_default_silhouette\.png"/);
});

test("Backup Restore and Match Sharing keep IDs, shared identity and duplicate protection",()=>{
  assert.match(html,/normalized\.registeredPlayerId = String\(normalized\.registeredPlayerId\)\.trim\(\)/);
  assert.match(html,/findDuplicateSharedMatchIdV1\(sharedMatchId/);
  assert.match(html,/readMatchRecords\(\), sharedMatchId/);
  const transaction=fs.readFileSync(new URL("../match-sharing-transaction-v1.js",import.meta.url),"utf8");
  assert.match(transaction,/sharedMatchId:logical\.sharedMatchId/);
  assert.match(transaction,/findDuplicateSharedMatchId\(initialMatches,logical\.sharedMatchId\)/);
  assert.match(transaction,/findDuplicateSharedMatchId\(finalMatches,logical\.sharedMatchId\)/);
});

test("active dashboard, ranking and formal analytics start from registered Players only",()=>{
  assert.match(html,/return registered\.map\(player => \(\{ id: String\(player\.id\), name: String\(player\.name\) \}\)\)/);
  assert.match(html,/const registeredPlayers = safePlayers\(\)\.filter\(p => p\?\.id && p\?\.name\)/);
  assert.match(html,/if \(!registered\) return;/);
  assert.match(html,/if\(p\?\.id&&p\?\.name\)active\.push/);
});
