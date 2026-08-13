import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const helperStart = html.indexOf("function isQuotaExceededErrorV160(");
const helperEnd = html.indexOf("let derivedViewRefreshQueuedV131", helperStart);
assert.ok(helperStart >= 0 && helperEnd > helperStart, "restore safety helpers must exist");
const helperSource = html.slice(helperStart, helperEnd);

function makeStorage(initial = {}, setHook = null) {
  const data = new Map(Object.entries(initial));
  let writes = 0;
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) {
      writes += 1;
      setHook?.({ key, value: String(value), writes, data });
      data.set(key, String(value));
    },
    removeItem(key) { data.delete(key); },
    dump() { return Object.fromEntries(data); }
  };
}

function loadHelpers(storage) {
  const context = vm.createContext({ window: {}, localStorage: storage, console });
  vm.runInContext(helperSource, context);
  return context.window.CueScoreRestoreSafetyV160;
}

test("replace-style restore succeeds and verifies all target values", () => {
  const storage = makeStorage({ players: "[]", records: "[]", categories: "[]", seasons: "[]" });
  const safety = loadHelpers(storage);
  safety.performTransaction(
    ["players", "records", "categories", "seasons"],
    [["players", [{ id: 1 }]], ["records", [{ id: "m1" }]], ["categories", ["league"]], ["seasons", ["2026"]]]
  );
  assert.deepEqual(storage.dump(), {
    players: '[{"id":1}]', records: '[{"id":"m1"}]', categories: '["league"]', seasons: '["2026"]'
  });
});

test("quota on the first write leaves current data unchanged and is not corruption", () => {
  const original = { players: "[]", records: "[]", categories: "[]", seasons: "[]" };
  const storage = makeStorage(original, ({ writes }) => {
    if (writes === 1) throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
  });
  const safety = loadHelpers(storage);
  assert.throws(() => safety.performTransaction(Object.keys(original), [["players", [{ id: 1 }]]]), error => {
    assert.equal(error.restoreDataUnchanged, true);
    assert.equal(error.restoreRollbackVerified, true);
    assert.equal(safety.isQuotaExceededError(error), true);
    assert.match(safety.failureMessage(error), /現在のデータは変更されていません/);
    assert.doesNotMatch(safety.failureMessage(error), /破損/);
    return true;
  });
  assert.deepEqual(storage.dump(), original);
});

test("quota after a partial write rolls back from the in-memory snapshot and verifies it", () => {
  const original = { players: "[]", records: "[]", categories: "[]", seasons: "[]" };
  const storage = makeStorage(original, ({ writes }) => {
    if (writes === 2) throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
  });
  const safety = loadHelpers(storage);
  assert.throws(() => safety.performTransaction(Object.keys(original), [
    ["players", [{ id: 1 }]], ["records", [{ id: "m1" }]]
  ]), error => {
    assert.equal(error.restoreDataUnchanged, false);
    assert.equal(error.restoreRollbackVerified, true);
    assert.match(safety.failureMessage(error), /元の状態へ戻しました/);
    return true;
  });
  assert.deepEqual(storage.dump(), original);
});

test("rollback verification failure is reported as an unconfirmed critical state", () => {
  const original = { players: "[]", records: "[]" };
  const storage = makeStorage(original, ({ writes }) => {
    if (writes >= 2) throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
  });
  const safety = loadHelpers(storage);
  assert.throws(() => safety.performTransaction(Object.keys(original), [
    ["players", [{ id: 1 }]], ["records", [{ id: "m1" }]]
  ]), error => {
    assert.equal(error.restoreRollbackVerified, false);
    assert.match(safety.failureMessage(error), /完全に戻せたことを確認できません/);
    assert.doesNotMatch(safety.failureMessage(error), /元の状態へ戻しました/);
    return true;
  });
});

test("replace and merge restore do not create localStorage snapshot keys", () => {
  const replaceBlock = html.slice(html.indexOf("async function importBackupFile(file)"), html.indexOf("function clearSelectedPlayersV1"));
  const mergeBlock = html.slice(html.indexOf("async function mergeBackup(backup)"), html.indexOf("function handFileToExistingRestore"));
  assert.doesNotMatch(replaceBlock, /beforeLocalRestore|restoreSnapshotKey/);
  assert.doesNotMatch(mergeBlock, /beforeLocalMergeRestore|snapshotKey/);
  assert.match(replaceBlock, /CueScoreRestoreSafetyV160\.performTransaction/);
  assert.match(mergeBlock, /CueScoreRestoreSafetyV160\.performTransaction/);
});

test("legacy snapshot retention stays bounded and scoped away from formal data keys", () => {
  const lifecycleStart = html.indexOf("/* CueScore RC59: LocalStorage capacity audit");
  const lifecycleEnd = html.indexOf("</script>", lifecycleStart);
  const lifecycle = html.slice(lifecycleStart, lifecycleEnd);
  assert.match(lifecycle, /const MAX_TRANSIENT_GENERATIONS = 5;/);
  assert.match(lifecycle, /pruneGroup\(key => key\.startsWith\('rotationScoreboard\.beforeLocalRestore\.'\)\)/);
  assert.doesNotMatch(lifecycle, /matchRecords\.v1|players\.v1|matchCategories\.v1|matchSeasons\.v1/);
});

test("parse, unsupported format, quota, and rollback messages remain distinct", () => {
  assert.match(html, /JSONファイルが破損している可能性があります。/);
  assert.match(html, /このバックアップファイルはCueScore Appsで復元できる形式ではありません。/);
  assert.match(html, /端末の保存容量が不足しているため、データを復元できませんでした。/);
  assert.match(html, /元のデータへ完全に戻せたことを確認できません。/);
  assert.doesNotMatch(html, /バックアップファイルを読み込めませんでした。ファイルが破損している可能性があります。/);
});

test("backup JSON schema and export filename stay compatible", () => {
  assert.match(html, /const BACKUP_SCHEMA_VERSION = 2;/);
  assert.match(html, /format: BACKUP_FORMAT,[\s\S]*players:[\s\S]*matchRecords:[\s\S]*matchCategories:[\s\S]*matchSeasons:/);
  assert.match(html, /CueScore_Apps_v1\.0_Backup_\$\{dateStamp\(\)\}\.json/);
});
