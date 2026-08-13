import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("all six disciplines use one shared Race to X-Y display",()=>{
  assert.match(html,/const raceGoal1=goal1\|\|goal2/);
  assert.match(html,/const raceGoal2=goal2\|\|goal1/);
  assert.match(html,/const raceTag=`Race to \$\{raceGoal1\|\|"—"\}-\$\{raceGoal2\|\|"—"\}`/);
  assert.match(html,/const conditionItems=\[raceTag\]/);
  assert.match(html,/window\.openMatchResultDetailV5=recordId=>openMatchDetailV1\(recordId,\{source:"result"\}\)/);
});

test("shared result/detail condition no longer emits discipline-specific labels",()=>{
  const start=html.indexOf("function openMatchDetailV1(recordId,options={})");
  const end=html.indexOf("openHistoricalRecord=openMatchDetailV1",start);
  const renderer=html.slice(start,end);
  for(const oldLabel of ["最終ラック数","目標点","Race／先取点","持ち点"]){
    assert.ok(!renderer.includes(oldLabel),`legacy result/detail label remains: ${oldLabel}`);
  }
  assert.doesNotMatch(renderer,/Race to \$\{[^}]+\} \/ \$\{/);
});

test("fallback result view also uses the same hyphenated Race to format",()=>{
  assert.match(html,/const resultConditionText=`Race to \$\{resultGoal1\}-\$\{resultGoal2\}`/);
  assert.doesNotMatch(html,/const resultConditionText=[\s\S]{0,500}Race／先取点/);
});

test("JPA upper facts and 3C internal goal behavior remain intact",()=>{
  assert.match(html,/match-detail-result-name-v2[^`]*\$\{disciplineV4==="jpa9"\?`<small>SL/);
  assert.match(html,/const jpaMatchPointsV1=disciplineV4==="jpa9"/);
  assert.match(html,/threeCushionModeV1 \? "持ち点"/);
  assert.doesNotMatch(html,/recordSchemaVersion\s*:\s*[2-9][0-9]*/);
});
