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
assert.match(html,/window\.openHistoricalRecordV2=openMatchDetailV1/);
assert.match(html,/window\.openMatchDetailV1=openMatchDetailV1/);
assert.match(html,/window\.__cueScoreRivalReturnV2=\{playerId:rivalState\.playerId,discipline:rivalState\.discipline\}/);
assert.match(html,/window\.openPlayerOpponentRecordsV2\(opponentReturn\.playerId,opponentReturn\.discipline\|\|'9ball'\)/);
assert.match(html,/data-player-record-open-v3/);
assert.match(html,/openPlayerJourneyMatchV3\(direct\.dataset\.playerRecordOpenV3\)/);
assert.match(html,/window\.openMatchDetailV1\|\|window\.openHistoricalRecordV2/);
assert.match(html,/\.record-detail-overlay\.match-detail-overlay-v1\{[\s\S]*?z-index:16000!important/);
assert.match(html,/journeyDiscipline=discipline\.dataset\.playerDetailDiscipline\|\|"9ball"/);
assert.match(html,/const active=journeyDiscipline/);
assert.match(html,/aria-selected=\"\$\{d\.id===active\}\"/);
assert.match(html,/select\.dispatchEvent\(new Event\("change",\{bubbles:true\}\)\)/);
assert.doesNotMatch(html,/player-journey-overlay-v2[\s\S]{0,800}player-detail-bottom-nav-v1/);
assert.match(html,/CueScore player journey v2\.1/);
assert.match(html,/grid-template-columns:auto auto auto auto minmax\(58px,1fr\)/);
assert.match(serviceWorker,/const APP_VERSION = "1\.0-[^"]+"/);

console.log("Player information, opponent records, and player history three-screen checks passed.");
