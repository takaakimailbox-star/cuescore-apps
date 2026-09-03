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
  assert.match(revision,/classList\.add\("pd13-rival-context","page-rival-context-v1"\)/);
  assert.match(revision,/classList\.remove\("player-journey-card-v2"\)/);
  assert.match(css,/\.pd13-rival-context[\s\S]*background:transparent/);
});

test("normal histories remove period and analysis actions but retain detail cards",()=>{
  assert.match(revision,/querySelector\("\[data-history-period\]"\)\?\.remove\(\)/);
  assert.match(revision,/querySelectorAll\("\[data-player-analysis-record-id\]"\)/);
  assert.match(revision,/data-player-record-id/);
  assert.match(revision,/試合詳細を開く/);
});

test("opponent-fixed and player histories use separate compact match contracts",()=>{
  assert.match(revision,/classList\.toggle\("pd13-opponent-match",opponentFixed\)/);
  assert.match(revision,/classList\.toggle\("pd13-player-match",!opponentFixed&&!disciplineFixed\)/);
  assert.match(revision,/if\(opponentFixed\)opponent\?\.remove\(\)/);
  assert.doesNotMatch(revision,/row\.querySelector\("\.journey-game-v2"\)\?\.remove\(\)/);
  assert.match(revision,/row\.querySelector\("\.journey-match-opponent-avatar-v3"\)\?\.remove\(\)/);
  assert.match(css,/match-card-c-opponent-v37[\s\S]*height:56px!important/);
  assert.match(css,/\.pd13-player-match[\s\S]*min-height:54px/);
  assert.match(css,/\.pd13-player-match \.journey-game-v2 img \{ display:none/);
});

test("opponent-fixed history removes the redundant Player vs Opponent row only in fixed context",()=>{
  assert.match(revision,/const opponentFixed=Boolean\(root\.dataset\.pd8Opponent\),disciplineFixed=Boolean\(root\.dataset\.pd8Discipline\)&&!opponentFixed,opponent=root\.querySelector\("\.journey-history-opponent-v11"\)/);
  assert.match(revision,/if\(opponentFixed\)opponent\?\.remove\(\)/);
  assert.doesNotMatch(revision,/opponent\?\.remove\(\);[\s\S]*if\(!opponentFixed\)opponent\?\.remove\(\)/);
});

test("Match Detail Back keeps the remembered history origin",()=>{
  assert.match(revision,/rememberMatchDetailOrigin/);
  assert.match(revision,/document\.addEventListener\("click",rememberMatchDetailOrigin,true\)/);
  assert.match(revision,/document\.addEventListener\("keydown"/);
  assert.match(revision,/const closeMatchDetailBase=window\.closeFormalMatchDetailV2/);
  assert.match(revision,/window\.closeFormalMatchDetailV2=.*closeMatchDetailBase\?\.\(\).*history\?\.classList\.remove\("hidden"\)/);
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
