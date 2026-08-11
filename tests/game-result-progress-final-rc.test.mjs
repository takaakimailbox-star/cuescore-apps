import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const start=html.indexOf("  function scoreProgressForRecordV1(");
const end=html.indexOf("  function currentProgressRecordV1()",start);
assert.ok(start>=0&&end>start,"shared score-progress builder must exist");
const context={window:{}};
vm.runInNewContext(`${html.slice(start,end)}\nwindow.testBuilder=scoreProgressForRecordV1;`,context);
const build=(record,discipline)=>JSON.parse(JSON.stringify(context.window.testBuilder(record,discipline)));
const common=(sourceType,player,inning,data={})=>({type:sourceType==="rack_end"?"RackEnd":"Shot",sourceType,player,inningNumber:inning,data});

test("Official Game Result is a centered Modal with explicit action-only dismissal",()=>{
  assert.doesNotMatch(html,/official-result-handle-v1/);
  assert.match(html,/\.official-result-sheet-v1\{[\s\S]*width:min\(100%,560px\);[\s\S]*border-radius:28px;/);
  assert.match(html,/@keyframes official-result-modal-in-v1/);
  assert.doesNotMatch(html,/id="officialResultCloseV1"/);
  assert.doesNotMatch(html,/\.official-result-close-v1\s*\{/);
  assert.doesNotMatch(html,/officialResultCloseV1[^\n]*addEventListener/);
  assert.match(html,/id="officialResultReturnGameV1"[\s\S]*?試合へ戻る/);
  assert.match(html,/officialResultReturnGameV1"\)\?\.addEventListener\("click",dismissOfficialResultToGameV1\)/);
  assert.doesNotMatch(html,/official-result-backdrop-v1[^\n]*addEventListener/);
  assert.doesNotMatch(html,/event\.key\s*===?\s*["']Escape["'][\s\S]{0,240}dismissOfficialResultToGameV1/);
  assert.doesNotMatch(html,/\.official-result-sheet-v1\{[\s\S]{0,400}bottom:0;/);
});

test("9-Ball and 10-Ball use cumulative rack wins from all compatible sources",()=>{
  const winners=[1,1,2,1,1,1];
  const nine=build({rackResults:winners.map((winner,index)=>({rack:index+1,winner}))},"9ball");
  assert.deepEqual(nine,{p1:[0,1,2,2,3,4,5],p2:[0,0,0,1,1,1,1],steps:[0,1,2,3,4,5,6],axis:"ラック"});
  const ten=build({tenBall:{rackResults:winners.map((winner,index)=>({rack:index+1,winner}))}},"10ball");
  assert.deepEqual(ten.p1,nine.p1);
  const legacy=build({eventLog:{events:winners.map((winner,index)=>common("rack_end",winner,index+1,{rack:index+1,winner}))}},"9ball");
  assert.deepEqual(legacy.p2,nine.p2);
});

test("Rotation and JPA 9-Ball add one cumulative point per inning from active events",()=>{
  const rotation=build({eventLog:{events:[common("ball_pocketed",1,1,{points:3}),common("ball_pocketed",2,1,{points:2}),common("ball_pocketed",1,2,{points:5})]}},"rotation");
  assert.deepEqual(rotation.p1,[0,3,8]);
  assert.deepEqual(rotation.p2,[0,2,2]);
  const jpa=build({eventLog:{events:[common("break_result",1,1,{scoreAdded:2}),common("ball_pocketed",2,1,{points:1}),common("ball_pocketed",1,2,{points:2})]}},"jpa9");
  assert.deepEqual(jpa.p1,[0,2,4]);
  assert.deepEqual(jpa.p2,[0,1,1]);
});

test("Straight Pool graph falls for normal and three-foul penalties",()=>{
  const events=[
    common("ball_pocketed",1,1,{points:8}),
    {type:"Foul",sourceType:"foul",player:1,inningNumber:2,data:{foulType:"unspecified"}},
    common("ball_pocketed",1,3,{points:4}),
    {type:"Foul",sourceType:"foul",player:1,inningNumber:4,data:{foulType:"unspecified"}},
    {type:"FoulPenalty",sourceType:"straight_pool_three_foul",player:1,inningNumber:4,data:{penalty:-16}}
  ];
  const result=build({eventLog:{events}},"straightPool");
  assert.deepEqual(result.p1,[0,8,7,11,-5]);
  assert.ok(result.p1[2]<result.p1[1]);
  assert.ok(result.p1[4]<result.p1[3]);
});

test("Three Cushion uses carom points and saved inning totals",()=>{
  const active=build({eventLog:{events:[common("carom_point",1,1,{points:2}),common("carom_point",2,1,{points:1}),common("carom_point",1,2,{points:1})]}},"threeCushion");
  assert.deepEqual(active.p1,[0,2,3]);
  assert.deepEqual(active.p2,[0,1,1]);
  const archived=build({threeCushion:{innings:[{inning:1,p1Total:2,p2Total:1},{inning:2,p1Total:3,p2Total:1}]}},"threeCushion");
  assert.deepEqual(archived.p1,active.p1);
});

test("Undo-invalidated events are absent and Official Demo legacy progress uses the shared fallback",()=>{
  const afterUndo=build({eventLog:{events:[common("ball_pocketed",1,1,{points:2})],journal:[{status:"undone",event:common("ball_pocketed",2,1,{points:9})}]}},"rotation");
  assert.deepEqual(afterUndo.p2,[0,0]);
  const demo=build({eventLog:{events:[]},analysis:{events:[]},progress:{p1:[0,4,7],p2:[0,2,3]}},"rotation");
  assert.deepEqual(demo.p1,[0,4,7]);
  assert.deepEqual(demo.p2,[0,2,3]);
  const demoStraight=build({eventLog:{events:[]},analysis:{events:[{type:"foul",player:1,inning:1}]},progress:{p1:[0,6,9],p2:[0,2,4]}},"straightPool");
  assert.deepEqual(demoStraight.p1,[0,6,9]);
});

test("Game Result and Match Detail call the same progress builder",()=>{
  assert.match(html,/function buildOfficialResultProgressV1\(\) \{\s*return scoreProgressForRecordV1\(/);
  assert.match(html,/function progressV1\(record\) \{\s*return typeof window\.scoreProgressForRecordV1/);
  assert.doesNotMatch(html,/result\.p1\[result\.p1\.length - 1\] = Number\(scores\[1\]\)/);
});
