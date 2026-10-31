import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../match-setup-ux-v1.css", import.meta.url), "utf8");

test("the shared yellow focus contract remains unchanged", () => {
  assert.match(html, /:where\(button, a, input, select, textarea, \[tabindex\]\):focus-visible\s*\{\s*outline: 3px solid #ffd54a !important;\s*outline-offset: 3px !important;/);
});

test("only the editable Other numeric input receives the neutral two-tone focus ring", () => {
  assert.match(css, /\.new-match-race-custom-v1 input\[type="number"\]:focus-visible\{\s*outline:2px solid #171717!important;\s*outline-offset:2px!important;\s*box-shadow:0 0 0 4px #fff!important;\s*\}/);
  assert.doesNotMatch(css, /:where\([^}]*\):focus-visible\s*\{[^}]*outline:2px solid #171717/);
  assert.doesNotMatch(css, /(?:^|[,{])\s*input\[type="number"\]:focus-visible\s*\{/m);
});

test("turn, selection, winner, 9-Ball identity and shot-clock colours stay protected", () => {
  assert.match(html, /\.pro-player-panel\.active\s*\{\s*border-color: #ffd54a;/);
  assert.match(html, /\.pro-next-break-btn\.selected\s*\{[\s\S]*?border-color: #ffd54a;/);
  assert.match(html, /\.pro-final-panel\.winner\s*\{\s*border-color: #ffd54a;/);
  assert.match(html, /\.cue-discipline-v1\[data-discipline="9ball"\]\.is-selected \.cue-ball-icon-v1\{\s*border-color:#c8a829!important;/);
  const clock = readFileSync(new URL("../shotclock-v1.css", import.meta.url), "utf8");
  assert.match(clock, /--cue-scg-normal:#F2DD75;--cue-scg-ext:#66BA80;--cue-scg-warn:#F2C56E;--cue-scg-danger:#F1AC66/);
});
