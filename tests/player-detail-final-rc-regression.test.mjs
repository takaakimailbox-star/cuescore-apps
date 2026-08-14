import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const serviceWorker=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");

const extractFunction=name=>{
  const start=html.indexOf(`function ${name}(`);
  assert.notEqual(start,-1,`missing ${name}`);
  const brace=html.indexOf("{",start);
  let depth=0;
  for(let index=brace;index<html.length;index++){
    if(html[index]==="{")depth++;
    if(html[index]==="}"&&--depth===0)return html.slice(start,index+1);
  }
  throw new Error(`unterminated ${name}`);
};

const players=[{id:"player-1",name:"A"},{id:"player-2",name:"B"}];
const records=[];
const context=vm.createContext({
  readPlayerLibrary:()=>players,
  readMatchRecords:()=>records
});
vm.runInContext(`${extractFunction("recordsForRegisteredPlayer")}\n${extractFunction("playerSideInRecord")}`,context);

// Existing saves may contain the same identifier as a number or a string.
const mixedIdRecord={players:{1:{registeredPlayerId:123,name:"A"},2:{registeredPlayerId:"player-2",name:"B"}}};
assert.equal(context.playerSideInRecord(mixedIdRecord,{id:"123",name:"A"}),1);
assert.equal(context.playerSideInRecord(mixedIdRecord,{id:123,name:"A"}),1);

// Legacy name-only and deleted-player histories remain readable. Malformed data is skipped.
const legacy={players:{1:{name:"A"},2:{name:"Legacy Opponent"}}};
const malformed={players:null};
const deletedPlayerHistory={players:{1:{registeredPlayerId:"deleted-player",name:"A"},2:{name:"Opponent"}}};
records.push(mixedIdRecord,legacy,malformed,deletedPlayerHistory);
assert.equal(context.playerSideInRecord(legacy,players[0]),1);
assert.equal(context.playerSideInRecord(malformed,players[0]),null);
assert.equal(context.playerSideInRecord(deletedPlayerHistory,players[0]),1);

class MemoryStorage {
  #values=new Map();
  get length(){return this.#values.size;}
  key(index){return [...this.#values.keys()][index]??null;}
  getItem(key){return this.#values.has(key)?this.#values.get(key):null;}
  setItem(key,value){this.#values.set(String(key),String(value));}
  removeItem(key){this.#values.delete(String(key));}
}
const sampleContext=vm.createContext({localStorage:new MemoryStorage()});
sampleContext.globalThis=sampleContext;
vm.runInContext(fs.readFileSync(new URL("../demo-data.js",import.meta.url),"utf8"),sampleContext);
const sample=sampleContext.CueScoreDemoData.create(sampleContext.localStorage);
const samplePlayersById=new Map(sample.players.map(player=>[String(player.id),player]));
for(const record of sample.records){
  for(const playerSide of [1,2]){
    const samplePlayer=samplePlayersById.get(String(record.players[playerSide].registeredPlayerId));
    assert.ok(samplePlayer,`sample record ${record.id} has an unknown player`);
    assert.equal(context.playerSideInRecord(record,samplePlayer),playerSide);
  }
}
assert.deepEqual(
  [...new Set(sample.records.map(record=>record.disciplineId))].sort(),
  ["10ball","9ball","jpa9","rotation","straightPool","threeCushion"]
);

// Every Player Detail section consumes only records whose player side resolves.
assert.match(html,/const records = p => recordsForRegisteredPlayer\(p\)\.filter\(record=>side\(record,p\)\)\.sort/);
assert.match(html,/const opponent = \(record,s\) => s \? record\?\.players\?\.\[s===1\?2:1\]\|\|\{\} : \{\}/);
assert.doesNotMatch(html,/p1\.registeredPlayerId === player\.id/);

for(const discipline of ["9ball","10ball","rotation","jpa9","straightPool","threeCushion"]){
  assert.ok(html.includes(`id:"${discipline}"`),`missing Player Detail discipline: ${discipline}`);
}
for(const section of ["最近の成績","対戦相手別の成績","このプレーヤーの試合履歴"]){
  assert.ok(html.includes(section),`missing Player Detail section: ${section}`);
}

const version=serviceWorker.match(/const APP_VERSION = "([^"]+)"/)?.[1];
assert.equal(version,"2.0-fa-iphone-003-diagnostic-toggle-v3");
assert.match(html,new RegExp(`const PWA_VERSION = "${version}"`));
assert.match(html,new RegExp(`demo-data\\.js\\?v=${version}`));
assert.match(serviceWorker,new RegExp(`demo-data\\.js\\?v=${version}`));

console.log("Player Detail Final RC compatibility regression checks passed");
