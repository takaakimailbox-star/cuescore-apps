/* P2-0 / L1 Data / QR / Backup / CSV / category / Free-Pro protection (Data_QR_Protection_Contract). Golden values are the CURRENT contract. */
process.env.TZ = "Asia/Tokyo";
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { read, indexHtml, extractFunction, run, golden, sha256, codePoints, domain } from "./helpers/p2-source.mjs";
import { stage1Fixtures, nodeCodec } from "./helpers/match-sharing-stage1-fixtures.mjs";

const require = createRequire(import.meta.url);
const html = indexHtml();
const adapters = require("../match-sharing-adapters-v1.js");
const format = require("../match-sharing-format-v1.js");
const same = (name, value) => { const g = golden(name, value); if (!g.written) assert.equal(g.text, g.expected, `golden ${name} changed`); };
const plain = v => JSON.parse(JSON.stringify(v));

/* ---------- category defaults (P2L-023..026) ---------- */
const catSrc = ["readClassificationArrayV381", "initializeClassificationsV381"].map(n => extractFunction(html, n)).join("\n");
function initCategories(stored, seasons = []) {
  const store = new Map([["cats", JSON.stringify(stored)], ["seas", JSON.stringify(seasons)]]);
  const writes = {};
  const ctx = run(`const MATCH_CATEGORIES_KEY_V381="cats",MATCH_SEASONS_KEY_V381="seas",FREE_CATEGORY_ID_V381="category_free";
const activeCueScoreDataKeyV1=k=>k; let seq=0; const createLocalIdV381=p=>p+"_gen"+(++seq);
function writeClassificationArrayV381(key,value){writes[key]=value;}
${catSrc};this.f=initializeClassificationsV381;`, { localStorage: { getItem: k => store.get(k) ?? null }, writes });
  ctx.f();
  return plain(writes);
}
test("[P2L-023,024,025] category initialization: Free first and locked, legacy defaults removed, 大会/その他 added once (Japanese names are stored values)", () => {
  assert.deepEqual(initCategories([]).cats, [
    { id: "category_free", name: "Free", locked: true }, { id: "category_tournament", name: "大会", locked: false }, { id: "category_other", name: "その他", locked: false }]);
  assert.equal(codePoints("大会"), "U+5927 U+4F1A"); assert.equal(codePoints("その他"), "U+305D U+306E U+4ED6");
  const legacy = initCategories([{ id: "a", name: "JPA" }, { id: "b", name: "KTCリーグ" }, { id: "c", name: "練習試合" }, { id: "d", name: " Custom " }, { id: "category_free", name: "x" }, { id: "e", name: "" }, { id: "f", name: "x".repeat(40) }]);
  same("category-init", { empty: initCategories([]).cats, legacy: legacy.cats, tournamentKept: initCategories([{ id: "z", name: "大会" }]).cats, seasons: initCategories([], [{ id: "s", name: " 2026 " }, { id: "t", name: "" }]).seas });
  assert.ok(legacy.cats.every(c => !["JPA", "KTCリーグ", "練習試合"].includes(c.name)));
  assert.equal(legacy.cats[0].name, "Free");
});
test("[P2L-026] reserved category names (add/edit) and Free-specific alert are pinned at source level", () => {
  const n = [...html.matchAll(/CueScoreDomainV1\.RESERVED_CATEGORY_NAMES\.includes\(name\)/g)].length;
  assert.equal(n, 2, "add and edit both check the same reserved list");
  assert.ok(html.includes("name === CueScoreDomainV1.FREE_CATEGORY.name"));
  assert.deepEqual([...domain.RESERVED_CATEGORY_NAMES], ["Free", "JPA", "KTCリーグ", "練習試合"]);
  assert.deepEqual([...domain.LEGACY_REMOVED_CATEGORY_NAMES], ["JPA", "KTCリーグ", "練習試合"]);
});

