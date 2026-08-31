import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("Phase B-1 removes declaration-only legacy Home routes", () => {
  for (const id of [
    "legacyNewGameBtn",
    "legacyPlayerManagementBtn",
    "legacyRecordsBtn",
    "legacySettingsBtn",
    "legacyOpenRankingsBtn"
  ]) assert.doesNotMatch(html, new RegExp(`id=["']${id}["']`));
});

test("Phase B-1 removes the hidden legacy Home dashboard entry surface", () => {
  assert.doesNotMatch(html, /id=["']homeDashboard["']/);
  assert.doesNotMatch(html, /id=["']dashboardPlayerSelect["']/);
  assert.doesNotMatch(html, /id=["']dashboardStatsGrid["']/);
});

test("Phase B-1 stops deferred Cloud Sync before runtime initialization", () => {
  assert.match(
    html,
    /Ver\.4\.8\.0: Device ID cloud sync[\s\S]*?\(\(\) => \{[\s\S]*?if \(!window\.CueScoreFeatureAccess\.canUse\("cloudSync"\)\) return;\s*const SUPABASE_CONFIG_KEY/
  );
});

test("Phase B-1 leaves CSV unavailable without a production click entry point", () => {
  assert.match(html, /csvExport:false/);
  assert.doesNotMatch(html, /byId\("exportCsvBtn"\)\?\.addEventListener\("click",\s*exportCsv\)/);
});

test("Phase B-1 keeps one owned Player Library handler for each overlapping control", () => {
  assert.equal((html.match(/el\("playerLibraryList"\)\?\.addEventListener\("click"/g) || []).length, 1);
  assert.equal((html.match(/el\("playerLibraryBackBtn"\)\?\.addEventListener\("click"/g) || []).length, 1);
  assert.equal((html.match(/el\("playerLibraryAddBtn"\)\?\.addEventListener\("click"/g) || []).length, 1);
  assert.match(html, /playerLibraryList"\)\?\.addEventListener\("click",[\s\S]*?}, true\)/);
});
