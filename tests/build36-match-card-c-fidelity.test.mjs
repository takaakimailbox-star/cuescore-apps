import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const index=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const nav=readFileSync(new URL("../navigation-phase2-6.js",import.meta.url),"utf8");
const revision=readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../ui-revision-v12.css",import.meta.url),"utf8");

test("one shared C helper names all four match-list contexts",()=>{
  assert.match(revision,/window\.CueScoreMatchCardC=Object\.freeze/);
  for(const context of ["recent","opponent","all-matches","player-history","global"])
    assert.ok(index.includes(`"${context}"`)||nav.includes(`"${context}"`)||revision.includes(`"${context}"`),context);
});

test("recent and opponent cards keep the compact two-layer hierarchy",()=>{
  assert.match(css,/match-card-c-recent-v37[^}]*grid-template-columns:44px 28px/);
  assert.match(css,/match-card-c-opponent-v37[^}]*grid-template-rows:16px 28px/);
  assert.match(css,/grid-template-areas:'date date date result chevron' 'game race race score chevron'/);
});

test("discipline all matches replaces Build 34 three rows with two rows",()=>{
  assert.match(css,/match-card-c-all-matches-v37[^}]*grid-template-rows:16px 28px/);
  assert.match(css,/grid-template-areas:'date date date date result chevron' 'avatar opponent game race score chevron'/);
  assert.match(css,/journey-match-opponent-avatar-v3\{grid-area:avatar!important;width:28px;height:28px/);
  assert.doesNotMatch(revision,/journey-game-v2"\)\?\.remove/);
});

test("global History retains identity while compacting icon and avatars",()=>{
  assert.match(index,/record-card \$\{cardClassV37\}/);
  assert.match(css,/match-card-c-global-v37[^}]*grid-template-rows:16px 28px/);
  assert.match(css,/record-game-icon-v2\{width:22px!important;height:22px/);
  assert.match(css,/record-match-avatar-v3\{width:24px!important;height:24px/);
});

test("large scores, long names and 390px width remain protected",()=>{
  assert.match(css,/white-space:nowrap;font-variant-numeric:tabular-nums/);
  assert.match(css,/overflow:hidden;text-overflow:ellipsis;white-space:nowrap/);
  assert.match(css,/@media\(max-width:390px\)/);
  assert.doesNotMatch(css,/match-card-c-v37[^}]*overflow-x/);
});

test("Build 35 Back input and exact-origin contracts are untouched",()=>{
  assert.match(index,/detailBack\.addEventListener\("pointerup"/);
  assert.match(index,/window\.closeFormalMatchDetailV2\?\.\(\)/);
  assert.match(revision,/const closeMatchDetailExactBase=window\.closeFormalMatchDetailV2/);
  assert.match(revision,/scroll\.scrollTop=origin\.scrollTop/);
});
