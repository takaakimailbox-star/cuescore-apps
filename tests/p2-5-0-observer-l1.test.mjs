/* P2-5-0 / L1 observer characterization (fake DOM, real production source text). Pins what the CURRENT observers do so that P2-5 can
 * prove "same Japanese output, no Observer". Reachability in the real UI is a separate question answered by the L2 scenarios. */
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { read, extractFunction, count } from "./helpers/p2-source.mjs";

const html = read("index.html");
/* Inner text of the inline <script> that contains `marker`. */
function inlineScript(marker) {
  const at = html.indexOf(marker); assert.ok(at > 0, "marker not found: " + marker);
  const a = html.lastIndexOf("<script>", at) + "<script>".length, b = html.indexOf("</script>", at);
  return html.slice(a, b);
}
class FakeNode { constructor(text = "") { this._t = text; this.writes = 0; this.dataset = {}; } get textContent() { return this._t; } set textContent(v) { this.writes++; this._t = String(v); } }

/* ---------- OBS-15 / P2L-119 'correct' wording guard ---------- */
function loadCorrect(texts) {
  const nodes = texts.map(t => new FakeNode(t));
  const root = { querySelectorAll: sel => { assert.equal(sel, ".analysis-v2-point span"); return nodes; }, addEventListener() {} };
  let callback = null, observed = null;
  const ctx = vm.createContext({
    document: { querySelector: s => (s === ".analysis-v2" ? root : null) },
    MutationObserver: class { constructor(f) { callback = f; } observe(target, opts) { observed = { target, opts: JSON.parse(JSON.stringify(opts)) }; } },
    window: {}
  });
  vm.runInContext(inlineScript("Analysis v2.0 wording guard for equal single-match metrics"), ctx);
  return { nodes, fire: () => callback(), observed: () => observed, root };
}
const SAME_FOUL = "ファール数は相手と同じ", SAME_HIGH = "ハイランは相手と同じ";
/* The current predicate is a SUBSTRING test, so any difference whose digits end in 0 is rewritten (10, 20, 100 ...). Quirk is preserved in P2 (D-R3). */
const MATRIX = [
  ["ファールを相手より0回少なく抑えた", SAME_FOUL, "intended: equal fouls"],
  ["ファールを相手より1回少なく抑えた", "ファールを相手より1回少なく抑えた", "kept"],
  ["ファールを相手より5回少なく抑えた", "ファールを相手より5回少なく抑えた", "kept"],
  ["ファールを相手より9回少なく抑えた", "ファールを相手より9回少なく抑えた", "kept"],
  ["ファールを相手より10回少なく抑えた", SAME_FOUL, "QUIRK: 10 fewer fouls shown as 'same'"],
  ["ファールを相手より11回少なく抑えた", "ファールを相手より11回少なく抑えた", "kept"],
  ["ファールを相手より20回少なく抑えた", SAME_FOUL, "QUIRK"],
  ["ファールを相手より100回少なく抑えた", SAME_FOUL, "QUIRK"],
  ["ファールが相手より10回多かった", "ファールが相手より10回多かった", "other branch: not matched"],
  ["ハイランで相手を0上回った", SAME_HIGH, "intended: equal high run"],
  ["ハイランで相手を1上回った", "ハイランで相手を1上回った", "kept"],
  ["ハイランで相手を9上回った", "ハイランで相手を9上回った", "kept"],
  ["ハイランで相手を10上回った", SAME_HIGH, "QUIRK: player 10 ahead shown as 'same'"],
  ["ハイランで相手を20上回った", SAME_HIGH, "QUIRK"],
  ["ハイランで相手を100上回った", SAME_HIGH, "QUIRK"],
  ["ハイランでは相手が0上回った", SAME_HIGH, "unreachable in practice (0 goes to the first branch) but the predicate matches"],
  ["ハイランでは相手が3上回った", "ハイランでは相手が3上回った", "kept"],
  ["ハイランでは相手が10上回った", SAME_HIGH, "QUIRK (worst): opponent 10 ahead shown as 'same'"],
  ["ハイランでは相手が20上回った", SAME_HIGH, "QUIRK (worst)"],
  ["シュート成功率で相手を0ポイント上回った", "シュート成功率で相手を0ポイント上回った", "not matched: 'ポイント' sits between 0 and 上回った"],
  ["シュート成功率で相手を10ポイント上回った", "シュート成功率で相手を10ポイント上回った", "not matched"],
  ["", "", "empty"]
];
test("[P2L-119 / OBS-15 / D-R3] 'correct' difference matrix: current substring behaviour (incl. the 10/20/100 quirk) is pinned", () => {
  const { nodes, fire } = loadCorrect(MATRIX.map(r => r[0]));
  fire();
  MATRIX.forEach(([input, expected, note], i) => assert.equal(nodes[i].textContent, expected, `${input}  (${note})`));
});
test("[P2L-119 / OBS-15] 'correct' is idempotent: a second callback run (the observer re-fires on its own text write) changes nothing", () => {
  const { nodes, fire } = loadCorrect(MATRIX.map(r => r[0]));
  fire(); const after1 = nodes.map(n => n.textContent), writes1 = nodes.map(n => n.writes);
  fire(); fire();
  assert.deepEqual(nodes.map(n => n.textContent), after1);
  assert.deepEqual(nodes.map(n => n.writes), writes1, "no text node may be written twice");
});
test("[P2L-119 / OBS-15] 'correct' writes only to nodes that match (at most once each) and never touches others", () => {
  const { nodes, fire } = loadCorrect(MATRIX.map(r => r[0]));
  fire();
  MATRIX.forEach(([input, expected], i) => assert.equal(nodes[i].writes, input === expected ? 0 : 1, input));
});
test("[P2L-119 / OBS-15] 'correct' observes the analysis-v2 root with childList+subtree only (no attributes, no characterData)", () => {
  const { observed, root } = loadCorrect(["x"]);
  assert.equal(observed().target, root);
  assert.deepEqual(observed().opts, { childList: true, subtree: true });
});
test("[P2L-119 / OBS-15] the generator contract for P2-5a-1: renderMatch builds these exact strings, and the guard predicate maps them as pinned", () => {
  const render = extractFunction(html, "renderMatch");
  for (const piece of ["ファールを相手より${f2-f1}回少なく抑えた", "ハイランで相手を${high1-high2}上回った", "ハイランでは相手が${high2-high1}上回った", "f1<=f2?", "high1>=high2?"]) assert.ok(render.includes(piece), piece);
  assert.equal(count(render, "回少なく抑えた"), 1);
  assert.equal(count(render, "上回った"), 3, "shot-rate (ポイント上回った) + two high-run branches");
});
test("[P2L-119 / OBS-15] when absent from the DOM the guard is inert (script returns before registering)", () => {
  const ctx = vm.createContext({ document: { querySelector: () => null }, MutationObserver: class { constructor() { throw new Error("must not register"); } } });
  vm.runInContext(inlineScript("Analysis v2.0 wording guard for equal single-match metrics"), ctx);
});

