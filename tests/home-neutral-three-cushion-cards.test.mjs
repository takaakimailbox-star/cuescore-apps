import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const serviceWorker=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");
const officialJpaIcon=fs.readFileSync(new URL("../assets/icons/games/game-jpa-9ball.svg",import.meta.url),"utf8");

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
assert.match(html,/class="cue-game-icon-v1" src="assets\/icons\/games\/game-jpa-9ball\.svg"/);
assert.match(html,/asset:"assets\/icons\/games\/game-jpa-9ball\.svg"/);
assert.doesNotMatch(html,/game-jpa-9ball-home\.svg/);
assert.doesNotMatch(serviceWorker,/game-jpa-9ball-home\.svg/);
assert.match(officialJpaIcon,/<text x="50" y="30"[^>]*>[\s\S]*?JPA<\/text>/);
assert.match(officialJpaIcon,/<path d="M17 50h13M70 50h13"/);
assert.match(officialJpaIcon,/<text x="50" y="64"[^>]*>[\s\S]*?9<\/text>/);

console.log("Neutral Home selector and shared 3-Cushion player-card checks passed.");
