import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const revision=readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");

test("Match Detail Edge Swipe invokes the formal close contract without synthetic click",()=>{
  assert.match(html,/const requestBackContract = backButton => \{[\s\S]*?ownsVisibleMatchDetail[\s\S]*?typeof window\.closeFormalMatchDetailV2==="function"[\s\S]*?window\.closeFormalMatchDetailV2\(\);[\s\S]*?return true;/);
  assert.match(html,/requestBackContract\(backButton\)/);
  assert.doesNotMatch(html,/backButton\.dataset\.cueBackSource="swipe";backButton\.click\(\)/);
});

test("non-Match Detail screens retain their existing visible button contract",()=>{
  assert.match(html,/if\(ownsVisibleMatchDetail&&typeof window\.closeFormalMatchDetailV2==="function"\)[\s\S]*?return true;\s*}\s*backButton\.click\(\);/);
  assert.match(html,/requestBackContract,/);
});

test("Build 39 exact origin wrapper remains the runtime close SSOT",()=>{
  assert.match(revision,/const closeMatchDetailExactBase=window\.closeFormalMatchDetailV2/);
  assert.match(revision,/window\.closeFormalMatchDetailV2=\(\)=>\{/);
  for(const kind of ["personal-best","player-recent","player-history","opponent-history","global-history"])assert.match(revision,new RegExp(kind));
});
