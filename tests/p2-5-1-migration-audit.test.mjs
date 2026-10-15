import "./helpers/ja-fs.mjs";
/* P2-5a-1 Formalization audit tests (added by the formalization gate; no production change). They restore, for the NEW design, the
 * properties that the retired observer-shaped tests used to cover: idempotence / purity of the wording, "only the intended lines change",
 * no DOM-text reads in the wording generator, and the explicit guard's behaviour for a hidden view. */
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { read, extractFunction, count } from "./helpers/p2-source.mjs";

const html = read("index.html");
const pointsSrc = (() => { const at = html.indexOf("const points=["); return html.slice(at + "const points=".length, html.indexOf(";viewNode(\"match\")", at)); })();
const points = vm.runInNewContext(`(function(shot1,shot2,f1,f2,high1,high2){return ${pointsSrc}})`);
const plain = a => JSON.parse(JSON.stringify(a));

test("[audit / was: 'correct' is idempotent] the generated wording is a pure function of its numeric inputs: repeated evaluation and interleaving never change the result", () => {
  const inputs = []; for (const f of [0, 1, 10, 11, 20]) for (const h of [0, 3, 10, 20, 100]) inputs.push([60, 40, 0, f, h, 0], [60, 40, f, 0, 0, h], [50, 50, 4, 4, h, h]);
  const first = inputs.map(a => plain(points(...a)));
  for (let r = 0; r < 3; r++) inputs.slice().reverse().forEach(a => points(...a));
  assert.deepEqual(inputs.map(a => plain(points(...a))), first);
});
test("[audit / was: 'correct' writes only to matching nodes] only the fouls line and the high-run line can become a 'same' sentence; the shot-rate line never does", () => {
  for (let a = 0; a <= 120; a += 10) for (let b = 0; b <= 120; b += 10) assert.ok(!/と同じ/.test(points(a, b, 0, 0, 0, 0)[0]), `${a}/${b}`);
  assert.equal(plain(points(50, 50, 5, 5, 5, 5)).length, 3);
  assert.equal(points(50, 50, 7, 3, 4, 9)[1], "ファールが相手より4回多かった", "the 'more fouls' branch is never rewritten");
});
test("[audit / was: observer re-reads rendered text] the wording generator and the guard decide from numbers / data attributes only, never from rendered display text", () => {
  assert.ok(!/textContent|innerText|innerHTML|getAttribute|\.includes\(|\.match\(/.test(pointsSrc));
  const guard = extractFunction(html, "applyPriorGamesGuardV1");
  const reads = guard.split("\n").filter(l => /\.textContent\b(?!\s*=)/.test(l) || /\.innerHTML\b(?!\s*=)/.test(l));
  assert.deepEqual(reads, [], "the guard only reads dataset.priorGames / dataset.analysisState");
});
test("[audit / was: 'enforce' skips a hidden view] the explicit guard applies at render time even while the view is hidden (documented difference); visible result is proven equal by the hidden-DOM L2 audit", () => {
  const writes = [];
  const node = (n, extra = {}) => ({ n, dataset: extra.dataset || {}, set textContent(v) { writes.push(n); this._t = v; }, get textContent() { return this._t || ""; }, set innerHTML(v) { writes.push(n); } });
  const view = { hidden: true, querySelector: s => ({ ".analysis-v2-target": node("t", { dataset: { priorGames: "1" } }), ".analysis-v2-status": node("s"), ".analysis-v2-change": node("c"), ".analysis-v2-advice-row:last-child span": node("g") })[s] || null, querySelectorAll: () => [] };
  const ctx = vm.createContext({ viewNode: () => view, window: {} });
  vm.runInContext(extractFunction(html, "applyPriorGamesGuardV1") + ";this.f=applyPriorGamesGuardV1;", ctx); ctx.f();
  assert.deepEqual(writes, ["s", "c", "g"]);
  ctx.window.CueScoreAnalyticsFinalRC = {}; writes.length = 0; ctx.f(); assert.deepEqual(writes, [], "FinalRC present: inert regardless of hidden");
});
test("[audit] the guard has exactly one call site and every player render goes through renderPlayerWithDisciplineMetrics", () => {
  assert.equal(count(html, "applyPriorGamesGuardV1();"), 1);
  assert.equal(count(html, /(?<!function )renderPlayer\(\)/), 1); // only called from renderPlayerWithDisciplineMetrics
  assert.equal(count(html, /(?<!function )renderPlayerWithDisciplineMetrics\(\)/), 3); // openPlayer + the two change handlers
});

test("[audit B / hidden DOM] the player view can only become visible through openPlayer, which renders (and so applies the guard) first; the only other reader of the guarded nodes is analysis-final-rc.js, where the guard is inert", () => {
  assert.equal(count(html, 'setView("player")'), 1);
  assert.ok(html.includes('function openPlayer(){renderPlayerWithDisciplineMetrics();setView("player");runAnalysisPostRenderV1()}'));
  const readers = ["analysis-build4.js", "analysis-final-rc.js", "navigation-phase2-6.js", "navigation-shell-phase1.js", "player-detail-build6.js", "ui-revision-v12.js", "final-ui-build18.js", "monetization-v1.js"].filter(f => /analysis-v2-(status|change|delta|metric|advice-row)/.test(read(f)));
  assert.deepEqual(readers, ["analysis-final-rc.js"]);
  assert.ok(!/analysis-v2-status|analysis-v2-change/.test(read("analysis-build4.js")), "build4 replaces the whole view and never reads the guarded status/change nodes");
});