/* ---------- OBS-14 / P2L-118 'enforce' sufficiency guard ---------- */
function el(extra = {}) { const n = new FakeNode(extra.text || ""); n.dataset = extra.dataset || {}; n.innerWrites = 0; Object.defineProperty(n, "innerHTML", { get() { return n._h || ""; }, set(v) { n.innerWrites++; n._h = String(v); } }); n.hidden = !!extra.hidden; return n; }
function loadEnforce({ finalRc, prior = "1", status = "好調", change = "x" }) {
  const view = el();
  const target = el({ dataset: prior === null ? {} : { priorGames: prior } });
  const st = el({ text: status, dataset: { analysisState: "stable" } });
  const ch = el({ dataset: { analysisState: "changed" } }); ch._h = change;
  const em1 = el({ text: "+3" }), em2 = el({ text: "+1" });
  const goal = el({ text: "継続しましょう" });
  const map = { ".analysis-v2-target": target, ".analysis-v2-status": st, ".analysis-v2-change": ch, ".analysis-v2-advice-row:last-child span": goal };
  view.querySelector = sel => map[sel] || null;
  view.querySelectorAll = sel => (sel === ".analysis-v2-delta em,.analysis-v2-metric em" ? [em1, em2] : []);
  const root = { querySelector: sel => (sel === '[data-analysis-view="player"]' ? view : null), addEventListener() {} };
  let callback = null, timers = [];
  const window_ = {}; if (finalRc) window_.CueScoreAnalyticsFinalRC = {};
  const ctx = vm.createContext({ document: { querySelector: s => (s === ".analysis-v2" ? root : null) }, MutationObserver: class { constructor(f) { callback = f; } observe() {} }, window: window_, setTimeout: f => timers.push(f) });
  vm.runInContext(inlineScript("Analysis v2.0 data sufficiency guard"), ctx);
  return { view, target, st, ch, em1, em2, goal, fire: () => callback(), window_, root };
}
const writesOf = o => ({ status: o.st.writes, change: o.ch.innerWrites, em: o.em1.writes + o.em2.writes, goal: o.goal.writes });
test("[P2L-118 / OBS-14] with window.CueScoreAnalyticsFinalRC present (always true in the shipped page order) enforce writes nothing", () => {
  const o = loadEnforce({ finalRc: true, prior: "1" }); o.fire();
  assert.deepEqual(writesOf(o), { status: 0, change: 0, em: 0, goal: 0 });
});
test("[P2L-118 / OBS-14] LATENT branch (FinalRC missing, e.g. analysis-final-rc.js failed to load): prior<3 -> Japanese 'accumulating' texts are written", () => {
  const o = loadEnforce({ finalRc: false, prior: "1" }); o.fire();
  assert.equal(o.st.textContent, "蓄積中"); assert.equal(o.st.dataset.analysisState, "accumulating");
  assert.equal(o.ch.innerHTML, "前期間の試合数が少ないため、変化はまだ評価しません"); assert.equal(o.ch.dataset.analysisState, "insufficient-prior");
  assert.equal(o.em1.textContent, "—"); assert.equal(o.em2.textContent, "—");
  assert.equal(o.goal.textContent, "比較に必要な試合データを蓄積しましょう");
});
test("[P2L-118 / OBS-14] LATENT branch: converges (second run writes nothing), and is skipped for prior>=3, non-numeric prior, hidden view", () => {
  const o = loadEnforce({ finalRc: false, prior: "2" }); o.fire(); const w = writesOf(o); o.fire(); assert.deepEqual(writesOf(o), w, "second run must not write again");
  for (const prior of ["3", "10", "x", "", null]) { const p = loadEnforce({ finalRc: false, prior }); p.fire(); assert.deepEqual(writesOf(p), { status: 0, change: 0, em: 0, goal: 0 }, String(prior)); }
  const h = loadEnforce({ finalRc: false, prior: "1" }); h.view.hidden = true; h.fire(); assert.deepEqual(writesOf(h), { status: 0, change: 0, em: 0, goal: 0 });
});
test("[P2L-118 / OBS-14] LATENT branch boundary: prior=2 writes, prior=3 does not (threshold is exactly 3)", () => {
  const two = loadEnforce({ finalRc: false, prior: "2" }); two.fire(); assert.equal(two.st.textContent, "蓄積中");
  const three = loadEnforce({ finalRc: false, prior: "3" }); three.fire(); assert.deepEqual(writesOf(three), { status: 0, change: 0, em: 0, goal: 0 });
});
test("[P2L-118 / OBS-14] dead-code evidence is structural: analysis-final-rc.js sets window.CueScoreAnalyticsFinalRC and its <script> tag follows the guard script in the same page", () => {
  assert.ok(/window\.CueScoreAnalyticsFinalRC\s*=/.test(read("analysis-final-rc.js")));
  const guardAt = html.indexOf("Analysis v2.0 data sufficiency guard"), tagAt = html.indexOf('<script src="./analysis-final-rc.js">');
  assert.ok(guardAt > 0 && tagAt > guardAt, "the final-rc script is loaded after the guard registers (mutations only occur later, when FinalRC exists)");
  assert.ok(html.includes("if(window.CueScoreAnalyticsFinalRC)return;"));
});

