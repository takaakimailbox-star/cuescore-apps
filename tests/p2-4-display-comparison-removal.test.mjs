/* P2-4: internal decisions no longer read display text. Each test runs the CURRENT code against fakes and compares with the
 * previous decision rule (kept here only as a reference function) over the same inputs. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import { read, indexHtml, extractFunction, run, count, matchClose } from "./helpers/p2-source.mjs";

const html = indexHtml();

/* ---------- P2L-017 quota detection (legacy-compatible) ---------- */
/* Reference: the pre-P2-4 implementation, byte for byte (main 96629cc). The current function must answer exactly like it. */
const OLD_QUOTA_SRC = `function isQuotaExceededErrorV160(error) {
    const visited = new Set();
    let currentError = error;
    while (currentError && !visited.has(currentError)) {
      visited.add(currentError);
      if (
        currentError.name === "QuotaExceededError" ||
        currentError.code === 22 ||
        currentError.code === 1014 ||
        /quota|storage quota|保存容量が不足/i.test(String(currentError.message || ""))
      ) return true;
      currentError = currentError.cause;
    }
    return false;
  }`;
const quotaFn = run(extractFunction(html, "isQuotaExceededErrorV160") + ";this.f=isQuotaExceededErrorV160;").f;
const oldQuotaFn = run(OLD_QUOTA_SRC + ";this.f=isQuotaExceededErrorV160;").f;
test("[P2L-017] quota detection keeps the legacy behavior: Japanese message, English message, name / code / cause chain, non-quota errors (cases A-F)", () => {
  const cases = [
    ["A: 保存容量が不足", { message: "保存容量が不足" }, true],
    ["B: 保存容量が不足しました", { message: "保存容量が不足しました" }, true],
    ["B2: embedded in a longer message", { message: "端末の保存容量が不足しているため…" }, true],
    ["C: English quota", { message: "The quota has been exceeded." }, true],
    ["C2: storage quota", { message: "Storage quota exceeded" }, true],
    ["C3: upper case", { message: "QUOTA" }, true],
    ["D: QuotaExceededError name", { name: "QuotaExceededError", message: "" }, true],
    ["D2: DOMException-like code 22", { code: 22 }, true],
    ["D3: code 1014 (Firefox)", { code: 1014 }, true],
    ["E: cause chain (name)", { message: "wrap", cause: { name: "QuotaExceededError" } }, true],
    ["E2: cause chain (Japanese message)", { message: "wrap", cause: { message: "保存容量が不足" } }, true],
    ["E3: cause chain, deep", { message: "a", cause: { message: "b", cause: { code: 22 } } }, true],
    ["F: other Error", { message: "保存内容の照合に失敗しました。" }, false],
    ["F2: unrelated Japanese", { message: "端末への保存に失敗しました。空き容量とブラウザ設定を確認してください。" }, false],
    ["F3: empty", { message: "" }, false], ["F4: null", null, false], ["F5: undefined", undefined, false],
    ["F6: other code", { code: 11 }, false], ["F7: non-string message", { message: 22 }, false]
  ];
  for (const [name, input, expected] of cases) {
    assert.equal(quotaFn(input), expected, name);
    assert.equal(oldQuotaFn(input), expected, "reference (pre-P2-4) " + name);
  }
  const loop = { message: "a" }; loop.cause = loop; assert.equal(quotaFn(loop), false, "cycle safe");
  const loopQ = { message: "a" }; loopQ.cause = { message: "保存容量が不足", cause: loopQ }; assert.equal(quotaFn(loopQ), true);
});
test("[P2L-017] G: every Error message the app can create gets the same answer from the current and the pre-P2-4 detector", () => {
  const messages = new Set();
  for (const f of fs.readdirSync(new URL("../", import.meta.url)).filter(f => /\.(js|html)$/.test(f) && !/^(sw\.js|official-document\.js)$/.test(f))) {
    for (const m of read(f).matchAll(/new (?:Error|[A-Za-z]*Error)\(\s*(["'`])((?:\\.|(?!\1)[^\\\n])*)\1/g)) messages.add(m[2]);
  }
  for (const m of html.matchAll(/return "([^"\n]*保存容量が不足[^"\n]*)";/g)) messages.add(m[1]); // the two restore alert texts, in case a caller ever re-wraps them
  assert.ok(messages.size > 30, "collected " + messages.size);
  const quota = []; for (const message of messages) { assert.equal(quotaFn({ message }), oldQuotaFn({ message }), message); if (quotaFn({ message })) quota.push(message.slice(0, 30)); }
  assert.ok(quota.length >= 2, "the restore alert texts are detected exactly as before: " + quota.join(" | "));
});
test("[P2L-017] Official 108 AC-S2 / L-ARCH-4(b) cover DOM / label display text; the legacy detector reads Error.message, which the scanner properties do not include", () => {
  const spec = read("docs/official/108_CueScore_Localization_Spec.md");
  assert.ok(spec.includes("| AC-S2 | 表示文言（`textContent` / `innerText` / `aria-label` 等）との文字列比較 | 0 件（P2完了時） |"));
  assert.ok(spec.includes("(b) 表示文言（DOM/ラベル）との比較"));
  const src = extractFunction(html, "isQuotaExceededErrorV160");
  assert.ok(/currentError\.message/.test(src) && !/textContent|innerText|aria-label|getAttribute|placeholder/.test(src));
  assert.ok(src.includes("legacy-compat: Error.message sniffing of storage errors (not DOM display text)"));
});

/* ---------- P2L-022 re-rack notice kind ---------- */
test("[P2L-022] the 14.1 re-rack modal class follows the notice kind, not the title text", () => {
  const src = [extractFunction(html, "queueStraightPoolNoticeV1"), extractFunction(html, "showNextStraightPoolNoticeV1")].join("\n");
  const make = () => {
    const nodes = {}; const node = id => nodes[id] ||= { id, classes: new Set(["hidden"]), textContent: "", classList: { contains: c => nodes[id].classes.has(c), add: c => nodes[id].classes.add(c), remove: c => nodes[id].classes.delete(c), toggle: (c, on) => (on ? nodes[id].classes.add(c) : nodes[id].classes.delete(c)) } };
    const ctx = run(`const straightPoolNoticeQueueV1=[];const el=id=>NODES(id);${src};this.q=queueStraightPoolNoticeV1;`, { NODES: node });
    return { ctx, node };
  };
  for (const [title, kind, modal] of [["14ボールラック", "rerack", true], ["14ボールラック", "", false], ["Re-rack the 14 balls", "rerack", true], ["スポット確認", "", false], ["3ファール", "", false]]) {
    const { ctx, node } = make(); ctx.q(title, "m", null, kind);
    assert.equal(node("straightPoolNoticeOverlayV1").classes.has("straight-pool-rerack-modal-v18"), modal, title + "/" + kind);
    assert.equal(node("straightPoolNoticeTitleV1").textContent, title);
  }
  assert.equal(count(html, 'null, "rerack");'), 1, "only the 14-ball re-rack call passes the kind");
  assert.equal(count(html, /queueStraightPoolNoticeV1\("/g), 4);
});

/* ---------- P2L-027 stale control recovery ---------- */
test("[P2L-027] stale OK-button recovery follows the saving flag; same recoveries as the old label rule for every label the summary can show", () => {
  const body = /const recoverStaleControlsV160 = \(\) => \{[\s\S]*?\n  \};\n/.exec(html)[0];
  const exec = buttons => {
    const log = []; const mk = b => ({ ...b, dataset: { ...(b.dataset || {}) }, disabled: true, attrs: new Set(["aria-busy"]), removeAttribute(a) { this.attrs.delete(a); }, get textContent() { return this._t; }, set textContent(v) { this._t = v; } });
    const list = buttons.map(b => { const x = mk(b); x._t = b.label; return x; });
    const summary = { querySelectorAll: () => list.filter(b => b.disabled) };
    const ctx = run(`${body};this.f=recoverStaleControlsV160;`, { document: { getElementById: () => summary }, visibleV160: () => true, recordIssueV160: (...a) => log.push(a) });
    const n = ctx.f(); return { n, list: list.map(b => [b.label, b.disabled, b.textContent, b.attrs.has("aria-busy")]), log };
  };
  const saving = exec([{ label: "保存中…", dataset: { saving: "1" } }]);
  assert.equal(saving.n, 1); assert.deepEqual(saving.list[0], ["保存中…", false, "OK", false]); assert.equal(saving.log[0][0], "stale-control-recovered");
  // old rule examples that must stay untouched: a disabled button that is not saving
  const plain = exec([{ label: "OK", dataset: {} }, { label: "戻る", dataset: { saving: "0" } }]);
  assert.equal(plain.n, 0); assert.ok(plain.list.every(row => row[1] === true));
  // language independence: the relabeled saving button is recovered, an unrelated button that merely says 保存中 is not
  assert.equal(exec([{ label: "Saving…", dataset: { saving: "1" } }]).n, 1);
  assert.equal(exec([{ label: "保存中…", dataset: {} }]).n, 0, "the label alone no longer decides (the app only produces this label together with the flag)");
  // static: the busy label of the only button inside #proSummary is written together with the flag
  assert.ok(/button\.dataset\.saving = "1";\s*button\.disabled = true;\s*button\.textContent = "保存中…";/.test(html));
  assert.equal(count(html, /textContent = "(?:更新中|確認中)…"/g) + count(html, /textContent = "保存中…"/g), 4, "all busy labels in the app: save (summary) + three outside #proSummary");
});

/* ---------- P2L-029 player editor mode ---------- */
test("[P2L-029] the player editor modal mode comes from an internal flag set by the opener, not from the title text", () => {
  assert.ok(html.includes("let playerEditorIsEditingV1 = false;"));
  assert.ok(html.includes('el("playerLibraryTitle").textContent = playerLibraryTitleV1(player ? "プレーヤー編集" : "新規プレーヤー登録");\n    playerEditorIsEditingV1 = Boolean(player);'));
  assert.ok(html.includes("const editing=playerEditorIsEditingV1;"));
  assert.ok(!/playerLibraryTitle"\)\?\.textContent\.includes/.test(html));
  // the editor is only ever shown right after the opener set the title and the flag
  assert.equal(count(html, 'el("playerEditor").classList.remove("hidden")'), 1);
});

/* ---------- P2L-030/031 analysis-v2 data-sufficiency guard ---------- */
test("[P2L-030,031] analysis-v2 guard decides from data attributes written by the renderer / the guard (behavior over fakes)", () => {
  const script = extractFunction(html, "applyPriorGamesGuardV1"); // P2-5a-1: the guard is an explicit step of the player render (was an inline MutationObserver script)
  const build = priorGames => {
    const writes = []; const mkNode = (name, extra = {}) => ({ name, dataset: {}, set textContent(v) { writes.push([name, "text", v]); this._t = v; }, get textContent() { return this._t ?? ""; }, set innerHTML(v) { writes.push([name, "html", v]); }, ...extra });
    const target = mkNode("target", { dataset: priorGames === undefined ? {} : { priorGames } });
    const status = mkNode("status"), change = mkNode("change"), em = mkNode("em"), goal = mkNode("goal");
    const view = { hidden: false, querySelector: sel => ({ ".analysis-v2-target": target, ".analysis-v2-status": status, ".analysis-v2-change": change, ".analysis-v2-advice-row:last-child span": goal })[sel] || null, querySelectorAll: () => [em] };
    const root = { querySelector: sel => (sel === '[data-analysis-view="player"]' ? view : null), addEventListener() {} };
    const ctx = run(`${script};this.f=applyPriorGamesGuardV1;`, { viewNode: name => (name === "player" ? view : null), window: {} }); const cb = ctx.f;
    return { cb, writes, status, change };
  };
  for (const prior of ["0", "1", "2"]) {
    const { cb, writes, status, change } = build(prior); cb();
    assert.deepEqual(writes.map(w => w[0] + ":" + w[1]), ["status:text", "change:html", "em:text", "goal:text"], prior);
    assert.equal(status.textContent, "蓄積中"); assert.equal(status.dataset.analysisState, "accumulating"); assert.equal(change.dataset.analysisState, "insufficient-prior");
    const n = writes.length; cb(); assert.equal(writes.length, n, "second pass is a no-op (already enforced)");
  }
  for (const prior of ["3", "10", undefined, "NaN", ""]) { const { cb, writes } = build(prior); cb(); assert.equal(writes.length, 0, String(prior)); }
  assert.ok(html.includes('<span class="analysis-v2-target" data-prior-games="${before.games}">'));
  assert.ok(!html.includes("target.match(/前の"));
});

/* ---------- P2L-033 title comparison ---------- */
test("[P2L-033] the P1 transitional title comparison was dead: no writer can produce the compared literal", () => {
  assert.ok(!read("navigation-shell-phase1.js").includes('textContent==="プレーヤー一覧"'));
  const ja = require_ja();
  const writers = [];
  for (const f of fs.readdirSync(new URL("../", import.meta.url)).filter(f => /\.(js|html)$/.test(f) && !/^(i18n|sw\.js|official-document)/.test(f))) {
    for (const m of read(f).matchAll(/playerLibraryTitle[^\n]{0,60}?textContent\s*=\s*([^;\n]+)/g)) writers.push(m[1].trim());
  }
  assert.ok(writers.length >= 3, writers.join(" | "));
  const values = writers.flatMap(w => [...w.matchAll(/(["'`])((?:\\.|(?!\1).)*)\1/g)].map(x => x[2]));
  assert.ok(!values.some(v => v === "プレーヤー一覧"));
  for (const key of ["player.title", "player.manage.title"]) assert.notEqual(ja[key], "プレーヤー一覧", key);
});
function require_ja() { return createRequire(import.meta.url)("../i18n-catalog-ja-v1.js"); }

/* ---------- P2L-034 / 124 best-card kind ---------- */
test("[P2L-034,124] ui-revision removes the 'highest score' card by its kind; same cards as the old text rule for every best key and discipline", () => {
  const body = extractFunction(read("ui-revision-v12.js"), "reviseDetail");
  const bestLabels = { shotRate: "最高シュート率", breakInRate: "最高ブレイクイン率", masuwariRate: "最高マス割り率", masuwariCount: "1試合最多マス割り", breakPocketCount: "最高ブレイクポケット数", breakScore: "最高ブレイク得点", highRun: "最大ハイラン", score: "1試合最高得点", average: "アベレージ", leastWinningInnings: "最少イニング勝利" };
  const oldRule = (key, label) => label.includes("1試合最高得点") || label.includes("1試合最多得点");
  for (const active of ["rotation", "straightPool", "jpa9", "9ball", "10ball", "threeCushion"]) {
    const removed = [];
    const cards = Object.entries(bestLabels).map(([key, label]) => ({ key, textContent: `12　${label}　2026/01/01　試合を見る ›`, dataset: { pd7BestKey: key }, remove() { removed.push(key); } }));
    const body_ = { querySelector: sel => (sel === ".pd7-shell" ? {} : null), querySelectorAll: sel => (sel === ".pd7-best" ? cards : []) };
    const ctx = run(`const detail=()=>({state:{discipline:ACTIVE}});${body};this.f=reviseDetail;`, { document: { getElementById: () => body_ }, ACTIVE: active });
    ctx.f();
    const expected = ["rotation", "straightPool", "jpa9"].includes(active) ? Object.entries(bestLabels).filter(([k, l]) => oldRule(k, l)).map(([k]) => k) : [];
    assert.deepEqual(removed, expected, active);
  }
  assert.ok(read("player-detail-build6.js").includes('class="pd7-best" data-pd7-best-key="${esc(best.key)}"'));
});

/* ---------- AC-S2 ratchet ---------- */
test("[P2L-017..034] AC-S2: display-text comparisons in production code are 0 (P2-5a-1 removed the last two with the wording-guard observer)", () => {
  const files = fs.readdirSync(new URL("../", import.meta.url)).filter(f => /\.(js|html)$/.test(f) && !/^(sw\.js|official-document\.js|support\.html|privacy\.html|terms\.html)$/.test(f));
  const eq = /textContent\s*(?:\)|\?\.)?\s*(===|!==|==)\s*["'`][^"'`\n]*[぀-鿿]/g;
  const incl = /(?:textContent|innerText|innerHTML|getAttribute\([^)]*\))\)?(?:\?\.|\.)(?:includes|startsWith|endsWith|match|test)\(\s*["'/`][^\n]{0,40}?[぀-鿿]/g;
  let total = 0; const where = [];
  for (const f of files) { const s = read(f); const n = count(s, eq) + count(s, incl); if (n) where.push(f + ":" + n); total += n; }
  assert.deepEqual(where, [], "was index.html:2 (P2L-119 'correct'); ratchet lowered in P2-5a-1, old->new map in the Evidence");
  assert.equal(total, 0);
});
