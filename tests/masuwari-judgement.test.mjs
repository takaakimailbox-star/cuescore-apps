import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const helperStart=html.indexOf("function rackGameMasuwariCountsV1(");
const helperBrace=html.indexOf("{",helperStart);
let helperDepth=0,helperEnd=-1;
for(let index=helperBrace;index<html.length;index++){
  if(html[index]==="{")helperDepth++;
  if(html[index]==="}"&&--helperDepth===0){helperEnd=index+1;break;}
}
assert.ok(helperStart>=0&&helperEnd>helperStart,"missing shared masuwari evaluator");
const context=vm.createContext({window:{},recordDisciplineV2:record=>record.disciplineId});
vm.runInContext(`${html.slice(helperStart,helperEnd)}\nwindow.evaluate=rackGameMasuwariCountsV1;`,context);

const ballEvents=(discipline,options={})=>{
  const target=discipline==="10ball"?10:9;
  const breakBalls=options.breakBalls??[1];
  const normalBalls=options.normalBalls??Array.from({length:target-breakBalls.length},(_,index)=>index+breakBalls.length+1);
  return [
    {type:"break_result",player:1,breakPlayer:1,rack:1,pocketedBalls:breakBalls,...options.breakFlags},
    ...normalBalls.map(ball=>({type:"ball_pocketed",player:1,rack:1,ball})),
    ...(options.middleEvents??[]),
    {type:"rack_end",player:1,winner:1,rack:1}
  ];
};
const count=(discipline,events)=>context.window.evaluate({disciplineId:discipline,analysis:{events}})[1];

for(const [discipline,target] of [["9ball",9],["10ball",10]]){
  test(`${discipline}: winning ball on the break with other balls remaining is not masuwari`,()=>{
    assert.equal(count(discipline,ballEvents(discipline,{breakBalls:[target],normalBalls:[]})),0);
  });

  test(`${discipline}: early winning ball during the uninterrupted turn is not masuwari`,()=>{
    assert.equal(count(discipline,ballEvents(discipline,{breakBalls:[1],normalBalls:[target]})),0);
  });

  test(`${discipline}: breaker clears every object ball without yielding`,()=>{
    assert.equal(count(discipline,ballEvents(discipline)),1);
  });

  test(`${discipline}: any turn change prevents masuwari`,()=>{
    assert.equal(count(discipline,ballEvents(discipline,{middleEvents:[{type:"player_switch",player:1,fromPlayer:1,toPlayer:2,rack:1}]})),0);
  });

  test(`${discipline}: breaker foul prevents masuwari`,()=>{
    assert.equal(count(discipline,ballEvents(discipline,{middleEvents:[{type:"foul",player:1,rack:1}]})),0);
  });

  test(`${discipline}: scratch on the break prevents masuwari`,()=>{
    assert.equal(count(discipline,ballEvents(discipline,{breakFlags:{scratch:true,foul:true}})),0);
  });

  test(`${discipline}: illegal break prevents masuwari`,()=>{
    assert.equal(count(discipline,ballEvents(discipline,{breakFlags:{illegalBreak:true}})),0);
  });

  test(`${discipline}: a spotted ball remaining on the table prevents masuwari`,()=>{
    assert.equal(count(discipline,ballEvents(discipline,{middleEvents:[{type:"spot_ball",player:1,rack:1,ballNumber:2}]})),0);
  });

  test(`${discipline}: clearing a spotted ball again completes masuwari`,()=>{
    assert.equal(count(discipline,ballEvents(discipline,{middleEvents:[
      {type:"spot_ball",player:1,rack:1,ballNumber:2},
      {type:"ball_pocketed",player:1,rack:1,ball:2}
    ]})),1);
  });

  test(`${discipline}: incomplete ball history is never inferred as masuwari`,()=>{
    assert.equal(count(discipline,[
      {type:"break_result",player:1,rack:1,breakRunOut:true},
      {type:"break_run_out",player:1,rack:1},
      {type:"rack_end",player:1,winner:1,rack:1}
    ]),0);
  });
}

test("all display and analytics paths use the shared evaluator",()=>{
  assert.match(html,/function currentMatchMasuwariCountV1\(player\)[\s\S]*?window\.rackGameMasuwariCountsV1\?\.\(record\)/);
  assert.match(html,/const masuwariV4=rackGameMasuwariCountsV1\(record\)/);
  assert.match(html,/masuwari\+=Number\(window\.rackGameMasuwariCountsV1\(record\)\?\.\[playerSide\]\)\|\|0/);
  assert.match(html,/const analyticsMasuwariCount= \(record,s\)=>\{\s*return Number\(window\.rackGameMasuwariCountsV1\?\.\(record\)\?\.\[Number\(s\)\]\)\|\|0;/);
  assert.doesNotMatch(html,/const analyticsMasuwariCount=[\s\S]{0,500}breakRunOut===true/);
});

test("9ball masuwari remains identical after record save and reload",()=>{
  const record={disciplineId:"9ball",eventLog:{events:ballEvents("9ball")}};
  const reloaded=JSON.parse(JSON.stringify(record));
  assert.equal(context.window.evaluate(record)[1],1);
  assert.equal(context.window.evaluate(reloaded)[1],1);
});
