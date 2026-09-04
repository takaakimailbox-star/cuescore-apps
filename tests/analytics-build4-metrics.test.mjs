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
  const input=record([breakEvent(1,1),event("rack_end",1,1,{winner:1}),breakEvent(2,2),event("rack_end",2,2,{winner:2})]);
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
])test(`masuwari denominator includes a classifiable completed ${name} rack`,()=>{
  assert.deepEqual(metrics.masuwariForRecord(record(events),1,"9ball",()=>({1:0})),{eligible:true,numerator:0,denominator:1,rate:0});
});

const ratioRecord=(total,side=1)=>record(Array.from({length:total},(_,index)=>[
  breakEvent(side,index+1),event("rack_end",side,index+1,{winner:side})
]).flat());
for(const [denominator,numerator,rate] of [[4,3,75],[2,1,50],[1,1,100],[4,0,0]]){
  test(`masuwari adopted denominator: ${numerator}/${denominator} = ${rate}%`,()=>{
    assert.deepEqual(metrics.masuwariForRecord(ratioRecord(denominator),1,"9ball",()=>({1:numerator,2:0})),{eligible:true,numerator,denominator,rate});
  });
}

test("masuwari rejects a break ledger with a rack missing rack_end",()=>{
  const input=record([breakEvent(1,1),event("rack_end",1,1,{winner:1}),breakEvent(1,2)]);
  assert.equal(metrics.masuwariForRecord(input,1,"9ball",()=>({1:1,2:0})).eligible,false);
});

test("shot and average eligibility reject missing denominators",()=>{
  assert.equal(metrics.shotRateForRecord({pocketCount:8,misses:2}).rate,80);
  assert.equal(metrics.shotRateForRecord({shotRate:90}).eligible,false);
  assert.equal(metrics.averageForRecord({score:10},{},5).value,2);
  assert.equal(metrics.averageForRecord({score:10},{},0).eligible,false);
});

const completedRecord=(events,extra={})=>({
  ...record(events),endedAt:"2026-08-24T00:00:00Z",result:"win",...extra
});

const completedRack=(rack,participants=[1],foulPlayers=[])=>[
  ...participants.map(player=>event("player_switch",player,rack,{fromPlayer:player,toPlayer:player===1?2:1})),
  ...foulPlayers.map(player=>event("foul",player,rack,{foulType:"ordinary"})),
  event("rack_end",1,rack,{winner:1})
];

test("foul rate counts foul racks over participated completed racks",()=>{
  const events=[];
  for(let rack=1;rack<=8;rack++)events.push(...completedRack(rack,[1,2],rack<=3?[1]:[]));
  for(let rack=9;rack<=10;rack++)events.push(breakEvent(2,rack),event("rack_end",2,rack,{winner:2}));
  assert.deepEqual(metrics.foulRateForRecord(completedRecord(events),1,"9ball"),{eligible:true,numerator:3,denominator:8,rate:37.5});
});

test("multiple fouls in one rack count once",()=>{
  const events=[];
  for(let rack=1;rack<=5;rack++)events.push(...completedRack(rack,[1,2],rack<=2?[1]:[]));
  events.splice(2,0,event("foul",1,1,{foulType:"second-in-rack"}));
  assert.deepEqual(metrics.foulRateForRecord(completedRecord(events),1,"10ball"),{eligible:true,numerator:2,denominator:5,rate:40});
});

test("opponent break-and-run is excluded from target denominator",()=>{
  const input=completedRecord([breakEvent(2,1),event("rack_end",2,1,{winner:2})]);
  assert.deepEqual(metrics.foulRateForRecord(input,1,"9ball"),{eligible:false,numerator:0,denominator:0,rate:null});
});

test("target break-foul is both participated and a foul rack",()=>{
  const input=completedRecord([breakEvent(1,1,{breakFoul:true}),event("foul",1,1),event("rack_end",2,1,{winner:2})]);
  assert.deepEqual(metrics.foulRateForRecord(input,1,"9ball"),{eligible:true,numerator:1,denominator:1,rate:100});
});

test("participated rack without foul stays in denominator",()=>{
  const input=completedRecord(completedRack(1,[1,2],[]));
  assert.deepEqual(metrics.foulRateForRecord(input,1,"rotation"),{eligible:true,numerator:0,denominator:1,rate:0});
});

test("incomplete and non-determinable participation are ineligible",()=>{
  assert.equal(metrics.foulRateForRecord(completedRecord([event("foul",1,1)]),1,"9ball").eligible,false);
  assert.equal(metrics.foulRateForRecord(completedRecord([event("rack_end",2,1,{winner:2})]),1,"9ball").eligible,false);
  assert.equal(metrics.foulRateForRecord(completedRecord([event("rack_end",1,1)]),1,"threeCushion").eligible,false);
});

test("rotation, JPA and 14-1 require explicit completion and participation evidence",()=>{
  const rotation=completedRecord([event("player_switch",1,1,{fromPlayer:1,toPlayer:2}),event("foul",1,1),event("rack_completed",2,1)]);
  const jpa=completedRecord([breakEvent(1,1,{breakFoul:true}),event("game_end",2,1)]);
  const straight=completedRecord([event("ball_pocketed",1,1),event("foul",1,1),event("straight_pool_rerack",2,1)]);
  assert.deepEqual(metrics.foulRateForRecord(rotation,1,"rotation"),{eligible:true,numerator:1,denominator:1,rate:100});
  assert.deepEqual(metrics.foulRateForRecord(jpa,1,"jpa9"),{eligible:true,numerator:1,denominator:1,rate:100});
  assert.deepEqual(metrics.foulRateForRecord(straight,1,"straightPool"),{eligible:true,numerator:1,denominator:1,rate:100});
});

