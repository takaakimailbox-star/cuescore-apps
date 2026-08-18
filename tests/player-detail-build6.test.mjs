import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const script=fs.readFileSync(new URL("../player-detail-build6.js",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../player-detail-build6.css",import.meta.url),"utf8");
const nativeBuild=fs.readFileSync(new URL("../scripts/build-native-web.mjs",import.meta.url),"utf8");
const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");

test("Build 6 integrated Player Detail assets load after adopted analytics",()=>{
  assert.match(html,/analysis-build4\.js[\s\S]*player-detail-build6\.js/);
  assert.match(html,/player-detail-build6\.css/);
  assert.match(nativeBuild,/player-detail-build6\.js/);
  assert.match(nativeBuild,/player-detail-build6\.css/);
  assert.match(sw,/player-detail-build6\.js/);
});

test("integrated Player Detail contains all eight approved sections",()=>{
  for(const text of ["通算","今の状態","主要指標","最近の調子","推移を見る","自己ベスト","最近の試合","対戦相手別の成績","試合一覧"]){
    assert.match(script,new RegExp(text));
  }
  assert.doesNotMatch(script,/プレーヤー分析を見る/);
  assert.doesNotMatch(script,/data-analysis-player/);
});

test("all disciplines keep their adopted metric sets",()=>{
  assert.match(script,/"9ball":\["shotRate","breakInRate","masuwariRate","avgFouls"\]/);
  assert.match(script,/rotation:\["shotRate","breakInRate","highRun","avgFouls"\]/);
  assert.match(script,/jpa9:\["average","breakInRate","highRun","avgFouls"\]/);
  assert.match(script,/straightPool:\["average","highRun","avgFouls"\]/);
  assert.match(script,/threeCushion:\["average","highRun"\]/);
});

test("trend, bests and recent matches use the existing derived metrics and Match Detail",()=>{
  assert.match(script,/CueScoreBuild4Metrics/);
  assert.match(script,/api\.aggregate/);
  assert.match(script,/api\.bests/);
  assert.match(script,/CueScoreBuild4Analytics\?\.chart/);
  assert.match(script,/openMatchDetailV1\?\.\(match\.dataset\.pd6Match\)/);
  assert.match(script,/value==null\?"—"/);
});

test("initial density and expansion contracts are explicit",()=>{
  assert.match(script,/index>=3\?"pd6-more-best"/);
  assert.match(script,/index>=2\?"pd6-more-match"/);
  assert.match(script,/data-pd6-best-toggle/);
  assert.match(script,/data-pd6-match-toggle/);
  assert.match(script,/data-pd6-trend-toggle aria-expanded="false"/);
});

test("390px portrait keeps compact two-column metric and best cards",()=>{
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:390px\)/);
  assert.match(css,/text-overflow:ellipsis/);
});