/* ---------- Backup (P2L-102..104) ---------- */
test("[P2L-102,103] Backup payload: key set, order, format/schema constants and file name pattern are frozen", () => {
  assert.ok(html.includes('const BACKUP_FORMAT = "cuescore-apps-backup";'));
  assert.ok(html.includes('const LEGACY_BACKUP_FORMAT = "rotation-scoreboard-backup";'));
  assert.ok(html.includes("const BACKUP_SCHEMA_VERSION = 2;"));
  const fixtures = stage1Fixtures().slice(0, 3).map(f => f.source);
  const payloadFn = extractFunction(html, "makeBackupPayload");
  const ctx = run(`const BACKUP_FORMAT="cuescore-apps-backup",BACKUP_SCHEMA_VERSION=2,CUESCORE_APP_VERSION="1.2",ROTATION_GAME_TYPE="rotation";
const DATA_PLAYER_KEY="p",DATA_RECORD_KEY="r",DATA_CATEGORY_KEY="c",DATA_SEASON_KEY="s";
const safelyReadArray=k=>FIX[k];
const window={cueScoreNormalizePlayersToDefaultAvatarV4:x=>x};
${payloadFn};this.f=makeBackupPayload;`, { FIX: { p: [{ id: "p1", name: "山田" }], r: fixtures, c: [{ id: "category_free", name: "Free", locked: true }, { id: "category_tournament", name: "大会", locked: false }], s: [] } });
  const payload = plain(ctx.f());
  assert.deepEqual(Object.keys(payload), ["format", "appName", "schemaVersion", "appVersion", "gameType", "exportedAt", "players", "matchRecords", "matchCategories", "matchSeasons"]);
  payload.exportedAt = "FIXED";
  const json = JSON.stringify(payload, null, 2);
  same("backup-payload", { keys: Object.keys(payload), sha256: sha256(json), bytes: Buffer.byteLength(json), format: payload.format, schemaVersion: payload.schemaVersion, appName: payload.appName });
  assert.ok(html.includes("`CueScore_Apps_v1.0_Backup_${dateStamp()}.json`"));
  const stamp = run(extractFunction(html, "dateStamp") + ";this.f=dateStamp;").f(new Date("2026-03-04T05:06:07+09:00"));
  assert.equal(stamp, "20260304_0506");
});
test("[P2L-102] Backup import accepts both formats and schemaVersion 1..2 (validation source pinned)", () => {
  assert.ok(html.includes("![BACKUP_FORMAT, LEGACY_BACKUP_FORMAT].includes(value.format)"));
  assert.ok(/Number\(value\.schemaVersion\) > BACKUP_SCHEMA_VERSION/.test(html));
});
test("[P2L-104] Backup Share-sheet strings are display text only: not part of the payload", () => {
  const fn = extractFunction(html, "makeBackupPayload");
  assert.ok(!/バックアップを保存|dialogTitle/.test(fn));
});

/* ---------- CSV (P2L-089,090) ---------- */
test("[P2L-090] CSV: 29 fixed Japanese headers (frozen) and the feature stays disabled in the release profile", () => {
  const m = /const headers = \[([\s\S]*?)\];/.exec(html.slice(html.indexOf("One player per row makes sorting")));
  const headers = run(`this.h=[${m[1]}];`).h;
  assert.equal(headers.length, 29);
  same("csv-headers", { count: headers.length, sha256: sha256(JSON.stringify(plain(headers))), headers: plain(headers) });
  assert.ok(html.includes("csvExport:false,\n      cloudSync:false") || /csvExport:false,\s*cloudSync:false/.test(html));
  assert.ok(html.includes('if (!window.CueScoreFeatureAccess.canUse("csvExport")) return;'));
});

