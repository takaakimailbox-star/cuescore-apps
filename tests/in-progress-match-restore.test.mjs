import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("in-progress storage is isolated, versioned and sample-data aware",()=>{
  assert.match(html,/const IN_PROGRESS_MATCH_KEY_V1 = "cueScore\.inProgressMatch\.v1"/);
  assert.match(html,/const IN_PROGRESS_MATCH_SCHEMA_V1 = 1/);
  assert.match(html,/resolveSettingKey\(IN_PROGRESS_MATCH_KEY_V1\)/);
  assert.match(html,/state:snapshot\(\),[\s\S]*?undoHistory:JSON\.parse/);
  assert.doesNotMatch(html,/matchRecords:[\s\S]{0,300}IN_PROGRESS_MATCH_KEY_V1/);
});

test("snapshot covers shared and discipline-specific continuation state",()=>{
  for(const field of [
    "activeGameTypeV1","selectedRegisteredPlayer","playerNames","goals","scores","rackScores",
    "current","rack","inning","breakCount","usedBalls","rows","fouls","undoHistory",
    "nineBallStateV1","tenBallStateV1","rotationStateV1","straightPoolStateV1",
    "threeCushionStateV1","jpa9SkillLevelsV1","deadBallsV1","commonEventsV7"
  ]) assert.match(html,new RegExp(`\\b${field}\\b`),`missing ${field}`);
  for(const discipline of ["ROTATION_GAME_TYPE","NINE_BALL_GAME_TYPE","TEN_BALL_GAME_TYPE","STRAIGHT_POOL_GAME_TYPE","JPA9_GAME_TYPE","THREE_CUSHION_GAME_TYPE"]){
    assert.match(html,new RegExp(`includes\\(state\\.activeGameTypeV1\\)[\\s\\S]*?${discipline}|${discipline}[\\s\\S]*?includes\\(state\\.activeGameTypeV1\\)`));
  }
});

test("every committed action saves and startup restores automatically",()=>{
  assert.match(html,/function updateGame\(\)[\s\S]*?persistInProgressMatchV1\(\);[\s\S]*?function saveAndDo/);
  assert.match(html,/document\.addEventListener\("visibilitychange"[\s\S]*?persistInProgressMatchV1/);
  assert.match(html,/window\.addEventListener\("pagehide", persistInProgressMatchV1\)/);
  assert.match(html,/requestAnimationFrame\(restoreInProgressMatchV1\)/);
  assert.match(html,/undoHistory = Array\.isArray\(payload\.undoHistory\)[\s\S]*?updateGame\(\)/);
});

test("completion and both explicit discard paths clear the active snapshot",()=>{
  assert.match(html,/function interruptNewMatchFromBreakV3\(\)[\s\S]*?clearInProgressMatchV1\(\)/);
  assert.match(html,/function requestBackToPlayerInfo\(\)[\s\S]*?clearInProgressMatchV1\(\)/);
  assert.match(html,/persistMatchRecordsOnlyV161\(existingRecords\);[\s\S]*?clearInProgressMatchV1\(\)/);
});

test("invalid or completed snapshots cannot reopen as an active game",()=>{
  assert.match(html,/state\.gameEnded \|\| state\.currentGameRecordSaved/);
  assert.match(html,/Unsupported in-progress snapshot/);
  assert.match(html,/localStorage\.removeItem\(key\)/);
  assert.match(html,/IN_PROGRESS_PERSISTED_UNDO_LIMIT_V1 = 50/);
});
