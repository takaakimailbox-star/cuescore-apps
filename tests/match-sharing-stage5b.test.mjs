import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync} from "node:fs";
import {stage1Fixtures} from "./helpers/match-sharing-stage1-fixtures.mjs";

const require=createRequire(import.meta.url);
const adapters=require("../match-sharing-adapters-v1.js");
const format=require("../match-sharing-format-v1.js");
const sender=require("../match-sharing-sender-v1.js");
const receiver=require("../match-sharing-receiver-v1.js");
const transaction=require("../match-sharing-transaction-v1.js");
const ui=require("../match-sharing-ui-v1.js");
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const uiSource=readFileSync(new URL("../match-sharing-ui-v1.js",import.meta.url),"utf8");
const build=readFileSync(new URL("../scripts/build-native-web.mjs",import.meta.url),"utf8");
const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
const player=(id,name,extra={})=>({id,name,avatar:{type:"default",id:"default_silhouette"},...extra});
const logical=fixture=>adapters.buildSharedMatchV1(fixture.source,{sharedMatchId:fixture.sharedMatchId});

test("receiver flow requires explicit symmetric mappings and preserves Back selections",()=>{
  const match=logical(stage1Fixtures()[0]),players=[player("a",match.players[1].name),player("b",match.players[2].name)];
  const flow=ui.createReceiverFlow({readPlayers:()=>players,importMatch:()=>({success:true,importedLocalMatchId:"m1"})});
  assert.equal(flow.setLogicalMatch(match).step,"mapping");
  assert.throws(()=>flow.next());
  flow.selectMapping(1,{kind:"existing",playerId:"a"});flow.selectMapping(2,{kind:"existing",playerId:"b"});assert.equal(flow.next().step,"confirm");
  assert.equal(flow.back().step,"mapping");assert.equal(flow.get().bySide[1].playerId,"a");assert.equal(flow.get().bySide[2].playerId,"b");
});

test("Player 1 and Player 2 cannot map to the same local Player",()=>{
  const match=logical(stage1Fixtures()[0]),flow=ui.createReceiverFlow({readPlayers:()=>[player("same","A")]});
  flow.setLogicalMatch(match);flow.selectMapping(1,{kind:"existing",playerId:"same"});
  assert.throws(()=>flow.selectMapping(2,{kind:"existing",playerId:"same"}));
  assert.equal(flow.get().bySide[2],null);
});

for(const [firstKind,secondKind] of [["existing","existing"],["new","existing"],["existing","new"],["new","new"]]){
  test(`production UI passes ${firstKind}/${secondKind} mapping to the Stage 3 adapter`,()=>{
    const match=logical(stage1Fixtures()[0]),seen=[];
    const flow=ui.createReceiverFlow({readPlayers:()=>[player("a","Local A"),player("b","Local B")],importMatch:(value,mapping)=>{seen.push({value,mapping});return{success:true,importedLocalMatchId:"local-match"}}});
    flow.setLogicalMatch(match);
    flow.selectMapping(1,firstKind==="existing"?{kind:"existing",playerId:"a"}:{kind:"new",pendingKey:"side-1",draft:{name:"New A"}});
    flow.selectMapping(2,secondKind==="existing"?{kind:"existing",playerId:"b"}:{kind:"new",pendingKey:"side-2",draft:{name:"New B"}});flow.next();
    const complete=flow.commit();assert.equal(complete.step,"complete");assert.equal(seen.length,1);assert.equal(seen[0].mapping.bySide[1].kind,firstKind);assert.equal(seen[0].mapping.bySide[2].kind,secondKind);
  });
}

test("all 18 production fixtures can traverse Preview through Final Confirmation",()=>{
  for(const fixture of stage1Fixtures()){
    const match=logical(fixture),flow=ui.createReceiverFlow({readPlayers:()=>[player("a","A"),player("b","B")],importMatch:()=>({success:true,importedLocalMatchId:`local-${fixture.fixtureId}`})});
    flow.setLogicalMatch(match);flow.selectMapping(1,{kind:"existing",playerId:"a"});flow.selectMapping(2,{kind:"existing",playerId:"b"});flow.next();assert.equal(flow.commit().result.importedLocalMatchId,`local-${fixture.fixtureId}`);
  }
});

