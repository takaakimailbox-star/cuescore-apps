import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const revision=readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");

test("formal Match Detail Back is a real button without fragile inline onclick",()=>{
  assert.match(html,/id="recordDetailBackBtn" class="match-detail-back-v1" type="button" aria-label="対戦履歴へ戻る">/);
  assert.doesNotMatch(html,/class="match-detail-back-v1"[^>]+onclick=/);
});

test("one physical tap reaches the shared close contract even when WebKit omits click",()=>{
  assert.match(html,/detailBack\.addEventListener\("pointerdown"/);
  assert.match(html,/detailBack\.addEventListener\("pointerup"/);
  assert.match(html,/detailBack\.addEventListener\("click"/);
  assert.match(html,/window\.closeFormalMatchDetailV2\?\.\(\)/);
  assert.match(html,/now-lastCloseRequestAt<450/);
});

test("tap uses the Match Detail close SSOT without a swipe route",()=>{
  assert.match(html,/getElementById\("recordDetailBackBtn"\)/);
  assert.match(html,/detailBack\.addEventListener\("click",event=>\{trace\("click",event\);requestClose\(event,"click"\)/);
  assert.doesNotMatch(html,/CueScoreEdgeBack|cue-edge-back|cueBackSource==="swipe"/);
  assert.match(revision,/const closeMatchDetailExactBase=window\.closeFormalMatchDetailV2/);
});

test("Back remains above the header and accepts pointer input",()=>{
  assert.match(html,/\.match-detail-back-v1\{[\s\S]*?z-index:3;[\s\S]*?pointer-events:auto!important;[\s\S]*?touch-action:manipulation;/);
});

test("in-memory trace records pointer, click, and close-contract arrival",()=>{
  assert.match(html,/__cueScoreMatchDetailBackTraceV35/);
  assert.match(html,/trace\("pointerdown",event\)/);
  assert.match(html,/trace\("pointerup",event\)/);
  assert.match(html,/trace\("click",event\)/);
  assert.match(html,/trace\(`close-request:\$\{source\}`,event\)/);
});
