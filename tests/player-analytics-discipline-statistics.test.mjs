import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("Player Analytics switches the adopted three metrics by discipline",()=>{
  assert.match(html,/disciplineId==="9ball"\|\|disciplineId==="10ball"\)return \[shot,masuwari,foul\]/);
  assert.match(html,/disciplineId==="rotation"\)return \[high,shot,foul\]/);
  assert.match(html,/return \[average,high,foul\]/);
});

test("Player Analytics derives Game Result-compatible statistics from saved matches",()=>{
  assert.match(html,/const analyticsMasuwariCount= \(record,s\)=>/);
  assert.match(html,/masuwari\+=analyticsMasuwariCount\(r,s\)/);
  assert.match(html,/const analyticsCompletedTurns=\(record,s\)=>/);
  assert.match(html,/const innings=analyticsCompletedTurns\(r,s\),score=Number\(m\.score \?\? recordPlayer\(r,s\)\.score\)/);
  assert.match(html,/average:totalInnings\?totalScore\/totalInnings:null/);
  assert.match(html,/avgFouls:games\?fouls\/games:0/);
});

test("Player Analytics preserves layout and replaces only metric labels and values",()=>{
  assert.match(html,/function renderPlayerWithDisciplineMetrics\(\)/);
  assert.match(html,/deltaGrid\.innerHTML=analysisMetricCards\(metrics,"analysis-v2-delta"\)/);
  assert.match(html,/evidenceGrid\.innerHTML=winRateCard\+analysisMetricCards\(metrics,"analysis-v2-metric"\)/);
});
