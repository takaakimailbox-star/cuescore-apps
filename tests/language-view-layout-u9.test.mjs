import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const view = html.slice(html.indexOf('data-suite-view="language"'), html.indexOf('data-suite-view="sync-history"'));

test("U9: the language-view intro reserves two lines (min-height only), so the Apply button has the same vertical position in every language", () => {
  assert.match(view, /<p class="settings-suite-intro-v2 settings-suite-language-intro-v1">\$\{window\.cueT\("settings\.language\.intro"\)\}<\/p>/);
  assert.match(html, /\.settings-suite-intro-v2\{margin:0 10px 20px;color:#292927;font-size:14px;line-height:1\.65\}\s*\/\*[^*]*\*\/\s*\.settings-suite-language-intro-v1\{min-height:3\.3em\}/);
  const rule = html.match(/\.settings-suite-language-intro-v1\{([^}]*)\}/)[1];
  assert.doesNotMatch(rule, /(^|;)\s*(height|max-height|overflow)\s*:/, "no fixed height, nothing may be clipped");
  assert.equal((html.match(/settings-suite-language-intro-v1/g) || []).length, 2, "only the language view uses the modifier");
});

test("U9: the approved design is unchanged — option order, labels, Apply button and Design System classes", () => {
  const order = [...view.matchAll(/name="suiteLanguage" value="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(order, ["auto", "ja", "en", "zh-Hans"]);
  assert.match(view, /<strong>日本語<\/strong>/); assert.match(view, /<strong>English<\/strong>/); assert.match(view, /<strong>简体中文<\/strong>/);
  assert.match(view, /<button class="settings-suite-primary-v2" id="suiteLanguageApply" type="button">\$\{window\.cueT\("settings\.language\.apply"\)\}<\/button>/);
  assert.match(html, /\.settings-suite-primary-v2,\.settings-suite-secondary-v2,\.settings-suite-danger-v2\{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:48px/);
});
