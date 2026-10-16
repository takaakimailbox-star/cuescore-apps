import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { jaLiteralsInJs, jaMarkupInHtml } from "./helpers/js-ja-literals.mjs";
import { matchClose, splitTop } from "./helpers/ja-source.mjs";

// Official 108 AC-S1 (P3 completion): no Japanese string literal / static markup text remains in the product sources unless it is allow-listed with a reason
// (Cloud Sync hidden code, CSV contract, canonical stored values, Decision-pending Paywall / Share Sheet wording, language names, meta description).
const root = new URL("../", import.meta.url);
const raw = name => globalThis.__p3RawReadFileSync.call(fs, new URL(name, root), "utf8");
const allow = JSON.parse(raw("tests/fixtures/p3/ja-allowlist.json"));
const PRODUCT = fs.readdirSync(root).filter(f => /\.(js|html)$/.test(f) && !/^(sw\.js|i18n-catalog-|i18n-v1\.js|domain-constants-v1\.js|demo-data\.js|support\.html|privacy\.html|terms\.html|official-document\.js)/.test(f));

function scanProduct() {
  const found = new Map();
  for (const file of PRODUCT) {
    const src = raw(file); let items = [];
    if (file.endsWith(".js")) items = jaLiteralsInJs(src);
    else {
      for (const m of src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) items.push(...jaLiteralsInJs(m[1], src.slice(0, m.index + m[0].indexOf(">") + 1).split("\n").length - 1));
      items.push(...jaMarkupInHtml(src).filter(x => !x.marker && !x.keyed));
    }
    for (const it of items) { const k = JSON.stringify([file, it.text.trim()]); found.set(k, (found.get(k) || 0) + 1); }
  }
  return found;
}

test("AC-S1: every remaining Japanese literal is allow-listed with a reason, and the allow-list has no stale entry", () => {
  const found = scanProduct();
  const listed = new Map();
  for (const e of allow.entries) { const k = JSON.stringify([e.file, e.text]); listed.set(k, (listed.get(k) || 0) + e.count); }
  const unlisted = [...found].filter(([k, n]) => (listed.get(k) || 0) !== n).map(([k, n]) => k + " found " + n + " listed " + (listed.get(k) || 0));
  assert.deepEqual(unlisted, [], "Japanese literal outside the allow-list (translate it with window.cueT, or add it with a reason)");
  const stale = [...listed].filter(([k]) => !found.has(k)).map(([k]) => k);
  assert.deepEqual(stale, [], "stale allow-list entries");
});

test("the allow-list only uses the approved reasons and keeps the Decision-pending areas isolated", () => {
  const reasons = new Set(["CLOUD", "CSV", "DOMAIN", "U4", "U8", "LANGNAME", "META"]);
  for (const e of allow.entries) assert.ok(reasons.has(e.reason), `${e.file}: ${e.reason}`);
  // U4 (Paywall) lives in monetization-v1.js and the Settings plan card; U8 is the Backup share sheet only; neither reason leaks elsewhere
  for (const e of allow.entries.filter(e => e.reason === "U4")) assert.ok(e.file === "monetization-v1.js" || e.file === "index.html", e.file);
  assert.equal(allow.entries.filter(e => e.reason === "U8").reduce((n, e) => n + e.count, 0), 3, "title / text / dialogTitle");
  assert.equal(allow.entries.filter(e => e.reason === "DOMAIN").reduce((n, e) => n + e.count, 0), 11, "BREAK_RESULT_LABELS_V61 canonical values");
  assert.ok(allow.entries.filter(e => e.reason === "CSV").length >= 40, "CSV header row and value words");
});

test("U6: every alert / confirm / prompt message outside the hidden Cloud Sync code goes through the catalog", () => {
  const html = raw("index.html");
  const calls = []; const re = /(?<![A-Za-z0-9_$.])(?:window\.)?(alert|confirm|prompt)\(/g; let m;
  while ((m = re.exec(html))) {
    const open = m.index + m[0].length - 1; const close = matchClose(html, open);
    assert.ok(close > open, "unbalanced dialog call at " + m.index);
    const line = 1 + (html.slice(0, m.index).match(/\n/g) || []).length;
    const args = splitTop(html.slice(open + 1, close));
    calls.push({ kind: m[1], line, message: args[0] || "", ja: jaLiteralsInJs(args[0] || "").length > 0 });
  }
  const jaCalls = calls.filter(c => c.ja);
  for (const c of jaCalls) assert.ok(c.line >= 17895 && c.line <= 19470, `${c.kind} at line ${c.line} still has a Japanese literal outside Cloud Sync`);
  const viaCatalog = calls.filter(c => /^window\.cueT\(/.test(c.message.trim()));
  assert.ok(viaCatalog.length >= 30, "the application's own dialogs use window.cueT");
  assert.equal(calls.length - jaCalls.length - viaCatalog.length >= 0, true);
  // the standard dialog kinds are kept (Decision 035: no custom modal): the three native functions are still the only dialog mechanism
  assert.ok(!/class\s+CueDialog|showCustomModal\(/.test(html));
});

test("scanner self-check: comments, regular expressions and neutral punctuation are ignored; strings and template chunks are found", () => {
  const sample = ['// コメント', '/* ブロック */', 'const a = "日本語";', "const b = '目標';", 'const c = `前${x}後`;', 'const d = /日本語/.test(s);', 'const e = "・";', 'const f = "English only";'].join("\n");
  const texts = jaLiteralsInJs(sample).map(x => x.text);
  assert.deepEqual(texts, ["日本語", "目標", "前", "後"]);
});