test("all 18 production payloads complete decode, Receiver UI, atomic import and semantic read-back",async()=>{
  for(const fixture of stage1Fixtures()){
    const sourceLogical=logical(fixture);
    const payload=await format.encodeSharedMatchV1(sourceLogical,sender.runtimeCodec);
    const decoded=(await receiver.decodeScannedPayload({payload})).logicalMatch;
    const state={
      players:[player(`side-1-${fixture.fixtureId}`,decoded.players[1].name),player(`side-2-${fixture.fixtureId}`,decoded.players[2].name)],
      matches:[],
    };
    const clone=value=>structuredClone(value);
    const storageTransaction={
      perform(nextPlayers,nextMatches){const snapshot=clone(state);state.players=clone(nextPlayers);state.matches=clone(nextMatches);return{snapshot}},
      restore(snapshot){state.players=clone(snapshot.players);state.matches=clone(snapshot.matches);return true},
      matchesSnapshot(snapshot){return JSON.stringify(state)===JSON.stringify(snapshot)},
    };
    const importMatch=(logicalMatch,mappingPlan)=>transaction.importSharedMatch({
      logicalMatch,mappingPlan,readPlayers:()=>clone(state.players),readMatches:()=>clone(state.matches),transaction:storageTransaction,
      matchIdFactory:()=>`receiver-${fixture.fixtureId}`,now:Date.UTC(2026,8,28,12,0,0),appVersion:"1.1",
    });
    const flow=ui.createReceiverFlow({readPlayers:()=>state.players,importMatch});
    flow.setLogicalMatch(decoded);
    flow.selectMapping(1,{kind:"existing",playerId:`side-1-${fixture.fixtureId}`});
    flow.selectMapping(2,{kind:"existing",playerId:`side-2-${fixture.fixtureId}`});flow.next();
    const result=flow.commit().result,imported=state.matches[0];
    assert.equal(result.importedLocalMatchId,`receiver-${fixture.fixtureId}`,fixture.fixtureId);
    assert.equal(state.matches.length,1,fixture.fixtureId);
    assert.equal(imported.sharedMatchId,fixture.sharedMatchId,fixture.fixtureId);
    assert.deepEqual(adapters.buildSharedMatchV1(imported,{sharedMatchId:fixture.sharedMatchId}),sourceLogical,fixture.fixtureId);
    assert.ok(imported.analysis?.summary,fixture.fixtureId);
  }
});

test("same shared name never creates or selects a local mapping automatically",()=>{
  const match=logical(stage1Fixtures()[0]),flow=ui.createReceiverFlow({readPlayers:()=>[player("a",match.players[1].name)]});
  const state=flow.setLogicalMatch(match);assert.equal(state.bySide[1],null);assert.equal(state.bySide[2],null);
});

test("Free hidden count is global, stable across filters, and absent for Pro",()=>{
  const all=Array.from({length:27},(_,id)=>({id})),eligible=all.slice(0,20);
  assert.equal(ui.hiddenPastCount(all,eligible),7);assert.equal(ui.hiddenPastCount(all,eligible,true),0);
  const filteredVisible=eligible.filter(item=>item.id%2);assert.equal(filteredVisible.length<eligible.length,true);assert.equal(ui.hiddenPastCount(all,eligible),7);
  assert.equal(ui.hiddenPastCount(all.slice(0,20),all.slice(0,20)),0);
});

test("adopted Receiver UI, transaction, exact-ID detail and success toast are production wired",()=>{
  assert.match(html,/id="matchSharingFlowV1"/);assert.match(html,/この端末のプレーヤー/);assert.match(html,/Player 1/);assert.match(html,/Player 2/);assert.match(html,/プレーヤーを選ぶ/);assert.match(html,/openMatchSharingPlayerPickerV1/);assert.match(html,/playerLibraryModeV145 === "match-sharing"/);assert.match(html,/新しいプレーヤーとして追加/);assert.match(html,/もう一方で選択済み/);assert.match(html,/取り込み内容を確認/);assert.match(html,/取り込むまでは試合とプレーヤーは保存されません/);assert.match(html,/data-flow-import>試合を取り込む/);
  assert.doesNotMatch(uiSource,/selectedSide|selectSelf|selectOpponent|\bself\b|\bopponent\b/);
  assert.match(html,/flow\.commit\(\)/);assert.match(html,/cueScoreOpenImportedMatchDetailOnceV1/);assert.match(html,/cueScoreConsumeImportedMatchDetailOnceV1/);assert.match(html,/✓ 試合を取り込みました/);
  assert.match(html,/role","status/);assert.match(html,/aria-live","polite/);
});

test("Free History notice uses global hidden count and existing Pro CTA",()=>{
  assert.match(html,/過去の試合 \$\{hiddenPastCountV1\}件/);assert.match(html,/Freeでは最新20試合を表示しています/);assert.match(html,/Proでは過去の試合もすべて確認できます/);assert.match(html,/data-pro-history-limit/);
});

test("privacy, Demo, duplicate and error boundaries remain in the production route",()=>{
  assert.match(html,/CueScoreDemoData\?\.isDemo/);assert.match(html,/renderMatchSharingFlowV1\(flow\.get\(\)\)/);assert.doesNotMatch(html,/Imported badge|受信badge|QRから追加/);
  assert.match(html,/matchSharingReceiverMemoryV1\?\.clear/);
  assert.match(html,/この試合はすでに取り込み済みです/);assert.match(html,/同じ試合が試合履歴に保存されています。/);assert.match(html,/他の試合を読み取る/);
  assert.match(html,/await closeMatchSharingReceiverV1\(\);\s*await startMatchSharingReceiverV1\(\);/);
});

test("Stage 5B module is copied into native-web and cached offline",()=>{
  assert.match(build,/"match-sharing-ui-v1\.js"/);assert.match(sw,/"\.\/match-sharing-ui-v1\.js"/);assert.match(html,/src="\.\/match-sharing-ui-v1\.js"/);
});

test("390x844 and narrow layout preserve scroll, tap targets and reduced motion",()=>{
  assert.match(html,/height:100dvh/);assert.match(html,/min-height:54px/);assert.match(html,/@media\(max-width:360px\)/);assert.match(html,/overflow-y:auto/);assert.match(html,/@media\(prefers-reduced-motion:reduce\)/);
});
