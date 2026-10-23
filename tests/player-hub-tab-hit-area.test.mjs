import "./helpers/ja-fs.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// DS-REQ-018 (Design System v2.1): every operable control has a hit area of at least 44x44pt.
// The Player Hub segmented tab keeps its 42pt visual height and extends the hit area by 1px above and below.
// The measured browser proof is tests/browser/player-hub-tab-hit-area.mjs (headless Chrome, not part of `node --test`).
const css = readFileSync(new URL("../navigation-phase2-6.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../navigation-phase2-6.js", import.meta.url), "utf8");
const block = (sel) => { const m = css.match(new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\{([^}]*)\\}")); return m ? m[1] : null; };
const px = (decl, prop) => { const m = decl.match(new RegExp("(?:^|;)" + prop + ":(-?[\\d.]+)px")); return m ? Number(m[1]) : null; };

test("Player Hub tabs keep the 42pt visual height and gain a vertical hit-area extension to >= 44pt", () => {
  const btn = block(".hub-tabs-v2 button");
  assert.ok(btn, "base button rule exists");
  assert.equal(px(btn, "min-height"), 42);
  assert.match(block(".hub-tabs-v2 button") + css, /\.hub-tabs-v2 button\{position:relative\}/);
  const before = block(".hub-tabs-v2 button::before");
  assert.ok(before, "::before hit-area rule exists");
  assert.match(before, /content:""/);
  assert.match(before, /position:absolute/);
  const m = before.match(/inset:(-?[\d.]+)px 0(?:;|$)/);
  assert.ok(m, "inset is `<n>px 0` (vertical only)");
  const ext = -Number(m[1]);
  assert.ok(42 + 2 * ext >= 44, "42pt + 2 x extension >= 44pt (DS-REQ-018)");
  assert.doesNotMatch(before, /background|border|box-shadow|pointer-events:none/);
});

test("the hit-area extension stays inside the container padding and cannot reach neighbouring controls or be clipped", () => {
  const box = block(".hub-tabs-v2");
  const pad = Number((box.match(/padding:(\d+(?:\.\d+)?)px/) || [])[1]);
  const ext = -Number(block(".hub-tabs-v2 button::before").match(/inset:(-?[\d.]+)px 0/)[1]);
  assert.ok(ext <= pad, "extension <= container padding");
  assert.doesNotMatch(box, /overflow:\s*(hidden|clip)/);
  assert.match(js, /closest\("\[data-hub-tab\]"\)/);
});
