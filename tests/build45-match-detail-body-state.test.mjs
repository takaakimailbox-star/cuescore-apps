import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const revision=readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");

test("body Match Detail state unconditionally owns Edge Swipe",()=>{
  assert.match(html,/const matchDetailBack=document\.getElementById\("recordDetailBackBtn"\);\s*if\(document\.body\.classList\.contains\("match-detail-visible-v1"\)&&matchDetailBack\)return matchDetailBack/);
  assert.doesNotMatch(html,/matchDetailBack\.getClientRects/);
  assert.doesNotMatch(html,/isVisible\(matchDetailBack\)/);
});

test("body Match Detail state directly invokes the exact close contract",()=>{
  assert.match(html,/const ownsVisibleMatchDetail=backButton\.id==="recordDetailBackBtn"&&document\.body\.classList\.contains\("match-detail-visible-v1"\)/);
  assert.match(html,/if\(ownsVisibleMatchDetail&&typeof window\.closeFormalMatchDetailV2==="function"\)\{\s*window\.closeFormalMatchDetailV2\(\)/);
  assert.match(revision,/const closeMatchDetailExactBase=window\.closeFormalMatchDetailV2/);
});

test("Match Detail renderer and closer own the same body state",()=>{
  assert.match(html,/document\.body\.classList\.add\("match-detail-visible-v1"\)/);
  assert.match(html,/document\.body\.classList\.remove\("match-detail-visible-v1"\)/);
});
