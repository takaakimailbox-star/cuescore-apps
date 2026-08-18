import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const script=fs.readFileSync(new URL("../analysis-build4.js",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../analysis-build4.css",import.meta.url),"utf8");

test("Build 4 analytics assets are loaded after the existing analytics layer",()=>{
  assert.match(html,/analysis-final-rc\.js[\s\S]*analytics-build4-metrics\.js[\s\S]*analysis-build4\.js/);
  assert.match(html,/analysis-build4\.css/);
});

test("player top contains all six adopted blocks and detail entries",()=>{
  for(const label of ["今の状態","主要指標","推移","今回のポイント","自己ベスト","詳細分析","対戦相手分析を見る","試合別分析を見る"])assert.match(script,new RegExp(label));
  assert.match(script,/window\.openMatchDetailV1\?\.\(best\.dataset\.b4MatchId\)/);
  assert.match(script,/window\.openRivalAnalysisForPlayerV832\?\.\(rival\.dataset\.b4Rival\)/);
  assert.match(script,/data-open-match-analysis/);
});

test("missing values and partial trend points are not coerced to zero",()=>{
  assert.match(script,/value==null\?"—"/);
  assert.match(script,/比較できません/);
  assert.match(script,/データなし/);
  assert.match(script,/Number\.isFinite\(value\)/);
});

test("all disciplines use the approved metric sets",()=>{
  assert.match(script,/"9ball":\["shotRate","breakInRate","masuwariRate","avgFouls"\]/);
  assert.match(script,/rotation:\["shotRate","breakInRate","highRun","avgFouls"\]/);
  assert.match(script,/jpa9:\["average","breakInRate","highRun","avgFouls"\]/);
  assert.match(script,/straightPool:\["average","highRun","avgFouls"\]/);
  assert.match(script,/threeCushion:\["average","highRun"\]/);
});

test("390px portrait rules keep two-column cards inside the viewport",()=>{
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:390px\)/);
  assert.match(css,/text-overflow:ellipsis/);
});
