import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { createRequire } from "node:module";

// P4 Manifest Completion: every key of the 3 catalogs has exactly one review-state entry (P3 keys in `keys`, P1/P2 keys in `earlierKeys`),
// the state is P3-PROVISIONAL for all of them (no P4-REVIEWED / P4-APPROVED exists until an independent reviewer and the PO act), and
// the catalogs agree key-for-key with matching placeholders.
const require = createRequire(import.meta.url);
const root = new URL("../", import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL("tests/fixtures/p3/translation-manifest.json", root), "utf8"));
const catalogs = { ja: require("../i18n-catalog-ja-v1.js"), en: require("../i18n-catalog-en-v1.js"), zh: require("../i18n-catalog-zh-hans-v1.js") };
const placeholders = text => [...String(text).matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(m => m[1]).sort().join(",");
const sorted = o => Object.keys(o).sort();

test("manifest covers every catalog key exactly once (P3 keys + P1/P2 keys = all catalog keys)", () => {
  const p3 = Object.keys(manifest.keys), earlier = Object.keys(manifest.earlierKeys);
  assert.equal(p3.filter(k => !k.startsWith("p3.")).length, 0, "keys holds only p3.* keys");
  assert.equal(earlier.filter(k => k.startsWith("p3.")).length, 0, "earlierKeys holds no p3.* key");
  assert.equal(new Set([...p3, ...earlier]).size, p3.length + earlier.length, "no key is listed twice");
  assert.deepEqual([...p3, ...earlier].sort(), sorted(catalogs.ja));
  const added = Object.values(manifest.keys).filter(e => e.addedBy).length; // keys added after the P4 manifest completion by PO-approved decisions (Decision 037: U3 note, U8 Share Sheet)
  assert.equal(p3.length + earlier.length, 1331 - 2 + added); // 2 = p3.e2e7544e / p3.ef088e10 (ball-in-hand wording) retired by the PO decision of 2026-10-28
  assert.equal(earlier.length, 90);
});

test("every manifest entry is P3-PROVISIONAL; nothing is P4-REVIEWED or P4-APPROVED", () => {
  for (const [key, entry] of [...Object.entries(manifest.keys), ...Object.entries(manifest.earlierKeys)]) {
    assert.equal(entry.status, "P3-PROVISIONAL", key);
    assert.ok(!/reviewer|approved|reviewed/i.test(JSON.stringify(entry)), `${key} carries no review/approval record`);
  }
  for (const entry of Object.values(manifest.earlierKeys)) { assert.equal(entry.origin, "P1/P2"); assert.ok(entry.group); }
});

test("ja, en and zh-Hans have identical key sets; values are non-empty with matching placeholders", () => {
  assert.deepEqual(sorted(catalogs.en), sorted(catalogs.ja));
  assert.deepEqual(sorted(catalogs.zh), sorted(catalogs.ja));
  for (const key of sorted(catalogs.ja)) {
    const base = placeholders(catalogs.ja[key]);
    for (const name of ["en", "zh"]) {
      const value = catalogs[name][key];
      const forms = typeof value === "object" ? Object.values(value) : [value];
      for (const form of forms) { assert.equal(typeof form, "string", `${name}:${key}`); assert.ok(form.length > 0, `${name}:${key} empty`); assert.equal(placeholders(form), base, `${name}:${key} placeholders`); }
    }
  }
});
