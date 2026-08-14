import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");
const diagnostic=html.match(/const FA_IPHONE_003_DEBUG_KEY_V1[\s\S]*?function inProgressMatchStorageKeyV1/)?.[0]||"";
const settings=html.match(/\/\* CueScore Settings v1\.0: formal layout with existing data actions\. \*\/[\s\S]*?window\.addEventListener\("pageshow", restoreSettingsAfterLegalV160\);/)?.[0]||"";
const backup=html.match(/function makeBackupPayload\(\) \{[\s\S]*?\n    \}/)?.[0]||"";

test("diagnostic flag OFF leaves normal query-free startup disabled",()=>{
  assert.match(diagnostic,/let FA_IPHONE_003_DEBUG_V1 = FA_IPHONE_003_QUERY_DEBUG_V1 \|\| readFaIphone003FlagV1\(\)/);
  assert.match(diagnostic,/getItem\(FA_IPHONE_003_DEBUG_KEY_V1\) === "1"/);
});

test("diagnostic flag ON enables query-free startup and survives document initialization",()=>{
  assert.match(diagnostic,/const FA_IPHONE_003_DEBUG_KEY_V1 = "cueScore\.debug\.faIphone003"/);
  assert.match(diagnostic,/FA_IPHONE_003_QUERY_DEBUG_V1 \|\| readFaIphone003FlagV1\(\)/);
  assert.match(html,/installFaIphone003PanelV1\(\);\s*initializePlayerUiV1\(\)/);
});

test("OFF removes only the diagnostic key and panel",()=>{
  assert.match(diagnostic,/else localStorage\.removeItem\(FA_IPHONE_003_DEBUG_KEY_V1\)/);
  assert.match(diagnostic,/FA_IPHONE_003_DEBUG_V1 = Boolean\(enabled\)/);
  assert.match(diagnostic,/el\("faIphone003PanelV1"\)\?\.remove\(\)/);
});

test("query diagnostics remain supported",()=>{
  assert.match(diagnostic,/new URLSearchParams\(location\.search\)\.get\("debug"\) === "fa-iphone-003"/);
});

test("Settings switch mirrors the stored flag and uses the diagnostic API",()=>{
  assert.match(html,/id="settingsFaIphone003Toggle"[^>]*type="checkbox"[^>]*role="switch"/);
  assert.match(settings,/toggle\.checked=diagnostic\?\.isStored\(\)===true/);
  assert.match(settings,/diagnostic\?\.setEnabled\(enabled\)===true/);
  assert.match(settings,/診断モードをONにしました。/);
  assert.match(settings,/診断モードをOFFにしました。/);
});

test("diagnostic log panel keeps copy support and required stages",()=>{
  assert.match(diagnostic,/navigator\.clipboard\.writeText\(text\)/);
  for(const stage of ["snapshotPlayerNames","selectedRegisteredPlayer","playerLibrary","name:resolve","render:dom-after","pageshow:after","navigation:after","playerListChildren"]){
    assert.match(html,new RegExp(stage.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  }
});

test("diagnostic key is not part of Backup JSON",()=>{
  assert.ok(backup);
  assert.doesNotMatch(backup,/cueScore\.debug\.faIphone003|FA_IPHONE_003_DEBUG_KEY_V1/);
  assert.deepEqual([...backup.matchAll(/^\s{8}(\w+):/gm)].map(match=>match[1]),["format","appName","schemaVersion","appVersion","gameType","exportedAt","players","matchRecords","matchCategories","matchSeasons"]);
});

test("diagnostic flag stays global and independent from normal or sample resolvers",()=>{
  assert.doesNotMatch(diagnostic,/resolveSettingKey\(FA_IPHONE_003_DEBUG_KEY_V1\)|activeCueScoreDataKeyV1\(FA_IPHONE_003_DEBUG_KEY_V1\)/);
  assert.match(html,/resolveSettingKey\(IN_PROGRESS_MATCH_KEY_V1\)/);
});

test("Player and Match schemas remain unchanged",()=>{
  assert.match(html,/const IN_PROGRESS_MATCH_SCHEMA_V1 = 1/);
  assert.match(html,/const PLAYER_LIBRARY_KEY = "rotationScoreboard\.players\.v1"/);
  assert.doesNotMatch(diagnostic,/schemaVersion\s*:/);
});

test("Compact Card contract remains unchanged",()=>{
  assert.match(html,/\.cue-resume-card-v1\{[^}]*min-height:64px!important/);
  assert.match(html,/\.cue-resume-matchup-v4\{display:flex;align-items:center;justify-content:flex-start;gap:5px;min-width:0;overflow:hidden\}/);
  assert.match(html,/\.cue-resume-game-v4 img\{width:34px;height:34px\}/);
  assert.match(html,/\.cue-resume-player-v4 img\{width:24px;height:24px/);
  assert.doesNotMatch(diagnostic,/cue-resume-card-v1|cue-resume-matchup-v4/);
});

test("diagnostic PWA version is synchronized",()=>{
  assert.match(html,/const PWA_VERSION = "2\.0-fa-iphone-003-diagnostic-toggle-v3"/);
  assert.match(html,/demo-data\.js\?v=2\.0-fa-iphone-003-diagnostic-toggle-v3/);
  assert.match(sw,/const APP_VERSION = "2\.0-fa-iphone-003-diagnostic-toggle-v3"/);
  assert.match(sw,/demo-data\.js\?v=2\.0-fa-iphone-003-diagnostic-toggle-v3/);
});

test("diagnostic mode writes no non-diagnostic localStorage key",()=>{
  const written=[...diagnostic.matchAll(/localStorage\.(?:setItem|removeItem)\(([^,\)]+)/g)].map(match=>match[1].trim());
  assert.deepEqual(written,["FA_IPHONE_003_DEBUG_KEY_V1","FA_IPHONE_003_DEBUG_KEY_V1"]);
});
