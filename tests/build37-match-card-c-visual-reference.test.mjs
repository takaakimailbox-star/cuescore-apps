import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const index=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const nav=readFileSync(new URL("../navigation-phase2-6.js",import.meta.url),"utf8");
const revision=readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../ui-revision-v12.css",import.meta.url),"utf8");

test("official C reference fixes the shared card geometry",()=>{
  assert.match(css,/\.match-card-c-v37\{[^}]*height:56px!important;min-height:56px!important;padding:5px 16px!important/);
  assert.match(css,/--mc-c-radius:12px/);
  assert.match(css,/font-size:20px!important;font-weight:800/);
});

test("recent matches retain date avatar name result score and chevron",()=>{
  for(const token of ["match-card-c-date-v37","match-card-c-avatar-v37","match-card-c-opponent-v37","match-card-c-result-v37","match-card-c-score-v37"])
    assert.ok(nav.includes(token),token);
  assert.match(nav,/\$\{avatar\(o\)\}/);
});

test("discipline history preserves the official second-row information order",()=>{
  assert.doesNotMatch(revision,/row\.querySelector\("\.journey-game-v2"\)\?\.remove/);
  assert.match(css,/grid-template-areas:'date date date date result chevron' 'avatar opponent game race score chevron'/);
  assert.match(css,/journey-match-race-v3\{grid-area:race!important[^}]*font-size:12px!important/);
});

test("opponent history removes repeated identity but retains discipline icon",()=>{
  assert.match(revision,/if\(opponentFixed\)\{row\.querySelector\("\.journey-match-vs-v3"\)\?\.remove/);
  assert.doesNotMatch(revision,/if\(opponentFixed\)\{row\.querySelector\("\.journey-game-v2"\)\?\.remove/);
  assert.match(css,/grid-template-areas:'date date date result chevron' 'game race race score chevron'/);
});

test("official result colors and overflow protections are fixed",()=>{
  assert.match(css,/color:#1e8e3e;background:#e6f4ea/);
  assert.match(css,/color:#d93025;background:#fde7e9/);
  assert.match(css,/overflow:hidden;text-overflow:ellipsis;white-space:nowrap/);
  assert.doesNotMatch(css,/match-card-c-v37[^}]*overflow-x/);
});

test("Build 35 exact-origin Back contract remains present",()=>{
  assert.match(index,/detailBack\.addEventListener\("pointerup"/);
  assert.match(revision,/const closeMatchDetailExactBase=window\.closeFormalMatchDetailV2/);
  assert.match(revision,/scroll\.scrollTop=origin\.scrollTop/);
});
