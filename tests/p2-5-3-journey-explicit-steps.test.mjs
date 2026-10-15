/* P2 Phase D: the journey post-render logic (rivals / history revisions) runs as explicit steps; the dead compactHistory wrap is gone.
 * Equivalence with the former observers is proven end to end by tests/browser/p2-5b-journey-flows.mjs (baseline vs changed tree, outerHTML hashes);
 * these tests pin the wiring and the pieces that can be checked at L0/L1. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { read, count, cueDate } from "./helpers/p2-source.mjs";

const html = read("index.html"), ui = read("ui-revision-v12.js"), b6 = read("player-detail-build6.js");

test("[Phase D / OBS-19] no production code creates a [data-player-analysis-record-id] element: the attribute appears only in selectors, removals, a click guard and CSS", () => {
  const files = fs.readdirSync(new URL("../", import.meta.url)).filter(f => /\.(js|html|css)$/.test(f) && f !== "sw.js");
  const per = {}; for (const f of files) { const n = count(read(f), /player-analysis-record-id|playerAnalysisRecordId/g); if (n) per[f] = n; }
  assert.deepEqual(per, { "ui-revision-v12.css": 1, "ui-revision-v12.js": 1, "index.html": 3 });
  for (const f of files) assert.ok(!/(createElement|innerHTML|insertAdjacentHTML|outerHTML)[^\n]{0,200}player-analysis-record-id/.test(read(f)) && !/dataset\.playerAnalysisRecordId\s*=/.test(read(f)), f);
  assert.ok(!b6.includes("compactHistory") && !b6.includes("MutationObserver"));
  assert.ok(html.includes('const addHistoryAnalysisEntriesV5=()=>historyRoot.querySelectorAll("[data-player-analysis-record-id]").forEach(button=>button.remove());')); // OBS-13 (structure) stays
});
test("[Phase D / OBS-23] the journey row date 'M/D（曜） HH:mm' equals the former regex rewrite of 'YYYY/MM/DD（曜） HH:mm' for ~1,000 dates; it is computed from the record, not parsed from text", () => {
  const old = text => { const m = text.match(/\d{4}\/(\d{2})\/(\d{2})(（.）)\s+(\d{2}:\d{2})/); return m ? `${Number(m[1])}/${Number(m[2])}${m[3]} ${m[4]}` : text; };
  for (let i = 0; i < 1000; i++) { const d = new Date(1.1e12 + i * 9.1e9 + i * 977); assert.equal(cueDate(d, "md-w-sp-hm"), old(cueDate(d, "ymd-w-sp-hm")), d.toISOString()); }
  assert.ok(!/\\d\{4\}\\\/\(\\d\{2\}\)/.test(ui), "the displayed-date regex is gone");
  assert.ok(ui.includes('date.textContent=window.cueDate(dt,"md-w-sp-hm")'));
});
test("[Phase D / OBS-23] recordTime() uses the same stored-date fallback chain as renderHistory's timeOf (endedAt || playedAt || startedAt || 0)", () => {
  const timeOf = vm.runInNewContext(html.match(/const timeOf = (record => new Date\([^;]*\));/)[1]);
  const src = ui.match(/const recordTime=id=>\{[^\n]*\};/)[0];
  const cases = [{ id: "a", endedAt: "2026-01-05T03:04:05Z" }, { id: "b", playedAt: "2026-02-05T03:04:05Z" }, { id: "c", startedAt: "2026-03-05T03:04:05Z" }, { id: "d" }, { id: "e", endedAt: "bad" }, { id: "f", endedAt: "", playedAt: "2026-04-01T00:00:00Z" }];
  const ctx = vm.createContext({ readMatchRecords: () => cases, String, Date }); vm.runInContext(src + ";this.f=recordTime;", ctx);
  for (const c of cases) { const a = ctx.f(c.id), b = timeOf(c); assert.equal(String(a.getTime()), String(b.getTime()), c.id); }
  assert.equal(ctx.f("zzz"), null);
});
test("[Phase D] wiring: no journey-root observers; revisions are called at the end of both renderers, in show(), at the two detail-return unhide sites and by the opener wrappers", () => {
  assert.equal(count(ui, "new MutationObserver("), 2);
  assert.ok(!/MutationObserver[^\n]*(reviseRivals|reviseHistory)/.test(ui));
  assert.ok(html.includes("この種目の対戦相手別データはまだありません。</div>`}</div>`;window.CueScoreUiRevisionV12?.reviseRivals?.();}"));
  assert.ok(html.includes("条件に一致する試合履歴はありません。</div>`}`;window.CueScoreUiRevisionV12?.reviseHistory?.();}"));
  assert.ok(html.includes("if(root===historyRoot)window.CueScoreUiRevisionV12?.reviseHistory?.();else if(root===rivalRoot)window.CueScoreUiRevisionV12?.reviseRivals?.();}"));
  assert.equal(count(ui, /reviseHistory\(\);/g), 4, "opener wrapper, rival-row click, 2 detail-return sites");
  assert.ok(ui.includes("window.openPlayerOpponentRecordsV2=(...args)=>{openRivalsBase?.(...args);reviseRivals();};"));
  assert.ok(ui.includes("window.openPlayerMatchHistoryV2=(...args)=>{openHistoryBase?.(...args);reviseHistory();};"));
  assert.ok(/window\.CueScoreUiRevisionV12=\{[^}]*reviseRivals[^}]*reviseHistory/.test(ui));
});
test("[Phase D] the revisions no longer read display text to decide whether to write (idempotent unconditional writes)", () => {
  const seg = ui.slice(ui.indexOf("function reviseHistory()"), ui.indexOf("document.addEventListener(\"click\",event=>{if(event.target.closest(\"#playerOpponentRecordsV2"));
  assert.ok(!/textContent\s*!==/.test(seg));
  assert.ok(seg.includes('title.textContent=label;title.setAttribute("aria-label",label);'));
});
