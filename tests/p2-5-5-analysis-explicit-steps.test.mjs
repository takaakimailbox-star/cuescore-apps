/* P2 Phase E-2 / OBS-01, OBS-02: the analysis-v2 post-render layers (analysis-final-rc.js patch, analysis-build4.js rebuild of the player view) are
 * explicit steps. Hidden views are skipped by both layers, so the step runs after setView(); the equivalence with the former observers is proven by the
 * fault/delay matrix (tests/browser/p2-5a-1-fault-scenarios.mjs), the hidden-DOM audit and the J1/J2 scenarios on baseline vs changed tree. */
import test from "node:test";
import assert from "node:assert/strict";
import { read, count } from "./helpers/p2-source.mjs";

const html = read("index.html"), rc = read("analysis-final-rc.js"), b4 = read("analysis-build4.js");

test("[Phase E-2] no observer in analysis-final-rc.js / analysis-build4.js; apply is published; the click / change listeners and the initial calls remain", () => {
  assert.ok(!rc.includes("MutationObserver") && !b4.includes("MutationObserver"));
  assert.ok(rc.includes("api.apply = apply;"));
  assert.ok(rc.includes('root.addEventListener("click", () => setTimeout(apply, 0));') && rc.includes('root.addEventListener("change", () => setTimeout(apply, 0));'));
  assert.ok(/\n  apply\(\);\n\}\)\(\);/.test(rc), "initial apply at load");
  assert.ok(b4.includes("queueMicrotask(render);") && b4.includes("window.CueScoreBuild4Analytics={render,chart,recordMetric};"));
});
test("[Phase E-2] the explicit step runs apply -> render -> apply (the order of the former observer microtasks) after every player / match render, once the view is visible", () => {
  assert.ok(html.includes("function runAnalysisPostRenderV1(){const finalRc=window.CueScoreAnalyticsFinalRC,build4=window.CueScoreBuild4Analytics;finalRc?.apply?.();build4?.render?.();finalRc?.apply?.();}"));
  assert.ok(html.includes('function openPlayer(){renderPlayerWithDisciplineMetrics();setView("player");runAnalysisPostRenderV1()}'));
  assert.ok(html.includes('function openMatch(){renderMatchForViewerV5();setView("match");runAnalysisPostRenderV1()}'));
  assert.ok(html.includes('selectedPlayerId=event.target.value;renderPlayerWithDisciplineMetrics();runAnalysisPostRenderV1()}'));
  assert.ok(html.includes('selectedDiscipline=event.target.value;renderPlayerWithDisciplineMetrics();runAnalysisPostRenderV1()}'));
  assert.equal(count(html, /runAnalysisPostRenderV1\(\)/g), 5);
});
test("[Phase E-2] inventory of the writers of the player / match views (a new writer needs a trigger review): renderHome/renderPlayer/renderMatch only, plus the two layers themselves", () => {
  assert.equal(count(html, /viewNode\("(player|match|home)"\)\.innerHTML=/g), 5);
  assert.equal(count(b4, /view\.innerHTML=/g), 1);
  assert.ok(count(rc, /\.innerHTML\s*=/g) >= 3);
  // both layers skip hidden views, which is why the step must run after setView()
  assert.ok(b4.includes("view.hidden"));
  assert.equal(count(rc, "view.hidden"), 2);
});
test("[Phase E-2] with a layer missing (script failed to load) the step simply skips it (optional chaining), exactly like an absent observer", () => {
  const run = (finalRc, build4) => { const calls = []; const ctx = { window: { CueScoreAnalyticsFinalRC: finalRc && { apply: () => calls.push("rc") }, CueScoreBuild4Analytics: build4 && { render: () => calls.push("b4") } } };
    new Function("window", html.match(/function runAnalysisPostRenderV1\(\)\{[^\n]*\}/)[0] + ";runAnalysisPostRenderV1();")(ctx.window); return calls.join(","); };
  assert.equal(run(true, true), "rc,b4,rc"); assert.equal(run(true, false), "rc,rc"); assert.equal(run(false, true), "b4"); assert.equal(run(false, false), "");
});
