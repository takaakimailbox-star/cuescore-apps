import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

function functionSource(name){
  const start=html.indexOf(`function ${name}(`);
  assert.ok(start>=0,`missing ${name}`);
  const brace=html.indexOf("{",start);
  let depth=0;
  for(let index=brace;index<html.length;index++){
    if(html[index]==="{")depth++;
    if(html[index]==="}"&&--depth===0)return html.slice(start,index+1);
  }
  throw new Error(`unterminated ${name}`);
}

test("adding a non-primary Player preserves the existing primary Player",()=>{
  const context=vm.createContext({window:{}});
  vm.runInContext(`${functionSource("setExclusivePrimaryPlayerV1")}\nwindow.apply=setExclusivePrimaryPlayerV1;`,context);
  const players=[{id:"A",isPrimary:true},{id:"B"}];
  const result=context.window.apply(players,"B",false);
  assert.equal(result.find(player=>player.id==="A").isPrimary,true);
  assert.equal(result.find(player=>player.id==="B").isPrimary,undefined);
  const changed=context.window.apply(result,"B",true);
  assert.equal(changed.find(player=>player.id==="A").isPrimary,undefined);
  assert.equal(changed.find(player=>player.id==="B").isPrimary,true);
  const cleared=context.window.apply(changed,"B",false);
  assert.equal(cleared.some(player=>player.isPrimary),false);
});

test("completed match frees the replaceable live snapshot before a quota-bound write",()=>{
  const values=new Map([["live","x".repeat(60)],["records","[]"]]);
  const size=()=>[...values.entries()].reduce((sum,[key,value])=>sum+key.length+value.length,0);
  const storage={
    getItem:key=>values.has(key)?values.get(key):null,
    removeItem:key=>values.delete(key),
    setItem(key,value){
      const previous=values.get(key);
      values.set(key,String(value));
      if(size()>100){
        if(previous===undefined)values.delete(key);else values.set(key,previous);
        throw new DOMException("quota","QuotaExceededError");
      }
    }
  };
  const context=vm.createContext({window:{},localStorage:storage,console,DOMException,
    inProgressMatchStorageKeyV1:()=>"live",
    persistMatchRecordsOnlyV161:records=>storage.setItem("records",JSON.stringify(records))
  });
  vm.runInContext(`${functionSource("persistCompletedMatchRecordsV162")}\nwindow.persist=persistCompletedMatchRecordsV162;`,context);
  assert.equal(context.window.persist([{id:"match-1",payload:"y".repeat(45)}]),true);
  assert.equal(storage.getItem("live"),null);
  assert.match(storage.getItem("records"),/match-1/);
});

test("failed completed-match write restores the live snapshot",()=>{
  const values=new Map([["live","recoverable"]]);
  const storage={
    getItem:key=>values.has(key)?values.get(key):null,
    removeItem:key=>values.delete(key),
    setItem:(key,value)=>values.set(key,String(value))
  };
  const expected=new Error("write failed");
  const context=vm.createContext({window:{},localStorage:storage,console,
    inProgressMatchStorageKeyV1:()=>"live",
    persistMatchRecordsOnlyV161:()=>{throw expected;}
  });
  vm.runInContext(`${functionSource("persistCompletedMatchRecordsV162")}\nwindow.persist=persistCompletedMatchRecordsV162;`,context);
  assert.throws(()=>context.window.persist([{id:"match-1"}]),/write failed/);
  assert.equal(storage.getItem("live"),"recoverable");
});

test("Game Result and Match Detail retain the adopted shared renderer",()=>{
  assert.match(html,/window\.openMatchResultDetailV5=recordId=>openMatchDetailV1\(recordId,\{source:"result"\}\)/);
  assert.match(functionSource("saveCurrentMatchRecord"),/persistCompletedMatchRecordsV162\(existingRecords\)/);
  assert.match(functionSource("renderOfficialMatchResultV1"),/window\.openMatchResultDetailV5\(savedId\)/);
});
