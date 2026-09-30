import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.doesNotMatch(html, /data-player-detail-delete=/, "Player detail must not expose individual delete");
assert.match(html, /id="playerEditorDeleteBtn"/, "Player Edit must expose individual delete");
assert.doesNotMatch(html, /\.player-editor-delete\s*\{\s*display:\s*none\s*!important/, "Player Edit delete must not be globally hidden");
assert.match(html, /id="matchDetailDeleteV1"/, "Match detail must expose individual delete");
assert.match(html, /id="suiteDeleteRecords"/, "Data management must expose all-history delete");
assert.match(html, /id="suiteDeletePlayers"/, "Data management must expose all-player delete");
assert.match(html, /id="suiteDeleteAll"/, "Data management must expose all-data delete");
assert.match(html, /このプレーヤーを削除しても、過去の試合履歴は残ります。/);
assert.match(html, /このプレーヤーは中断中の試合で使用されています。試合を終了または破棄してから削除してください。/);
assert.match(html, /履歴・分析・ランキング・VSから削除されます。/);
assert.match(html, /const DATA_PLAYER_KEY = activeCueScoreDataKeyV1\("rotationScoreboard\.players\.v1"\)/);
assert.match(html, /const backupPrefix = window\.CueScoreDemoData\?\.isDemo\(\) \? "cuescore-demo\.beforeDelete"/);
assert.doesNotMatch(
  html.slice(html.indexOf("function createDestructiveBackupV132"), html.indexOf("function refreshAfterDestructiveChangeV132")),
  /DATA_CATEGORY_KEY|DATA_SEASON_KEY/,
  "Deletion backup must not depend on out-of-scope storage constants"
);

console.log("Deletion workflow placement and data-space guards passed.");
