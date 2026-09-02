import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const revision=readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");

test("visible Match Detail owns edge Back ahead of underlying Player Back",()=>{
  assert.match(html,/const candidateBackButton = \(\) => \{\s*const matchDetailBack=document\.querySelector\("#recordDetailOverlay:not\(\.hidden\):not\(\[aria-hidden='true'\]\) #recordDetailBackBtn"\);\s*if\(isVisible\(matchDetailBack\)\)return matchDetailBack;/);
  assert.match(html,/backButton\.dataset\.cueBackSource="swipe";backButton\.click\(\)/);
  assert.match(html,/window\.closeFormalMatchDetailV2\?\.\(\)/);
});

test("Player Detail origins remain distinct and restore through the same close contract",()=>{
  assert.match(revision,/#playerStatsBody \.hub-bests-v2 \[data-hub-match\].*kind="personal-best"/);
  assert.match(revision,/#playerStatsBody \[data-hub-match\].*kind="player-recent"/);
  assert.match(revision,/const origin=exactMatchDetailOrigin;closeMatchDetailExactBase\?\.\(\);exactMatchDetailOrigin=null/);
});

test("all five Match Detail origins and opponent journey remain protected",()=>{
  for(const kind of ["personal-best","player-recent","player-history","opponent-history","global-history"]){
    assert.match(revision,new RegExp(kind));
  }
  assert.match(html,/"\[data-journey-back\]"/);
});
