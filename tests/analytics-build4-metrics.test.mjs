import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";

const require=createRequire(import.meta.url);
const metrics=require("../analytics-build4-metrics.js");
const event=(type,player,rack,data={})=>({sourceType:type,player,rackNumber:rack,data:{player,rack,...data}});
const breakEvent=(player,rack,data={})=>event("break_result",player,rack,{breakPlayer:player,pocketedBalls:[],pocketCount:0,scratch:false,breakFoul:false,illegalBreak:false,preBreakFoul:false,breakFailed:false,foul:false,schemaVersion:"break-v4",...data});
const record=(events,id="m1")=>({id,eventLog:{events},players:{1:{score:5},2:{score:1}},winner:1});

test("break-in rate counts valid multi-ball break once",()=>{
  const result=metrics.breakInForRecord(record([breakEvent(1,1,{pocketedBalls:[1,2,3],pocketCount:3})]),1,"9ball");
  assert.deepEqual(result,{eligible:true,numerator:1,denominator:1,rate:100});
});

for(const [name,data] of [
  ["pocket 0",{}],["scratch",{pocketedBalls:[1],pocketCount:1,scratch:true}],
  ["foul",{pocketedBalls:[1],pocketCount:1,foul:true}],["break foul",{pocketedBalls:[1],pocketCount:1,breakFoul:true}],
  ["illegal break",{pocketedBalls:[1],pocketCount:1,illegalBreak:true}],["pre-break foul",{pocketedBalls:[1],pocketCount:1,preBreakFoul:true}],
  ["failed break",{pocketedBalls:[1],pocketCount:1,breakFailed:true}]
])test(`break-in excludes ${name}`,()=>assert.equal(metrics.breakInForRecord(record([breakEvent(1,1,data)]),1,"9ball").numerator,0));

test("break-in omits missing events and zero denominator",()=>{
  assert.equal(metrics.breakInForRecord(record([]),1,"9ball").rate,null);
  assert.equal(metrics.breakInForRecord({id:"legacy",analysis:{events:[{type:"break_result",player:1}]}},1,"9ball").eligible,false);
});

test("break-in rejects a partially detailed single record",()=>{
  const partial={sourceType:"break_result",player:1,rackNumber:2,data:{player:1,breakPlayer:1,pocketedBalls:[1]}};
  assert.equal(metrics.breakInForRecord(record([breakEvent(1,1,{pocketedBalls:[1],pocketCount:1}),partial]),1,"9ball").eligible,false);
});

test("masuwari denominator uses player's completed break racks",()=>{
  const input=record([breakEvent(1,1),event("rack_end",1,1,{winner:1}),breakEvent(2,2),event("rack_end",2,2,{winner:2}),breakEvent(1,3)]);
  const result=metrics.masuwariForRecord(input,1,"9ball",()=>({1:1,2:0}));
  assert.deepEqual(result,{eligible:true,numerator:1,denominator:1,rate:100});
});

test("masuwari excludes missing break, rack end, legacy-only and zero denominator",()=>{
  assert.equal(metrics.masuwariForRecord(record([event("rack_end",1,1,{winner:1})]),1,"9ball",()=>({1:0})).eligible,false);
  assert.equal(metrics.masuwariForRecord(record([breakEvent(1,1)]),1,"9ball",()=>({1:0})).eligible,false);
  assert.equal(metrics.masuwariForRecord({id:"legacy",analysis:{events:[breakEvent(1,1),event("rack_end",1,1,{winner:1})]}},1,"9ball",()=>({1:1})).eligible,false);
});

test("masuwari rejects a completed-rack partial ledger instead of showing 100 percent",()=>{
  const input=record([breakEvent(1,1),event("rack_end",1,1,{winner:1}),event("rack_end",2,2,{winner:2})],"partial-match");
  assert.equal(metrics.masuwariForRecord(input,1,"9ball",()=>({1:1,2:0})).eligible,false);
});

test("masuwari best uses all classifiable completed break racks",()=>{
  const input=record([breakEvent(1,1),event("rack_end",1,1,{winner:1}),breakEvent(1,2),event("rack_end",2,2,{winner:2})],"two-racks");
  assert.deepEqual(metrics.masuwariForRecord(input,1,"9ball",()=>({1:1,2:0})),{eligible:true,numerator:1,denominator:2,rate:50});
});

test("masuwari rejects an official numerator larger than its eligible denominator",()=>{
  const input=record([breakEvent(1,1),event("rack_end",1,1,{winner:1})],"bad-count");
  assert.equal(metrics.masuwariForRecord(input,1,"9ball",()=>({1:2,2:0})).eligible,false);
});

for(const [name,events] of [
  ["turn transfer",[breakEvent(1,1,{pocketedBalls:[1],pocketCount:1}),event("player_switch",1,1,{fromPlayer:1,toPlayer:2}),event("rack_end",2,1,{winner:2})]],
  ["foul",[breakEvent(1,1,{pocketedBalls:[1],pocketCount:1,foul:true}),event("rack_end",2,1,{winner:2})]],
  ["break foul",[breakEvent(1,1,{pocketedBalls:[1],pocketCount:1,breakFoul:true}),event("rack_end",2,1,{winner:2})]]
])test(`masuwari denominator excludes ${name}`,()=>{
  assert.equal(metrics.masuwariForRecord(record(events),1,"9ball",()=>({1:0})).eligible,false);
});

test("shot and average eligibility reject missing denominators",()=>{
  assert.equal(metrics.shotRateForRecord({pocketCount:8,misses:2}).rate,80);
  assert.equal(metrics.shotRateForRecord({shotRate:90}).eligible,false);
  assert.equal(metrics.averageForRecord({score:10},{},5).value,2);
  assert.equal(metrics.averageForRecord({score:10},{},0).eligible,false);
});

test("best tie-break uses value, newest date, then match id",()=>{
  const chosen=metrics.chooseBest([
    {value:5,record:{id:"b",endedAt:"2026-08-18T00:00:00Z"}},
    {value:5,record:{id:"a",endedAt:"2026-08-18T00:00:00Z"}},
    {value:5,record:{id:"z",endedAt:"2026-08-17T00:00:00Z"}},
    {value:0,record:{id:"zero",endedAt:"2026-08-19T00:00:00Z"}}
  ]);
  assert.equal(chosen.record.id,"a");
});

test("least value uses ascending selection",()=>{
  const chosen=metrics.chooseBest([{value:8,record:{id:"a"}},{value:5,record:{id:"b"}}],"asc");
  assert.equal(chosen.value,5);
});
