import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

// Decision 037 (PD-P4A-F) / Official 120 P4A-R7: the Main badge stays; only a long player name is ellipsized. The badge's size, colour and position are untouched
// (its own rules are not redefined), normal names keep their layout.
const html = globalThis.__p3RawReadFileSync.call(fs, new URL("../index.html", import.meta.url), "utf8");
const block = html.slice(html.indexOf("/* Main badge (P4 approval item F)"), html.indexOf("</style>", html.indexOf("/* Main badge (P4 approval item F)")));

test("both name templates wrap the player name in .player-name-text-v1 and keep the badge as its sibling", () => {
  assert.match(html, /<strong class="player-management-name-v1"><span class="player-name-text-v1">\$\{escapeRecordText\(player\.name\)\}<\/span>\$\{player\.isPrimary \? `<span class="player-primary-badge-v1">/);
  assert.match(html, /<span class="player-library-name"><span class="player-name-text-v1">\$\{escapeRecordText\(p\.name\)\}<\/span>\$\{p\.isPrimary \? `<span class="player-primary-badge-v1">/);
});
test("the name span ellipsizes and the badge cannot shrink", () => {
  assert.ok(block.includes(".player-name-text-v1{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"));
  assert.ok(block.includes(".player-management-name-v1 .player-primary-badge-v1,.player-library-name .player-primary-badge-v1{flex:0 0 auto}"));
});
test("the badge's size, colour and own rules are not redefined (only position compensation inside the flex containers)", () => {
  const badgeRules = [...block.matchAll(/([^{}\n]*player-primary-badge-v1[^{}\n]*)\{([^}]*)\}/g)].map(m => m[2]);
  for (const body of badgeRules) assert.doesNotMatch(body, /(?:^|;)\s*(?:font-size|padding|background|color|border|width|height|min-width|border-radius)\s*:/);
  assert.match(html, /\.player-primary-badge-v1\{display:inline-flex;align-items:center;margin-left:8px;padding:2px 7px;border:1px solid #bdbdb9;border-radius:999px;background:#f3f3f1;color:#333;font-size:10px;font-weight:800;line-height:1\.2;vertical-align:middle\}/);
});
test("only the layout of the name containers changes, scoped to the two player lists; no Japanese in the block", () => {
  assert.doesNotMatch(block, /[぀-ヿ一-鿿]/);
  assert.doesNotMatch(block, /--[a-z-]+\s*:/);
});
