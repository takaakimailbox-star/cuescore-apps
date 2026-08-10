import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("Game Result uses the adopted two-stat mapping for all six disciplines",()=>{
  assert.match(html,/isNineBallV1\(\)\|\|isTenBallV1\(\).*\[\["シュート率",shotRate\],\["マス割"/);
  assert.match(html,/activeGameTypeV1===ROTATION_GAME_TYPE.*\[\["ハイラン",highRun\],\["シュート率",shotRate\]\]/);
  assert.match(html,/isJPA9V1\(\)\|\|isStraightPoolV1\(\).*\[\["アベレージ",average\.toFixed\(2\)\],\["ハイラン",highRun\]\]/);
  assert.match(html,/return \[\["アベレージ",average\.toFixed\(3\)\],\["ハイラン",highRun\]\]/);
});

test("Game Result averages count event-derived zero-point turns and masuwari uses run-out events",()=>{
  assert.match(html,/function calculateCompletedTurnsFromEventsV1\(\)/);
  assert.match(html,/new Set\(\["break_result","ball_pocketed","safety","foul","player_switch"\]\)/);
  assert.match(html,/scores\[1\]\/completedTurns\[1\]/);
  assert.match(html,/function currentMatchMasuwariCountV1\(player\)/);
  assert.match(html,/event\?\.type==="break_run_out"/);
});

test("Game Result is shown after save and return-to-game removes the provisional saved record",()=>{
  assert.doesNotMatch(html,/requestAnimationFrame\(\(\)=>window\.openMatchResultDetailV5\(savedId\)\)/);
  assert.match(html,/writeMatchRecords\(readMatchRecords\(\)\.filter\(record=>String\(record\?\.id\)!==recordId\)\)/);
  assert.match(html,/currentGameRecordSaved=false;\s*currentGameRecordIdV100=null;/);
});
