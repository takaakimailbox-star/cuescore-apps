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
  assert.match(html,/function initializePlayerUiV1\(\)[\s\S]*?renderInProgressHomeCardV1\(\)[\s\S]*?initializePlayerUiV1\(\)/);
  assert.doesNotMatch(html,/requestAnimationFrame\(renderInProgressHomeCardV1\)/);
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
  assert.match(html,/function inProgressPlayerNameV1\(state, slot, registeredPlayer\)[\s\S]*?state\?\.playerNames\?\.\[slot\][\s\S]*?\.trim\(\)[\s\S]*?const result=snapshotName\|\|registeredName/);
  assert.match(html,/const players=readPlayerLibrary\(\);[\s\S]*?const player1=inProgressPlayerNameV1\(state,1,player1Record\);[\s\S]*?cueResumePlayer1V1"\)\.textContent=player1/);
  assert.match(html,/const player2=inProgressPlayerNameV1\(state,2,player2Record\);[\s\S]*?cueResumePlayer2V1"\)\.textContent=player2/);
  assert.doesNotMatch(html,/setTimeout\([^)]*renderInProgressHomeCardV1/);
});

test("FA-IPHONE-002 preserves a valid snapshot while Home is shown or the process exits",()=>{
  assert.match(html,/function persistInProgressMatchV1\(\)[\s\S]*?if \(gameEnded \|\| currentGameRecordSaved\)[\s\S]*?clearInProgressMatchV1\(\)[\s\S]*?if \(!currentGameSessionIdV104 \|\| !app\.classList\.contains\("pro-game-mode"\)\) return/);
  assert.doesNotMatch(html,/!app\.classList\.contains\("pro-game-mode"\)\) \{\s*clearInProgressMatchV1/);
});

test("FA-IPHONE-002 rerenders the retained snapshot on PWA pageshow",()=>{
  assert.match(html,/window\.addEventListener\("pageshow", event => \{\s*initializePlayerUiV1\(\)/);
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

test("resume choice removes yellow touch focus only from its two action buttons",()=>{
  assert.match(html,/:where\(button, a, input, select, textarea, \[tabindex\]\):focus-visible\s*\{\s*outline: 3px solid #ffd54a !important/);
  assert.match(html,/\.cue-in-progress-choice-v1 :is\(#cueInProgressResumeV1,#cueInProgressNewV1\):focus-visible\s*\{\s*outline:3px solid #171717!important/);
  assert.match(html,/@media \(hover:none\) and \(pointer:coarse\)\{\s*\.cue-in-progress-choice-v1 :is\(#cueInProgressResumeV1,#cueInProgressNewV1\):is\(:focus,:focus-visible\)\{\s*outline:none!important;\s*outline-offset:0!important;\s*box-shadow:none!important/);
  assert.doesNotMatch(html,/\.cue-in-progress-choice-v1 :is\([^)]*cueInProgressCancelV1[^)]*\):is\(:focus,:focus-visible\)/);
});

test("resume choice keeps accessible initial focus and both action transitions",()=>{
  assert.match(html,/requestAnimationFrame\(\(\)=>el\("cueInProgressResumeV1"\)\?\.focus\(\)\)/);
  assert.match(html,/cueInProgressResumeV1"\)\?\.addEventListener\("click",resumeInProgressFromHomeV1\)/);
  assert.match(html,/cueInProgressNewV1"\)\?\.addEventListener\("click",\(\)=>\{[\s\S]*?closeInProgressChoiceV1\(\)[\s\S]*?clearInProgressMatchV1\(\)[\s\S]*?button\.click\(\)/);
  assert.match(html,/\.cue-in-progress-choice-v1 button\{min-height:48px;border:1px solid #171717;border-radius:10px/);
});

test("resume choice clears the fixed Bottom Navigation and scrolls internally when needed",()=>{
  assert.match(html,/\.cue-in-progress-choice-v1\{position:fixed;z-index:18020;[^}]*padding:18px 14px calc\(var\(--cue-phase1-nav-height,68px\) \+ 18px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(html,/\.cue-in-progress-choice-v1>section\{[^}]*max-height:calc\(100dvh - var\(--cue-phase1-nav-height,68px\) - env\(safe-area-inset-top\) - env\(safe-area-inset-bottom\) - 36px\)[^}]*overflow-y:auto[^}]*overscroll-behavior:contain/);
  assert.match(html,/<button id="cueInProgressResumeV1"[^>]*>中断中の試合を再開<\/button>[\s\S]*?<button id="cueInProgressNewV1"[^>]*>新しい試合を始める<\/button>[\s\S]*?<button id="cueInProgressCancelV1"[^>]*>キャンセル<\/button>/);
  assert.match(html,/cueInProgressCancelV1"\)\?\.addEventListener\("click",closeInProgressChoiceV1\)/);
  assert.match(html,/function openInProgressChoiceV1\(button\)[\s\S]*?document\.body\.classList\.add\("cue-in-progress-choice-visible-v1"\)/);
  assert.match(html,/function closeInProgressChoiceV1\(\)[\s\S]*?document\.body\.classList\.remove\("cue-in-progress-choice-visible-v1"\)/);
  assert.match(html,/body\.cue-in-progress-choice-visible-v1 \.cue-phase1-tab-bar,\s*body\.cue-in-progress-choice-visible-v1 \.cue-phase1-tab-bar \*\{pointer-events:none!important\}/);
});

test("all six disciplines have existing terminology for the Home card",()=>{
  for(const label of ["Rotation","9-Ball","10-Ball","14-1","JPA 9-Ball","3 Cushion","目標点","Race to","SL / Race","持ち点"]){
    assert.match(html,new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  }
});

test("completion and both explicit discard paths clear the active snapshot",()=>{
  assert.match(html,/function interruptNewMatchFromBreakV3\(\)[\s\S]*?clearInProgressMatchV1\(\)/);
  assert.match(html,/function requestBackToPlayerInfo\(\)[\s\S]*?clearInProgressMatchV1\(\)/);
  assert.match(html,/function persistCompletedMatchRecordsV162\(records\)[\s\S]*?localStorage\.removeItem\(inProgressKey\)[\s\S]*?persistMatchRecordsOnlyV161\(records\)/);
  assert.match(html,/persistCompletedMatchRecordsV162\(existingRecords\)/);
});

test("invalid or completed snapshots cannot reopen as an active game",()=>{
  assert.match(html,/state\.gameEnded \|\| state\.currentGameRecordSaved/);
  assert.match(html,/Unsupported in-progress snapshot/);
  assert.match(html,/localStorage\.removeItem\(key\)/);
  assert.match(html,/IN_PROGRESS_PERSISTED_UNDO_LIMIT_V1 = 50/);
});
