import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const serviceWorker=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");

assert.match(html,/CueScore Player Journey v2\.0/);
assert.match(html,/対戦相手別の成績/);
assert.match(html,/このプレーヤーの試合履歴/);
assert.match(html,/data-open-opponents-v2/);
assert.match(html,/data-open-player-history-v2/);
assert.match(html,/data-rival-sort="games"/);
assert.match(html,/data-rival-sort="rate"/);
assert.match(html,/data-history-filter="all"/);
assert.match(html,/data-history-period/);
assert.match(html,/window\.openHistoricalRecordV2 = openHistoricalRecord/);
assert.match(html,/select\.dispatchEvent\(new Event\("change",\{bubbles:true\}\)\)/);
assert.doesNotMatch(html,/player-journey-overlay-v2[\s\S]{0,800}player-detail-bottom-nav-v1/);
assert.match(html,/CueScore player journey v2\.1/);
assert.match(html,/grid-template-columns:auto auto auto auto minmax\(58px,1fr\)/);
assert.match(serviceWorker,/1\.0-player-journey-v2\.1/);

console.log("Player information, opponent records, and player history three-screen checks passed.");
