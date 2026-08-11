import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

assert.match(html,/App Store v1\.0: four player metrics selected for each discipline/);
assert.match(html,/active==="rotation"\)return \[\["試合数",games\],\["ハイラン",String\(highRun\)\],\["シュート成功率",shotRate\],\["ブレイクイン率",breakIn\]\]/);
assert.match(html,/active==="9ball"\|\|active==="10ball"\)return \[\["試合数",games\],\["マス割率",masuwariRate\],\["シュート成功率",shotRate\],\["ブレイクイン率",breakIn\]\]/);
assert.match(html,/const averageInnings=filtered\.length&&totalInnings\?String\(Math\.round\(totalInnings\/filtered\.length\*100\)\/100\):"—"/);
assert.match(html,/active==="jpa9"\)return \[\["試合数",games\],\["シュート成功率",shotRate\],\["ブレイクイン率",breakIn\],\["平均イニング",averageInnings\]\]/);
assert.match(html,/active==="straightPool"\)return \[\["試合数",games\],\["ハイラン",String\(highRun\)\],\["シュート成功率",shotRate\],\["平均得点\/イニング",pointsPerInning\]\]/);
assert.match(html,/\["おすすめ持ち点","—"\]/);

// Break-in success requires at least one pocketed ball and no foul condition.
assert.match(html,/if\(count>0&&!foul\)breakSuccesses\+=1/);
for(const flag of ["foul","scratch","breakFoul","illegalBreak","preBreakFoul","breakFailed"]){
  assert.match(html,new RegExp(`playerMetricValueV1\\(event,"${flag}"\\)`));
}

// Existing rack-game break-and-run judgement remains the numerator source.
assert.match(html,/window\.rackGameMasuwariCountsV1 = rackGameMasuwariCountsV1/);
assert.match(html,/masuwari\+=Number\(window\.rackGameMasuwariCountsV1\(record\)\?\.\[playerSide\]\)\|\|0/);
assert.doesNotMatch(html,/masuwari\+=Number\(rackGameMasuwariCountsV1\(record\)/);
assert.match(html,/targetRacks\+=completedRackCountV1\(record\)/);
assert.match(html,/const masuwariRate=targetRacks\?`\$\{Math\.round\(masuwari\/targetRacks\*100\)\}%`:"—"/);

// Match Detail and Player Detail are separate IIFEs. Verify the adopted helper
// is exported to their shared browser scope and remains executable there.
const helperStart=html.indexOf("function rackGameMasuwariCountsV1(");
const helperBrace=html.indexOf("{",helperStart);
let helperDepth=0,helperEnd=-1;
for(let index=helperBrace;index<html.length;index++){
  if(html[index]==="{")helperDepth++;
  if(html[index]==="}"&&--helperDepth===0){helperEnd=index+1;break;}
}
assert.ok(helperStart>=0&&helperEnd>helperStart,"missing rack-game masuwari helper");
const sharedContext=vm.createContext({window:{},recordDisciplineV2:record=>record.disciplineId});
vm.runInContext(`${html.slice(helperStart,helperEnd)}\nwindow.rackGameMasuwariCountsV1=rackGameMasuwariCountsV1;`,sharedContext);
const runOutRecord={disciplineId:"9ball",analysis:{events:[
  {type:"break_result",player:1,rack:1,pocketedBalls:[9]},
  {type:"rack_end",winner:1,rack:1}
]}};
assert.equal(sharedContext.window.rackGameMasuwariCountsV1(runOutRecord)[1],1);

const inningsStart=html.indexOf("function inningsCountNumberV1(");
const inningsBrace=html.indexOf("{",inningsStart);
let inningsDepth=0,inningsEnd=-1;
for(let index=inningsBrace;index<html.length;index++){
  if(html[index]==="{")inningsDepth++;
  if(html[index]==="}"&&--inningsDepth===0){inningsEnd=index+1;break;}
}
assert.ok(inningsStart>=0&&inningsEnd>inningsStart,"missing innings-count helper");
vm.runInContext(`${html.slice(inningsStart,inningsEnd)}\nwindow.inningsCountNumberV1=inningsCountNumberV1;`,sharedContext);
assert.equal(sharedContext.window.inningsCountNumberV1({players:{1:{completedTurns:4}}},1),4);
assert.match(html,/window\.inningsCountNumberV1 = inningsCountNumberV1/);
assert.match(html,/const innings=window\.inningsCountNumberV1\(record,playerSide\)/);
assert.doesNotMatch(html,/const innings=inningsCountNumberV1\(record,playerSide\)/);

// 14.1 / 3C points per inning uses final score divided by completed innings.
assert.match(html,/if\(innings>0&&Number\.isFinite\(score\)\)\{totalInnings\+=innings;totalScore\+=score;\}/);
assert.match(html,/const pointsPerInning=totalInnings\?String\(Math\.round\(totalScore\/totalInnings\*100\)\/100\):"—"/);

// JPA average innings uses completed player innings per match; 3C handicap stays unresolved.
assert.match(html,/\["おすすめ持ち点","—"\]/);
// All aggregation is render-time: no new persisted player or match field.
assert.doesNotMatch(html,/recommendedHandicap\s*:/);

console.log("Player discipline metric definitions and compatibility checks passed");
