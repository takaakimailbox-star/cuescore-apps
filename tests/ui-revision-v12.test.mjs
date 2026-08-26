import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const index=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const detail=readFileSync(new URL("../player-detail-build6.js",import.meta.url),"utf8");
const revision=readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../ui-revision-v12.css",import.meta.url),"utf8");

test("three points disciplines remove one-match highest score from displayed self best",()=>{
  assert.match(detail,/\["rotation","straightPool","jpa9"\]\.includes\(active\)&&best\.key==="score"/);
});

test("discipline detail exposes one full-screen trends entry and disables metric sheets",()=>{
  assert.match(revision,/グラフで見る/);
  assert.match(revision,/className="pd12-trends hidden"/);
  assert.match(revision,/removeAttribute\("data-pd7-metric-trend"\)/);
  assert.match(revision,/querySelector\("\[data-pd7-trend-modal\]"\)\?\.remove\(\)/);
  assert.deepEqual([...revision.matchAll(/"9ball":\[([^\]]+)\]/g)][0][1].match(/\w+Rate/g),["winRate","shotRate","breakInRate","masuwariRate","foulRate"]);
  assert.match(css,/\.pd12-trends \{ position:fixed; inset:0/);
});

test("opponent records are fixed-context, unsorted by controls, and recency ordered",()=>{
  assert.match(revision,/\.journey-summary-v2,\.journey-segment-v2/);
  assert.match(revision,/select\.replaceWith\(fixed\)/);
  assert.match(revision,/latest\.get\(b\.dataset\.rivalOpponent\).*latest\.get\(a\.dataset\.rivalOpponent\)/);
});

test("normal histories remove period and analysis actions but retain detail cards",()=>{
  assert.match(revision,/querySelector\("\[data-history-period\]"\)\?\.remove\(\)/);
  assert.match(revision,/querySelectorAll\("\[data-player-analysis-record-id\]"\)/);
  assert.match(revision,/data-player-record-id/);
  assert.match(revision,/試合詳細を開く/);
});

test("player management has automatic deterministic order and compact memo",()=>{
  assert.match(revision,/Number\(b\.isPrimary===true\)-Number\(a\.isPrimary===true\)/);
  assert.match(revision,/latest\.get\(String\(b\.id\)\).*latest\.get\(String\(a\.id\)\)/);
  assert.match(revision,/stable\(a\.id,b\.id\)/);
  assert.match(css,/#playerLibrarySortBtnV1 \{ display:none !important; \}/);
  assert.match(css,/player-management-memo-v2[\s\S]*white-space:nowrap/);
});

test("new assets load after the current player detail implementation",()=>{
  assert.ok(index.indexOf("player-detail-build6.js")<index.indexOf("ui-revision-v12.js"));
  assert.match(index,/ui-revision-v12\.css/);
});
