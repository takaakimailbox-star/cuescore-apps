import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("Game Result delegates to the shared Match Detail renderer",()=>{
  assert.match(html,/window\.openMatchResultDetailV5\(savedId\);\s*return;/);
  assert.match(html,/window\.openMatchResultDetailV5=recordId=>openMatchDetailV1\(recordId,\{source:"result"\}\)/);
});

test("Match Detail uses the adopted discipline-specific metrics",()=>{
  assert.match(html,/\["9ball","10ball"\]\.includes\(disciplineV4\) \? \[\s*shotRowV4,\s*\["マス割".*foulRowV4/s);
  assert.match(html,/disciplineV4==="rotation" \? \[\s*shotRowV4,highRunRowV4,foulRowV4/);
  assert.match(html,/disciplineV4==="straightPool" \? \[\s*averageRowV4,highRunRowV4,foulRowV4/);
  assert.match(html,/disciplineV4==="jpa9" \? \[\s*inningsRowV4,safetyRowV4,averageRowV4,highRunRowV4,foulRowV4/);
  assert.match(html,/\] : \[inningsRowV4,highRunRowV4,averageRowV4\];/);
});

test("JPA upper result facts and one metrics card avoid duplicate rows without schema changes",()=>{
  assert.match(html,/match-detail-result-name-v2[^`]*\$\{disciplineV4==="jpa9"\?`<small>SL/);
  assert.match(html,/const raceTag=`Race to \$\{raceGoal1\|\|"—"\}-\$\{raceGoal2\|\|"—"\}`/);
  assert.match(html,/disciplineV4==="jpa9" \? \[\s*inningsRowV4,safetyRowV4,averageRowV4,highRunRowV4,foulRowV4/);
  assert.doesNotMatch(html,/const jpaResultRowsV1=/);
  assert.doesNotMatch(html,/>試合結果情報</);
  assert.doesNotMatch(html,/>分析情報</);
  assert.match(html,/jpa9MatchPointsForPlayersV1\(winner,record\.players,record\?\.jpa9\?\.skillLevels\)/);
  assert.doesNotMatch(html,/recordSchemaVersion\s*:\s*[2-9][0-9]*/);
});

test("JPA Game Result retains SL, final points, match points and race context",()=>{
  assert.match(html,/match-detail-result-name-v2[^`]*\$\{disciplineV4==="jpa9"\?`<small>SL/);
  assert.match(html,/const jpaMatchPointsV1=disciplineV4==="jpa9"/);
  assert.match(html,/Number\(p1\.score\)\|\|0/);
  assert.match(html,/const raceTag=`Race to \$\{raceGoal1\|\|"—"\}-\$\{raceGoal2\|\|"—"\}`/);
});

test("3C renders inning, high run and average without a foul metric",()=>{
  assert.match(html,/\] : \[inningsRowV4,highRunRowV4,averageRowV4\];/);
  assert.match(html,/scoreProgressForRecordV1\(record,recordDisciplineV2\(record\)\)/);
  assert.match(html,/score-progress-line-p1-v1/);
  assert.match(html,/score-progress-line-p2-v1/);
  assert.match(html,/class="match-detail-game-history-v1" aria-label="ゲーム履歴"/);
});

test("Game Result omits history and deletion while Match Detail retains both",()=>{
  assert.match(html,/const history=resultMode\?"":gameHistoryV1\(record\)/);
  assert.match(html,/\$\{resultMode\?"":`<section class="match-detail-delete-section-v1"/);
  assert.match(html,/class="match-detail-game-history-v1" aria-label="ゲーム履歴"/);
});

test("Game Result retains the three adopted actions without a close control",()=>{
  for(const label of ["試合へ戻る","ホームへ戻る","もう一度対戦する"]){
    assert.ok(html.includes(label),`missing action: ${label}`);
  }
  assert.match(html,/resultMode\?'<span class="match-detail-header-spacer-v5"/);
  assert.doesNotMatch(html,/matchDetailResultOkV5/);
});
