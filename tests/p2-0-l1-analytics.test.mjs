/* P2-0 / L1 Analytics characterization: state words, label-text threshold, ratings. Same input must give the same output after P2-3. */
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { read, indexHtml, extractFunction, golden, run } from "./helpers/p2-source.mjs";

const html = indexHtml();
const same = (name, value) => { const g = golden(name, value); if (!g.written) assert.equal(g.text, g.expected, `golden ${name} changed`); };

/* ---------- 10818: label-text threshold in buildGrowthTrendCommentV810 ---------- */
const trend = run(extractFunction(html, "buildGrowthTrendCommentV810") + ";this.f=buildGrowthTrendCommentV810;").f;
const pts = values => values.map(value => ({ value }));
test("[P2L-021] trend comment: threshold depends on the label text (率 => 2, otherwise 0.3) — same data, different label, different tone", () => {
  const series = pts([10, 10.2, 10.4, 10.9]); // diff 0.9, scale 10.9 => floor 0.436
  assert.equal(trend(series, "勝率").tone, "flat", "率 label: threshold 2");
  assert.equal(trend(series, "平均得点").tone, "up", "non-率 label: threshold max(0.3, 0.436)");
  assert.equal(trend(series, "ABC").tone, "up", "a translated label without 率 takes the 0.3 branch");
  assert.equal(trend(series, "Win rate").tone, "up");
  assert.equal(trend(pts([1, 2]), "勝率").tone, "wait");
});
test("[P2L-021] trend comment golden: label × direction × lowerIsBetter matrix is frozen", () => {
  const cases = {};
  const series = { up: [10, 11, 13, 16], down: [16, 13, 11, 10], flat: [10, 10, 10, 10], small: [5, 5.1, 5.2, 5.3], pct: [50, 51, 52, 53.5] };
  for (const [sn, values] of Object.entries(series)) for (const label of ["勝率", "平均シュート率", "平均得点 / Inn", "ハイラン", "Win rate"]) for (const lower of [false, true]) {
    cases[`${sn}|${label}|${lower ? "lower" : "higher"}`] = trend(pts(values), label, lower, label.includes("率") ? "%" : "");
  }
  same("analytics-trend-matrix", cases);
});

/* ---------- 10539 growth status (summarize) and 10690 coach ---------- */
const growthSrc = [extractFunction(html, "buildPlayerGrowthAnalysisV740"), extractFunction(html, "buildRionCoachV760")].join("\n");
const sandbox = run(`const playerSideInRecord=(r,p)=>r.players&&r.players[1]&&r.players[1].name===p.name?1:(r.players&&r.players[2]&&r.players[2].name===p.name?2:0);
${growthSrc};this.growth=buildPlayerGrowthAnalysisV740;this.coach=buildRionCoachV760;`);
const plain = v => JSON.parse(JSON.stringify(v));
const sb = { growth: (...a) => plain(sandbox.growth(...a)), coach: (...a) => plain(sandbox.coach(...a)) };
const rec = (i, own, opp = {}, winner = 1) => ({ id: "r" + i, playedAt: `2026-01-${String(30 - i).padStart(2, "0")}T10:00:00Z`, inning: own.inning ?? 10, winner, players: { 1: { name: "A", ...own }, 2: { name: "B", ...opp } } });
const player = { name: "A" };
const recent = o => Array.from({ length: 5 }, (_, i) => rec(i, o));
const prior = o => Array.from({ length: 5 }, (_, i) => rec(5 + i, o));

