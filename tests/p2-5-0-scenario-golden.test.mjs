/* P2-5-0 / L2 golden invariants. The goldens under tests/fixtures/p2/observer-scenarios/ are produced by
 * `node tests/browser/p2-5-0-observer-scenarios.mjs <out> ja free|pro` (real Chrome, outside node --test) and compared by
 * tests/browser/p2-5-0-scenarios-compare.mjs. This file turns the facts that P2-5 depends on into explicit assertions, so a
 * careless golden regeneration cannot silently change the contract. Reachability words: ui = real clicks, fn = production function
 * called directly, inject = synthetic nodes handed to the REAL observer callback. */
import test from "node:test";
import assert from "node:assert/strict";
import { read } from "./helpers/p2-source.mjs";

const free = JSON.parse(read("tests/fixtures/p2/observer-scenarios/golden_ja_free.json"));
const pro = JSON.parse(read("tests/fixtures/p2/observer-scenarios/golden_ja_pro.json"));
const known = JSON.parse(read("tests/fixtures/p2/observer-ac-s3-known.json"));
const keys = new Set(known.map(k => k.key));
const S = (g, n) => g.scenarios[n];

test("[golden] both goldens were produced in ja / Asia/Tokyo / 430x932 and contain every scenario with no error", () => {
  for (const g of [free, pro]) { assert.equal(g.lang, "ja"); assert.equal(g.tz, "Asia/Tokyo"); assert.equal(g.viewport, "430x932"); for (const [n, s] of Object.entries(g.scenarios)) assert.equal(s.error, null, n); }
  assert.equal(Object.keys(free.scenarios).length, 21); assert.equal(Object.keys(pro.scenarios).length, 28);
});
test("[golden / AC-S3 L2] observer targets: every key is a known registration; OBS-04 (avatar chooser) is not created at boot; every target that has an id is the LIVE element", () => {
  for (const g of [free, pro]) {
    for (const o of g.observerTargets) { assert.ok(keys.has(o.key), o.key); for (const t of o.targets) if (/#/.test(t.desc)) assert.equal(t.live, true, `${o.key} observes a stale ${t.desc}`); }
    assert.ok(!g.observerTargets.some(o => o.key === "index.html#0"), "OBS-04 is created only by a conditional path (not exercised)");
    assert.equal(g.observerTargets.filter(o => o.key === "index.html#5").length, 0, "OBS-09 mirrorStatus: no runtime instance while cloudSync is disabled (Phase A)");
  }
});
test("[golden / F] quiescence: no scenario that performs no DOM text work lets any observer change text (idle, burst, idle after burst, repeated reconcile)", () => {
  for (const g of [free, pro]) for (const n of ["A1-boot-idle", "E1-burst-mutations", "E2-idle-after-burst", "C3-player-root-title-reconcile", "B2-tab-history", "B3-tab-settings", "B4-tab-home", "C4-tab-home-again"]) assert.deepEqual(S(g, n).changedObservers, [], n);
});
test("[golden / B,N] screen transitions do not change observer-written text (only the screens' own renderers do); player list title is the pinned ja value", () => {
  assert.equal(S(free, "B1-tab-player").result.title, "プレーヤー");
  assert.deepEqual(S(free, "B1-tab-player").changedObservers, []);
});
test("[golden / C] player editor (OBS-10): edit x3 is stable; create differs; texts pinned; repeated opens do not drift", () => {
  const edit = S(free, "C1-player-editor-edit-x3").result;
  assert.equal(edit.length, 3); for (const e of edit) assert.deepEqual(e, edit[0]);
  assert.deepEqual(edit[0], { title: "プレーヤー編集", copy: "", save: "変更", cancel: "キャンセル", nameLabel: "名前（必須）", placeholder: "プレーヤー名を入力", deleteHidden: false, open: true });
  assert.deepEqual(S(free, "C2-player-editor-create").result, { title: "プレーヤー登録", copy: "新しいプレーヤーを登録します。<br>あとからいつでも編集できます。", save: "登録", libTitle: "プレーヤー", open: true });
  assert.deepEqual(S(free, "C1-player-editor-edit-x3").changedObservers, [], "P2-5a-1: the editor texts are written by the opener, no observer changes text any more");
});
test("[golden / D] match setup (OBS-03): initial / none / one / two player states are pinned, and the production open/close of the library overlay (explicit triggers) is what refreshes them", () => {
  const d1 = S(free, "D1-match-setup-states").result;
  assert.equal(d1.none.p1, "プレーヤーを追加"); assert.equal(d1.none.p2, "対戦相手を追加"); assert.equal(d1.one.p2, "対戦相手を追加");
  assert.equal(d1.none.startDisabled, true); assert.equal(d1.two.guideHidden, true);
  const d2 = S(free, "D2-setup-observer-path"); assert.deepEqual(d2.changedObservers, [], "Phase B: refresh() runs from explicit triggers, not from an observer");
  assert.equal(d2.result.noPlayers.p1, "プレーヤーを追加"); assert.equal(d2.result.onePlayer.p2, "対戦相手を追加"); assert.deepEqual(d2.result.restored, d2.result.before);
});
test("[golden / L, OBS-09] Cloud Sync: not reachable in Free or Pro, even by force-clicking the hidden entry; mirror targets stay empty and invisible; the mirror is functional only if a source were written", () => {
  for (const g of [free, pro]) {
    const l1 = S(g, "L1-cloud-reachability").result;
    assert.equal(l1.canUse, false); assert.equal(l1.cloudRows.every(r => r.hidden && r.display === "none"), true);
    for (const t of Object.values(l1.targets)) assert.deepEqual({ text: t.text, visible: t.visible }, { text: "", visible: false });
    for (const t of Object.values(l1.sources)) assert.deepEqual({ text: t.text, visible: t.visible }, { text: "", visible: false });
    assert.deepEqual(l1.suiteOpeners, ["sync-history", "generation"]);
    const l3 = S(g, "L3-suite-views-reachability").result;
    assert.ok(l3.afterForcedCloudClick.views.every(v => v.shown === false), "forced cloud activation leaves no visible suite view");
    assert.equal(l3.afterForcedCloudClick.dataScreen, l3.dataScreen);
    assert.equal(l3.top.find(v => v.view === "cloud").feature, "cloud-sync");
    const l2 = S(g, "L2-cloud-mirror-live-copy").result;
    assert.equal(l2.before, ""); assert.equal(l2.mid.text, "", "Phase A: no mirror observer exists, writing a hidden source status is not copied"); assert.equal(l2.after, ""); assert.equal(l2.visible, false);
    assert.deepEqual(S(g, "L2-cloud-mirror-live-copy").changedObservers, []);
  }
  assert.equal(S(pro, "L3-suite-views-reachability").result.afterExport.length, 1, "a reachable suite view (export, Pro) shows only itself");
});
test("[golden / I, OBS-16] Pro badges (Free): per-screen counts, one badge per host, text and aria pinned; Pro removes them all; Free again restores the same count; mutation churn does not duplicate", () => {
  const i1 = S(free, "I1-badges-per-screen").result;
  assert.deepEqual(Object.fromEntries(Object.entries(i1).filter(([k]) => k !== "edgeNote").map(([k, v]) => [k, [v.badges, v.entries, v.perHostMax]])), { settings: [2, 2, 1], hubResults: [4, 2, 1], "hub-matches": [4, 3, 1], "hub-analysis": [4, 3, 1] });
  for (const v of Object.values(i1).filter(v => typeof v === "object")) { assert.deepEqual(v.text, ["🔒 Pro"]); assert.ok(v.aria.includes("Pro限定")); }
  assert.deepEqual(S(free, "I2-badge-state-toggle").result, [["start", false, 4], ["pro", true, 0], ["free-again", false, 4], ["free-after-mutations", false, 4, 1]]);
  assert.deepEqual(S(pro, "I2-badge-state-toggle").result, [["start", true, 0], ["pro", true, 0], ["free-again", false, 4], ["free-after-mutations", false, 4, 1]]);
  assert.ok(S(free, "I1-badges-per-screen").changedObservers.includes("monetization-v1.js#0"));
});
test("[golden / G, P2L-119] wording guard removed: legacy-looking strings injected into the REAL analysis root are no longer touched by any observer (P2-5a-1)", () => {
  const g = S(free, "G1-wording-guard-inject-matrix").result;
  assert.equal(g.stable, true); assert.equal(g.unchanged, true);
  assert.deepEqual(g.first, g.inputs);
  assert.deepEqual(S(free, "G1-wording-guard-inject-matrix").changedObservers, []);
});
test("[golden / J, P2L-119] END-TO-END match analysis (Pro, real UI path): the legacy wording never survives into the final DOM for any of the 8 wording cases; the final text comes from analysis-final-rc; the wording guard no longer exists", () => {
  const j = S(pro, "J1-analysis-match-e2e-wording");
  assert.equal(Object.keys(j.result).length, 8);
  for (const [id, r] of Object.entries(j.result)) { assert.equal(r.legacyWordingInFinalDom, false, id); assert.equal(r.finalPoints.length, 3, id); assert.ok(r.finalPoints.every(t => /対.*で、/.test(t)), id); assert.deepEqual(r.transientWrites.map(w => w.obs), [null], id + ": renderMatch's own write (not an observer)"); }
  assert.deepEqual(j.result["p250-eq"].finalPoints[2], "ファールは2対2で、同じでした");
  assert.deepEqual(j.result["p250-d10"].finalPoints[2], j.result["p250-opp10"].finalPoints[2], "the 10-difference high-run cases produce the identical final DOM (9-ball compares shot rate / masuwari / fouls only)");
  assert.deepEqual(j.changedObservers.filter(k => k !== "final-ui-build18.js#0").sort(), ["analysis-final-rc.js#0"], "P2-5a-1: the wording is generated by renderMatch; only final-rc still rewrites afterwards");
});
test("[golden / K, OBS-19/22/23] journey lists (Pro): rows exist (9), dates are rewritten to M/D（曜）, the aria suffix is appended once, no analysis buttons or wrappers survive (OBS-13 removes them first); rivals screen is rewritten by OBS-22", () => {
  const k1 = S(pro, "K1-journey-all-matches"); assert.equal(k1.result.rows, 9); assert.equal(k1.result.wrappers, 0); assert.equal(k1.result.analysisBtns, 0);
  assert.equal(k1.result.title, "9-Ballの全試合"); assert.deepEqual(k1.result.open, ["›"]); assert.match(k1.result.dates[0], /^\d{1,2}\/\d{1,2}（.）\s\d{2}:\d{2}$/);
  for (const a of k1.result.aria) assert.equal((a.match(/試合詳細を開く/g) || []).length, 2, "the current label already carries the suffix text once; pd13 appends the second");
  assert.deepEqual(k1.changedObservers, ["ui-revision-v12.js#3"]);
  assert.deepEqual(S(pro, "K2-journey-history-inject-compactHistory").result, { first: { wrappers: 0, open: ["試合詳細", "試合詳細"], analysis: [] }, second: { wrappers: 0, open: ["試合詳細", "試合詳細"] } });
  assert.deepEqual(S(pro, "K2-journey-history-inject-compactHistory").changedObservers, [], "OBS-19 never changes text in the shipped page");
  const k3 = S(pro, "K3-journey-rivals"); assert.equal(k3.result.fixed, "9-Ball"); assert.match(k3.result.ctxAria, /9-Ballの対戦相手別成績$/); assert.deepEqual(k3.changedObservers, ["ui-revision-v12.js#2"]);
  assert.equal(S(pro, "K4-journey-rival-history").result.rows, 9); assert.equal(S(pro, "K4-journey-rival-history").result.vsLeft, 0);
});
test("[golden / J, OBS-01/02] analysis-v2 player view for all 6 disciplines is built by analysis-build4 (OBS-01) and patched by final-rc (OBS-02): headings and per-discipline text hashes are pinned", () => {
  const j2 = S(pro, "J2-analysis-player-6-disciplines"); assert.deepEqual(Object.keys(j2.result), ["9ball", "10ball", "rotation", "jpa9", "straightPool", "threeCushion"]);
  for (const r of Object.values(j2.result)) assert.deepEqual(r.headings, ["今の状態", "主要指標", "推移グラフ", "今回のポイント", "自己ベスト", "詳細分析"]);
  assert.deepEqual(j2.changedObservers, ["analysis-build4.js#0", "analysis-final-rc.js#0"]);
});
test("[golden / M] the legacy player detail (.pd7-shell) is NOT present in the current UI and appears only when the production function is called directly", () => {
  const m = S(pro, "M1-legacy-player-detail-fn").result; assert.equal(m.shellBefore, false); assert.equal(m.shellAfter, true);
});
test("[golden / AC-S3 L2] the set of observers that changed text in real runs is pinned: Free 1, Pro 4 (was 6 / 9 before P2-5a-1; OBS-03 and OBS-09 are no longer observers; OBS-19 never changes text)", () => {
  const chg = g => [...new Set(Object.values(g.scenarios).flatMap(s => s.changedObservers))].sort();
  assert.deepEqual(chg(free), ["monetization-v1.js#0"]);
  assert.deepEqual(chg(pro), ["analysis-build4.js#0", "analysis-final-rc.js#0", "ui-revision-v12.js#2", "ui-revision-v12.js#3"]);
  for (const c of [...chg(free), ...chg(pro)]) { const k = known.find(x => x.key === c); assert.ok(k && ["TEXT_REWRITE"].includes(k.class), c + " is outside the known list"); }
});

test("[golden / D3, OBS-03] picking a player through the real library (open, click, close) refreshes the setup screen: p2 is shown and Start becomes enabled", () => {
  for (const g of [free, pro]) {
    const r = S(g, "D3-setup-pick-via-library").result;
    assert.equal(r.before.p2, "対戦相手を選択"); assert.equal(r.before.startDisabled, true); assert.equal(r.libraryOpen, true);
    assert.equal(r.afterPick.startDisabled, false); assert.equal(r.afterPick.aria, "false"); assert.notEqual(r.afterPick.p2, r.before.p2);
  }
});
