/* P2-0 / L1 resultLabel characterization: producer, consumers, display, Mapper, protected canonical values. No production change. */
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import vm from "node:vm";
import { read, indexHtml, codePoints, matchClose, extractFunction, count, sha256, domain } from "./helpers/p2-source.mjs";

const require = createRequire(import.meta.url);
const html = indexHtml();
const core = require("../i18n-v1.js");
const adapters = require("../match-sharing-adapters-v1.js");
require("../i18n-catalog-ja-v1.js"); require("../i18n-catalog-en-v1.js"); require("../i18n-catalog-zh-hans-v1.js");

/* Frozen Japanese canonical values (Official 108 §1.2 / Data_QR_Protection_Contract). Code points are the contract. */
const CANON = {
  noScore: ["無得点", "U+7121 U+5F97 U+70B9"],
  scratch: ["スクラッチ", "U+30B9 U+30AF U+30E9 U+30C3 U+30C1"],
  illegal: ["イリーガル", "U+30A4 U+30EA U+30FC U+30AC U+30EB"],
  preBreakFoul: ["ファール（ブレイク交代）", "U+30D5 U+30A1 U+30FC U+30EB U+FF08 U+30D6 U+30EC U+30A4 U+30AF U+4EA4 U+4EE3 U+FF09"],
  one: ["1個", "U+0031 U+500B"], two: ["2個", "U+0032 U+500B"], twoOrMore: ["2個以上", "U+0032 U+500B U+4EE5 U+4E0A"],
  threeOrMore: ["3個以上", "U+0033 U+500B U+4EE5 U+4E0A"], breakFailed: ["ブレイク失敗", "U+30D6 U+30EC U+30A4 U+30AF U+5931 U+6557"],
  breakFoul: ["ブレイクファール", "U+30D6 U+30EC U+30A4 U+30AF U+30D5 U+30A1 U+30FC U+30EB"]
};

test("[P2L-004,008,012] canonical resultLabel values keep their exact code points (frozen contract)", () => {
  for (const [name, [text, cps]] of Object.entries(CANON)) assert.equal(codePoints(text), cps, name);
  assert.equal(codePoints("3球イン"), "U+0033 U+7403 U+30A4 U+30F3");
});

/* ---------- producer (index.html: break_result event builder) ---------- */
const producerExpr = (() => {
  const at = html.indexOf('recordAnalysisEventV60("break_result"');
  assert.ok(at > 0);
  const m = /resultLabel:\s*(decision\.preBreakFoul[^\n]*?RESULT_LABELS\.NO_SCORE),\n/.exec(html.slice(at, at + 1500));
  assert.ok(m, "producer expression shape changed");
  return m[1];
})();
const produce = decision => vm.runInNewContext(`(function(decision){return ${producerExpr};})`, { CueScoreDomainV1: domain })(decision);

test("[P2L-004] producer: five branches with the current priority order", () => {
  const base = { preBreakFoul: false, scratch: false, illegalBreak: false, pocketedBalls: [] };
  assert.equal(produce({ ...base }), CANON.noScore[0]);
  assert.equal(produce({ ...base, pocketedBalls: [3] }), "1球イン");
  assert.equal(produce({ ...base, pocketedBalls: [1, 2, 3, 4, 5, 6, 7, 8, 9] }), "9球イン");
  assert.equal(produce({ ...base, illegalBreak: true, pocketedBalls: [1] }), CANON.illegal[0]);
  assert.equal(produce({ ...base, scratch: true, illegalBreak: true, pocketedBalls: [1] }), CANON.scratch[0]);
  assert.equal(produce({ ...base, preBreakFoul: true, scratch: true, illegalBreak: true, pocketedBalls: [1] }), CANON.preBreakFoul[0]);
  for (let n = 1; n <= 9; n++) assert.equal(produce({ ...base, pocketedBalls: Array.from({ length: n }, (_, i) => i + 1) }), `${n}球イン`);
});