test("[P2L-018] growth status 成長傾向 / ほぼ横ばい / 要調整 follow the metric-direction score; not-ready below 4 games", () => {
  const good = { shotRate: 70, maxRun: 6, fouls: 0, score: 40 }, bad = { shotRate: 40, maxRun: 2, fouls: 3, score: 10 };
  const up = sb.growth([...recent(good).map(r => ({ ...r, winner: 1 })), ...prior(bad).map(r => ({ ...r, winner: 2 }))], player);
  assert.equal(up.status, "成長傾向"); assert.equal(up.ready, true);
  const down = sb.growth([...recent(bad).map(r => ({ ...r, winner: 2 })), ...prior(good).map(r => ({ ...r, winner: 1 }))], player);
  assert.equal(down.status, "要調整");
  const flat = sb.growth([...recent(good), ...prior(good)], player);
  assert.equal(flat.status, "ほぼ横ばい");
  assert.equal(sb.growth([rec(0, good), rec(1, good), rec(2, good)], player).ready, false);
  same("analytics-growth-status", { up: { status: up.status, score: up.score, dirs: up.metrics.map(m => m.direction) }, down: { status: down.status, score: down.score, dirs: down.metrics.map(m => m.direction) }, flat: { status: flat.status, score: flat.score, dirs: flat.metrics.map(m => m.direction) } });
});

test("[P2L-019,020] coach: four branches, boundaries, comment text and rating pairs are frozen", () => {
  const ins = (winRate, foulsPerGame, extra = {}) => ({ ready: true, stats: { winRate, foulsPerGame, shotRate: 72, pointsPerInning: 6, avgHighRun: 18, ...extra }, strength: "S", focus: "F" });
  const grow = (ups, downs) => ({ ready: true, metrics: [...Array(ups).fill({ direction: "up" }), ...Array(downs).fill({ direction: "down" })] });
  const cases = {
    notReady: sb.coach({ ready: false }, null),
    growthGood: sb.coach(ins(50, 1.5), grow(3, 0)),
    growthBad: sb.coach(ins(50, 1.5), grow(0, 3)),
    growthTie: sb.coach(ins(50, 1.5), grow(3, 3)),
    winRate60Fouls1: sb.coach(ins(60, 1), null),
    winRate59Fouls1: sb.coach(ins(59, 1), null),
    winRate60Fouls1p1: sb.coach(ins(60, 1.1), null),
    winRate29: sb.coach(ins(29, 0.5), null),
    winRate30: sb.coach(ins(30, 0.5), null),
    fouls2: sb.coach(ins(50, 2), null),
    nullStats: sb.coach(ins(NaN, NaN, { shotRate: NaN, pointsPerInning: NaN, avgHighRun: NaN }), null)
  };
  assert.equal(cases.notReady.status, "データ待ち");
  assert.equal(cases.growthGood.status, "好調"); assert.equal(cases.growthBad.status, "要調整");
  assert.equal(cases.growthTie.status, "普通"); assert.equal(cases.winRate60Fouls1.status, "好調");
  assert.equal(cases.winRate59Fouls1.status, "普通"); assert.equal(cases.winRate60Fouls1p1.status, "普通");
  assert.equal(cases.winRate29.status, "要調整"); assert.equal(cases.winRate30.status, "普通"); assert.equal(cases.fouls2.status, "要調整");
  assert.deepEqual(cases.growthGood.ratings.map(r => r[0]), ["シュート力", "得点力", "連続得点", "安定感", "勝ち切る力"]);
  same("analytics-coach", cases);
});

/* ---------- 25968: rating keyed by a display label ---------- */
test("[P2L-028] the 勝ち切る力 rating is looked up by its Japanese label (current coupling) and equals winRate/20 clamped", () => {
  assert.ok(html.includes('coach.ratings.find(item => item?.[0] === "勝ち切る力")?.[1]'));
  const mk = winRate => sb.coach({ ready: true, stats: { winRate, foulsPerGame: 0 } }, null).ratings.find(i => i[0] === "勝ち切る力")[1];
  assert.deepEqual([0, 20, 49, 50, 90, 100].map(mk), [1, 1, 2, 3, 5, 5]);
});

