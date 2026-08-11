import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(
  html,
  /id="newMatchRacePickerCloseV1" class="cue-circle-close-v1"/,
  "Race/number picker must use the shared circular close shape"
);

const sharedCloseRule = html.match(/\.cue-circle-close-v1\s*\{([\s\S]*?)\n\}/)?.[1] || "";
for (const declaration of [
  /width:44px!important/,
  /height:44px!important/,
  /min-width:44px!important/,
  /min-height:44px!important/,
  /aspect-ratio:1\/1!important/,
  /flex:0 0 44px!important/,
  /display:grid!important/,
  /place-items:center!important/,
  /border-radius:50%!important/,
  /-webkit-appearance:none!important/
]) {
  assert.match(sharedCloseRule, declaration);
}

assert.match(
  html,
  /@media \(max-width: 600px\), \(hover: none\) and \(pointer: coarse\) \{\s*:where\(button:not\(\.result-dot\), \[role="button"\]\) \{ min-height: 44px; \}/,
  "the global mobile touch target must remain intact"
);
assert.match(html, /\.new-match-race-sheet-head-v1\{display:flex;align-items:center;justify-content:space-between/);
assert.doesNotMatch(html, /officialResultCloseV1|\.official-result-close-v1\s*\{/);
assert.match(html, /\.player-editor-close-v1\{[^}]*width:44px;height:44px/);

console.log("Circular modal close regression checks passed");
