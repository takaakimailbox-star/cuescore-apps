/* P2-6: date display goes through ONE Display formatter (i18n-v1 formatDatePattern / window.cueDate). The Japanese output must equal the replaced
 * hand-built formatters for every date, and stored values / export formats / date LOGIC must be untouched.
 * Per-site equality over many inputs (incl. invalid / null / 0 / Tokyo and UTC) is additionally pinned by the P2-0 date goldens. */
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { read, count } from "./helpers/p2-source.mjs";

const core = createRequire(import.meta.url)("../i18n-v1.js");
const html = read("index.html");
const pad = n => String(n).padStart(2, "0");
const W = ["日", "月", "火", "水", "木", "金", "土"];
/* reference = the hand-built expressions that existed before P2-6 (kept here only as oracles) */
const REF = {
  "md": d => `${d.getMonth() + 1}/${d.getDate()}`,
  "mmdd": d => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`,
  "ymd": d => `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`,
  "ymd-short": d => `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`,
  "ymd-hm": d => `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`,
  "ymd-w": d => `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}（${W[d.getDay()]}）`,
  "ymd-w-hm": d => `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}（${W[d.getDay()]}）${pad(d.getHours())}:${pad(d.getMinutes())}`,
  "ymd-w-sp-hm": d => `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}（${W[d.getDay()]}） ${pad(d.getHours())}:${pad(d.getMinutes())}`,
  "md-w-sp-hm": d => `${d.getMonth() + 1}/${d.getDate()}（${W[d.getDay()]}） ${pad(d.getHours())}:${pad(d.getMinutes())}`,
  "hm": d => `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  "h-mm": d => `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`
};
const samples = (() => {
  const out = [new Date(0), new Date("1999-12-31T23:59:59"), new Date("2000-01-01T00:00:00"), new Date("2026-02-28T14:59:59Z"), new Date("2024-02-29T12:00:00Z"), new Date("2026-12-31T23:59:59+09:00")];
  for (let day = 0; day < 800; day += 7) for (const h of [0, 1, 9, 12, 23]) out.push(new Date(Date.UTC(2025, 0, 1 + day, h, (day * 7 + h) % 60, 5)));
  for (let i = 0; i < 400; i++) out.push(new Date(1.2e12 + i * 7.3e9 + i * 12345));
  return out;
})();

