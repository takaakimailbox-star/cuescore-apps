import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const fn = name => { const start = html.indexOf(`function ${name}(`); assert.ok(start > 0, `${name} must exist`); return html.slice(start, html.indexOf("\n  }\n", start)); };

test("restore re-opens a Break prompt that was open at snapshot time, through the routine Undo already uses, with every saved pending field", () => {
  const body = fn("restoreInProgressMatchV1");
  assert.match(body, /updateGame\(\);[\s\S]*?payload\.state\.pendingBreakPlayerV61 != null && !payload\.state\.pendingBreakStartsNextRackV1 && !payload\.state\.rackEnded\) \{\s*restoreBreakPromptFromUndoV697\(\{/);
  for (const field of ["pendingBreakPlayerV61", "pendingBreakRackV61", "pendingBreakBallsV696", "pendingBreakNoInV702", "pendingBreakPreFoulV1", "pendingBreakScratchV696", "pendingBreakIllegalV696", "pendingBreakPushOutV695"]) assert.match(body, new RegExp(`payload\\.state\\.${field}`));
  assert.match(body, /pendingBreakNoInV702 = Boolean\(payload\.state\.pendingBreakNoInV702\);/, "the routine derives the no-in flag; the saved value is kept");
  assert.equal((body.match(/restoreBreakPromptFromUndoV697\(/g) || []).length, 1);
  assert.doesNotMatch(body, /showBreakResultPromptV61\(/, "no fresh (empty) prompt is created on restore");
});

test("restore only opens the prompt: it never confirms or saves a Break result", () => {
  const body = fn("restoreInProgressMatchV1");
  assert.doesNotMatch(body, /saveBreakResultV61\(|breakResultSaveV695|recordAnalysisEventV60\(|appendCommonEventV700\(/);
  assert.match(fn("restoreBreakPromptFromUndoV697"), /overlay\.classList\.remove\("hidden"\)/);
  assert.doesNotMatch(fn("restoreBreakPromptFromUndoV697"), /saveBreakResultV61\(|recordAnalysisEventV60\(/);
});

test("the next-rack prompt keeps its single existing owner (updateGame) and is not re-armed by restore", () => {
  assert.match(html, /rackEnded &&\s*!gameEnded &&[\s\S]*?showBreakResultPromptV61\(nextBreakerV1, nextRackNumberV1, \{ nextRack:true \}\)/);
  assert.equal((fn("restoreInProgressMatchV1").match(/nextRack:true/g) || []).length, 0);
});

test("restore(), the prompt close path, the snapshot writer and the snapshot schema are unchanged", () => {
  assert.match(html, /const IN_PROGRESS_MATCH_SCHEMA_V1 = 1/);
  const restore = fn("restore");
  assert.match(restore, /pendingBreakPlayerV61 = state\.pendingBreakPlayerV61 \?\? null;/);
  assert.match(restore, /closeBreakResultPromptV61\(\);\s*$/);
  assert.match(fn("closeBreakResultPromptV61"), /pendingBreakPlayerV61 = null;\s*pendingBreakRackV61 = null;/);
  assert.match(fn("persistInProgressMatchV1"), /state:snapshot\(\)/);
  assert.match(fn("snapshot"), /pendingBreakPlayerV61, pendingBreakRackV61, pendingBreakResultV695, pendingBreakPushOutV695/);
});

test("the first Break prompt is only opened by the new-match start; 14-1 and 3 Cushion have no Break prompt", () => {
  assert.equal((html.match(/showBreakResultPromptV61\(startingPlayer, 1, \{source:"new-match"\}\)/g) || []).length, 1);
  assert.match(html, /if \(!threeCushionModeV1 && !straightPoolModeV1 && recordingModeV611 === "detail"\) \{\s*showRackStartToastV1\(1,startingPlayer\);/);
  assert.match(fn("showBreakResultPromptV61"), /isStraightPoolV1\(\)\) return;/);
});

test("the disabled Break options stay disabled (illegal break, pre-break foul, Push Out, 14-1 opening break / rebreak)", () => {
  assert.match(html, /pushOut:false, threeFoul:true, illegalBreak:true/);
  assert.match(html, /const straightSettingsValue = \{threeFoul:true,openingBreak:false,recordMode:"detail"\}/);
  assert.match(fn("showBreakResultPromptV61"), /if \(pushOutButtonV699\) pushOutButtonV699\.hidden = true;/);
});
