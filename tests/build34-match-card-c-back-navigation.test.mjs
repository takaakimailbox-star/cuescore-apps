import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const nav=readFileSync(new URL("../navigation-phase2-6.js",import.meta.url),"utf8");
const revision=readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../ui-revision-v12.css",import.meta.url),"utf8");

test("recent matches use the adopted C-balance card family",()=>{
  assert.match(nav,/CueScoreMatchCardC\?\.classes\?\.\("recent"\)/);
  assert.match(nav,/match-card-c-result-v37/);
  assert.match(nav,/match-card-c-score-v37/);
  assert.match(css,/\.hub-match-row-v2\.match-card-c-recent-v37/);
});

test("all required Match Detail origins are captured before navigation",()=>{
  for(const selector of ["#playerMatchHistoryV2 [data-player-record-id]","#recordsList [data-record-id]","#playerStatsBody [data-pd7-match]","#playerStatsBody [data-hub-match]"])
    assert.ok(revision.includes(selector),selector);
  for(const kind of ["opponent-history","player-history","global-history","personal-best","player-recent"])
    assert.ok(revision.includes(`\"${kind}\"`),kind);
  assert.match(revision,/scrollTop:scroll\?\.scrollTop\|\|0/);
});

test("Back restores the exact owner and its scroll position",()=>{
  assert.match(revision,/const closeMatchDetailExactBase=window\.closeFormalMatchDetailV2/);
  assert.match(revision,/\["player-history","opponent-history"\]\.includes\(origin\.kind\)/);
  assert.match(revision,/origin\.kind!=="global-history"/);
  assert.match(revision,/scroll\.scrollTop=origin\.scrollTop/);
});

test("C balance preserves Race and protects narrow screens",()=>{
  assert.doesNotMatch(revision,/journey-match-race-v3"\)\?\.remove/);
  assert.match(css,/\.journey-match-race-v3 \{ grid-area:race; display:block/);
  assert.match(css,/@media\(max-width:390px\)/);
  assert.doesNotMatch(css,/\.match-card-c-v37[^}]*overflow-x/);
});
