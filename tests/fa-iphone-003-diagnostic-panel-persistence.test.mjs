import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const diagnostic=html.match(/const FA_IPHONE_003_DEBUG_KEY_V1[\s\S]*?function inProgressMatchStorageKeyV1/)?.[0]||"";
const navigation=html.match(/if \(FA_IPHONE_003_DEBUG_V1\) document\.addEventListener\("click"[\s\S]*?\n  \}\);/)?.[0]||"";
const backup=html.match(/function makeBackupPayload\(\) \{[\s\S]*?\n    \}/)?.[0]||"";

test("first copy retains all in-memory diagnostic entries",()=>{
  const copyHandler=diagnostic.match(/el\("faIphone003CopyV1"\)\?\.addEventListener\("click"[\s\S]*?\n    \}\);/)?.[0]||"";
  assert.match(copyHandler,/faIphone003EntriesV1\.map\(item=>JSON\.stringify\(item\)\)/);
  assert.doesNotMatch(copyHandler,/faIphone003EntriesV1\.length\s*=\s*0|splice\(|pop\(|shift\(/);
});

test("navigation continues appending after the collapsed copy panel",()=>{
  assert.match(navigation,/faIphone003DebugV1\("navigation:after"/);
  assert.match(navigation,/event\.target\.closest\("#faIphone003PanelV1"\)/);
  assert.match(navigation,/requestAnimationFrame/);
});

test("Home return recreates or expands the diagnostic panel",()=>{
  assert.match(navigation,/isFaIphone003HomeVisibleV1\(\)/);
  assert.match(navigation,/showFaIphone003PanelV1\(\)/);
  assert.match(navigation,/faIphone003DebugV1\("home:return"/);
});

test("expanded panel rebuilds its body from every retained entry",()=>{
  const show=diagnostic.match(/function showFaIphone003PanelV1\(\) \{[\s\S]*?\n  \}/)?.[0]||"";
  assert.match(show,/installFaIphone003PanelV1\(\)/);
  assert.match(show,/output\.hidden=false/);
  assert.match(show,/output\.textContent=faIphone003EntriesV1\.map\(item=>JSON\.stringify\(item\)\)\.join\("\\n"\)/);
  assert.match(show,/copy\.textContent="コピー"/);
});

test("second copy includes startup, navigation and Home-return entries",()=>{
  assert.match(diagnostic,/diagnostic:start/);
  assert.match(navigation,/navigation:after/);
  assert.match(navigation,/home:return/);
  assert.match(diagnostic,/const text=faIphone003EntriesV1\.map\(item=>JSON\.stringify\(item\)\)\.join\("\\n"\)/);
});

test("diagnostic OFF cannot recreate the panel",()=>{
  assert.match(diagnostic,/function showFaIphone003PanelV1\(\) \{\s*if \(!FA_IPHONE_003_DEBUG_V1\) return false/);
  assert.match(diagnostic,/FA_IPHONE_003_DEBUG_V1 = Boolean\(enabled\)/);
  assert.match(diagnostic,/el\("faIphone003PanelV1"\)\?\.remove\(\)/);
});

test("Settings toggle contract remains unchanged",()=>{
  assert.match(html,/id="settingsFaIphone003Toggle"[^>]*type="checkbox"[^>]*role="switch"/);
  assert.match(html,/diagnostic\?\.setEnabled\(enabled\)===true/);
  assert.match(diagnostic,/const FA_IPHONE_003_DEBUG_KEY_V1 = "cueScore\.debug\.faIphone003"/);
});

test("Compact Card and saved-state schemas remain unchanged",()=>{
  assert.match(html,/\.cue-resume-card-v1\{[^}]*min-height:64px!important/);
  assert.match(html,/\.cue-resume-matchup-v4\{display:flex;align-items:center;justify-content:flex-start;gap:5px/);
  assert.match(html,/\.cue-resume-game-v4 img\{width:34px;height:34px\}/);
  assert.match(html,/\.cue-resume-player-v4 img\{width:24px;height:24px/);
  assert.match(html,/const IN_PROGRESS_MATCH_SCHEMA_V1 = 1/);
  assert.doesNotMatch(diagnostic,/schemaVersion\s*:/);
});

test("diagnostic entries and flag remain outside Backup JSON",()=>{
  assert.ok(backup);
  assert.doesNotMatch(backup,/faIphone003EntriesV1|cueScore\.debug\.faIphone003|FA_IPHONE_003_DEBUG_KEY_V1/);
});
