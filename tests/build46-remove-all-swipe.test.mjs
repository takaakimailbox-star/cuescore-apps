import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const navigation=readFileSync(new URL("../navigation-phase2-6.js",import.meta.url),"utf8");
const revision=readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");

test("all edge Back event monitoring, animation and state are removed",()=>{
  assert.doesNotMatch(html,/CueScoreEdgeBack|cue-edge-back|--cue-edge-back|requestBackContract|cancelInteractiveBack/);
  assert.doesNotMatch(html,/backButton\.dataset\.cueBackSource="swipe"/);
});

test("result, historical detail and discipline selection have no swipe navigation",()=>{
  assert.doesNotMatch(html,/touchStartX|touchStartY|goResultPageV780\(resultPageV780 \+ \(diffX/);
  assert.doesNotMatch(html,/goHistoricalPageV67\(historicalPageV67 \+ \(dx/);
  assert.doesNotMatch(navigation,/beginSwipe|endSwipe|swipeStart|lastSwipeAt|suppressSwipeClick/);
});

test("left Back and exact origin restoration remain intact",()=>{
  assert.match(html,/detailBack\.addEventListener\("pointerdown"/);
  assert.match(html,/detailBack\.addEventListener\("pointerup"/);
  assert.match(html,/detailBack\.addEventListener\("click"/);
  assert.match(html,/window\.closeFormalMatchDetailV2\?\.\(\)/);
  assert.match(revision,/const closeMatchDetailExactBase=window\.closeFormalMatchDetailV2/);
  assert.match(revision,/exactMatchDetailOrigin/);
});
