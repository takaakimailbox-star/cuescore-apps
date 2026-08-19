import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const script=fs.readFileSync(new URL("../player-detail-build6.js",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../player-detail-build6.css",import.meta.url),"utf8");
const nativeBuild=fs.readFileSync(new URL("../scripts/build-native-web.mjs",import.meta.url),"utf8");
const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");

test("two-level Player Detail assets remain in web, native, and service worker bundles",()=>{
  assert.match(html,/analysis-build4\.js[\s\S]*player-detail-build6\.js/);
  assert.match(nativeBuild,/player-detail-build6\.js/);
  assert.match(sw,/player-detail-build6\.js/);
});

test("level one is Player Info with all six discipline summary rows",()=>{
  assert.match(script,/header\("プレーヤー情報"\)/);
  assert.match(script,/競技別通算/);
  assert.match(script,/data-pd7-discipline/);
  for(const text of ["9-Ball","10-Ball","Rotation","14-1","JPA 9-Ball","3 Cushion"])assert.match(script,new RegExp(text));
  assert.match(script,/records\.length\?`\$\{wins\}勝\$\{losses\}敗`:"勝敗 —"/);
});

test("level two fixes a discipline and contains the adopted analytics journey",()=>{
  for(const text of ["プレーヤー情報へ戻る","通算","主要指標","今の状態","推移","自己ベスト","最近の試合","対戦相手別の成績","全試合"]){assert.match(script,new RegExp(text));}
  assert.match(script,/api\.aggregate\(records,player,helpers\)/);
  assert.match(script,/api\.bests\(records,player,active,helpers\)/);
  assert.match(script,/openMatchDetailV1/);
  assert.match(script,/openPlayerOpponentRecordsV2/);
  assert.match(script,/openPlayerMatchHistoryV2/);
});

test("all disciplines keep the approved metric sets",()=>{
  assert.match(script,/"9ball":\["shotRate","breakInRate","masuwariRate","avgFouls"\]/);
  assert.match(script,/rotation:\["shotRate","breakInRate","highRun","avgFouls"\]/);
  assert.match(script,/jpa9:\["average","breakInRate","highRun","avgFouls"\]/);
  assert.match(script,/straightPool:\["average","highRun","avgFouls"\]/);
  assert.match(script,/threeCushion:\["average","highRun"\]/);
});

test("detail density is collapsed and recent content is limited",()=>{
  assert.match(script,/bests\.slice\(0,3\)/);
  assert.match(script,/records\.slice\(0,3\)/);
  assert.match(script,/data-pd7-trend hidden/);
  assert.match(script,/value==null\?"—"/);
});

test("white cards force legible dark text and fit 390px portrait",()=>{
  assert.match(css,/color-scheme:light/);
  assert.match(css,/-webkit-text-fill-color:#171717/);
  assert.match(css,/background:#fff!important/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:390px\)/);
  assert.match(css,/text-overflow:ellipsis/);
});
