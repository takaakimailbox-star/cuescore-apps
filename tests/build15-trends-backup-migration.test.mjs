import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const chart=fs.readFileSync(new URL("../analysis-build4.js",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../ui-revision-v12.css",import.meta.url),"utf8");

test("restore accepts only supported backup schemas and migrates before writes",()=>{
  assert.match(html,/Number\(value\.schemaVersion\) > BACKUP_SCHEMA_VERSION/);
  assert.match(html,/function migrateBackupToCanonicalV170\(value\)/);
  assert.match(html,/backup = migrateBackupToCanonicalV170\(backup\)/);
  assert.match(html,/backup=window\.cueScoreMigrateBackupToCanonicalV170\(backup\)/);
});

test("migration canonicalizes Player, Match and registered Player identities",()=>{
  assert.match(html,/id: String\(player\.id \?\? player\.playerId \?\? player\.uuid/);
  assert.match(html,/const id = String\(record\.id \?\? record\.matchId/);
  assert.match(html,/normalized\.registeredPlayerId = String\(normalized\.registeredPlayerId\)\.trim\(\)/);
  assert.match(html,/Backup player IDs are duplicated/);
  assert.match(html,/Backup match IDs are duplicated/);
});

test("unsafe migration stops before restore transaction",()=>{
  const migration=html.indexOf("backup = migrateBackupToCanonicalV170(backup)");
  const transaction=html.indexOf("window.CueScoreRestoreSafetyV160.performTransaction",migration);
  assert.ok(migration>0&&transaction>migration);
  assert.match(html,/安全に現行形式へ変換できないため、復元を中止しました。現在のデータは変更されていません。/);
});

test("individual deletion backups contain only the deleted entity",()=>{
  assert.match(html,/backupScope: "deleted-player-only"[\s\S]*?\{ players: \[player\], matchRecords: \[\] \}/);
  assert.match(html,/backupScope: "deleted-match-only"[\s\S]*?\{ players: \[\], matchRecords: \[record\] \}/);
  assert.match(html,/Array\.isArray\(scopedData\?\.players\)/);
  assert.match(html,/Array\.isArray\(scopedData\?\.matchRecords\)/);
});

test("trend chart reserves visible axes and centers a single point",()=>{
  assert.match(chart,/h=208,left=48,right=14,top=16,bottom=44/);
  assert.match(chart,/values\.length===1\?left\+\(w-left-right\)\/2/);
  assert.match(chart,/analysis-b4-axis-caption[\s\S]*試合日/);
  assert.match(chart,/labelEvery=Math\.max\(1,Math\.ceil\(values\.length\/5\)\)/);
});

test("full-screen trends keep labels, grid, line and points readable at 390px",()=>{
  assert.match(css,/\.pd12-chart-scroll \{ overflow-x:hidden/);
  assert.match(css,/analysis-b4-y-label[\s\S]*font-size:11px/);
  assert.match(css,/analysis-b4-grid[\s\S]*#d4d4cf/);
  assert.match(css,/analysis-b4-plot-line[\s\S]*stroke-width:3/);
  assert.match(css,/analysis-b4-plot-point[\s\S]*stroke-width:3/);
});
