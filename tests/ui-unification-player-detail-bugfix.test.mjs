import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

// Regression: never shadow the side() resolver inside the Player Detail aggregator.
assert.doesNotMatch(html,/const side=side\(record,p\)/);
assert.match(html,/const playerSide=side\(record,p\);if\(!playerSide\)return/);
assert.match(html,/savedPlayerMetricsV113\(record,playerSide\)/);
assert.match(html,/inningsCountNumberV1\(record,playerSide\)/);

// Shared navigation design tokens cover the adopted control roles.
for(const token of [
  "--cue-nav-hit-size-v1:48px",
  "--cue-nav-line-width-v1:2.4px",
  "--cue-nav-control-radius-v1:12px",
  "--cue-nav-control-bg-v1:transparent",
  "--cue-nav-control-shadow-v1:none"
]) assert.match(html,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));

for(const selector of [
  ".player-library-back",
  ".records-back-v2",
  ".player-stats-back",
  ".settings-page-back-v2",
  ".vs-analysis-back",
  ".player-stats-race",
  ".player-library-add",
  ".records-filter-toggle-v1",
  ".records-sort-v1",
  ".player-library-sort-v1",
  ".player-detail-chevron-v1"
]) assert.ok(html.includes(selector),`missing shared navigation selector: ${selector}`);

console.log("Navigation UI unification and Player Detail runtime regression checks passed");
