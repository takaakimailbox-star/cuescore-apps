import assert from "node:assert/strict";
import fs from "node:fs";

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
assert.match(html,/masuwari\+=Number\(rackGameMasuwariCountsV1\(record\)\?\.\[playerSide\]\)\|\|0/);
assert.match(html,/targetRacks\+=completedRackCountV1\(record\)/);
assert.match(html,/const masuwariRate=targetRacks\?`\$\{Math\.round\(masuwari\/targetRacks\*100\)\}%`:"—"/);

// 14.1 / 3C points per inning uses final score divided by completed innings.
assert.match(html,/if\(innings>0&&Number\.isFinite\(score\)\)\{totalInnings\+=innings;totalScore\+=score;\}/);
assert.match(html,/const pointsPerInning=totalInnings\?String\(Math\.round\(totalScore\/totalInnings\*100\)\/100\):"—"/);

// JPA average innings uses completed player innings per match; 3C handicap stays unresolved.
assert.match(html,/\["おすすめ持ち点","—"\]/);
// All aggregation is render-time: no new persisted player or match field.
assert.doesNotMatch(html,/recommendedHandicap\s*:/);

console.log("Player discipline metric definitions and compatibility checks passed");
