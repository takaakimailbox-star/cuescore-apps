import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const revision=readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");

test("cancel atomically releases the active gesture and touch identifier",()=>{
  assert.match(html,/const abortGesture = \(\{animate=true\}=\{\}\) => \{[\s\S]*?gesture=null;[\s\S]*?gestureSequence\+=1/);
  assert.match(html,/identifier: touch\.identifier/);
  assert.match(html,/const touchForGesture=/);
  assert.doesNotMatch(html,/gesture\.cancelled\s*=\s*true/);
});

test("a second gesture invalidates the previous cancel timer",()=>{
  assert.match(html,/if\(visualResetTimer\)\{clearTimeout\(visualResetTimer\);visualResetTimer=0;\}/);
  assert.match(html,/const sequence=gestureSequence/);
  assert.match(html,/if\(sequence===gestureSequence\)clearInteractiveBack\(\)/);
  assert.match(html,/abortGesture\(\{animate:false\}\);\s*gestureSequence\+=1/);
  assert.match(html,/const hasVisualState=Boolean\(visualResetTimer\).*cue-edge-back-cancelling-v3/);
});

test("touchcancel pointercancel and lost capture share cleanup",()=>{
  assert.match(html,/addEventListener\("touchcancel",\(\)=>abortGesture\(\)/);
  assert.match(html,/addEventListener\("pointercancel",event=>\{if\(event\.pointerType==="touch"\)abortGesture\(\);\}/);
  assert.match(html,/addEventListener\("lostpointercapture",event=>\{if\(event\.pointerType==="touch"\)abortGesture\(\);\}/);
  assert.match(html,/addEventListener\("pagehide",\(\)=>abortGesture\(\{animate:false\}\)/);
});

test("repeated swipes use one guarded listener registration and expose reset diagnostics",()=>{
  assert.match(html,/if \(window\.__cueScoreEdgeBackV1\) return/);
  assert.match(html,/debugState:\(\)=>Object\.freeze\(\{active:Boolean\(gesture\),identifier:gesture\?\.identifier\?\?null,backTransitionActive,visualResetPending:Boolean\(visualResetTimer\)\}\)/);
  assert.match(html,/reset:\(\)=>abortGesture\(\{animate:false\}\)/);
});

test("Match Detail keeps the Build 35 close and Build 39 exact-origin contracts",()=>{
  assert.match(html,/window\.closeFormalMatchDetailV2\?\.\(\)/);
  assert.match(revision,/exactMatchDetailOrigin/);
  assert.match(revision,/kind="personal-best"/);
  assert.match(revision,/kind="player-recent"/);
  assert.match(html,/#recordDetailBackBtn/);
});
