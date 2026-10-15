import "./helpers/ja-fs.mjs";
/* P2-8 closure audit (Official 108 Part III §2 AC-S2 / S3 / S4 / S5 / S6 and the P2 ledger). Everything here is a STATIC check of the current tree; the runtime halves
 * (dynamic AC-S3 --expect-zero, baseline-vs-current parity, differential flows) are recorded in the Evidence of the P2 phases. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { read, extractFunction, count, domain } from "./helpers/p2-source.mjs";
import { matchClose } from "./helpers/p2-source.mjs";
import { observerScan } from "./helpers/p2-ac-s3.mjs";

const ROOT = new URL("../", import.meta.url);
const PROD = fs.readdirSync(ROOT).filter(f => /\.(js|html)$/.test(f) && !/^(sw\.js|support\.html|privacy\.html|terms\.html|official-document\.js|demo-data\.js|domain-constants-v1\.js)$/.test(f) && !/^i18n-catalog-/.test(f));
const html = read("index.html");

/* ---------- ledger ---------- */
const rows = read("tests/fixtures/p2/ledger-closure.tsv").trim().split("\n").map(l => l.split("\t"));
const head = rows.shift(); const col = Object.fromEntries(head.map((h, i) => [h, i]));
test("[P2-8 ledger] all 134 rows of the P2 dependency ledger have a closing status; none is open; counts are pinned", () => {
  assert.equal(rows.length, 134);
  assert.deepEqual(rows.map(r => r[col.id]), Array.from({ length: 134 }, (_, i) => "P2L-" + String(i + 1).padStart(3, "0")));
  const valid = new Set(["CLOSED", "ALLOWED_STRUCTURE", "GATED_DORMANT", "PROTECTED_VERIFIED", "NO_CHANGE_BY_DESIGN", "OPTIONAL_NOT_APPLIED", "RETAINED_DORMANT", "P3_DEFERRED", "MIGRATED_TEST"]);
  const per = {}; for (const r of rows) { assert.ok(valid.has(r[col.status]), r[col.id] + " " + r[col.status]); assert.ok(r[col.evidence].length > 10, r[col.id]); per[r[col.status]] = (per[r[col.status]] || 0) + 1; }
  assert.deepEqual(per, { CLOSED: 92, OPTIONAL_NOT_APPLIED: 10, ALLOWED_STRUCTURE: 9, NO_CHANGE_BY_DESIGN: 8, PROTECTED_VERIFIED: 5, MIGRATED_TEST: 5, P3_DEFERRED: 3, RETAINED_DORMANT: 1, GATED_DORMANT: 1 });
  for (const r of rows.filter(r => r[col.status] === "CLOSED")) assert.notEqual(r[col.closed_in], "-", r[col.id]);
});
test("[P2-8 ledger] the 134 ledger anchors still resolve to current source text (moved sites are re-anchored, none disappeared)", () => {
  const anchors = JSON.parse(read("tests/fixtures/p2/ledger-anchors.json"));
  assert.equal(anchors.length, 134);
  for (const a of anchors) assert.ok(read(a.file).includes(a.snippet), a.id);
});

/* ---------- AC-S2 ---------- */
test("[AC-S2] display-text comparisons: 0 in production (textContent / innerText / innerHTML / getAttribute compared or searched with Japanese literals)", () => {
  const eq = /textContent\s*(?:\)|\?\.)?\s*(===|!==|==)\s*["'`][^"'`\n]*[぀-鿿]/g;
  const incl = /(?:textContent|innerText|innerHTML|getAttribute\([^)]*\))\)?(?:\?\.|\.)(?:includes|startsWith|endsWith|match|test)\(\s*["'/`][^\n]{0,40}?[぀-鿿]/g;
  let total = 0; for (const f of PROD) { const s = read(f); total += count(s, eq) + count(s, incl); }
  assert.equal(total, 0);
});

