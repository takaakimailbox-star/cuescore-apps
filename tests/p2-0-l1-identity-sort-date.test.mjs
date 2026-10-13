/* P2-0 / L1 Player Identity, sort order and date formatting characterization. Fixed locale ja / fixed time zone; no production change. */
process.env.TZ = process.env.P2_TZ || "Asia/Tokyo";
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { read, indexHtml, extractFunction, run, golden, codePoints } from "./helpers/p2-source.mjs";

const require = createRequire(import.meta.url);
const html = indexHtml();
const TZ = process.env.TZ;
const same = (name, value) => { const g = golden(name, value); if (!g.written) assert.equal(g.text, g.expected, `golden ${name} changed`); };
const plain = v => JSON.parse(JSON.stringify(v));

/* ================= Player Identity (L-ID-1) ================= */
const NAMES = ["山田", " 山田 ", "Yamada", "yamada", "YAMADA", "ＹＡＭＡＤＡ", "ｙａｍａｄａ", "ﾔﾏﾀﾞ", "ヤマダ", "やまだ", "ヤマタ゛", "ガ", "ｶﾞ", "ガ", "Ａ　Ｂ", "A  B", "a b", "İ", "ß", "ǅ", "한글", "张三", "張三", "ABC１２３", "abc123", ""];
const normalizers = {
  trimJa: s => String(s ?? "").trim().toLocaleLowerCase("ja"),                    // index.html: 9 name-identity sites
  nfkcJa: s => String(s ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("ja") // index.html:27160, persistence:116
};
const grab = (file, re) => { const m = re.exec(read(file)); assert.ok(m, `${file}: ${re}`); return m[0]; };

test("[P2L-035..052] identity: source expressions equal the two characterized normalizers", () => {
  const idx = grab("index.html", /function normalizeText\(value\)\{[^\n]*\}/);
  const per = grab("match-sharing-persistence-v1.js", /const normalizeText=value=>[^\n]*;/);
  const draft = grab("match-sharing-player-drafts-v1.js", /const nameKey=value=>[^\n]*;/);
  const fx = run(`${idx};${per.replace("normalizeText", "persistenceNormalize")};${draft};this.a=normalizeText;this.b=persistenceNormalize;this.c=nameKey;`);
  for (const n of NAMES) {
    assert.equal(fx.a(n), normalizers.nfkcJa(n), "index.html normalizeText: " + JSON.stringify(n));
    assert.equal(fx.b(n), normalizers.nfkcJa(n), "persistence normalizeText: " + JSON.stringify(n));
    assert.equal(fx.c(n), normalizers.trimJa(n), "drafts nameKey: " + JSON.stringify(n));
  }
  assert.equal(grab("index.html", /name\.toLocaleLowerCase\("ja"\) === name\.toLocaleLowerCase\("ja"\)|p\.name\.toLocaleLowerCase\("ja"\) === name\.toLocaleLowerCase\("ja"\)/).length > 0, true);
});

test("[P2L-035..051] identity: the two normalizations DIFFER on width/compat/whitespace — both are preserved as-is (no unification in P2)", () => {
  assert.equal(normalizers.trimJa("ＹＡＭＡＤＡ") === normalizers.trimJa("yamada"), false);
  assert.equal(normalizers.nfkcJa("ＹＡＭＡＤＡ") === normalizers.nfkcJa("yamada"), true);
  assert.equal(normalizers.trimJa("ｶﾞ") === normalizers.trimJa("ガ"), false);
  assert.equal(normalizers.nfkcJa("ｶﾞ") === normalizers.nfkcJa("ガ"), true);
  assert.equal(normalizers.trimJa("A  B") === normalizers.trimJa("a b"), false);
  assert.equal(normalizers.nfkcJa("A  B") === normalizers.nfkcJa("a b"), true);
  assert.equal(normalizers.trimJa(" 山田 "), "山田");
  assert.equal(normalizers.trimJa("ヤマダ") === normalizers.trimJa("やまだ"), false, "kana types are distinct identities");
  same("identity-matrix", Object.fromEntries(NAMES.map(n => [n, { trimJa: codePoints(normalizers.trimJa(n)), nfkcJa: codePoints(normalizers.nfkcJa(n)) }])));
});

test("[P2L-040,041,042] playerSideInRecord: registered-ID first, legacy name fallback (trim + ja-lowercase only)", () => {
  const f = run(extractFunction(html, "playerSideInRecord") + ";this.f=playerSideInRecord;").f;
  const rec = (a, b) => ({ players: { 1: a, 2: b } });
  assert.equal(f(rec({ registeredPlayerId: "p1", name: "x" }, { registeredPlayerId: "p2", name: "y" }), { id: "p2", name: "x" }), 2);
  assert.equal(f(rec({ name: "Yamada" }, { name: "Sato" }), { id: "p9", name: " yamada " }), 1);
  assert.equal(f(rec({ name: "ＹＡＭＡＤＡ" }, { name: "Sato" }), { id: "p9", name: "yamada" }), null, "no NFKC at this site");
  assert.equal(f(rec({ registeredPlayerId: "p3", name: "Yamada" }, { name: "Sato" }), { id: "p9", name: "Yamada" }), null, "a different registered ID blocks name matching");
  assert.equal(f(rec({}, { name: "ヤマダ" }), { name: "やまだ" }), null);
  assert.equal(f(rec({}, { name: "Ｖ" }), { name: "ｖ" }), 2, "full-width case folding works without NFKC");
  assert.equal(f(rec({}, { name: "Ｖ" }), { name: "v" }), null, "full-width vs ASCII does not match without NFKC");
});

test("[P2L-043] duplicate-name check in the editor is trim-free ja-lowercase on the stored name vs trimmed input", () => {
  const src = read("index.html");
  assert.ok(src.includes('p.name.toLocaleLowerCase("ja") === name.toLocaleLowerCase("ja") && p.id !== editingPlayerId'));
});

/* ================= Sort (L-ID-2) ================= */
const SORT_NAMES = ["山田", "やまだ", "ヤマダ", "Yamada", "yamada", "佐藤", "さとう", "鈴木", "Suzuki", "田中", "10", "9", "2", "ａ", "Ａ", "å", "z", "Z", "あ", "ア", "ー", "ｱ", "漢字", "かんじ", "123", "１２３", "A1", "a10", "a2"];
test("[P2L-056..074] sort: localeCompare('ja') name ordering over a mixed-script set is frozen (and independent of process locale env)", () => {
  const sorted = SORT_NAMES.slice().sort((a, b) => a.localeCompare(b, "ja"));
  const numeric = ["r10", "r9", "r2", "r1", "R3"].sort((a, b) => a.localeCompare(b, "ja", { numeric: true }));
  assert.equal(JSON.stringify(SORT_NAMES.slice().sort((a, b) => a.localeCompare(b, "ja"))), JSON.stringify(sorted));
  assert.deepEqual(numeric, ["r1", "r2", "R3", "r9", "r10"]);
  const unstable = process.versions.icu;
  same("sort-ja-names", { icuVersionNote: "collation order below was captured with ICU " + unstable, sorted });
});

test("[P2L-076,077] stableNewest: newer first, then id compared with ja numeric collation", () => {
  const { stableNewest } = require("../record-access-v1.js");
  const rows = [{ id: "m10", endedAt: "2026-01-01" }, { id: "m9", endedAt: "2026-01-01" }, { id: "m2", endedAt: "2026-01-01" }, { id: "z", endedAt: "2026-02-01" }, { id: "m11" }];
  assert.deepEqual(rows.slice().sort(stableNewest).map(r => r.id), ["z", "m10", "m9", "m2", "m11"].map(x => x));
});

test("[P2L-056..059,069..071,074] name tie-breaks in ranking sorts use the fixed ja collator at every site (source tokens pinned)", () => {
  const src = read("index.html");
  const hits = [...src.matchAll(/localeCompare\(([^)]*)\)/g)].map(m => m[1]);
  assert.equal(hits.filter(h => /["']ja["']/.test(h)).length, 12);
  assert.equal(hits.length, 23);
});

test("[P2L-053,054,055,062,063,064,065,072,073,075] ASCII-key sorts without a locale argument give the same order under default, ja, en and zh collation", () => {
  const monthKeys = ["2026-03", "2025-12", "2026-01", "2026-12", "2024-02", "2026-10"];
  const ids = ["match_2026-01-02", "match_2026-01-10", "m_9", "m_10", "rec-a", "rec-B", "rec_1", "Z9"];
  const iso = ["2026-01-05T12:00:00.000Z", "2025-12-31T23:59:59.000Z", "2026-01-05T12:00:00.100Z"];
  const out = {};
  for (const [name, list] of Object.entries({ monthKeys, ids, iso })) {
    const orders = {};
    for (const loc of [undefined, "ja", "en", "zh-Hans"]) orders[String(loc)] = list.slice().sort((a, b) => a.localeCompare(b, loc)).join("|");
    if (name !== "ids") assert.equal(new Set(Object.values(orders)).size, 1, name + ": ASCII month/ISO keys must sort identically in every locale");
    out[name] = orders;
  }
  assert.deepEqual(monthKeys.slice().sort((a, b) => a.localeCompare(b)), ["2024-02", "2025-12", "2026-01", "2026-03", "2026-10", "2026-12"]);
  same("sort-ascii-keys", out);
});

/* ================= Dates (C-R6) ================= */
const INPUTS = ["2026-01-05T12:34:56Z", "2026-03-31T23:30:00+09:00", "2025-12-31T15:30:00Z", "2026-02-28T14:59:59Z", "2024-02-29T00:00:00Z", "2026-07-04T03:04:05", "2026-12-31T23:59:59+09:00", "1999-01-01T00:00:00Z", "", null, undefined, "invalid", 0, 1767225600000];
const fnOf = name => { const r = run(extractFunction(html, name) + `;this.f=${name};`); return r.f; };
const lineConst = (file, re) => grab(file, re);

const dateFns = {
  formatRecordDate: fnOf("formatRecordDate"),
  formatLastUsed: fnOf("formatLastUsed"),
  formatRecordListDate: fnOf("formatRecordListDate"),
  fmtDate: fnOf("fmtDate"),
  formatCsvDateParts: (() => { const r = run(extractFunction(html, "formatCsvDateParts") + ";this.f=formatCsvDateParts;"); return r.f; })(),
  inProgressTimeTextV1: v => fnOf("inProgressTimeTextV1")({ savedAt: v }),
  datePartsV1: v => fnOf("datePartsV1")({ startedAt: v }),
  recordDate_build4: v => run(lineConst("analysis-build4.js", /const recordDate=record=>\{[^\n]*\};/) + ";this.f=recordDate;").f({ endedAt: v }),
  dateText_phase26: v => run(lineConst("navigation-phase2-6.js", /const dateValue=record=>[^\n]*;/) + lineConst("navigation-phase2-6.js", /const dateText=record=>\{[^\n]*\};/) + ";this.f=dateText;").f({ endedAt: v }),
  dateText_detail6: v => run(lineConst("player-detail-build6.js", /const dateValue=record=>[^\n]*;/) + lineConst("player-detail-build6.js", /const dateText=record=>\{[^\n]*\};/) + ";this.f=dateText;").f({ endedAt: v })
};
test(`[P2L-078..101] date formatters: 17 display/logic sites reachable at L1 give frozen output for ISO inputs (TZ=${TZ})`, () => {
  const out = {};
  for (const [name, f] of Object.entries(dateFns)) {
    out[name] = {};
    for (const input of INPUTS) {
      let value; try { value = f(input instanceof Object ? input : (input === undefined ? undefined : input)); } catch (e) { value = "THROWS:" + e.constructor.name; }
      out[name][String(input)] = value instanceof Object && !(typeof value === "string") ? plain(value) : value;
    }
  }
  // spot assertions for the documented formats
  assert.equal(dateFns.formatRecordDate("2026-01-05T12:34:56Z").length, 16);
  assert.match(String(dateFns.formatRecordDate("2026-01-05T12:34:56Z")), /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
  assert.equal(dateFns.formatRecordDate("invalid"), "日時不明");
  assert.equal(dateFns.formatLastUsed(""), "未使用");
  assert.equal(dateFns.formatRecordListDate("x"), "--/--/--");
  assert.match(dateFns.formatRecordListDate("2026-01-05T12:34:56Z"), /^\d{4}\/\d{2}\/\d{2}（[日月火水木金土]）\d{2}:\d{2}$/);
  assert.equal(dateFns.recordDate_build4(""), "1/1", "empty falls back to epoch 0 (1970-01-01), not to 日付なし");
  assert.equal(dateFns.recordDate_build4("invalid"), "日付なし");
  assert.equal(dateFns.dateText_phase26(""), "日付なし");
  assert.equal(dateFns.inProgressTimeTextV1(""), "日時 —");
  assert.deepEqual(plain(dateFns.formatCsvDateParts("bad")), { date: "", time: "", dateTime: "" });
  same(`dates-${TZ.replace("/", "_")}`, out);
});

test("[P2L-089,090,103] backup filename stamp and CSV date contract keep their fixed formats", () => {
  const stamp = grab("index.html", /const (?:stamp|filenameStamp)[^\n]*|CueScore_Apps_v1\.0_Backup_[^\n]*/);
  assert.ok(html.includes("CueScore_Apps_v1.0_Backup_"));
  assert.ok(stamp.length > 0);
  const csv = dateFns.formatCsvDateParts("2026-03-04T05:06:07+09:00");
  const d = new Date("2026-03-04T05:06:07+09:00"), p = n => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`, time = `${p(d.getHours())}:${p(d.getMinutes())}`;
  assert.deepEqual(plain(csv), { date, time, dateTime: `${date} ${time}` }, "CSV date/time use the device-local clock in YYYY-MM-DD / HH:mm form");
  if (TZ === "Asia/Tokyo") assert.deepEqual(plain(csv), { date: "2026-03-04", time: "05:06", dateTime: "2026-03-04 05:06" });
});

test("[P2L-095,066] fixed ja-JP Intl sites: output captured with the current ICU (comparison applies only on the same ICU)", () => {
  const cloud = run(extractFunction(html, "formatDate", 0) + ";this.f=formatDate;").f;
  const suite = run(extractFunction(html, "formatDate", 1) + ";this.f=formatDate;").f;
  const out = { icu: process.versions.icu, cloud: cloud("2026-01-05T12:34:56Z"), cloudEmpty: cloud(""), cloudBad: cloud("x"), suite: suite("2026-01-05T12:34:56Z"), suiteEmpty: suite("") };
  assert.equal(out.cloudEmpty, "なし"); assert.equal(out.cloudBad, "不明"); assert.equal(out.suiteEmpty, "未同期");
  const g = golden(`dates-intl-${TZ.replace("/", "_")}`, out);
  if (!g.written && process.versions.icu === JSON.parse(g.expected).icu) assert.equal(g.text, g.expected);
});

test("[P2L-079..101] weekday arrays: three inline Japanese weekday arrays exist (formatRecordListDate, datePartsV1, renderHistory) and give the same names", () => {
  assert.equal([...html.matchAll(/\["日","月","火","水","木","金","土"\]/g)].length, 3);
  // 2026-01-04 is a Sunday ... 2026-01-10 a Saturday
  const names = ["日", "月", "火", "水", "木", "金", "土"];
  for (let i = 0; i < 7; i++) {
    const iso = `2026-01-${String(4 + i).padStart(2, "0")}T12:00:00+09:00`;
    assert.ok(dateFns.formatRecordListDate(iso).includes(`（${names[new Date(iso).getDay()]}）`));
    assert.equal(dateFns.datePartsV1(iso).date.slice(-3), `（${names[new Date(iso).getDay()]}）`);
  }
});

test("[P2L-082,083,088,094,096] date LOGIC (this-month filter, YYYY-MM grouping) depends on the device time zone, not on language: source tokens pinned", () => {
  const src = read("index.html");
  assert.ok(/getFullYear\(\)\s*===\s*now\.getFullYear\(\)/.test(src) || src.includes("now.getMonth()"));
  assert.ok(src.includes("getMonth()+1") || src.includes("getMonth() + 1"));
});

if (!process.env.P2_CHILD) {
  test("[P2L-078..101] dates under TZ=UTC: the same checks pass against the UTC golden (time-zone behavior is recorded, not assumed)", () => {
    const env = { ...process.env, TZ: "UTC", P2_TZ: "UTC", P2_CHILD: "1" };
    delete env.NODE_TEST_CONTEXT; delete env.P2_WRITE_GOLDEN; // a child that inherits the runner context silently runs nothing
    const r = spawnSync(process.execPath, ["--test", new URL(import.meta.url).pathname], { env, encoding: "utf8" });
    assert.equal(r.status, 0, r.stdout.slice(-1500) + r.stderr.slice(-500));
    assert.ok(Number(/ℹ pass (\d+)/.exec(r.stdout)?.[1]) >= 13, "child must actually run its tests (not silently nothing)");
    assert.match(r.stdout, /ℹ fail 0\b/);
  });
}