/* ---------- OBS-09 / P2L-113 mirrorStatus (D-R2 evidence) ---------- */
test("[P2L-113 / OBS-09] mirrorStatus copies the source element's text and ok/error class into the target (no literal of its own); runs once at creation", () => {
  const fn = extractFunction(html, "mirrorStatus");
  const mk = (text, classes) => ({ _t: text, className: "", classList: { contains: c => classes.includes(c) }, set textContent(v) { this._t = v; }, get textContent() { return this._t; } });
  const old = mk("接続済み", ["ok"]), target = mk("", []);
  let cb, created = 0;
  const ctx = vm.createContext({ document: { getElementById: id => (id === "old" ? old : null) }, $: (sel, rootEl) => (sel === "#t" ? target : null), root: {}, MutationObserver: class { constructor(f) { cb = f; created++; } observe(el, opts) { this.opts = opts; ctx.__opts = JSON.parse(JSON.stringify(opts)); } } });
  vm.runInContext(fn + ";mirrorStatus('old','#t');", ctx);
  assert.equal(created, 1); assert.equal(target.textContent, "接続済み"); assert.equal(target.className, "settings-suite-status-v2 ok");
  assert.deepEqual(ctx.__opts, { childList: true, subtree: true, characterData: true, attributes: true });
  old._t = "エラー"; old.classList.contains = c => c === "error"; cb();
  assert.equal(target.textContent, "エラー"); assert.equal(target.className, "settings-suite-status-v2 error");
  const none = vm.createContext({ document: { getElementById: () => null }, $: () => null, root: {}, MutationObserver: class { constructor() { throw new Error("must not register without both nodes"); } } });
  vm.runInContext(fn + ";mirrorStatus('x','#y');", none);
});
test("[P2L-113 / OBS-09] Cloud Sync is structurally unreachable in this release: feature table has cloudSync:false for Free and Pro, setView('cloud') returns, the sync IIFE returns early, the entry rows carry the hidden attribute", () => {
  assert.equal(count(html, "cloudSync:false"), 2);
  assert.ok(html.includes('if (view === "cloud" && !window.CueScoreFeatureAccess.canUse("cloudSync")) return;'));
  assert.ok(html.includes('if (!window.CueScoreFeatureAccess.canUse("cloudSync")) return;\n    const SUPABASE_CONFIG_KEY'));
  assert.ok(/data-settings-action="cloud" data-release-feature="cloud-sync" hidden/.test(html));
  for (const id of ["supabaseConnectionStatus", "deviceIdStatus", "cloudSyncStatus"]) assert.ok(new RegExp('id="' + id + '"[^>]*></div>').test(html), id + " source node is empty in markup (only the cloud IIFE writes it)");
});