/* ---------- AC-S3 ---------- */
test("[AC-S3] no MutationObserver callback can reach a text-writing function; the only text-capable registration left is the Cloud Sync mirror, which exists only when Cloud Sync is enabled", () => {
  const known = JSON.parse(read("tests/fixtures/p2/observer-ac-s3-known.json"));
  const scan = observerScan();
  assert.equal(scan.length, 14);
  assert.deepEqual(scan.filter(s => s.textWriters.length).map(s => s.key), ["index.html#5"]);
  assert.equal(known.find(k => k.key === "index.html#5").class, "TEXT_MIRROR_GATED");
  assert.deepEqual(scan.filter(s => s.usesCueT), []);
  assert.equal(known.filter(k => k.class === "TEXT_REWRITE").length, 0);
  assert.equal(known.filter(k => k.class === "REMOVED").length, 9);
  assert.equal(known.filter(k => ["STRUCTURE", "STATE", "DIAGNOSTIC"].includes(k.class)).length, 13);
  assert.ok(html.includes('if (window.CueScoreFeatureAccess.canUse("cloudSync")) {\n    mirrorStatus('));
  assert.equal(count(html, "cloudSync:false"), 2);
});
test("[AC-S3 / L-SW-1] no DOM-wide MutationObserver string replacement exists in the i18n core, and no production script observes document.body with a text writer", () => {
  for (const f of ["i18n-v1.js", "i18n-catalog-ja-v1.js", "i18n-catalog-en-v1.js", "i18n-catalog-zh-hans-v1.js"]) assert.ok(!/MutationObserver/.test(read(f)), f);
  assert.deepEqual(observerScan().filter(s => s.textWriters.length).map(s => s.key), ["index.html#5"]); // the Cloud Sync mirror only (guarded; observes hidden status nodes, never document.body)
});

/* ---------- AC-S4 ---------- */
test("[AC-S4] canonical values (resultLabel, default / reserved category names) are never compared as literals outside the Domain constants", () => {
  const canon = new Set([...Object.values(domain.RESULT_LABELS), domain.FREE_CATEGORY.name, ...Object.values(domain.DEFAULT_CATEGORIES).map(c => c.name), ...domain.LEGACY_REMOVED_CATEGORY_NAMES, ...domain.RESERVED_CATEGORY_NAMES].filter(x => typeof x === "string"));
  assert.ok(canon.size >= 15);
  const hits = [];
  for (const f of PROD) { const t = read(f); for (const c of canon) { const e = c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); const re = new RegExp("(?:===|!==|==|!=)\\s*[\"'`]" + e + "[\"'`]|[\"'`]" + e + "[\"'`]\\s*(?:===|!==|==|!=)|case\\s+[\"']" + e + "[\"']|\\.(?:includes|indexOf|startsWith|endsWith)\\(\\s*[\"'`]" + e + "[\"'`]", "g"); const n = count(t, re); if (n) hits.push(f + ":" + c + ":" + n); } }
  assert.deepEqual(hits, []);
  // the detector itself works: it finds every one of these
  for (const probe of ['x === "無得点"', "'スクラッチ' !== y", 'case "記録なし":', 'list.includes("大会")']) { let found = false; for (const c of canon) { const e = c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); if (new RegExp("(?:===|!==|==|!=)\\s*[\"'`]" + e + "[\"'`]|[\"'`]" + e + "[\"'`]\\s*(?:===|!==|==|!=)|case\\s+[\"']" + e + "[\"']|\\.(?:includes|indexOf|startsWith|endsWith)\\(\\s*[\"'`]" + e + "[\"'`]").test(probe)) found = true; } assert.ok(found, probe); }
});

