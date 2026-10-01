import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const revision=fs.readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");
const orderSource=fs.readFileSync(new URL("../player-library-order-v1.js",import.meta.url),"utf8");
const orderContext=vm.createContext({});
vm.runInContext(orderSource,orderContext);
const orderApi=orderContext.CueScorePlayerLibraryOrderV1;

const match=(id,playerId,endedAt,extra={})=>({
  id,endedAt,players:{1:{registeredPlayerId:playerId,name:playerId},2:{registeredPlayerId:"opponent",name:"Opponent"}},...extra
});

function recordsByPlayer(records){
  return player=>records.filter(record=>Object.values(record.players||{}).some(side=>side.registeredPlayerId===player.id));
}

test("formal Player order is Main, latest completed Match descending, then registry order",()=>{
  const players=[
    {id:"c",name:"テストc"},
    {id:"d",name:"テストd"},
    {id:"e",name:"テストe",isPrimary:true},
    {id:"f",name:"テストf"}
  ];
  const records=[
    match("c-old","c","2026-09-01T10:00:00Z"),
    match("d-new","d","2026-10-01T10:00:00Z"),
    match("f-same","f","2026-09-01T10:00:00Z")
  ];
  assert.deepEqual(orderApi.orderPlayers(players,recordsByPlayer(records)).map(player=>player.id),["e","d","c","f"]);
});

test("Players without Matches and equal timestamps preserve registry registration order",()=>{
  const players=["c","d","e","f"].map(id=>({id:`uuid-${id}`,name:`テスト${id}`}));
  assert.deepEqual(orderApi.orderPlayers(players,()=>[]).map(player=>player.name),["テストc","テストd","テストe","テストf"]);
  const same=players.map((player,index)=>match(`m${index}`,player.id,"2026-10-01T12:00:00Z"));
  assert.deepEqual(orderApi.orderPlayers(players,recordsByPlayer(same)).map(player=>player.name),["テストc","テストd","テストe","テストf"]);
});

test("UUID values never break a formal-order tie",()=>{
  const players=[{id:"zzzz",name:"First"},{id:"0000",name:"Second"},{id:"mmmm",name:"Third"}];
  assert.deepEqual(orderApi.orderPlayers(players,()=>[]).map(player=>player.name),["First","Second","Third"]);
});

test("a newly completed Match moves that Player without changing registry storage",()=>{
  const players=[{id:"a",name:"A"},{id:"b",name:"B"},{id:"c",name:"C"}];
  const before=structuredClone(players);
  const records=[match("a1","a","2026-09-01T10:00:00Z"),match("b1","b","2026-09-02T10:00:00Z")];
  assert.deepEqual(orderApi.orderPlayers(players,recordsByPlayer(records)).map(player=>player.id),["b","a","c"]);
  records.push(match("c1","c","2026-10-01T10:00:00Z"));
  assert.deepEqual(orderApi.orderPlayers(players,recordsByPlayer(records)).map(player=>player.id),["c","b","a"]);
  assert.deepEqual(players,before);
});

test("in-progress records do not affect completed-Match ordering",()=>{
  const players=[{id:"a",name:"A"},{id:"b",name:"B"}];
  const records=[match("active","b","2026-12-01T10:00:00Z",{status:"in-progress"}),match("done","a","2026-10-01T10:00:00Z")];
  assert.deepEqual(orderApi.orderPlayers(players,recordsByPlayer(records)).map(player=>player.id),["a","b"]);
});

test("renderer and row-integrity revision use the shared formal order without UUID tie-break",()=>{
  assert.match(html,/CueScorePlayerLibraryOrderV1\?\.orderPlayers\([\s\S]*?recordsForRegisteredPlayer/);
  assert.match(revision,/CueScorePlayerLibraryOrderV1\?\.orderPlayers\(players,player=>window\.recordsForRegisteredPlayer/);
  const playerListBlock=revision.slice(revision.indexOf("function revisePlayerList"),revision.indexOf("function reviseRivals"));
  assert.doesNotMatch(playerListBlock,/stable\(a\.id,b\.id\)|localeCompare/);
  assert.match(playerListBlock,/querySelectorAll\(":scope > \.player-management-row-v1"\)/);
});

test("Backup Restore retains registry array order without a new Player schema field",()=>{
  assert.match(html,/const players = window\.cueScoreNormalizePlayersToDefaultAvatarV4\(value\.players\)\.map/);
  assert.match(html,/\[DATA_PLAYER_KEY, window\.cueScoreNormalizePlayersToDefaultAvatarV4\(backup\.players\)\]/);
  assert.doesNotMatch(html,/registrationOrder|playerOrderIndex|createdOrder/);
});

test("Player Delete uses the Japanese custom confirmation and no browser confirm",()=>{
  const start=html.indexOf("function showPlayerDeleteConfirmationV1");
  const end=html.indexOf("function selectRegisteredPlayer",start);
  const source=html.slice(start,end);
  assert.match(source,/role\", \"alertdialog/);
  assert.match(source,/>キャンセル<\/button><button class="is-destructive"[^>]*>削除<\/button>/);
  assert.match(source,/「\$\{player\.name\}」を削除しますか？/);
  assert.match(source,/このプレーヤーを削除しても、過去の試合履歴は残ります。/);
  assert.doesNotMatch(source,/\bconfirm\s*\(/);
});

test("Player Delete notices use neutral surfaces and stacked long Japanese copy",()=>{
  assert.match(html,/function showPlayerDeleteNoticeV1\(kind, title, message\)/);
  assert.match(html,/showPlayerDeleteNoticeV1\(\s*"blocked",\s*"プレーヤーを削除できません"/);
  assert.match(html,/showPlayerDeleteNoticeV1\("success", "プレーヤーを削除しました"/);
  assert.match(html,/\.player-delete-notice-v1 \{[\s\S]*?grid-template-columns: 24px minmax\(0,1fr\) 44px;[\s\S]*?background: #FFFFFF;/);
  assert.match(html,/\.player-delete-notice-copy-v1 strong,[\s\S]*?\.player-delete-notice-copy-v1 span[\s\S]*?display: block/);
  assert.doesNotMatch(html,/\.player-delete-notice-v1 \{[\s\S]*?background:\s*rgba\(214, 248, 232/);
});
