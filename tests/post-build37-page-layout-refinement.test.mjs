import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const index=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const nav=readFileSync(new URL("../navigation-phase2-6.js",import.meta.url),"utf8");
const revision=readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../ui-revision-v12.css",import.meta.url),"utf8");

test("shared summary bar uses existing statistics in accessible visual order",()=>{
  assert.match(index,/const summaryStatsBar = summary =>/);
  for(const label of ["試合","勝敗","勝率"])assert.ok(index.includes(label));
  assert.match(css,/\.page-summary-stats-v1\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)[^}]*height:52px/);
  assert.match(css,/border-radius:16px/);
});

test("target pages use the adopted hierarchy without changing Match Card C",()=>{
  assert.match(index,/page-journey-heading-v1">対戦相手/);
  assert.match(revision,/page-rival-context-v1/);
  assert.match(css,/font-size:22px;font-weight:700;line-height:28px/);
  assert.match(css,/\.journey-list-v2\+\.journey-month-v2\{margin-top:32px\}/);
  assert.match(css,/\.match-card-c-v37\{[^}]*height:56px!important/);
  assert.match(nav,/data-hub-all-matches[^\n]+stopImmediatePropagation\(\)[^\n]+CueScorePlayerJourneyV2/);
});

test("Player Information analysis ends at Self Best without redundant links",()=>{
  const analysis=nav.slice(nav.indexOf("function analysisView"),nav.indexOf("function render(playerId"));
  assert.ok(analysis.indexOf("今の状態")<analysis.indexOf("主要指標"));
  assert.ok(analysis.indexOf("主要指標")<analysis.indexOf("推移"));
  assert.ok(analysis.indexOf("推移")<analysis.indexOf("今回のポイント"));
  assert.ok(analysis.indexOf("今回のポイント")<analysis.indexOf("自己ベスト"));
  assert.doesNotMatch(analysis,/詳しい分析|対戦相手分析/);
  assert.match(nav,/data-hub-full-analysis/);
  assert.match(nav,/data-hub-opponents/);
});

test("Build 35 exact-origin close contract remains untouched",()=>{
  assert.match(index,/detailBack\.addEventListener\("pointerup"/);
  assert.match(revision,/const closeMatchDetailExactBase=window\.closeFormalMatchDetailV2/);
  assert.match(revision,/scroll\.scrollTop=origin\.scrollTop/);
});
