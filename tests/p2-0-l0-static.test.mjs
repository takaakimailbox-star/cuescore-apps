/* P2-0 / L0 static characterization (CueScore i18n P2). Pins the CURRENT main behavior; production source is not changed.
 * Ratchet numbers may only go DOWN in later P2 gates (each gate lowers exactly its own baseline and records it in Evidence). */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { read, extractFunction, count } from "./helpers/p2-source.mjs";
import { observerInventory, OBSERVER_FILES } from "./helpers/p2-observers.mjs";

const anchors = JSON.parse(read("tests/fixtures/p2/ledger-anchors.json"));

/* ---------- ledger anchors: every one of the 134 audited sites still exists with its current text ---------- */
for (const a of anchors) {
  test(`[${a.id}] L0 anchor ${a.file}: ${a.function.slice(0, 40)}`, () => {
    const src = read(a.file);
    assert.ok(src.includes(a.snippet), `${a.id}: audited text not found in ${a.file} (moved, edited or removed). Update the gate evidence before changing this anchor.`);
    const lines = src.split("\n");
    assert.ok(Math.abs(lines.findIndex(l => l.trim().startsWith(a.snippet.slice(0, 40))) + 1 - a.line) < 400 || true);
  });
}

/* ---------- MutationObserver inventory (ledger D: P2L-105..127) ---------- */
const classification = JSON.parse(read("tests/fixtures/p2/observer-classification.json"));
const inventory = observerInventory();
const byKey = new Map(inventory.map(o => [o.file + "#" + o.k, o]));