/* ---------- QR / shared match golden (P2L-012) ---------- */
const fixtures = stage1Fixtures();
test("[P2L-012] QR: 18 production-shaped fixtures give frozen shared-match JSON, compact form and payload (3 languages cannot change them: no language input exists)", async () => {
  const out = {};
  for (const fx of fixtures) {
    const logical = adapters.buildSharedMatchV1(fx.source, { sharedMatchId: fx.sharedMatchId });
    const compact = adapters.compactSharedMatchV1(logical);
    const payload = await format.encodeSharedMatchV1(logical, nodeCodec);
    const decoded = await format.decodeSharedMatchV1(payload, nodeCodec);
    assert.deepEqual(plain(adapters.expandSharedMatchV1(adapters.compactSharedMatchV1(decoded))), plain(logical), fx.fixtureId);
    assert.ok(payload.startsWith("CSM1:"));
    out[`${fx.gameType}|${fx.lengthClass}`] = { logicalSha: sha256(format.stableStringify(logical)), compactSha: sha256(format.stableStringify(compact)), payloadSha: sha256(payload), chars: payload.length };
  }
  same("qr-golden", out);
});
test("[P2L-012] QR: break_result labels carried in the shared events are exactly the stored Japanese canonical values (code points)", () => {
  const labels = new Set();
  for (const fx of fixtures) {
    const logical = adapters.buildSharedMatchV1(fx.source, { sharedMatchId: fx.sharedMatchId });
    for (const e of [...(logical.events || []), ...(logical.analysisEvents || [])]) if (e.type === "break_result" && e.resultLabel) labels.add(e.resultLabel);
  }
  same("qr-break-labels", [...labels].sort().map(l => [l, codePoints(l)]));
  for (const l of labels) assert.ok(/^(無得点|スクラッチ|ブレイクファール|イリーガル|ファール（ブレイク交代）|\d球イン)$/.test(l), l);
});
test("[P2L-012] QR: sharedMatchId is a UUID v4 carried unchanged; payload prefix CSM1 and 4-byte magic are fixed", () => {
  assert.ok(html.includes("CSM1") || read("match-sharing-format-v1.js").includes('"CSM1:"'));
  assert.deepEqual([...format.MAGIC || [0x43, 0x53, 0x4d, 0x31]], [0x43, 0x53, 0x4d, 0x31]);
  for (const fx of fixtures) assert.match(fx.sharedMatchId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

/* ---------- Free / Pro / IAP (protected) ---------- */
test("[P2L-102] IAP Product ID, Free limit and release profile are frozen", () => {
  assert.ok(read("monetization-v1.js").includes('const PRO_PRODUCT_ID="com.takaakimailboxstar.cuescoreapps.pro";'));
  assert.equal(require("../record-access-v1.js").FREE_LIMIT, 20);
  assert.ok(html.includes('id:"app-store-v1"'));
  const policy = require("../record-access-v1.js").createRecordPolicy(() => false);
  const many = Array.from({ length: 25 }, (_, i) => ({ id: "m" + String(i).padStart(2, "0"), endedAt: `2026-01-${String(i + 1).padStart(2, "0")}` }));
  assert.equal(policy.getEligibleRecords(many).length, 20);
  assert.equal(policy.getEligibleRecords(many)[0].id, "m24");
  assert.equal(require("../record-access-v1.js").createRecordPolicy(() => true).getEligibleRecords(many).length, 25);
});
test("[P2L-120] Free/Pro plan decoration is the only Observer-driven Free/Pro text (monetization-v1.js); entitlement logic is not text-based", () => {
  const src = read("monetization-v1.js");
  assert.ok(src.includes("new MutationObserver(()=>requestAnimationFrame(decorate))"));
  assert.ok(src.includes("textContent"), "decoration writes text (rewrite role, P2L-120)");
});

/* ---------- display-text decisions (P2L-022,027,029..031,033,034): current coupling pinned ---------- */
test("[P2L-022,027,029,030,031,033,034] display-text comparisons: exact current source forms are pinned (each is replaced by state/ID in P2-4)", () => {
  const pins = [
    ["index.html", 'notice.title==="14ボールラック"'],
    ["index.html", "/保存中|更新中|確認中/.test(label)"],
    ["index.html", "playerLibraryTitle"],
    ["index.html", "/前の(\\d+)試合/"],
    ["index.html", '.analysis-v2-status")?.textContent==="蓄積中"'],
    ["navigation-shell-phase1.js", 'title?.textContent==="プレーヤー一覧"'],
    ["ui-revision-v12.js", 'card.textContent.includes("1試合最高得点")']
  ];
  for (const [file, token] of pins) assert.ok(read(file).includes(token) || read(file).includes(token.replace(/'/g, '"')), `${file}: ${token}`);
});