test("[P2-6] every pattern equals its hand-built reference for ~1,000 dates (local time, Asia/Tokyo or UTC alike)", () => {
  assert.deepEqual(Object.keys(core.DATE_PATTERNS.ja).sort(), Object.keys(REF).sort());
  for (const [id, ref] of Object.entries(REF)) for (const d of samples) assert.equal(core.formatDatePattern("ja", d, id), ref(d), `${id} ${d.toISOString()}`);
});
test("[P2-6] invalid dates keep the legacy output byte for byte ('NaN' parts, 'undefined' weekday); non-Date input throws a TypeError like the old getters did", () => {
  const bad = new Date("x");
  for (const [id, ref] of Object.entries(REF)) assert.equal(core.formatDatePattern("ja", bad, id), ref(bad), id);
  assert.equal(core.formatDatePattern("ja", bad, "ymd-hm"), "NaN/NaN/NaN NaN:NaN");
  for (const v of ["2026-01-05T12:00:00Z", 0, null, undefined]) assert.throws(() => core.formatDatePattern("ja", v, "ymd"), TypeError);
});
test("[P2-6/P3] ja output is the legacy table; an unknown language falls back to it; en / zh-Hans have their own provisional tables with the same pattern ids; unknown pattern ids fail loudly; the input Date is not modified", () => {
  const d = new Date("2026-07-04T03:04:05Z"), t = d.getTime();
  for (const id of Object.keys(REF)) assert.equal(core.formatDatePattern("xx", d, id), core.formatDatePattern("ja", d, id));
  for (const lang of ["en", "zh-Hans"]) assert.deepEqual(Object.keys(core.DATE_PATTERNS[lang]).sort(), Object.keys(core.DATE_PATTERNS.ja).sort(), lang);
  // P3 (was: "en / zh-Hans use the Japanese table until P3"): fixed local date, exact provisional output
  const local = new Date(2026, 9, 8, 9, 5);
  assert.equal(core.formatDatePattern("en", local, "ymd-w-hm"), "Thu, Oct 8, 2026 09:05");
  assert.equal(core.formatDatePattern("en", local, "ymd"), "Oct 8, 2026");
  assert.equal(core.formatDatePattern("en", local, "md-w-sp-hm"), "Thu, Oct 8 09:05");
  assert.equal(core.formatDatePattern("zh-Hans", local, "ymd-w"), "2026年10月8日 周四");
  assert.equal(core.formatDatePattern("zh-Hans", local, "md"), "10月8日");
  assert.equal(core.formatDatePattern("ja", local, "ymd-w-hm"), "2026/10/08（木）09:05");
  assert.throws(() => core.formatDatePattern("ja", d, "nope"), RangeError);
  assert.equal(d.getTime(), t);
  assert.ok(Object.isFrozen(core.DATE_PATTERNS) && Object.isFrozen(core.DATE_PATTERNS.ja) && Object.isFrozen(core.DATE_PATTERNS.en) && Object.isFrozen(core.DATE_WEEKDAYS.ja));
  for (const lang of ["ja", "en", "zh-Hans"]) assert.equal(core.DATE_WEEKDAYS[lang].length, 7);
  assert.equal(core.DATE_MONTHS.en.length, 12);
});
test("[P2-6] the date formatter returns strings only: it never produces or accepts a stored value (stored dates stay ISO strings; no displayed date is parsed)", () => {
  const src = read("i18n-v1.js");
  const fn = src.slice(src.indexOf("function formatDatePattern"), src.indexOf("return Object.freeze({", src.indexOf("function formatDatePattern")));
  assert.ok(!/localStorage|JSON\.parse|toISOString|setItem|Date\.parse|new Date\(/.test(fn));
});
test("[P2-6] wiring: window.cueDate is published beside cueT, and every converted production site uses a named pattern (counts pinned)", () => {
  assert.ok(html.includes('window.cueDate = (value, patternId) => instance.formatDatePattern(value, patternId);'));
  const per = {};
  for (const f of ["index.html", "analysis-build4.js", "navigation-phase2-6.js", "player-detail-build6.js"]) for (const m of read(f).matchAll(/window\.cueDate\([^,()]+,\s*"([a-z-]+)"\)/g)) per[m[1]] = (per[m[1]] || 0) + 1;
  assert.deepEqual(per, { "md": 3, "ymd": 3, "ymd-hm": 5, "ymd-short": 1, "hm": 4, "ymd-w-hm": 1, "ymd-w": 1, "ymd-w-sp-hm": 1, "h-mm": 1 });
  assert.ok(html.includes('return window.cueDate(d,short?"mmdd":"ymd");}'), "fmtDate chooses mmdd / ymd");
  for (const id of Object.keys(per)) assert.ok(core.DATE_PATTERNS.ja[id], id);
});
test("[P2-6] no hand-built display date remains: the only getFullYear()-based YYYY-MM / YYYY-MM-DD strings left are month grouping keys (logic) and the CSV date (protected export)", () => {
  const files = ["index.html", "analysis-build4.js", "navigation-phase2-6.js", "player-detail-build6.js", "ui-revision-v12.js", "analysis-final-rc.js", "final-ui-build18.js", "monetization-v1.js", "navigation-shell-phase1.js", "record-access-v1.js"];
  const hits = [];
  for (const f of files) for (const line of read(f).split("\n")) if (/getFullYear\(\)\}\s*[\/-]/.test(line)) hits.push(f + ":" + line.trim().slice(0, 26));
  assert.deepEqual(hits, ["index.html:const monthKeyV34 = `${rec", "index.html:const dateText = `${date.g", "index.html:const groups=new Map();rec"]);
  assert.equal(count(html, /\["日","月","火","水","木","金","土"\]/g), 0);
});
test("[P2-6] protected formats are untouched: CSV date parts, backup file-name stamp, month grouping keys and the this-month filters are pinned verbatim", () => {
  assert.ok(html.includes("const dateText = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;"));
  assert.ok(html.includes("const timeText = `${pad(date.getHours())}:${pad(date.getMinutes())}`;"));
  assert.ok(html.includes("return `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`;"));
  assert.ok(html.includes("const monthKeyV34 = `${recordDateV34.getFullYear()}-${String(recordDateV34.getMonth() + 1).padStart(2, \"0\")}`;"));
  assert.ok(html.includes('const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`'));
  assert.equal(count(html, "Intl.DateTimeFormat(\"ja-JP\""), 1, "the hidden Cloud Sync status formatter is left for P3 (fixed ja-JP, feature disabled)");
});
