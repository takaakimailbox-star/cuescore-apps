import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("new-match Break Input renders immediately without waiting for the rack toast",()=>{
  assert.match(html,/showRackStartToastV1\(1,startingPlayer\);\s*showBreakResultPromptV61\(startingPlayer, 1, \{source:"new-match"\}\);/);
  assert.doesNotMatch(html,/showRackStartToastV1\(1,startingPlayer\);[\s\S]{0,300}setTimeout[\s\S]{0,300}showBreakResultPromptV61/);
});

test("next-rack Break Input renders immediately while preserving breaker and rack state",()=>{
  assert.match(html,/const nextRackNumberV1 = Number\(rack\) \+ 1;\s*const nextBreakerV1 = Number\(nextBreakPlayer\) === 2 \? 2 : 1;\s*showRackStartToastV1\(nextRackNumberV1,nextBreakerV1\);\s*rackBreakPromptQueuedV1 = false;\s*showBreakResultPromptV61\(nextBreakerV1, nextRackNumberV1, \{ nextRack:true \}\);/);
  assert.doesNotMatch(html,/showRackStartToastV1\(nextRackNumberV1,nextBreakerV1\);[\s\S]{0,300}setTimeout[\s\S]{0,300}showBreakResultPromptV61/);
});

test("all Break Input re-entry paths call the prompt synchronously",()=>{
  assert.match(html,/showBreakResultPromptV61\(nextBreaker, rackNumber, \{source:"game"\}\);/);
  assert.match(html,/recordingModeV611 === "detail"\) showBreakResultPromptV61\(player, rack\);/);
  assert.match(html,/if \(options\.showPrompt !== false\) showBreakResultPromptV61\(player, rack\);/);
  assert.match(html,/if \(choice === "rebreak"\) showBreakResultPromptV61\(current, rack\);/);
  assert.doesNotMatch(html,/(?:setTimeout|requestAnimationFrame)\([^\n]{0,160}showBreakResultPromptV61/);
});

test("Break save remains guarded against double input and restores the save control",()=>{
  assert.match(html,/function saveBreakResultV61\(\) \{\s*if \(breakResultSavingV1\) return;[\s\S]{0,220}breakResultSavingV1 = true;/);
  assert.match(html,/breakResultSaveV695"\)\) el\("breakResultSaveV695"\)\.disabled = true;/);
  assert.match(html,/breakResultSavingV1 = false;\s*if \(el\("breakResultSaveV695"\)\) el\("breakResultSaveV695"\)\.disabled = false;/);
});

test("Break Input discipline scope remains 9-Ball, 10-Ball, Rotation and JPA",()=>{
  assert.match(html,/if \(recordingModeV611 !== "detail" \|\| gameEnded \|\| reviewMode \|\| isStraightPoolV1\(\)\) return;/);
  assert.match(html,/if \(!threeCushionModeV1 && !straightPoolModeV1 && recordingModeV611 === "detail"\)/);
});
