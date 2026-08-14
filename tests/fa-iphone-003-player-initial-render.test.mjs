import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("startup synchronizes Player Library, list, resume card and main Player in order",()=>{
  assert.match(html,/function initializePlayerUiV1\(\) \{\s*readPlayerLibrary\(\);\s*renderPlayerLibrary\(\);\s*renderInProgressHomeCardV1\(\);\s*initializePrimaryMatchSetupV1\(\);[\s\S]*?return true;\s*\}/);
  assert.match(html,/function initializePlayerUiV1\(\)[\s\S]*?initializePlayerUiV1\(\);\s*window\.addEventListener\("pageshow", event => \{\s*initializePlayerUiV1\(\)/);
});

test("initial Player render does not depend on timers, animation frames or navigation",()=>{
  const initializer=html.match(/function initializePlayerUiV1\(\) \{([\s\S]*?)\n  \}/)?.[1]||"";
  assert.ok(initializer);
  assert.doesNotMatch(initializer,/setTimeout|requestAnimationFrame|Promise|queueMicrotask/);
  assert.doesNotMatch(html,/requestAnimationFrame\((?:initializePrimaryMatchSetupV1|renderInProgressHomeCardV1)\)/);
});

test("old incomplete snapshots resolve registered names synchronously while complete names stay authoritative",()=>{
  assert.match(html,/function inProgressPlayerNameV1\(state, slot, registeredPlayer\)[\s\S]*?snapshotName[\s\S]*?registeredName[\s\S]*?const result=snapshotName\|\|registeredName\|\|`Player \$\{slot\}`[\s\S]*?return result/);
  assert.match(html,/const players=readPlayerLibrary\(\);[\s\S]*?player1Record[\s\S]*?player2Record[\s\S]*?inProgressPlayerNameV1\(state,1,player1Record\)[\s\S]*?inProgressPlayerNameV1\(state,2,player2Record\)/);
});

test("normal and sample modes keep the existing key resolvers and Compact Card CSS is unchanged",()=>{
  assert.match(html,/resolveSettingKey\(IN_PROGRESS_MATCH_KEY_V1\)/);
  assert.match(html,/function readPlayerLibrary\(\)[\s\S]*?activeCueScoreDataKeyV1\(PLAYER_LIBRARY_KEY\)/);
  assert.match(html,/\.cue-resume-matchup-v4\{display:flex;align-items:center;justify-content:flex-start;gap:5px;min-width:0;overflow:hidden\}/);
  assert.match(html,/\.cue-resume-card-v1\{[^}]*min-height:64px!important/);
  assert.match(html,/\.cue-resume-game-v4 img\{width:34px;height:34px\}/);
  assert.match(html,/\.cue-resume-player-v4 img\{width:24px;height:24px/);
});