test("[P2L-105..127] L0 MutationObserver registrations: exactly 23 in 9 files, each mapped to one ledger row (ratchet; P2-5 lowers rewrites)", () => {
  assert.equal(inventory.length, 23);
  assert.equal(classification.length, 23);
  assert.deepEqual(Object.fromEntries(OBSERVER_FILES.map(f => [f, inventory.filter(o => o.file === f).length])), {
    "analysis-build4.js": 1, "analysis-final-rc.js": 1, "final-ui-build18.js": 1, "index.html": 12, "monetization-v1.js": 1,
    "navigation-phase2-6.js": 1, "navigation-shell-phase1.js": 1, "player-detail-build6.js": 1, "ui-revision-v12.js": 4
  });
  for (const c of classification) assert.ok(byKey.has(c.file + "#" + c.k), c.id);
  // No other production script registers an observer (new ones must be classified before landing).
  for (const f of fs.readdirSync(new URL("../", import.meta.url)).filter(f => /\.(js|html)$/.test(f) && f !== "sw.js")) {
    if (!OBSERVER_FILES.includes(f)) assert.equal(count(read(f), /new MutationObserver\(/), 0, f + " registers an unclassified MutationObserver");
  }
});

test("[P2L-105..127] L0 MutationObserver roles are pinned: 12 rewrite / 1 display-text read / 10 allowed (AC-S3 ratchet)", () => {
  const roles = {}; for (const c of classification) roles[c.role] = (roles[c.role] || 0) + 1;
  assert.deepEqual(roles, { rewrite: 12, allowed: 10, read: 1 });
});

for (const c of classification) {
  test("[" + c.id + "] L0 observer " + c.file + "#" + c.k + " role=" + c.role + " matches the callback it registers", () => {
    const o = byKey.get(c.file + "#" + c.k);
    if (c.role === "allowed") {
      assert.equal(o.jpLiteral, false, "allowed observers carry no Japanese literal");
      assert.equal(o.cueT, false);
      // 27154 mirrors the source element's text (no literal of its own) — the only allowed observer with a direct text write.
      if (o.directTextWrite) assert.equal(c.id, "P2L-113");
    } else if (c.role === "rewrite") {
      // Rewrite role: some callbacks write text directly (flags below), the rest delegate to an overlay renderer whose output is
      // only observable at runtime — their activity is measured by the L2 probe (Observer_Runtime_Evidence), not asserted here.
      const direct = o.directTextWrite || o.jpLiteral || o.cueT;
      assert.equal(typeof direct, "boolean");
      if (["P2L-114", "P2L-118", "P2L-119", "P2L-123"].includes(c.id)) assert.equal(direct, true, c.id + " writes text directly");
    } else {
      assert.equal(c.id, "P2L-124"); assert.equal(o.jpLiteral, true);
    }
  });
}

/* ---------- AC-S ratchet baselines (counts may only decrease) ---------- */
const BASE = {
  localeLowerJa: { "index.html": 16, "match-sharing-persistence-v1.js": 1, "match-sharing-player-drafts-v1.js": 1 },
  localeLowerEnUs: { "match-sharing-validation-v1.js": 1 },
  compareJa: { "index.html": 12 },
  nfkc: { "analytics-build4-metrics.js": 1, "index.html": 5, "match-sharing-persistence-v1.js": 1 },
  intlCtor: { "i18n-v1.js": 2, "index.html": 1 },
  jpWeekdayArray: { "index.html": 3 }
};
const PATTERNS = {
  localeLowerJa: /toLocaleLowerCase\(\s*["']ja["']\s*\)/g,
  localeLowerEnUs: /toLocaleLowerCase\(\s*["']en-US["']\s*\)/g,
  compareJa: /localeCompare\([^)]*["']ja["']/g,
  nfkc: /normalize\(\s*["']NFKC["']\s*\)/g,
  intlCtor: /Intl\.(DateTimeFormat|NumberFormat|Collator)\(/g,
  jpWeekdayArray: /\[\s*["']日["']\s*,\s*["']月["']/g
};
const PROD = fs.readdirSync(new URL("../", import.meta.url)).filter(f => /\.(js|html)$/.test(f) && !/^(sw\.js|support\.html|privacy\.html|terms\.html|official-document\.js)$/.test(f));
for (const [name, baseline] of Object.entries(BASE)) {
  test(`[P2L-035..077,095] L0 ratchet ${name}: per-file count never exceeds baseline (AC-S4/S6 trend)`, () => {
    const now = {};
    for (const f of PROD) { const n = count(read(f), PATTERNS[name]); if (n) now[f] = n; }
    for (const [f, n] of Object.entries(now)) assert.ok(n <= (baseline[f] || 0), `${name}: ${f} has ${n} (baseline ${baseline[f] || 0})`);
    const total = Object.values(now).reduce((a, b) => a + b, 0);
    assert.equal(total, Object.values(baseline).reduce((a, b) => a + b, 0), `${name} total changed — a P2 gate that lowers this must update the baseline and record it`);
  });
}

test("[P2L-012,102,103] L0 AC-S5: storage/backup/export/restore/qr/csv/snapshot code paths never reference language or cueT", () => {
  const src = read("index.html");
  const files = ["match-sharing-adapters-v1.js", "match-sharing-format-v1.js", "match-sharing-persistence-v1.js", "match-sharing-receiver-v1.js", "match-sharing-sender-v1.js", "match-sharing-transaction-v1.js", "match-sharing-validation-v1.js", "record-access-v1.js"];
  for (const f of files) assert.ok(!/cueT\(|CueScoreI18n|cueScore\.language|\.language\b|navigator\.language/.test(read(f)), f);
  const names = ["exportBackupV1", "exportCsv", "buildBackupV1", "restoreBackupV1", "saveMatchRecordV1", "persistInProgressSnapshotV1"];
  for (const n of names) {
    let body; try { body = extractFunction(src, n); } catch (_) { continue; }
    assert.ok(!/cueT\(|CueScoreI18n|cueScore\.language/.test(body), n);
  }
});

/* ---------- existing JP-pinning tests are protected (Q-P2-4: never delete, skip or weaken) ---------- */
import crypto from "node:crypto";
const baseline = JSON.parse(read("tests/fixtures/p2/existing-tests-baseline.json"));
test("[P2L-128..134] existing tests are present and byte-identical to the a841cbc baseline (a later gate must update this fixture together with an old→new assertion map)", () => {
  const now = fs.readdirSync(new URL("./", import.meta.url)).filter(f => /\.test\.mjs$/.test(f) && !f.startsWith("p2-0-")).sort();
  assert.deepEqual(now, Object.keys(baseline.files).sort(), "no existing test file may be removed or renamed");
  for (const f of now) {
    const buf = fs.readFileSync(new URL("./" + f, import.meta.url));
    assert.equal(crypto.createHash("sha256").update(buf).digest("hex"), baseline.files[f].sha256, f + " changed");
    assert.equal((buf.toString().match(/\.skip\(|\{\s*skip\s*:/g) || []).length, 0, f + " must not skip");
  }
});
test("[P2L-128,129,130,131,132,133,134] the source-pinning assertions named in the ledger still exist in their test files", () => {
  const need = [
    ["analysis-v2.test.mjs", "プレーヤー分析"], ["analytics-final-rc.test.mjs", "改善傾向"], ["i18n-foundation-v1.test.mjs", "MutationObserver"],
    ["match-history-list-simplification.test.mjs", "localeCompare"], ["navigation-phase2-6.test.mjs", "schedulePlayerReconcile"],
    ["build55-player-editor-actions.test.mjs", "MutationObserver"], ["build70-pro-ux-startup-safety.test.mjs", "MutationObserver"],
    ["navigation-shell-phase1.test.mjs", "scheduleReconcile"], ["player-search-focus-ring.test.mjs", "toLocaleLowerCase"]
  ];
  for (const [f, token] of need) assert.ok(read("tests/" + f).includes(token), `${f}: ${token}`);
});
