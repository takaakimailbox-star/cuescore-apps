import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";

const index=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const revision=readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../ui-revision-v12.css",import.meta.url),"utf8");
const build18=readFileSync(new URL("../final-ui-build18.js",import.meta.url),"utf8");
const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
const nativeBuild=readFileSync(new URL("../scripts/build-native-web.mjs",import.meta.url),"utf8");
const require=createRequire(import.meta.url);
const metrics=require("../analytics-build4-metrics.js");

test("full-screen trends use aggregate SSOT for cumulative points",()=>{
  assert.match(revision,/CueScoreBuild4Metrics/);
  assert.match(revision,/aggregate\?\.\(records\.slice\(0,index\+1\),state\.player,helpers\)\?\.\[key\]/);
  assert.doesNotMatch(revision,/const values=records\.map\(record=>chartApi\(\)\?\.recordMetric/);
});

test("cumulative latest point equals the full eligible aggregate and keeps missing rates unavailable",()=>{
  const player={id:"p1"};
  const records=[
    {id:"m1",winner:1,endedAt:"2026-08-20T01:00:00Z",players:{1:{registeredPlayerId:"p1"},2:{registeredPlayerId:"p2"}}},
    {id:"m2",winner:2,endedAt:"2026-08-20T02:00:00Z",players:{1:{registeredPlayerId:"p1"},2:{registeredPlayerId:"p2"}}},
    {id:"m3",winner:1,endedAt:"2026-08-21T01:00:00Z",players:{1:{registeredPlayerId:"p1"},2:{registeredPlayerId:"p2"}}}
  ];
  const helpers={side:()=>1,won:(record,side)=>record.winner===side,metric:()=>({}),recordPlayer:(record,side)=>record.players[side],completedTurns:()=>null,discipline:()=>"9ball",masuwariCounts:()=>({1:0,2:0})};
  const points=records.map((_,index)=>metrics.aggregate(records.slice(0,index+1),player,helpers));
  const detail=metrics.aggregate(records,player,helpers);
  assert.deepEqual(points.map(point=>point.winRate),[100,50,2/3*100]);
  assert.equal(points.at(-1).winRate,detail.winRate);
  assert.equal(points.at(-1).shotRate,null);
  assert.equal(points.at(-1).breakInRate,null);
});

test("fixed 9-Ball history keeps its explicit title and adopted row contract",()=>{
  assert.match(revision,/label=`\$\{def\(active\)\.label\}の全試合`/);
  assert.match(revision,/pd13-fixed-discipline-match/);
  assert.match(revision,/journey-game-v2/);
  assert.match(css,/\.pd13-fixed-discipline-match \.journey-match-race-v3/);
  assert.match(css,/\.pd13-fixed-discipline-match/);
});

test("14-ball rerack notice is a central modal without a pull handle",()=>{
  assert.match(index,/notice\.title==="14ボールラック"/);
  assert.match(index,/\.straight-pool-rerack-modal-v18\{align-items:center/);
  assert.match(index,/\.straight-pool-rerack-modal-v18 \.cue-sheet-handle-v1\{display:none\}/);
});

test("match setup requires two registered distinct players",()=>{
  for(const text of ["プレーヤーが登録されていません","試合を始めるには2人のプレーヤーを登録してください。","対戦相手を追加","プレーヤーを追加"])assert.match(build18,new RegExp(text));
  assert.match(build18,/players\.length<2\|\|!selected\(1\)\|\|!selected\(2\)/);
  assert.match(build18,/stopImmediatePropagation/);
  assert.doesNotMatch(index,/value="プレイヤー [12]"/);
});

test("Build 18 compatibility asset precedes the Phase 1 shell and remains bundled",()=>{
  assert.ok(index.indexOf("ui-revision-v12.js")<index.indexOf("final-ui-build18.js"));
  assert.ok(index.indexOf("final-ui-build18.js")<index.indexOf("navigation-shell-phase1.js"));
  assert.match(nativeBuild,/final-ui-build18\.js/);
  assert.match(sw,/final-ui-build18\.js/);
  assert.match(sw,/2\.0-build36-match-card-c-fidelity-v1/);
});
