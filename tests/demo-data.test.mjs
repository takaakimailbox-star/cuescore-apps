import assert from "node:assert/strict";
import fs from "node:fs";
import { performance } from "node:perf_hooks";
import vm from "node:vm";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
for (const label of ["サンプルデータ","通常データ","準備する","サンプルを見る","通常データへ戻る","初期状態に戻す"]) assert.match(html,new RegExp(label));
assert.match(html,/アプリの画面と機能を試せます。通常のデータには影響しません。/);
assert.match(html,/record\?\.analysis\?\.events/,"Match Detail must fall back to the canonical analysis stream");

class MemoryStorage {
  #values = new Map();
  get length(){ return this.#values.size; }
  key(index){ return [...this.#values.keys()][index] ?? null; }
  getItem(key){ return this.#values.has(key) ? this.#values.get(key) : null; }
  setItem(key,value){ this.#values.set(String(key),String(value)); }
  removeItem(key){ this.#values.delete(String(key)); }
}
const storage=new MemoryStorage(),context=vm.createContext({localStorage:storage});
context.globalThis=context;
vm.runInContext(fs.readFileSync(new URL("../demo-data.js",import.meta.url),"utf8"),context);
const demo=context.CueScoreDemoData;
assert.equal(demo.version,"3.0");

const normalKeys={players:"rotationScoreboard.players.v1",records:"rotationScoreboard.matchRecords.v1",categories:"rotationScoreboard.matchCategories.v1",seasons:"rotationScoreboard.matchSeasons.v1"};
const normalFixture={players:JSON.stringify([{id:"real-player",name:"Real"}]),records:JSON.stringify([{id:"real-match"}]),categories:JSON.stringify([{id:"real-category"}]),seasons:JSON.stringify([{id:"real-season"}])};
Object.entries(normalKeys).forEach(([name,key])=>storage.setItem(key,normalFixture[name]));

const started=performance.now(),sample=demo.create(storage),createdMs=performance.now()-started;
assert.equal(sample.players.length,10);
assert.equal(sample.records.length,500);
assert.equal(sample.players.filter(player=>player.isPrimary).length,1);
const playerIds=new Set(sample.players.map(player=>player.id));
assert.equal(playerIds.size,10);
assert.equal(new Set(sample.records.map(record=>record.id)).size,500);
assert.deepEqual(Object.fromEntries([...new Set(sample.records.map(record=>record.disciplineId))].sort().map(id=>[id,sample.records.filter(record=>record.disciplineId===id).length])),{"10ball":88,"9ball":104,jpa9:74,rotation:101,straightPool:76,threeCushion:57});

for(const record of sample.records){
  for(const side of [1,2]) assert.ok(playerIds.has(record.players[side].registeredPlayerId),`unknown Player ID in ${record.id}`);
  const winner=Number(record.winner),loser=winner===1?2:1;
  assert.equal(Number(record.players[winner].score),Number(record.players[winner].goal),`winner goal mismatch: ${record.id}`);
  assert.ok(Number(record.players[loser].score)<Number(record.players[loser].goal),`loser goal mismatch: ${record.id}`);
  assert.ok(Array.isArray(record.analysis?.events)&&record.analysis.events.length>0);
  assert.equal(record.analysis.report.recordingMode,"detail");
}
const dates=sample.records.map(record=>Date.parse(record.startedAt));
assert.ok(Math.max(...dates)-Math.min(...dates)>450*86400000,"sample history must span 12–18 months");
const months=new Map();
for(const record of sample.records){const key=record.startedAt.slice(0,7),bucket=months.get(key)||{games:0,wins:0,shots:[]};bucket.games++;bucket.wins+=Number(record.winner)===1?1:0;bucket.shots.push(Number(record.players[1].shotRate)||0);months.set(key,bucket);}
assert.ok(months.size>=15,"Analytics must have at least 15 monthly points");
assert.ok(new Set([...months.values()].map(bucket=>bucket.games)).size>=6,"monthly match-count graph must vary");
assert.ok(new Set([...months.values()].map(bucket=>Math.round(bucket.wins/bucket.games*100))).size>=6,"monthly win-rate graph must vary");
assert.ok(new Set([...months.values()].map(bucket=>Math.round(bucket.shots.reduce((a,b)=>a+b,0)/bucket.shots.length))).size>=4,"monthly shot-rate graph must vary");
const playerCounts=sample.players.map(player=>sample.records.filter(record=>[1,2].some(side=>record.players[side].registeredPlayerId===player.id)).length);
assert.ok(Math.min(...playerCounts)>=90&&Math.max(...playerCounts)<=110,"match distribution should be broad and natural");

const allEvents=sample.records.flatMap(record=>record.analysis.events);
for(const type of ["break_result","ball_pocketed","player_switch","foul","safety","safety_result","rack_end"]) assert.ok(allEvents.some(event=>event.type===type),`missing ${type}`);
const breaks=allEvents.filter(event=>event.type==="break_result");
assert.ok(breaks.some(event=>event.pocketCount>0&&event.legalBreak));
assert.ok(breaks.some(event=>event.scratch));
assert.ok(breaks.some(event=>event.breakFoul));
assert.ok(breaks.some(event=>event.pocketCount===0));
const safetyResults=allEvents.filter(event=>event.type==="safety_result");
assert.ok(safetyResults.some(event=>event.outcome==="success"));
assert.ok(safetyResults.some(event=>event.outcome==="failed"));
for(const event of safetyResults){
  if(event.outcome==="failed") assert.equal(event.causedBy,"opponent_valid_pocket");
  else assert.match(event.causedBy,/opponent_(no_valid_pocket|foul)|match_end_no_valid_pocket/);
}
assert.ok(sample.records.some(record=>record.rackResults?.some(rack=>rack.breakRunOut)));
assert.ok(sample.records.some(record=>record.players[1].score===0||record.players[2].score===0));
assert.ok(sample.records.some(record=>record.inning>=30));
assert.ok(sample.records.some(record=>record.eventLog?.undoCount>0));
assert.ok(sample.records.filter(record=>record.disciplineId==="threeCushion").every(record=>record.recommendedHandicap==null&&record.threeCushion?.recommendedHandicap==null));

Object.entries(normalKeys).forEach(([name,key])=>assert.equal(storage.getItem(key),normalFixture[name]));
const deterministic=JSON.stringify(sample);
assert.equal(JSON.stringify(demo.create(storage)),deterministic);
storage.setItem(demo.keys.metadata,JSON.stringify({version:"2.0"}));
assert.equal(demo.upgrade(storage).records.length,500);
assert.equal(JSON.parse(storage.getItem(demo.keys.metadata)).version,"3.0");
demo.setMode("demo",storage);
Object.entries(normalKeys).forEach(([name,key])=>assert.equal(demo.resolveKey(key,storage),demo.keys[name]));
storage.setItem(demo.keys.records,"[]");
assert.equal(JSON.parse(storage.getItem(normalKeys.records)).length,1);
demo.setMode("normal",storage);
Object.entries(normalKeys).forEach(([name,key])=>assert.equal(storage.getItem(key),normalFixture[name]));
demo.setMode("demo",storage);demo.remove(storage);
assert.equal(demo.isDemo(storage),false);
Object.entries(normalKeys).forEach(([name,key])=>assert.equal(storage.getItem(key),normalFixture[name]));

const serialized500=JSON.stringify(sample),parseStart=performance.now();JSON.parse(serialized500);const parse500Ms=performance.now()-parseStart;
assert.ok(Buffer.byteLength(serialized500)<3.5*1024*1024,"500 detailed matches must remain within the safe sample-data budget");
const benchStart=performance.now(),thousand=demo.benchmark(1000),benchGeneratedMs=performance.now()-benchStart;
const stringifyStart=performance.now(),serialized1000=JSON.stringify(thousand),stringify1000Ms=performance.now()-stringifyStart;
const parse1000Start=performance.now();JSON.parse(serialized1000);const parse1000Ms=performance.now()-parse1000Start;
assert.equal(thousand.records.length,1000);
assert.ok(benchGeneratedMs<1500&&stringify1000Ms<1500&&parse1000Ms<1500);
assert.ok(Buffer.byteLength(serialized1000)>5*1024*1024,"1,000 detailed records should remain a benchmark, not the localStorage production snapshot");

console.log(JSON.stringify({players:10,matches:500,playerRange:[Math.min(...playerCounts),Math.max(...playerCounts)],period:[new Date(Math.min(...dates)).toISOString(),new Date(Math.max(...dates)).toISOString()],events:allEvents.length,size500MiB:(Buffer.byteLength(serialized500)/1048576).toFixed(2),created500Ms:createdMs.toFixed(1),parse500Ms:parse500Ms.toFixed(1),size1000MiB:(Buffer.byteLength(serialized1000)/1048576).toFixed(2),generated1000Ms:benchGeneratedMs.toFixed(1),stringify1000Ms:stringify1000Ms.toFixed(1),parse1000Ms:parse1000Ms.toFixed(1)}));