/* ---------- OBS-23 / P2L-127 date regex in reviseHistory ---------- */
test("[P2L-127 / OBS-23] journey date rewrite: 'YYYY/MM/DD（曜） HH:mm' -> 'M/D（曜） HH:mm' (regex taken from source; weekday char is any single char)", () => {
  const src = read("ui-revision-v12.js");
  const lit = /date\.textContent\.match\((\/[^\n]*?\/)\)/.exec(src); assert.ok(lit, "regex literal located");
  const re = eval(lit[1]);
  const rewrite = t => { const m = t.match(re); return m ? `${Number(m[1])}/${Number(m[2])}${m[3]} ${m[4]}` : t; };
  assert.equal(rewrite("2026/01/05（月） 09:30"), "1/5（月） 09:30");
  assert.equal(rewrite("2026/12/31（木）  23:59"), "12/31（木） 23:59");
  assert.equal(rewrite("2026/01/05(月) 09:30"), "2026/01/05(月) 09:30", "ASCII parentheses are not matched");
  assert.equal(rewrite("2026/1/5（月） 09:30"), "2026/1/5（月） 09:30");
  assert.equal(rewrite("日付なし"), "日付なし");
  assert.ok(src.includes("date.textContent=`${Number(match[1])}/${Number(match[2])}${match[3]} ${match[4]}`"));
});

