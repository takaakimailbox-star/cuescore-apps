import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

assert.doesNotMatch(
  html,
  /class="cue-discipline-v1 is-selected"[^>]*data-discipline="rotation"/,
  "Home must not ship with a preselected discipline ring"
);
assert.match(html,/button\.classList\.remove\("is-selected"\);/);
assert.match(html,/button\.setAttribute\("aria-selected", "false"\);/);
assert.match(html,/button\.setAttribute\("aria-pressed", "false"\);/);
assert.doesNotMatch(html,/\.three-cushion-game-v1 \.pro-score\{font-size:/);
assert.doesNotMatch(html,/\.three-cushion-game-v1 \.pro-stats\{font-size:/);
assert.doesNotMatch(html,/\.three-cushion-game-v1 #proP1Goal/);
assert.match(html,/<span>プレー中の得点<\/span><strong id="threeCushionRunValueV1">0<\/strong>/);
assert.match(html,/threeCushionModeV1 \? "持ち点"/);

console.log("Neutral Home selector and shared 3-Cushion player-card checks passed.");
