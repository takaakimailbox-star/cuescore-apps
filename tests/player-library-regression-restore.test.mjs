import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

const legacyDefinition=html.indexOf("function renderPlayerLibrary() {");
const formalOverride=html.indexOf("renderPlayerLibrary = function() {",legacyDefinition+1);
assert.ok(legacyDefinition>=0,"legacy-compatible base renderer must remain available");
assert.ok(formalOverride>legacyDefinition,"formal renderer must override the old Player1 selection renderer later in initialization");

const formalEnd=html.indexOf("function openPlayerManagementV145",formalOverride);
const formal=html.slice(formalOverride,formalEnd);
for(const required of [
  "player-management-row-v1",
  "player-management-avatar-v1",
  "player-primary-pin-v2",
  "player-selection-row-v1",
  "player-selection-button-v1",
  "player-selection-avatar-v1",
  "player-primary-badge-v1",
  "現在選択中",
  "最終使用",
  "recordsForRegisteredPlayer(player)",
  "playerLibrarySortV1 === \"name\""
]) assert.ok(formal.includes(required),`formal Player Library behavior missing: ${required}`);

assert.match(html,/openPlayerLibrary = function\(target\)/);
assert.match(html,/overlay\?\.classList\.add\("player-management-formal-v1"\)/);
assert.match(html,/overlay\?\.classList\.toggle\("player-selection-formal-v1", !management\)/);
assert.match(html,/playerLibraryTarget = target/);
assert.match(html,/document\.getElementById\("playerManagementBtn"\)\?\.addEventListener\("click", openPlayerManagementV145\)/);
assert.match(html,/el\("p1PlayerSearchBtn"\)\?\.addEventListener\("click", \(\) => openPlayerLibrary\(1\)\)/);
assert.match(html,/el\("p2PlayerSearchBtn"\)\?\.addEventListener\("click", \(\) => openPlayerLibrary\(2\)\)/);
assert.match(html,/el\("playerLibrarySearch"\)\?\.addEventListener\("input", \(\) => renderPlayerLibrary\(\)\)/);
assert.match(html,/if \(playerLibraryModeV145 === "management" && stats\) openPlayerStats/);
assert.match(html,/el\("playerLibraryAddBtn"\)\?\.addEventListener\("click"/);

// Selection uses the formal white Player Library shell and row renderer, not the old
// combined green row with stats/edit actions.
const selectionStart=formal.indexOf('return `<div class="player-selection-row-v1');
const selectionEnd=formal.indexOf("}).join(\"\");",selectionStart);
const selection=formal.slice(selectionStart,selectionEnd);
assert.ok(selectionStart>=0,"formal selection row must be rendered for Player1 and Player2");
assert.match(selection,/playerAvatarHtmlV2\(p,"player-avatar-v2"\)/);
assert.match(selection,/data-select-player/);
assert.match(selection,/現在選択中/);
assert.match(selection,/Player\$\{otherPlayer\}で選択中/);
assert.match(selection,/最終使用/);
assert.doesNotMatch(selection,/data-stats-player|data-edit-player|>成績<|>編集</);

for(const discipline of ["9ball","10ball","rotation","straightPool","jpa9","threeCushion"]){
  assert.match(html,new RegExp(`data-discipline="${discipline}"`));
}
assert.equal((html.match(/openPlayerLibrary\(1\)/g)||[]).length,1,"Player1 must use the shared selection entry point");
assert.equal((html.match(/openPlayerLibrary\(2\)/g)||[]).length,1,"Player2 must use the shared selection entry point");

// Match memo/tag Phase 1 removal must not regress with the restored Player Library block.
for(const removed of [/data-records-filter="memo"/,/data-records-tag=/,/record-detail-memo/,/memo-tag-chip/]) {
  assert.doesNotMatch(html,removed);
}

console.log("Formal Player Library renderer and Player1/Player2 routes restored without memo/tag regression.");
