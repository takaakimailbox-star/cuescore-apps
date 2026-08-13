import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("Game Result uses the adopted two metrics for all six disciplines",()=>{
  assert.match(html,/isNineBallV1\(\)\|\|isTenBallV1\(\).*\[\["シュート率",shotRate\],\["マス割"/);
  assert.match(html,/activeGameTypeV1===ROTATION_GAME_TYPE.*\[\["シュート率",shotRate\],\["ハイラン",highRun\]\]/);
  assert.match(html,/isJPA9V1\(\).*\[\["イニング".*\["セーフティ"/);
  assert.match(html,/isStraightPoolV1\(\).*\[\["アベレージ".*\["ハイラン"/);
  assert.match(html,/return \[\["アベレージ",average\.toFixed\(3\)\],\["ハイラン",highRun\]\]/);
});

test("Match Detail uses the adopted discipline-specific metrics",()=>{
  assert.match(html,/\["9ball","10ball"\]\.includes\(disciplineV4\) \? \[\s*shotRowV4,\s*\["マス割".*foulRowV4/s);
  assert.match(html,/disciplineV4==="rotation" \? \[\s*shotRowV4,highRunRowV4,foulRowV4/);
  assert.match(html,/disciplineV4==="straightPool" \? \[\s*averageRowV4,highRunRowV4,foulRowV4/);
  assert.match(html,/disciplineV4==="jpa9" \? \[\s*averageRowV4,highRunRowV4,foulRowV4/);
  assert.match(html,/\] : \[averageRowV4,highRunRowV4\];/);
});

test("JPA Match Detail separates result facts from analysis without schema changes",()=>{
  for(const label of ["SL","Race／先取点","最終取得点","マッチポイント","イニング","セーフティ","試合結果情報","分析情報"]){
    assert.ok(html.includes(label),`missing JPA Match Detail label: ${label}`);
  }
  assert.match(html,/const jpaResultRowsV1=disciplineV4==="jpa9"/);
  assert.match(html,/jpa9MatchPointsForPlayersV1\(winner,record\.players,record\?\.jpa9\?\.skillLevels\)/);
  assert.doesNotMatch(html,/recordSchemaVersion\s*:\s*[2-9][0-9]*/);
});

test("JPA Game Result retains SL, final points, match points and race context",()=>{
  assert.match(html,/const skillLevel=isJPA9V1\(\)\?`<small>SL/);
  assert.match(html,/const jpaMatchPoints=isJPA9V1\(\)\?jpa9MatchPointsForPlayersV1/);
  assert.match(html,/official-result-score-v1/);
  assert.match(html,/isJPA9V1\(\)\?`Race／先取点/);
});

test("3C does not render a foul metric and common progress/history remain shared",()=>{
  assert.match(html,/\] : \[averageRowV4,highRunRowV4\];/);
  assert.match(html,/scoreProgressForRecordV1\(record,recordDisciplineV2\(record\)\)/);
  assert.match(html,/score-progress-line-p1-v1/);
  assert.match(html,/score-progress-line-p2-v1/);
  assert.match(html,/class="match-detail-game-history-v1" aria-label="ゲーム履歴"/);
});
