import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../match-setup-ux-v1.css", import.meta.url), "utf8");
const b18 = readFileSync(new URL("../final-ui-build18.js", import.meta.url), "utf8");
const seedFn = html.match(/function seedInitialPlayersV1\(\) \{[\s\S]*?\n  \}\n  seedInitialPlayersV1\(\);/)[0];

test("D plan: initial players are created only for a completely new install (key absent, no other usage key, no demo)", () => {
  assert.match(seedFn, /CueScoreDemoData\?\.isDemo\?\.\(\)\) return false;/);
  assert.match(seedFn, /localStorage\.getItem\(PLAYER_LIBRARY_KEY\) !== null\) return false;/, "any saved / deleted / restored library (even []) blocks it");
  assert.match(seedFn, /if \(!INITIAL_PLAYERS_BOOT_KEYS_V1\.has\(key\)\) return false;/, "any non-default CueScore key means the app was used");
  assert.match(seedFn, /match\(Categories\|Seasons\)[^\n]*!== "\[\]"\) return false;/);
  assert.match(seedFn, /catch \(error\) \{[\s\S]*return false;/, "an unreadable state adds nothing");
  const boot = html.match(/INITIAL_PLAYERS_BOOT_KEYS_V1 = new Set\(\[([^\]]*)\]\)/)[1];
  assert.equal([...boot.matchAll(/"([^"]+)"/g)].length, 8, "exactly the 8 default keys the app writes at boot (+ language)");
  assert.ok(!/userData|Marker|marker|firstLaunch/.test(seedFn), "no new persistent marker key");
});

test("D plan: Score 1 / Score 2 are ordinary players with independent IDs; Score 1 is the main player; names are fixed (not translated)", () => {
  assert.match(seedFn, /\["Score 1", "Score 2"\]\.map/);
  assert.match(seedFn, /id: makePlayerId\(\)/);
  assert.match(seedFn, /\.\.\.\(index === 0 \? \{ isPrimary: true \} : \{\}\)/);
  assert.match(seedFn, /verifiedLocalStorageWriteV131\(PLAYER_LIBRARY_KEY, players\)/);
  assert.ok(!/cueT\(/.test(seedFn), "names do not depend on the language");
  assert.ok(html.indexOf("seedInitialPlayersV1();") < html.indexOf("  readPlayerLibrary();\n\n  function makePlayerId"), "registered before the first library read");
});

test("D plan: Score 2 is selected as the second player on the first launch only; the start condition is untouched", () => {
  assert.match(html, /initializePrimaryMatchSetupV1\(\);\n    applyInitialSecondPlayerV1\(\);/);
  const fn = html.match(/function applyInitialSecondPlayerV1\(\) \{[\s\S]*?\n  \}\n/)[0];
  assert.match(fn, /initialSecondPlayerIdV1 = null;/, "consumed once");
  assert.match(fn, /selectedRegisteredPlayer\[2\] \|\| selectedRegisteredPlayer\[1\] === id\) return false;/);
  assert.match(b18, /start\.disabled=players\.length<2\|\|!selected\(1\)\|\|!selected\(2\)\|\|String\(selectedRegisteredPlayer\[1\]\)===String\(selectedRegisteredPlayer\[2\]\);/, "start condition unchanged");
});

test("D / D2 plan: unselected = light-grey dashed card and avatar ring, selected = solid card; D2 sizes (68px avatar, 23px name, 18px guidance, 17px Race to); no red", () => {
  const d = css.slice(css.indexOf("/* D2 final design (PO 2026-11-02)"));
  assert.match(d, /\.new-match-player-card-v1\.is-empty-v1\{border:1\.5px dashed #c8c8c4!important;background:#fff!important\}/);
  assert.match(d, /\.new-match-avatar-v1\.has-player-avatar-v2\{box-sizing:border-box;border:1\.5px dashed #bcbcb8!important;border-radius:50%/);
  assert.match(d, /\.cue-player-stack-v2 \.new-match-player-select-v1 \.new-match-avatar-v1\.has-player-avatar-v2\{width:68px!important;height:68px!important/);
  assert.match(d, /:not\(\.is-empty-v1\) \.new-match-player-select-v1 \.new-match-player-name-v1\{font-size:23px!important/);
  assert.match(d, /\.is-empty-v1 \.new-match-player-select-v1 \.new-match-player-name-v1\{font-size:18px!important/);
  assert.match(d, /\.new-match-race-row-v2 strong\{font-size:17px!important\}/);
  assert.match(d, /\.cue-new-match-summary-v2\{margin:0 0 clamp\(24px,6vh,60px\)!important\}/);
  const colors = [...d.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)].map(m => m[1].length === 3 ? m[1].replace(/./g, "$&$&") : m[1]);
  assert.ok(colors.length >= 6);
  // neutral greys / white, plus the calm slate of the decorative (i) (#5a6b7d): never red / yellow
  for (const c of colors) { const [r, g, b] = [0, 2, 4].map(k => parseInt(c.slice(k, k + 2), 16)); assert.ok(r <= b + 6 && Math.abs(r - g) <= 22, `#${c} is neutral / cool (no red, no yellow)`); }
  assert.ok(!/red/i.test(d.replace(/\/\*[\s\S]*?\*\//g, "")), "no red in the rules (comments excluded)");
  assert.ok(!/dotted|underline/.test(d.replace(/no underline/g, "")), "no dotted / underline");
});
