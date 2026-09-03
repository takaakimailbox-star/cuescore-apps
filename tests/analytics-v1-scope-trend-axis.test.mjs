import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const analytics=readFileSync(new URL("../analysis-build4.js",import.meta.url),"utf8");
const detail=readFileSync(new URL("../player-detail-build6.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=readFileSync(new URL("../player-detail-build8.css",import.meta.url),"utf8");

test("analysis trend charts and their interactive points are removed",()=>{
  assert.doesNotMatch(analytics,/analysis-b4-(?:x-label|y-label|trend)|data-b4-point/);
  assert.doesNotMatch(detail,/trendRecords|data-pd7-metric-trend/);
});

test("v1 normal journeys keep simple opponent results and Match Detail only",()=>{
  assert.match(detail,/試合詳細を見る/);
  assert.match(detail,/analysis\.hidden=true/);
  assert.match(html,/<button class="journey-opponent-v2" type="button" data-rival-opponent=/);
  assert.match(html,/openOpponentHistory\(row\.dataset\.rivalOpponent\)/);
  assert.match(html,/window\.openRivalAnalysisForPlayerV832/);
});
