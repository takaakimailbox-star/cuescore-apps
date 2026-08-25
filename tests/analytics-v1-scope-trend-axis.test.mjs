import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const analytics=readFileSync(new URL("../analysis-build4.js",import.meta.url),"utf8");
const detail=readFileSync(new URL("../player-detail-build6.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=readFileSync(new URL("../player-detail-build8.css",import.meta.url),"utf8");

test("percentage trends show the approved five Y-axis labels",()=>{
  assert.match(analytics,/\[100,75,50,25,0\]/);
  assert.match(analytics,/analysis-b4-y-label/);
  assert.match(analytics,/\$\{Math\.round\(tick\)\}%/);
});

test("trend points carry date context and exact accessible values",()=>{
  assert.match(analytics,/analysis-b4-x-label/);
  assert.match(analytics,/data-b4-point tabindex="0" role="button"/);
  assert.match(analytics,/data-b4-date/);
  assert.match(analytics,/data-b4-value/);
  assert.match(analytics,/data-b4-point-callout/);
  assert.match(detail,/point\.dataset\.b4Date/);
  assert.match(detail,/state\.trendRecords\)/);
  assert.match(css,/analysis-b4-point-callout/);
});

test("same-day matches get a visible sequence suffix",()=>{
  assert.match(analytics,/totals\[date\]>1/);
  assert.match(analytics,/`\$\{date\}·\$\{seen\[date\]\}`/);
});

test("v1 normal journeys keep simple opponent results and Match Detail only",()=>{
  assert.match(detail,/試合詳細を見る/);
  assert.match(detail,/analysis\.hidden=true/);
  assert.match(html,/<article class="journey-opponent-v2">/);
  assert.doesNotMatch(html,/<button class="journey-opponent-v2" type="button" data-rival-opponent=/);
  assert.match(html,/window\.openRivalAnalysisForPlayerV832/);
});
