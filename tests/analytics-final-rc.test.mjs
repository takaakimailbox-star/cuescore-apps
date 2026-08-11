import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const script=fs.readFileSync(new URL("../analysis-final-rc.js",import.meta.url),"utf8");
const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");
const context={window:{},queueMicrotask};
vm.runInNewContext(script,context);
const engine=context.window.CueScoreAnalyticsFinalRC;
const disciplines=["9ball","10ball","rotation","jpa9","straightPool","threeCushion"];

const samples={
  "9ball":{better:{winRate:70,shotRate:78,masuwari:3,avgFouls:0.8},worse:{winRate:50,shotRate:68,masuwari:1,avgFouls:1.5}},
  "10ball":{better:{winRate:70,shotRate:78,masuwari:3,avgFouls:0.8},worse:{winRate:50,shotRate:68,masuwari:1,avgFouls:1.5}},
  rotation:{better:{winRate:70,highRun:35,shotRate:78,avgFouls:0.8},worse:{winRate:50,highRun:20,shotRate:68,avgFouls:1.5}},
  jpa9:{better:{winRate:70,average:7.25,highRun:22,avgFouls:0.8},worse:{winRate:50,average:5.5,highRun:14,avgFouls:1.5}},
  straightPool:{better:{winRate:70,average:5.25,highRun:32,avgFouls:0.8},worse:{winRate:50,average:3.5,highRun:18,avgFouls:1.5}},
  threeCushion:{better:{winRate:70,average:0.742,highRun:7,avgFouls:0.2},worse:{winRate:50,average:0.515,highRun:4,avgFouls:0.8}}
};

test("all six disciplines classify improvement, decline, flat and insufficient data",()=>{
  for(const discipline of disciplines){
    const {better,worse}=samples[discipline];
    assert.equal(engine.evaluate(better,worse,discipline).status,"改善傾向",discipline);
    assert.equal(engine.evaluate(worse,better,discipline).status,"要調整",discipline);
    assert.equal(engine.evaluate(better,better,discipline).status,"安定",discipline);
    assert.equal(engine.evaluate(better,worse,discipline,{sufficient:false}).status,"蓄積中",discipline);
  }
});

test("foul increase is always decline and foul decrease is always improvement",()=>{
  for(const discipline of disciplines){
    const definition=engine.definitionsFor(discipline).find(metric=>metric.key==="avgFouls");
    assert.equal(engine.metricDirection(1.8,1.2,definition),"worsened",discipline);
    assert.equal(engine.metricDirection(0.7,1.2,definition),"improved",discipline);
    const current={...samples[discipline].better,avgFouls:1.8};
    const previous={...samples[discipline].better,avgFouls:1.2};
    const result=engine.evaluate(current,previous,discipline);
    assert.ok(result.conclusions.includes("ファールは増加傾向"),discipline);
    assert.ok(!result.conclusions.some(text=>/ファール.*改善/.test(text)),discipline);
  }
});

test("mixed directions weaken the overall conclusion",()=>{
  const result=engine.evaluate(
    {winRate:50,shotRate:78,masuwari:1,avgFouls:1.8},
    {winRate:50,shotRate:70,masuwari:2,avgFouls:1.2},
    "9ball"
  );
  assert.equal(result.status,"安定");
  assert.equal(result.mixed,true);
  assert.ok(result.conclusions.some(text=>text.includes("断定しません")));
});

test("missing saved values stay unavailable instead of becoming zero",()=>{
  const shot=engine.definitionsFor("9ball").find(metric=>metric.key==="shotRate");
  assert.equal(engine.metricDirection(null,72,shot),"na");
  assert.equal(engine.metricDirection(undefined,72,shot),"na");
  assert.equal(engine.formatValue(null,shot),"—");
  assert.match(script,/hasMasuwariEvidence \? context\.masuwariCount\(record, side\) : null/);
  assert.match(script,/hasOwn\("maxRun"\)/);
  assert.match(script,/hasOwn\("fouls"\)/);
});

test("Final RC removes unsupported flow and non-interactive chevrons at render time",()=>{
  assert.match(script,/querySelector\("\.analysis-v2-flow"\)\?\.remove\(\)/);
  assert.match(script,/querySelectorAll\("\.analysis-v2-advice-row > b"\)/);
  assert.doesNotMatch(script,/strengths\.push\([^\n]*ファール/);
  assert.match(html,/analysis-final-rc\.js/);
  assert.match(sw,/"\.\/analysis-final-rc\.js"/);
  assert.match(sw,/"\.\/analysis-final-rc\.css"/);
});

test("high foul count is never added to Match Detail strengths",()=>{
  assert.doesNotMatch(html,/punishedRate < 40\) strengths\.push/);
  assert.match(html,/punishedRate < 40 && foulCount < 3\) challenges\.push/);
});