/* ---------- OBS-19 / P2L-123 compactHistory (function body from source, fake DOM) ---------- */
function loadCompact(rowsSpec) {
  const src = read("player-detail-build6.js");
  const at = src.indexOf("const compactHistory=()=>{"); assert.ok(at > 0);
  const end = src.indexOf("\n  };", at) + "\n  };".length;
  const code = src.slice(at, end);
  class El {
    constructor(cls = "", text = "") { this.className = cls; this._t = text; this.children = []; this.parent = null; this.hidden = false; this.attrs = {}; this.tabIndex = 0; this.tw = 0; this.matchSel = []; }
    get textContent() { return this._t; } set textContent(v) { this.tw++; this._t = String(v); }
    closest(sel) { let n = this; while (n) { if (sel === ".pd8-history-match" && n.className === "pd8-history-match") return n; n = n.parent; } return null; }
    get nextElementSibling() { if (!this.parent) return null; const i = this.parent.children.indexOf(this); return this.parent.children[i + 1] || null; }
    matches(sel) { return this.matchSel.includes(sel); }
    querySelector(sel) { return this.children.find(c => c.className === sel.slice(1)) || null; }
    descendants() { return this.children.flatMap(c => [c, ...c.descendants()]); }
    replaceWith(w) { const i = this.parent.children.indexOf(this); this.parent.children[i] = w; w.parent = this.parent; this.parent = null; }
    append(...ns) { for (const n of ns) { n.parent = this; this.children.push(n); } }
    setAttribute(k, v) { this.attrs[k] = v; }
  }
  const host = new El("host");
  const rows = rowsSpec.map(spec => { const row = new El("journey-match-v3"); const detail = new El("journey-match-open-v3", "試合詳細"); row.children = [detail]; detail.parent = row; host.append(row); let analysis = null; if (spec) { analysis = new El("", "試合分析"); analysis.matchSel = ["[data-player-analysis-record-id]"]; host.append(analysis); } return { row, detail, analysis }; });
  host.querySelectorAll = sel => (sel === ".journey-match-v3" ? host.descendants().filter(c => c.className === "journey-match-v3") : []);
  const ctx = vm.createContext({ historyRoot: host, document: { createElement: () => new El() } });
  vm.runInContext(code + ";this.run=compactHistory;", ctx);
  return { run: ctx.run, host, rows };
}
test("[P2L-123 / OBS-19] compactHistory: a row followed by an analysis button is wrapped; texts become 詳細 / 分析 and the button is hidden (function-level; see L2 K2 for reachability)", () => {
  const { run, rows } = loadCompact([true, false]);
  run();
  assert.equal(rows[0].detail.textContent, "詳細"); assert.equal(rows[0].analysis.textContent, "分析");
  assert.equal(rows[0].analysis.hidden, true); assert.equal(rows[0].analysis.attrs["aria-hidden"], "true"); assert.equal(rows[0].analysis.tabIndex, -1);
  assert.equal(rows[0].row.parent.className, "pd8-history-match");
  assert.equal(rows[1].detail.textContent, "試合詳細", "a row without an analysis sibling is untouched");
  assert.equal(rows[1].row.parent.className, "host");
});
test("[P2L-123 / OBS-19] compactHistory is idempotent (already wrapped rows are skipped)", () => {
  const { run, rows } = loadCompact([true]);
  run(); const w = rows[0].detail.tw + rows[0].analysis.tw; run(); run();
  assert.equal(rows[0].detail.tw + rows[0].analysis.tw, w);
});
test("[P2L-123 / OBS-19 reachability] OBS-13 (addHistoryAnalysisEntriesV5) deletes every analysis button on the same root BEFORE compactHistory's observer runs, so the wrap branch cannot occur in the shipped page", () => {
  const remover = 'const addHistoryAnalysisEntriesV5=()=>historyRoot.querySelectorAll("[data-player-analysis-record-id]").forEach(button=>button.remove());';
  assert.ok(html.includes(remover));
  const a = html.indexOf("new MutationObserver(addHistoryAnalysisEntriesV5).observe(historyRoot"), b = html.indexOf('<script src="./player-detail-build6.js">');
  assert.ok(a > 0 && b > a, "OBS-13 registers (inline script) before build6 loads -> its callback is delivered first for mutations of the same root");
  assert.ok(read("player-detail-build6.js").includes("new MutationObserver(compactHistory).observe(historyRoot,{subtree:true,childList:true})"));
});
