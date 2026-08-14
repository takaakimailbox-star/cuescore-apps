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

test("every committed action saves while startup renders Home card without auto restore",()=>{
  assert.match(html,/function updateGame\(\)[\s\S]*?persistInProgressMatchV1\(\);[\s\S]*?function saveAndDo/);
  assert.match(html,/document\.addEventListener\("visibilitychange"[\s\S]*?persistInProgressMatchV1/);
  assert.match(html,/window\.addEventListener\("pagehide", persistInProgressMatchV1\)/);
  assert.match(html,/requestAnimationFrame\(renderInProgressHomeCardV1\)/);
  assert.doesNotMatch(html,/requestAnimationFrame\(restoreInProgressMatchV1\)/);
  assert.match(html,/undoHistory = Array\.isArray\(payload\.undoHistory\)[\s\S]*?updateGame\(\)/);
});

test("Home card uses the single-row v4 avatar layout and exposes the required match context",()=>{
  for(const text of ["再開&nbsp;›","cueResumePlayer1V1","cueResumePlayer2V1","cueResumePlayer1AvatarV4","cueResumePlayer2AvatarV4"]){
    assert.match(html,new RegExp(text));
  }
  assert.match(html,/<button class="cue-resume-card-v1" id="cueResumeCardV1" type="button"/);
  assert.doesNotMatch(html,/id="cueResumeMatchV1"[^>]*>試合を再開/);
  assert.match(html,/\.cue-resume-card-v1\{[^}]*grid-template-columns:44px minmax\(0,1fr\) auto[^}]*min-height:64px!important/);
  assert.doesNotMatch(html,/cue-resume-match-v1/);
  assert.doesNotMatch(html,/id="cueResumeDisciplineV1"/);
  assert.doesNotMatch(html,/id="cueResumeTimeV1"|id="cueResumeConditionV1"/);
  assert.match(html,/cue-resume-game-v4[\s\S]*?cueResumeIconV1[\s\S]*?cueResumePlayer1AvatarV4[\s\S]*?cueResumePlayer1V1[\s\S]*?cue-resume-vs-v4[\s\S]*?cueResumePlayer2AvatarV4[\s\S]*?cueResumePlayer2V1[\s\S]*?再開&nbsp;›/);
  assert.match(html,/\.cue-resume-game-v4 img\{width:34px;height:34px\}/);
  assert.doesNotMatch(html,/\.cue-resume-game-v4\{[^}]*border-right/);
  assert.match(html,/cue-resume-matchup-v4[\s\S]*?cueResumePlayer1AvatarV4[\s\S]*?cue-resume-vs-v4[\s\S]*?cueResumePlayer2AvatarV4/);
  assert.match(html,/\.cue-resume-matchup-v4\{[^}]*display:flex[^}]*gap:5px[^}]*overflow:hidden/);
  assert.doesNotMatch(html,/\.cue-resume-matchup-v4\{[^}]*grid-template-columns/);
  assert.match(html,/\.cue-resume-player-v4\{[^}]*flex:0 1 auto[^}]*max-width:calc\(\(100% - 20px\)\/2\)/);
  assert.match(html,/\.cue-resume-player-v4 img\{width:24px;height:24px/);
  assert.match(html,/\.cue-resume-player-v4 span\{[^}]*text-overflow:ellipsis/);
  assert.match(html,/playerAvatarSourceV2\(registered\?\.avatar\)/);
  assert.match(html,/card\.setAttribute\("aria-label",`中断中の\$\{visual\.name\}、\$\{player1\}対\$\{player2\}、\$\{condition\}、試合を再開`\)/);
  assert.match(html,/card\.addEventListener\("click",resumeInProgressFromHomeV1\)/);
  assert.match(html,/function resumeInProgressFromHomeV1\(\)[\s\S]*?restoreInProgressMatchV1\(\)/);
});

test("Home card resolves both names synchronously from snapshot before using Player Library fallback",()=>{
  assert.match(html,/function inProgressPlayerNameV1\(state, slot, registeredPlayer\)[\s\S]*?state\?\.playerNames\?\.\[slot\][\s\S]*?\.trim\(\)[\s\S]*?if\(snapshotName\)return snapshotName/);
  assert.match(html,/const players=readPlayerLibrary\(\);[\s\S]*?const player1=inProgressPlayerNameV1\(state,1,player1Record\);[\s\S]*?cueResumePlayer1V1"\)\.textContent=player1/);
  assert.match(html,/const player2=inProgressPlayerNameV1\(state,2,player2Record\);[\s\S]*?cueResumePlayer2V1"\)\.textContent=player2/);
  assert.doesNotMatch(html,/setTimeout\([^)]*renderInProgressHomeCardV1/);
});

test("FA-IPHONE-002 preserves a valid snapshot while Home is shown or the process exits",()=>{
  assert.match(html,/function persistInProgressMatchV1\(\)[\s\S]*?if \(gameEnded \|\| currentGameRecordSaved\)[\s\S]*?clearInProgressMatchV1\(\)[\s\S]*?if \(!currentGameSessionIdV104 \|\| !app\.classList\.contains\("pro-game-mode"\)\) return/);
  assert.doesNotMatch(html,/!app\.classList\.contains\("pro-game-mode"\)\) \{\s*clearInProgressMatchV1/);
});

test("FA-IPHONE-002 rerenders the retained snapshot on PWA pageshow",()=>{
  assert.match(html,/window\.addEventListener\("pageshow",renderInProgressHomeCardV1\)/);
  assert.match(html,/window\.addEventListener\("pagehide", persistInProgressMatchV1\)/);
});

test("FA-IPHONE-002 keeps cleanup limited to completion, explicit discard, replacement, or invalid data",()=>{
  assert.match(html,/gameEnded \|\| currentGameRecordSaved[\s\S]*?clearInProgressMatchV1/);
  assert.match(html,/requestBackToPlayerInfo\(\)[\s\S]*?confirm\("現在の試合を終了してHomeへ戻りますか？"\)[\s\S]*?clearInProgressMatchV1/);
  assert.match(html,/cueInProgressNewV1[\s\S]*?clearInProgressMatchV1/);
  assert.match(html,/Unsupported in-progress snapshot[\s\S]*?localStorage\.removeItem\(key\)/);
});

test("new-match choice provides resume, replace and cancel branches",()=>{
  for(const text of ["中断中の試合があります","中断中の試合を再開","新しい試合を始める","キャンセル"]){
    assert.match(html,new RegExp(text));
  }
  assert.match(html,/cueInProgressNewV1"\)\?\.addEventListener[\s\S]*?clearInProgressMatchV1\(\)[\s\S]*?button\.click\(\)/);
  assert.match(html,/cueInProgressCancelV1"\)\?\.addEventListener\("click",closeInProgressChoiceV1\)/);
  assert.match(html,/cueDisciplineSwitcherV1"\)\?\.addEventListener\("click"[\s\S]*?openInProgressChoiceV1\(button\)[\s\S]*?,true\)/);
});

test("all six disciplines have existing terminology for the Home card",()=>{
  for(const label of ["Rotation","9-Ball","10-Ball","14-1","JPA 9-Ball","3 Cushion","目標点","Race to","SL / Race","持ち点"]){
    assert.match(html,new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  }
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
