import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

// P5 visual fit (Official 108 P5: wrap / min-width / ellipsis rules only). Pins the minimal CSS added in the P4 Review Policy gate:
// (1) English-only font-size fit for <=340px screens, (2) Match Detail result names get max-width:100% so the declared ellipsis works.
const html = globalThis.__p3RawReadFileSync.call(fs, new URL("../index.html", import.meta.url), "utf8");
const block = html.slice(html.lastIndexOf("/* P5 visual fit (Official 108 P5)"), html.lastIndexOf("</style>", html.length));

test("320px-class fit is English-only and limited to <=340px screens", () => {
  assert.ok(block.includes('@media(max-width:340px){'));
  assert.ok(block.includes('html[lang="en"] .cue-player-stack-v2 .new-match-player-name-v1{font-size:14px!important}'));
  assert.ok(block.includes('html[lang="en"] .player-library-title{font-size:15px!important}'));
  const media = block.slice(block.indexOf("@media(max-width:340px){"), block.indexOf("}\n/* P5-1a"));
  assert.ok(!/(?<!html\[lang="en"\] )\.(cue-player-stack-v2|player-library-title)\b[^{]*\{/.test(media.replace(/html\[lang="en"\] [^{]*\{/g, "")), "every rule inside the media block is scoped to html[lang=en]");
});
test("Match Detail result names keep their declared ellipsis (max-width:100%)", () => {
  assert.ok(block.includes(".match-detail-result-name-v2{max-width:100%}"));
  assert.match(html, /\.match-detail-result-name-v2\{\s*min-width:0;\s*overflow:hidden;\s*text-overflow:ellipsis;\s*white-space:nowrap;/);
});
test("the P5 CSS block contains no Japanese and no tokens/dimensions of the design system are redefined", () => {
  assert.doesNotMatch(block, /[぀-ヿ一-鿿]/);
  assert.doesNotMatch(block, /--[a-z-]+\s*:/);
});