/* ---------- analysis-final-rc.js evaluate (P2L-014/015/016/129) ---------- */
const frc = (() => { const ctx = vm.createContext({ window: {} }); vm.runInContext(read("analysis-final-rc.js"), ctx); return ctx.window.CueScoreAnalyticsFinalRC; })();
test("[P2L-014,129] analysis-final-rc evaluate: status/mixed/conclusions for six disciplines × four scenarios are frozen", () => {
  const out = {};
  const dis = ["9ball", "10ball", "rotation", "jpa9", "straightPool", "threeCushion"];
  const val = (def, delta) => 10 + (def.higher ? delta : -delta);
  for (const d of dis) {
    const defs = frc.definitionsFor(d);
    const mkSet = (cb) => Object.fromEntries([["winRate", 50], ...defs.map((def, i) => [def.key, cb(def, i)])]);
    const prev = mkSet(() => 10);
    out[d] = {
      improved: frc.evaluate({ ...mkSet(def => val(def, 2)), winRate: 60 }, prev, d),
      worsened: frc.evaluate({ ...mkSet(def => val(def, -2)), winRate: 40 }, prev, d),
      same: frc.evaluate(mkSet(() => 10), prev, d),
      insufficient: frc.evaluate(mkSet(def => val(def, 2)), prev, d, { sufficient: false }),
      mixed: frc.evaluate(mkSet((def, i) => val(def, i === 0 ? 2 : -2)), prev, d)
    };
  }
  assert.equal(out.rotation.improved.status, "改善傾向"); assert.equal(out.rotation.worsened.status, "要調整");
  assert.equal(out.rotation.same.status, "安定"); assert.equal(out.rotation.insufficient.status, "蓄積中");
  assert.equal(out.rotation.mixed.mixed, true);
  same("analytics-final-rc-evaluate", JSON.parse(JSON.stringify(out)));
});

test("[P2L-015,016] render class selection is keyed by status words / conclusion text (current): source tokens pinned", () => {
  const src = read("analysis-final-rc.js");
  assert.ok(/classList\.toggle\("attention",\s*result\.status === "要調整"\)/.test(src) || src.includes('result.status === "要調整"'));
  assert.ok(src.includes("増加傾向") && src.includes("低下傾向"));
  assert.ok(/includes\("増加傾向"\)\s*\|\|\s*[^;]*includes\("低下傾向"\)/.test(src) || src.includes('"増加傾向"'));
});

/* ---------- build4 / phase2-6 status expression (P2L-013,032) ---------- */
const statusExpr = file => /const status=(current\.games<3[^;]*);/.exec(read(file))[1];
test("[P2L-013,032] hub/overlay status expression: 4 outcomes, identical in both files", () => {
  const a = statusExpr("analysis-build4.js"), b = statusExpr("navigation-phase2-6.js");
  assert.equal(a, b);
  const st = (c, p) => vm.runInNewContext(`(function(current,previous){return ${a};})`)(c, p);
  assert.equal(st({ games: 2, winRate: 50 }, { games: 9, winRate: 40 }), "データ蓄積中");
  assert.equal(st({ games: 3, winRate: 50 }, { games: 2, winRate: 40 }), "安定");
  assert.equal(st({ games: 3, winRate: 60 }, { games: 3, winRate: 50 }), "改善傾向");
  assert.equal(st({ games: 3, winRate: 40 }, { games: 3, winRate: 50 }), "要調整");
  assert.equal(st({ games: 3, winRate: 50 }, { games: 3, winRate: 50 }), "安定");
});

/* ---------- 29431 guard + 9557 quota + 14210 notice (display-text decisions) ---------- */
test("[P2L-017] quota detection: message regex matches English and the app's own Japanese message; name-based branch unchanged", () => {
  const fn = run(extractFunction(html, "isQuotaExceededErrorV160") + ";this.f=isQuotaExceededErrorV160;").f;
  assert.equal(fn({ name: "QuotaExceededError" }), true);
  assert.equal(fn({ message: "Storage quota exceeded" }), true);
  assert.equal(fn({ message: "保存容量が不足しています" }), true);
  assert.equal(fn({ message: "Not enough storage" }), false);
  assert.equal(fn(null), false);
});
