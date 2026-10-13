/* P2-0 coverage gate: every ledger row (134) has at least one characterization test, or an explicit NOT VERIFIED reason. */
import test from "node:test";
import assert from "node:assert/strict";
import { read } from "./helpers/p2-source.mjs";
import { coverageByTitle } from "./helpers/p2-coverage.mjs";

const anchors = JSON.parse(read("tests/fixtures/p2/ledger-anchors.json"));
const cover = coverageByTitle();
/* Rows whose behavior cannot be asserted below L2; each carries the reason. Anything not listed here must have a specific L0/L1 test beyond its generic anchor. */
const L2_ONLY = {};

test("[coverage] the ledger has 134 rows P2L-001..P2L-134", () => {
  assert.equal(anchors.length, 134);
  assert.deepEqual(anchors.map(a => a.id), Array.from({ length: 134 }, (_, i) => "P2L-" + String(i + 1).padStart(3, "0")));
});

test("[coverage] every ledger row has a dedicated test (anchor tests + at least one behavioral/ratchet test), or a documented gap", () => {
  const missing = [];
  for (const a of anchors) {
    const tests = (cover.get(a.id) || []).filter(t => !/ L0 anchor /.test(t.title));
    if (!tests.length && !L2_ONLY[a.id]) missing.push(a.id);
  }
  assert.deepEqual(missing, [], "ledger rows without a specific test: " + missing.join(","));
});
