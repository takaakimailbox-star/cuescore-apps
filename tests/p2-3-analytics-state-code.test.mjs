/* P2-3 Analytics state codes: internal decisions use language-independent codes; Japanese wording is display only.
 * Proof of independence: every Japanese string literal in the analytics logic is replaced by a placeholder and the internal
 * decisions (state codes, tones, directions, highlight flags, ratings, thresholds) must stay identical. */
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { read, indexHtml, extractFunction, run, count } from "./helpers/p2-source.mjs";

const html = indexHtml();
const JP = /[぀-ヿ㐀-鿿＀-￯]+/g;
const strip = src => src.replace(JP, "X");
const plain = v => JSON.parse(JSON.stringify(v));

function finalRc(source) { const ctx = vm.createContext({ window: {} }); vm.runInContext(source, ctx); return ctx.window.CueScoreAnalyticsFinalRC; }
const frcJa = finalRc(read("analysis-final-rc.js")), frcX = finalRc(strip(read("analysis-final-rc.js")));

test("[P2L-014,015,016] final-RC: state codes, directions, mixed flag and highlight flags are identical when ALL Japanese wording is replaced", () => {
  for (const d of ["9ball", "10ball", "rotation", "jpa9", "straightPool", "threeCushion"]) {
    const defs = frcJa.definitionsFor(d);
    const mk = f => Object.fromEntries([["winRate", 50], ...defs.map((def, i) => [def.key, f(def, i)])]);
    const val = (def, delta) => 10 + (def.higher ? delta : -delta);
    const prev = mk(() => 10);
    const scenarios = [[mk(def => val(def, 2)), {}], [mk(def => val(def, -2)), {}], [mk(() => 10), {}], [mk(def => val(def, 2)), { sufficient: false }], [mk((def, i) => val(def, i === 0 ? 2 : -2)), {}], [mk((def, i) => val(def, i === 0 ? 2 : 0)), {}]];
    for (const [cur, opt] of scenarios) {
      const a = plain(frcJa.evaluate(cur, prev, d, opt)), b = plain(frcX.evaluate(cur, prev, d, opt));
      assert.deepEqual([b.statusCode, b.mixed, b.improved, b.worsened, b.winDirection, b.conclusionAttention, b.metrics.map(m => m.direction)],
                       [a.statusCode, a.mixed, a.improved, a.worsened, a.winDirection, a.conclusionAttention, a.metrics.map(m => m.direction)], d);
    }
  }
});
test("[P2L-014] final-RC: status text is a display table keyed by the code (wording unchanged)", () => {
  const src = read("analysis-final-rc.js");
  assert.ok(src.includes('const STATUS_TEXT = { improving: "改善傾向", attention: "要調整", stable: "安定", accumulating: "蓄積中" };'));
  assert.equal(count(src, /result\.status\b/g), 1, "result.status is only the badge text; decisions read statusCode");
});

const coachSrc = [/const COACH_RATING_ORDER_V1[^\n]*\n\s*const COACH_RATING_LABELS_V1[^\n]*\n\s*const coachRatingValueV1[^\n]*\n/.exec(html)[0], extractFunction(html, "buildPlayerGrowthAnalysisV740"), extractFunction(html, "buildRionCoachV760")].join("\n");
const pre = `const playerSideInRecord=(r,p)=>r.players&&r.players[1]&&r.players[1].name===p.name?1:(r.players&&r.players[2]&&r.players[2].name===p.name?2:0);`;
const mkSandbox = code => run(`${pre}\n${code};this.growth=buildPlayerGrowthAnalysisV740;this.coach=buildRionCoachV760;this.rating=coachRatingValueV1;`);
const ja = mkSandbox(coachSrc), x = mkSandbox(strip(coachSrc));

