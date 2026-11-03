import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = f => readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
const js = read("match-setup-ux-v1.js"), css = read("match-setup-ux-v1.css"), html = read("index.html"), b18 = read("final-ui-build18.js");

test("Build 99 STOP repair: the label wrap is MEASURED (font independent) and both name boxes get the same two-line height only when one label wraps", () => {
  assert.match(js, /const r = doc\.createRange\(\); r\.selectNodeContents\(nm\);/, "line count from the text node, not from the box height");
  assert.match(js, /grid\.classList\.toggle\("cue-name-wrap-v1", labelLines\(1\) > 1 \|\| labelLines\(2\) > 1\)/);
  assert.match(js, /alignNames\(\);\n/, "evaluated on every setup refresh");
  assert.match(js, /root\.addEventListener\("resize", later\);/, "re-measured when the window size changes");
  const rules = css.match(/\.new-match-player-grid-v1\.cue-name-wrap-v1 [^{]*\{[^}]*\}/g) || [];
  assert.equal(rules.length, 2);
  assert.ok(rules.every(r => /min-height:44px!important/.test(r)));
  assert.ok(/:not\(\.is-empty-v1\)[^{]*\{min-height:44px!important;line-height:44px!important\}/.test(rules[1]), "selected names stay vertically centred in the same two-line box");
});

test("the approved D2 sizes and the main-player rules are untouched (no auto-promotion, no forced P1 selection)", () => {
  assert.match(css, /\.cue-player-stack-v2 \.is-empty-v1 \.new-match-player-select-v1 \.new-match-player-name-v1\{font-size:18px!important/);
  assert.match(css, /:not\(\.is-empty-v1\) \.new-match-player-select-v1 \.new-match-player-name-v1\{font-size:23px!important/);
  assert.match(html, /function primaryPlayerV1\(players=readPlayerLibrary\(\)\) \{\s*return players\.find\(player=>player\.isPrimary===true\) \|\| null;/);
  assert.match(html, /const primary=primaryPlayerV1\(\);\s*if \(!primary\) return false;/, "no main player -> nothing is selected automatically (Official 103/104)");
  assert.match(b18, /if\(players\.length&& !selected\(1\)\)initializePrimaryMatchSetupV1\(\{force:true\}\);/);
  assert.match(b18, /start\.disabled=players\.length<2\|\|!selected\(1\)\|\|!selected\(2\)\|\|String\(selectedRegisteredPlayer\[1\]\)===String\(selectedRegisteredPlayer\[2\]\);/, "start condition unchanged");
});
