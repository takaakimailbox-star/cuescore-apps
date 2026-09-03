import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const analytics=readFileSync(new URL("../analysis-build4.js",import.meta.url),"utf8");
const detail=readFileSync(new URL("../player-detail-build6.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=readFileSync(new URL("../player-detail-build8.css",import.meta.url),"utf8");

test("player analysis owns one embedded trend graph while redundant detail routes stay removed",()=>{
  assert.match(analytics,/analysis-b4-trend/);
  assert.match(analytics,/data-b4-trend-select/);
  assert.doesNotMatch(analytics,/foulRate|ファール率/);
  assert.doesNotMatch(detail,/trendRecords|data-pd7-metric-trend/);
});

test("formal analysis restores percentage trend chart without foul metrics",()=>{
  const formal=html.slice(html.indexOf("CueScore Analytics v1.0"),html.indexOf("CueScore Settings Suite"));
  assert.match(formal,/推移グラフ/);
  assert.match(formal,/analyticsTabsV1/);
  assert.match(formal,/analyticsChartV1/);
  assert.match(formal,/data-metric="winRate"/);
  assert.match(formal,/data-metric="shotRate"/);
  assert.match(formal,/data-metric="safetyRate"/);
  assert.doesNotMatch(formal,/ファール平均|平均ファール|data-metric="foulRate"/);
});

test("v1 normal journeys keep simple opponent results and Match Detail only",()=>{
  assert.match(detail,/試合詳細を見る/);
  assert.match(detail,/analysis\.hidden=true/);
  assert.match(html,/<button class="journey-opponent-v2" type="button" data-rival-opponent=/);
  assert.match(html,/openOpponentHistory\(row\.dataset\.rivalOpponent\)/);
  assert.match(html,/window\.openRivalAnalysisForPlayerV832/);
});
