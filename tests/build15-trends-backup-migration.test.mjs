import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const analysis=fs.readFileSync(new URL("../analysis-build4.js",import.meta.url),"utf8");

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

test("analysis no longer exposes trend chart code",()=>{
  assert.doesNotMatch(analysis,/function chart|data-b4-chart|analysis-b4-trend|推移/);
});