test("[P2L-018,019,020,028] growth status code, coach tone and rating ids are identical when ALL Japanese wording is replaced", () => {
  const rec = (i, own, winner) => ({ id: "r" + i, playedAt: `2026-01-${String(30 - i).padStart(2, "0")}T10:00:00Z`, inning: 10, winner, players: { 1: { name: "A", ...own }, 2: { name: "B" } } });
  const good = { shotRate: 70, maxRun: 6, fouls: 0, score: 40 }, bad = { shotRate: 40, maxRun: 2, fouls: 3, score: 10 };
  const sets = {
    up: [...[0, 1, 2, 3, 4].map(i => rec(i, good, 1)), ...[5, 6, 7, 8, 9].map(i => rec(i, bad, 2))],
    down: [...[0, 1, 2, 3, 4].map(i => rec(i, bad, 2)), ...[5, 6, 7, 8, 9].map(i => rec(i, good, 1))],
    flat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => rec(i, good, 1)), short: [0, 1, 2].map(i => rec(i, good, 1))
  };
  for (const [name, records] of Object.entries(sets)) {
    const ga = plain(ja.growth(records, { name: "A" })), gx = plain(x.growth(records, { name: "A" }));
    assert.equal(gx.statusCode, ga.statusCode, name); assert.equal(gx.score, ga.score, name);
    assert.deepEqual(gx.metrics?.map(m => m.direction), ga.metrics?.map(m => m.direction), name);
    const ins = (winRate, fouls) => ({ ready: true, stats: { winRate, foulsPerGame: fouls, shotRate: 72, pointsPerInning: 6, avgHighRun: 18 }, strength: "S", focus: "F" });
    for (const [wr, f] of [[50, 1.5], [60, 1], [59, 1], [29, 0.5], [30, 2], [100, 0]]) {
      const ca = plain(ja.coach(ins(wr, f), ga)), cx = plain(x.coach(ins(wr, f), gx));
      assert.deepEqual([cx.tone, cx.ready, cx.ratings.map(r => r[1])], [ca.tone, ca.ready, ca.ratings.map(r => r[1])], `${name}/${wr}/${f}`);
      assert.equal(x.rating(cx, "finish"), ja.rating(ca, "finish"));
    }
  }
});
test("[P2L-018,019] coach / growth status text are display tables keyed by the code; no status word is compared", () => {
  assert.ok(html.includes("const statusCode=score>=2?'improving':score<=-2?'attention':'flat';"));
  assert.ok(html.includes("const status={good:'好調',alert:'要調整',normal:'普通'}[tone];"));
  assert.ok(html.includes("if(tone==='good') comment=") && html.includes("else if(tone==='alert') comment="));
  assert.ok(!/status\s*===?\s*['"](好調|要調整|普通)['"]/.test(html));
});
test("[P2L-020] rating ids / labels: fixed order, label table, and the finish rating is the winRate/20 value at its fixed position", () => {
  const sb = ja.coach({ ready: true, stats: { winRate: 80, foulsPerGame: 0, shotRate: 36, pointsPerInning: 8, avgHighRun: 24 } }, null);
  assert.deepEqual(plain(sb.ratings), [["シュート力", 2], ["得点力", 2], ["連続得点", 2], ["安定感", 5], ["勝ち切る力", 4]]);
});

const trendOf = code => run(extractFunction(code, "buildGrowthTrendCommentV810") + ";this.f=buildGrowthTrendCommentV810;").f;
test("[P2L-021] the trend threshold depends only on isRate: relabeling to any language never changes the decision", () => {
  const f = trendOf(html), fx = trendOf(strip(html));
  const series = values => values.map(value => ({ value }));
  const data = [[10, 10.2, 10.4, 10.9], [50, 51, 52, 53.5], [16, 13, 11, 10], [10, 10, 10, 10], [5, 5.1, 5.2, 5.3]];
  for (const values of data) for (const isRate of [false, true]) for (const lower of [false, true]) {
    const base = plain(f(series(values), "ラベル", lower, "", isRate)).tone;
    for (const label of ["勝率", "Win rate", "胜率", "ABC", "シュート率"]) assert.equal(plain(f(series(values), label, lower, "", isRate)).tone, base, label);
    assert.equal(plain(fx(series(values), "X", lower, "", isRate)).tone, base);
  }
});
test("[P2L-021] AC-S2: no analytics decision tests label text, sentence text or status words (index.html, analysis-final-rc, build4, phase2-6)", () => {
  assert.ok(!/label\.includes\(/.test(html.slice(html.indexOf("function buildGrowthTrendCommentV810"), html.indexOf("function buildGrowthTrendCommentV810") + 1500)));
  for (const f of ["analysis-final-rc.js", "analysis-build4.js", "navigation-phase2-6.js"]) {
    const src = read(f);
    assert.equal(count(src, /\.includes\(["'](増加傾向|低下傾向)["']\)/g), 0, f);
    assert.equal(count(src, /\bstatus\s*===?\s*["'](要調整|安定|蓄積中|改善傾向)["']/g), 0, f);
  }
});

test("[P2L-019] coach tone boundaries around the growth rule (ups/downs 2 vs 3, ties) are unchanged", () => {
  const grow = (ups, downs) => ({ ready: true, metrics: [...Array(ups).fill({ direction: "up" }), ...Array(downs).fill({ direction: "down" })] });
  const ins = { ready: true, stats: { winRate: 50, foulsPerGame: 1.5, shotRate: 72, pointsPerInning: 6, avgHighRun: 18 }, strength: "S", focus: "F" };
  const tone = g => plain(ja.coach(ins, g)).tone;
  assert.deepEqual([[0, 0], [2, 0], [3, 0], [4, 1], [3, 3], [0, 2], [0, 3], [1, 4], [2, 2]].map(([u, d]) => tone(grow(u, d))), ["normal", "normal", "good", "good", "normal", "normal", "alert", "alert", "normal"]);
  assert.equal(plain(ja.coach(ins, { ready: false, metrics: [] })).tone, "normal");
});
test("[P2L-021] rate threshold boundary: a 2.5-point rise on ~50 is 'up' (threshold ~2.1), a 1.9-point rise is 'flat' (threshold 2)", () => {
  const f = trendOf(html); const s = values => values.map(value => ({ value }));
  assert.equal(plain(f(s([50, 51, 52, 52.5]), "x", false, "%", true)).tone, "up");
  assert.equal(plain(f(s([50, 50.5, 51, 51.9]), "x", false, "%", true)).tone, "flat");
  assert.equal(plain(f(s([5, 5.2, 5.4, 5.45]), "x", false, "", false)).tone, "up");
});