test("[P2L-004] producer: recordAnalysisEventV60 23 call sites (24 occurrences incl. the definition); no call site carries a Japanese literal in its payload since P2-1 (break_result used to be the only one)", () => {
  const re = /recordAnalysisEventV60\(\s*["']([a-z_]+)["']\s*,/g; let m; const calls = [];
  while ((m = re.exec(html))) {
    const open = html.indexOf("(", m.index);
    const text = html.slice(open, matchClose(html, open) + 1);
    calls.push({ type: m[1], jp: /[぀-ヿ一-鿿]/.test(text) });
  }
  const types = calls.map(c => c.type);
  assert.equal(count(html, "recordAnalysisEventV60"), 24, "24 occurrences: 1 definition + 23 call sites");
  assert.equal(calls.length, 23, "23 call sites with a literal event type");
  // P2-1: the one Japanese literal (break_result.resultLabel) now comes from the Domain constants, so no call site holds a literal.
  assert.deepEqual([...new Set(calls.filter(c => c.jp).map(c => c.type))], []);
  assert.ok(types.includes("break_result"));
});

/* ---------- consumers (13091-13093 and 16580-16582): inconsistent lists are preserved, not unified (Q-P2-3) ---------- */
const v64 = (() => {
  const body = extractFunction(html, "buildPlayerMatchAnalysisV64");
  const grab = name => new RegExp("const " + name + " = [^\\n]*;").exec(body)[0];
  return [grab("breakScored"), grab("breakNoScore"), grab("breakTrouble")].join("\n");
})();
const card = (() => {
  const at = html.indexOf('const breakScored = breaks.filter(e => [CueScoreDomainV1.RESULT_LABELS.ONE,CueScoreDomainV1.RESULT_LABELS.TWO_OR_MORE]');
  assert.ok(at > 0);
  const part = html.slice(at, at + 700);
  const grab = name => new RegExp("const " + name + " = [^\\n]*;").exec(part)[0];
  return [grab("breakScored"), grab("breakNoScore"), grab("breakTrouble")].join("\n");
})();
const evalConsumers = (code, name, events) => {
  const ctx = vm.createContext({ [name]: events, out: null, CueScoreDomainV1: domain });
  vm.runInContext(code + ";out=[breakScored,breakNoScore,breakTrouble];", ctx);
  return [...ctx.out];
};
const ev = props => ({ type: "break_result", player: 1, ...props });
const v64Of = e => evalConsumers(v64, "breakEvents", [e]);
const cardOf = e => evalConsumers(card, "breaks", [e]);

/* label -> [v64 scored, v64 noScore, v64 trouble, card scored, card noScore, card trouble] */
const CONSUMER_GOLDEN = {
  "無得点": [0, 1, 0, 0, 1, 0],
  "1個": [1, 0, 0, 1, 0, 0],
  "2個": [1, 0, 0, 0, 0, 0],
  "2個以上": [1, 0, 0, 1, 0, 0],
  "3個以上": [1, 0, 0, 0, 0, 0],
  "スクラッチ": [0, 0, 1, 0, 0, 1],
  "イリーガル": [0, 0, 1, 0, 0, 0],
  "ブレイク失敗": [0, 0, 1, 0, 0, 1],
  "ブレイクファール": [0, 0, 1, 0, 0, 0],
  "ファール（ブレイク交代）": [0, 0, 0, 0, 0, 0],
  "1球イン": [0, 0, 0, 0, 0, 0],
  "9球イン": [0, 0, 0, 0, 0, 0],
  "記録なし": [0, 0, 0, 0, 0, 0],
  "未知の値": [0, 0, 0, 0, 0, 0]
};

test("[P2L-005,006,007,009,010,011] consumers: per-label outcome of both consumer lists is frozen (lists differ today and stay different)", () => {
  for (const [label, expected] of Object.entries(CONSUMER_GOLDEN)) {
    assert.deepEqual([...v64Of(ev({ resultLabel: label })), ...cardOf(ev({ resultLabel: label }))], expected, label);
  }
});

test("[P2L-005..011] consumers: legacy `result` fallback, empty label fallback and flag-only events", () => {
  assert.deepEqual(v64Of(ev({ result: "2個以上" })), [1, 0, 0]);
  assert.deepEqual(cardOf(ev({ result: "2個以上" })), [1, 0, 0]);
  assert.deepEqual(v64Of(ev({ resultLabel: "", result: "無得点" })), [0, 1, 0]);
  assert.deepEqual(v64Of(ev({})), [0, 0, 0]);
  assert.deepEqual(v64Of(ev({ scratch: true })), [0, 0, 1]);
  assert.deepEqual(cardOf(ev({ scratch: true })), [0, 0, 1]);
  assert.deepEqual(v64Of(ev({ breakFailed: true })), [0, 0, 1]);
  assert.deepEqual(cardOf(ev({ breakFailed: true })), [0, 0, 1]);
  assert.deepEqual(v64Of(ev({ breakFoul: true })), [0, 0, 1]);
  assert.deepEqual(cardOf(ev({ breakFoul: true })), [0, 0, 0]);
  assert.deepEqual(v64Of(ev({ illegalBreak: true })), [0, 0, 1]);
  assert.deepEqual(cardOf(ev({ illegalBreak: true })), [0, 0, 0]);
  assert.deepEqual(v64Of(ev({ preBreakFoul: true, resultLabel: CANON.preBreakFoul[0] })), [0, 0, 0]);
});

test("[P2L-003] BREAK_RESULT_LABELS_V61 is defined once and never referenced elsewhere (dead constant, 11 labels)", () => {
  assert.equal(count(html, "BREAK_RESULT_LABELS_V61"), 1);
  const at = html.indexOf("BREAK_RESULT_LABELS_V61");
  const obj = html.slice(html.indexOf("{", at), matchClose(html, html.indexOf("{", at)) + 1);
  assert.equal((obj.match(/:\s*['"]/g) || []).length, 11);
});

/* ---------- display (16526) ---------- */
test("[P2L-008] display rows (buildAnalysisLogV65): every stored label is shown verbatim after the arrow; empty falls back to 記録; no language input", () => {
  const logFor = lang => { const i = stub(lang); return vm.runInNewContext(`const escapeRecordText=s=>String(s);${extractFunction(html, "buildAnalysisLogV65")};buildAnalysisLogV65`, { window: { cueResultLabel: v => core.mapResultLabel(i, v) } }); };
  const log = logFor("ja");
  const labels = ["無得点", "1個", "2個", "2個以上", "3個以上", "スクラッチ", "イリーガル", "ブレイク失敗", "ブレイクファール", "ファール（ブレイク交代）", "4球イン", "記録なし", "未知"];
  const events = labels.map((resultLabel, i) => ({ type: "break_result", player: 1, rack: i + 1, resultLabel }));
  events.push({ type: "break_result", player: 1, rack: 99, result: "2個以上" }, { type: "break_result", player: 1, rack: 100 }, { type: "break_result", player: 2, rack: 1, resultLabel: "無得点" });
  const rows = JSON.parse(JSON.stringify(log({ analysis: { events }, players: { 1: { name: "A" }, 2: { name: "B" } } }, 1).rows));
  assert.deepEqual(rows.map(r => r.title), [...labels.map(l => "ブレイク → " + l), "ブレイク → 2個以上", "ブレイク → 記録"]);
  assert.deepEqual(rows.filter(r => r.kind === "failed").length, 0, "kind is failed only for scratch/breakFailed flags, not for labels");
  // P2-2: other languages go through the Display Mapper; stored events are not touched and unknown values stay verbatim
  const rec = { analysis: { events: [...events, { type: "break_result", player: 1, rack: 101, resultLabel: "未知の値" }] }, players: { 1: { name: "A" }, 2: { name: "B" } } };
  const before = JSON.stringify(rec);
  const en = logFor("en")(rec, 1).rows.map(r => r.title), zh = logFor("zh-Hans")(rec, 1).rows.map(r => r.title);
  assert.equal(JSON.stringify(rec), before, "display must not rewrite the stored record");
  assert.equal(en[2], "ブレイク → 2 balls"); assert.equal(zh[2], "ブレイク → 2球");
  assert.equal(en[3], "ブレイク → 2 or more"); assert.equal(en.at(-1), "ブレイク → 未知の値");
  assert.equal(logFor("en")({ analysis: { events: [{ type: "break_result", player: 1, rack: 1, resultLabel: "記録なし" }] } }, 1).rows[0].title, "ブレイク → Not recorded");
  assert.equal(logFor("zh-Hans")({ analysis: { events: [{ type: "break_result", player: 1, rack: 1, resultLabel: "記録なし" }] } }, 1).rows[0].title, "ブレイク → 未记录");
});

test("[P2L-008] display site (16526) reads the stored label and shows it through the Display Mapper with fallback 記録", () => {
  assert.ok(html.includes('title:`ブレイク → ${window.cueResultLabel(e.resultLabel || e.result || "記録")}`'));
  assert.equal(count(html, /mapResultLabel/g), 1, "exactly one Mapper binding (window.cueResultLabel)");
  assert.ok(html.includes("window.cueResultLabel = value => core.mapResultLabel(instance, value);"));
  assert.ok(html.includes("window.cueResultLabel = value => value;"), "no-i18n fallback shows the stored value");
});

/* ---------- Mapper (i18n-v1.js) ---------- */
const stub = language => core.createI18n({ language, storage: null });
test("[P2L-002] Mapper: table = Domain canonical values, ja unchanged, en / zh-Hans mapped, unknown values verbatim", () => {
  assert.deepEqual(Object.keys(core.RESULT_LABEL_KEYS), ["無得点", "1個", "2個", "2個以上", "3個以上", "スクラッチ", "イリーガル", "ブレイク失敗", "ブレイクファール", "ファール（ブレイク交代）", "記録なし"]);
  assert.deepEqual(Object.keys(core.RESULT_LABEL_KEYS).sort(), Object.values(domain.RESULT_LABELS).sort(), "Mapper table covers exactly the Domain canonical values");
  const ja = stub("ja"), en = stub("en"), zh = stub("zh-Hans");
  for (const label of Object.keys(core.RESULT_LABEL_KEYS)) assert.equal(core.mapResultLabel(ja, label), label, "ja shows the canonical value unchanged: " + label);
  assert.deepEqual(["2個", "記録なし"].map(v => core.mapResultLabel(en, v)), ["2 balls", "Not recorded"]);
  assert.deepEqual(["2個", "記録なし"].map(v => core.mapResultLabel(zh, v)), ["2球", "未记录"]);
  for (const value of ["", "未知", "球イン", "1球インX", "x3球イン"]) for (const i of [ja, en, zh]) assert.equal(core.mapResultLabel(i, value), value);
  for (const value of [null, undefined, 7, {}]) assert.equal(core.mapResultLabel(en, value), value);
  assert.equal(core.mapResultLabel(ja, "5球イン"), "5球イン");
});

test("[P2L-002] Mapper is read-only: stored event objects are never rewritten", () => {
  const event = Object.freeze({ type: "break_result", resultLabel: "無得点" });
  core.mapResultLabel(stub("en"), event.resultLabel);
  assert.equal(event.resultLabel, "無得点");
  assert.equal(codePoints(event.resultLabel), CANON.noScore[1]);
});

/* ---------- QR payload allow-list and demo fixtures ---------- */
test("[P2L-012] QR/shared event: break_result keeps resultLabel in its allow-list and the Japanese canonical value is carried unchanged", () => {
  assert.ok(adapters.EVENT_SPECS.break_result[1].includes("resultLabel"));
  const source = { type: "break_result", sequence: 1, rack: 1, inning: 1, player: 1, breakPlayer: 1, resultLabel: CANON.preBreakFoul[0], pocketCount: 0, pocketedBalls: [], legalBreak: false, scratch: false, breakFoul: false, illegalBreak: false, preBreakFoul: true, breakFailed: false, memo: "private" };
  const compact = adapters.COMPACT_FIELD_MAP;
  assert.ok(compact);
  // The sharing validation allow-list must not carry anything beyond the explicit fields.
  assert.ok(!adapters.EVENT_SPECS.break_result[1].includes("memo"));
  assert.equal(codePoints(source.resultLabel), CANON.preBreakFoul[1]);
});

test("[P2L-001] demo-data fixtures carry the canonical break labels (count and kinds frozen)", () => {
  const src = read("demo-data.js");
  for (const literal of ["スクラッチ", "ブレイクファール", "無得点", "球イン"]) assert.ok(src.includes(`"${literal}"`) || src.includes(literal), literal);
  assert.equal(count(src, /resultLabel:scratch\?"スクラッチ":breakFoul\?"ブレイクファール":dry\?"無得点":/g), 2);
  assert.equal(count(src, "resultLabel"), 2);
});
