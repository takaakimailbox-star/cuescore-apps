import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../match-setup-ux-v1.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../match-setup-ux-v1.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("C plan: avatar, name and Race to are one tight group (no bottom-pinned Race to, no forced card height)", () => {
  assert.match(css, /\.new-match-race-row-v2\{margin:10px 0 0!important\}/);
  assert.match(css, /\.new-match-player-select-v1\{padding-bottom:0!important\}/);
  assert.ok(!/new-match-player-card-v1\{min-height:clamp/.test(css), "the earlier forced card min-height is gone");
  assert.ok(css.lastIndexOf("margin:10px 0 0!important") > css.indexOf("margin:auto 0 0"), "the grouped margin is declared after, and !important over, the old bottom-pinned one");
});

test("C plan: spare height goes between the sections; the start button keeps about 24pt above the tab bar", () => {
  assert.match(css, /\.cue-new-match-summary-v2\{margin:0 0 clamp\(6px,1\.8vh,18px\)!important\}/);
  assert.match(css, /\.cue-sc-setup\{margin-top:clamp\(14px,3\.4vh,36px\)!important\}/);
  assert.match(css, /#cueSetupFooterV1\{padding-bottom:clamp\(10px,2\.8vh,26px\)\}/);
  assert.match(css, /#cueSetupFooterV1\{display:block;flex:0 0 auto/, "the footer stays an independent flex child above the tab bar");
});

test("C plan: the opponent guidance sits below the opponent card, reuses the approved key, is aria-hidden and has no new wording", () => {
  assert.match(js, /note\.id = "cueSetupOppNoteV1"/);
  assert.match(js, /note\.setAttribute\("aria-hidden", "true"\)/);
  assert.match(js, /T\("setupux\.reason\.p2"\)/);
  assert.match(js, /oppNote\(!name\(2\)\)/);
  assert.match(css, /\.cue-setup-note-v1\{grid-column:2;grid-row:2;/);
  assert.match(css, /background:#e9eff5;color:#1c2a3a/);
  assert.ok(!/setupux\.reason\.aria|setupux\.reason\.other/.test(js));
});

test("yellow state colours stay (shared focus, turn / selection / winner); the swap button moved up with the grouped cards", () => {
  assert.match(html, /:where\(button, a, input, select, textarea, \[tabindex\]\):focus-visible\s*\{\s*outline: 3px solid #ffd54a !important;/);
  assert.match(html, /\.pro-player-panel\.active\s*\{\s*border-color: #ffd54a;/);
  assert.match(css, /\.new-match-swap-v1\{position:absolute!important;left:-27px!important;top:22px!important/);
});