test("stored completion without a target event ledger stays ineligible",()=>{
  const stored=completedRecord([],{rackResults:[{rack:1,winner:1}]});
  assert.deepEqual(metrics.foulRateForRecord(stored,1,"9ball"),{eligible:false,numerator:0,denominator:0,rate:null});
});

test("average fouls per rack supports each adopted discipline boundary",()=>{
  assert.equal(metrics.completedRacksForRecord(completedRecord([event("rack_completed",1,1),event("rack_completed",2,2),event("game_end",1,3)]),"rotation").denominator,3);
  assert.equal(metrics.completedRacksForRecord(completedRecord([event("rack_completed",1,1),event("game_end",1,2)]),"jpa9").denominator,2);
  assert.equal(metrics.completedRacksForRecord(completedRecord([event("straight_pool_rerack",1,1),event("straight_pool_three_foul",2,2),event("game_end",1,3)]),"straightPool").denominator,2);
});

test("average fouls per rack rejects indeterminate and unfinished racks",()=>{
  assert.deepEqual(metrics.completedRacksForRecord({players:{}},"9ball"),{eligible:false,denominator:0});
  assert.deepEqual(metrics.completedRacksForRecord(completedRecord([event("game_end",1,4)]),"straightPool"),{eligible:false,denominator:0});
  assert.equal(metrics.completedRacksForRecord(completedRecord([event("rack_completed",1,1),event("game_end",1,2)]),"rotation").denominator,2);
  assert.deepEqual(metrics.completedRacksForRecord(completedRecord([event("rack_end",1,1)]),"threeCushion"),{eligible:false,denominator:0});
});

test("aggregate excludes ineligible records and exposes zero foul rate",()=>{
  const records=[completedRecord(completedRack(1,[1,2],[])),completedRecord([],{id:"missing"})];
  const helpers={side:()=>1,won:()=>true,metric:(item,side)=>item.players[side],recordPlayer:(item,side)=>item.players[side],completedTurns:()=>0,discipline:()=>"9ball",masuwariCounts:()=>({1:0,2:0})};
  const result=metrics.aggregate(records,{},helpers);
  assert.equal(result.foulRate,0);
  assert.equal(result.eligible.foulRacks,1);
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

test("legal break best counts pockets for 9-Ball and sums ball values for Rotation",()=>{
  const nine=metrics.breakBestForRecord(record([
    breakEvent(1,1,{pocketedBalls:[1,3,7],pocketCount:3}),
    breakEvent(1,2,{pocketedBalls:[2,4],pocketCount:2})
  ]),1,"9ball");
  assert.deepEqual(nine,{eligible:true,pocketCount:3,score:null});
  const rotation=metrics.breakBestForRecord(record([
    breakEvent(1,1,{pocketedBalls:[1,4,8],pocketCount:3}),
    breakEvent(1,2,{pocketedBalls:[10,15],pocketCount:2})
  ]),1,"rotation");
  assert.deepEqual(rotation,{eligible:true,pocketCount:3,score:25});
});

test("break best excludes fouls and rejects incomplete legacy break evidence",()=>{
  const foul=metrics.breakBestForRecord(record([
    breakEvent(1,1,{pocketedBalls:[8,9],pocketCount:2,scratch:true}),
    breakEvent(1,2,{pocketedBalls:[1,2],pocketCount:2})
  ]),1,"rotation");
  assert.deepEqual(foul,{eligible:true,pocketCount:2,score:3});
  const partial={sourceType:"break_result",player:1,rackNumber:2,data:{player:1,pocketedBalls:[9]}};
  assert.equal(metrics.breakBestForRecord(record([breakEvent(1,1,{pocketedBalls:[1]}),partial]),1,"rotation").eligible,false);
});

test("personal best keys follow the approved six-discipline contract",()=>{
  const helpers={side:()=>1,won:item=>item.winner===1,metric:(item,side)=>item.players[side],recordPlayer:(item,side)=>item.players[side],completedTurns:(item,side)=>item.players[side].completedTurns,discipline:()=>"",masuwariCounts:()=>({1:1,2:0})};
  const item=completedRecord([
    breakEvent(1,1,{pocketedBalls:[1,4,8],pocketCount:3}),
    event("rack_end",1,1,{winner:1})
  ],{players:{1:{score:13,maxRun:8,pocketCount:9,misses:1,completedTurns:4},2:{score:1}}});
  assert.deepEqual(metrics.bests([item],{}, "9ball",helpers).map(best=>best.key),["shotRate","masuwariCount","breakPocketCount"]);
  assert.deepEqual(metrics.bests([item],{}, "10ball",helpers).map(best=>best.key),["shotRate","masuwariCount","breakPocketCount"]);
  assert.deepEqual(metrics.bests([item],{}, "rotation",helpers).map(best=>best.key),["shotRate","highRun","breakScore"]);
  assert.deepEqual(metrics.bests([item],{}, "straightPool",helpers).map(best=>best.key),["highRun","average"]);
  assert.deepEqual(metrics.bests([item],{}, "jpa9",helpers).map(best=>best.key),["highRun","average","leastWinningInnings"]);
  assert.deepEqual(metrics.bests([item],{}, "threeCushion",helpers).map(best=>best.key),["highRun","average","leastWinningInnings"]);
});
