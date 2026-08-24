import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const script=fs.readFileSync(new URL("../player-detail-build6.js",import.meta.url),"utf8");
assert.match(script,/foulRate:"ファール率"/);
assert.match(script,/key==="foulRate"\?`\$\{Number\(value\)\.toFixed\(2\)\}%`/);
const css=fs.readFileSync(new URL("../player-detail-build6.css",import.meta.url),"utf8");
const nativeBuild=fs.readFileSync(new URL("../scripts/build-native-web.mjs",import.meta.url),"utf8");
const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");

test("two-level Player Detail assets remain in web, native, and service worker bundles",()=>{
  assert.match(html,/analysis-build4\.js[\s\S]*player-detail-build6\.js/);
  assert.match(nativeBuild,/player-detail-build6\.js/);
  assert.match(sw,/player-detail-build6\.js/);
  assert.match(html,/player-detail-build8\.css/);
  assert.match(nativeBuild,/player-detail-build8\.css/);
  assert.match(sw,/player-detail-build8\.css/);
});

test("level one is Player Info with all six discipline summary rows",()=>{
  assert.match(script,/header\("プレーヤー情報"\)/);
  assert.match(script,/競技別通算/);
  assert.match(script,/data-pd7-discipline/);
  for(const text of ["9-Ball","10-Ball","Rotation","14-1","JPA 9-Ball","3 Cushion"])assert.match(script,new RegExp(text));
  assert.match(script,/records\.length\?`\$\{wins\}勝\$\{losses\}敗`:"勝敗 —"/);
});

test("level two fixes a discipline and contains the Build 8 analytics journey",()=>{
  for(const text of ["通算","主要指標","自己ベスト","対戦相手別の成績","全試合"]){assert.match(script,new RegExp(text));}
  assert.doesNotMatch(script,/最近の試合/);
  assert.doesNotMatch(script,/プレーヤー情報へ戻る/);
  assert.doesNotMatch(script,/今の状態/);
  assert.doesNotMatch(script,/pd7-now/);
  assert.match(script,/api\.aggregate\(records,player,helpers\)/);
  assert.match(script,/api\.bests\(records,player,active,helpers\)/);
  assert.match(script,/openMatchDetailV1/);
  assert.match(script,/openPlayerOpponentRecordsV2/);
  assert.match(script,/openPlayerMatchHistoryV2/);
});

test("all disciplines keep the approved metric sets",()=>{
  assert.match(script,/"9ball":\["shotRate","breakInRate","masuwariRate","foulRate"\]/);
  assert.match(script,/rotation:\["shotRate","breakInRate","highRun","foulRate"\]/);
  assert.match(script,/jpa9:\["average","breakInRate","highRun","foulRate"\]/);
  assert.match(script,/straightPool:\["average","highRun","foulRate"\]/);
  assert.match(script,/threeCushion:\["average","highRun"\]/);
});

test("detail density is collapsed and duplicate recent matches are removed",()=>{
  assert.match(script,/bests\.slice\(0,3\)/);
  assert.doesNotMatch(script,/records\.slice\(0,3\)/);
  assert.doesNotMatch(script,/data-pd7-trend-toggle/);
  assert.match(script,/data-pd7-metric-trend="winRate"/);
  assert.match(script,/data-pd7-trend-modal hidden/);
  assert.match(script,/value==null\?"—"/);
});

test("each supported metric opens one direct trend popup",()=>{
  assert.match(script,/data-pd7-metric-trend="winRate"/);
  assert.match(script,/\["shotRate","breakInRate","masuwariRate","foulRate"\]\.includes\(key\)/);
  assert.match(script,/role="dialog" aria-modal="true"/);
  assert.match(script,/data-pd7-trend-close/);
  assert.doesNotMatch(script,/指標の変化を見る/);
  assert.doesNotMatch(script,/data-pd7-trend-key/);
});

test("rate precision is one decimal except foul rate at two decimals",()=>{
  assert.match(script,/Number\(value\)\.toFixed\(1\)/);
  assert.match(script,/Number\(value\)\.toFixed\(2\)/);
  assert.match(script,/wins\/records\.length\*100\)\.toFixed\(1\)/);
});

test("detail navigation title is game specific and the standard back button owns navigation",()=>{
  assert.match(html,/id="playerStatsTitle"/);
  assert.match(script,/header\(`\$\{def\(active\)\.label\} 詳細`,"",def\(active\)\.asset\)/);
  assert.match(script,/playerStatsBackBtn/);
  for(const text of ["Rotation","9-Ball","10-Ball","JPA 9-Ball","14-1","3 Cushion"])assert.match(script,new RegExp(text));
});

test("metric and best summaries use one responsive row without blank segments",()=>{
  assert.match(script,/pd7-metrics count-\$\{keys\.length\}/);
  assert.match(script,/pd7-bests count-\$\{Math\.min\(bests\.length,3\)\}/);
  assert.match(css,/\.pd7-metrics\.count-4\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)\}/);
  assert.match(css,/\.pd7-metrics\.count-3,\.pd7-bests\.count-3\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)\}/);
  assert.match(css,/\.pd7-metrics\.count-2,\.pd7-bests\.count-2\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/);
  assert.doesNotMatch(css,/overflow-x\s*:\s*(auto|scroll)/);
});

test("discipline detail keeps compact player and game context",()=>{
  assert.match(script,/pd7-detail-summary/);
  assert.match(script,/profile\(player,true\)/);
  assert.match(script,/state\.discipline=active/);
  assert.match(script,/value==null\?"—"/);
});

test("white cards force legible dark text and fit 390px portrait",()=>{
  assert.match(css,/color-scheme:light/);
  assert.match(css,/-webkit-text-fill-color:#171717/);
  assert.match(css,/background:#fff!important/);
  assert.match(css,/minmax\(0,1fr\)/);
  assert.match(css,/@media\(max-width:390px\)/);
  assert.match(css,/text-overflow:ellipsis/);
});
