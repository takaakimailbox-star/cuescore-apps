import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("Player-origin Match Detail ownership does not inherit a hidden ancestor",()=>{
  assert.match(html,/matchDetailBack&&matchDetailBack\.getClientRects\(\)\.length>0/);
  assert.doesNotMatch(html,/if\(isVisible\(matchDetailBack\)\)return matchDetailBack/);
});

test("direct close uses the Match Detail overlay's own open state",()=>{
  assert.match(html,/const ownsVisibleMatchDetail=backButton\.id==="recordDetailBackBtn"&&matchDetail&&!matchDetail\.classList\.contains\("hidden"\)&&matchDetail\.getAttribute\("aria-hidden"\)!=="true"/);
  assert.match(html,/if\(ownsVisibleMatchDetail&&typeof window\.closeFormalMatchDetailV2==="function"\)\{\s*window\.closeFormalMatchDetailV2\(\)/);
  assert.doesNotMatch(html,/backButton\.id==="recordDetailBackBtn"&&isVisible\(matchDetail\)/);
});

test("failed synthetic click is not used for an open Match Detail",()=>{
  const contract=html.match(/const requestBackContract = backButton => \{[\s\S]*?return true;\s*};/)?.[0]||"";
  assert.match(contract,/ownsVisibleMatchDetail/);
  assert.match(contract,/window\.closeFormalMatchDetailV2\(\)/);
  assert.match(contract,/backButton\.click\(\)/);
  assert.ok(contract.indexOf("window.closeFormalMatchDetailV2()")<contract.indexOf("backButton.click()"));
});