/* ---------- AC-S5 ---------- */
test("[AC-S5] storage-writing code paths do not reference the language: no function that writes storage calls cueT / CueScoreI18n / cueResultLabel / getLanguage (one pinned UI-preference exception)", () => {
  const WR = /localStorage\.setItem|verifiedLocalStorageWriteV131\(|writePlayerLibrary\(|writeMatchRecords\(|safeWrite|sessionStorage\.setItem/;
  const LANG = /\bcueT\(|CueScoreI18n|cueDate\(|cueResultLabel\(|getLanguage|\.language\b/;
  const re = /(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g; let m; let total = 0; const hits = [];
  while ((m = re.exec(html))) { const p = html.indexOf("(", m.index); const bo = html.indexOf("{", matchClose(html, p)); const end = matchClose(html, bo); if (end < 0) continue; const body = html.slice(bo, end + 1); if (WR.test(body)) { total++; if (LANG.test(body)) hits.push(m[1]); } }
  assert.ok(total >= 35, "storage-writing functions scanned: " + total);
  // rival analysis render(): displays dates with cueDate and remembers the last two selected opponents; the stored value is {p1:key,p2:key} (language independent)
  assert.deepEqual(hits, ["render"]);
  assert.ok(html.includes("localStorage.setItem(VS_SELECTION_KEY,JSON.stringify({p1:a.key,p2:b.key}));"));
  for (const f of ["match-sharing-adapters-v1.js", "match-sharing-format-v1.js", "match-sharing-persistence-v1.js", "match-sharing-receiver-v1.js", "match-sharing-sender-v1.js", "match-sharing-transaction-v1.js", "match-sharing-validation-v1.js", "record-access-v1.js"]) assert.ok(!/cueT\(|CueScoreI18n|cueDate|cueScore\.language|\.language\b|navigator\.language/.test(read(f)), f);
});

/* ---------- AC-S6 ---------- */
test("[AC-S6] identity / sort / normalization locales come from Domain constants; the only locale literals left are the fixed en-US privacy-key filter; the 5 remaining NFKC literals are game-type key folding, not name identity", () => {
  const lit = [];
  for (const f of PROD) for (const [i, line] of read(f).split("\n").entries()) if (/(toLocaleLowerCase|localeCompare)\([^\n]*["'](ja|en|zh)[^"']*["']/.test(line)) lit.push(f + ":" + line.trim().slice(0, 60));
  assert.deepEqual(lit, ['match-sharing-validation-v1.js:if(FORBIDDEN_KEYS.has(String(key).toLocaleLowerCase("en-US")']);
  const nfkc = []; for (const f of PROD) { const ls = read(f).split("\n"); ls.forEach((line, i) => { if (/\.normalize\(\s*["']NFKC["']\s*\)/.test(line)) nfkc.push(f + ":" + (ls[i - 1] || "").trim() + " " + line.trim()); }); }
  assert.equal(nfkc.length, 5);
  // game-type / event-type / discipline enum keys folded to ASCII (width folding) - none of them touches player names
  for (const l of nfkc) { assert.ok(/gameType|sourceType|String\(value \|\| ""\)/.test(l), l); assert.ok(!/\.name\b|trim\(\)/.test(l), l); }
  assert.equal(count(html, "CueScoreDomainV1.IDENTITY_LOCALE") >= 10, true);
  assert.equal(count(html, "CueScoreDomainV1.SORT_LOCALE"), 13);
});

/* ---------- things that must NOT have been deleted ---------- */
test("[P2-8] dormant / legacy-compatibility code is retained: BREAK_RESULT_LABELS_V61 and the quota legacy message alternative", () => {
  assert.ok(html.includes("BREAK_RESULT_LABELS_V61"));
  assert.ok(html.includes("/quota|storage quota|保存容量が不足/i.test(String(currentError.message || \"\"))"));
});
test("[P2-8 / L-I18N-2] the language switch writes only its own key (S-B flag stays false)", () => {
  assert.ok(html.includes("const LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false;"));
  assert.ok(read("i18n-v1.js").includes('const STORAGE_KEY="cueScore.language.v1";'));
});
