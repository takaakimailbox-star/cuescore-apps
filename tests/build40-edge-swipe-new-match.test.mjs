import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const navigation=readFileSync(new URL("../navigation-phase2-6.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../navigation-phase2-6.css",import.meta.url),"utf8");

test("slow half-width edge swipe completes through the visible Back contract",()=>{
  assert.match(html,/const EDGE_START_MAX = 64/);
  assert.match(html,/const MIN_HORIZONTAL_TRAVEL = 60/);
  assert.match(html,/const MAX_GESTURE_DURATION = 4000/);
  assert.match(html,/backButton\.dataset\.cueBackSource="swipe";backButton\.click\(\)/);
});

test("short and vertical gestures cancel naturally",()=>{
  assert.match(html,/dx < MIN_HORIZONTAL_TRAVEL.*cancelInteractiveBack\(\)/);
  assert.match(html,/Math\.abs\(dy\) > MAX_VERTICAL_TRAVEL/);
  assert.match(html,/cue-edge-back-cancelling-v3/);
});

test("tracking begins after horizontal intent and covers Player journey overlays",()=>{
  assert.match(html,/const hasIntent=dx>8&&dx>Math\.abs\(dy\)\*HORIZONTAL_DOMINANCE/);
  assert.match(html,/if\(hasIntent\)document\.body\.classList\.add\("cue-edge-back-tracking-v3"\)/);
  for(const root of ["body.cue-edge-back-tracking-v3>.app","#playerOpponentRecordsV2","#playerMatchHistoryV2"])assert.match(html,new RegExp(root.replace(/[.>]/g,"\\$&")));
  assert.doesNotMatch(html,/interactiveTargetSelector = "button/);
  assert.match(html,/\[role='tab'\],\[data-discipline\]/);
});

test("New Match removes only its redundant top-left Back",()=>{
  assert.match(navigation,/back\?\.remove\(\)/);
  assert.doesNotMatch(html,/const backButtonSelectors = \[[\s\S]*?"#cueMatchSetupBackV3"/);
  assert.doesNotMatch(css,/match-setup-active-v3 \.cue-match-setup-back-v3/);
});

test("Build 39 Match Detail and Player exact restore remain the shared destination",()=>{
  assert.match(html,/"#recordDetailBackBtn"/);
  assert.match(html,/"#playerStatsBackBtn"/);
  assert.match(html,/"\[data-journey-back\]"/);
  assert.match(html,/window\.closeFormalMatchDetailV2\?\.\(\)/);
});
