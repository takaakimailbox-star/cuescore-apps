import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

class MemoryStorage {
  #values = new Map();
  get length() { return this.#values.size; }
  key(index) { return [...this.#values.keys()][index] ?? null; }
  getItem(key) { return this.#values.has(key) ? this.#values.get(key) : null; }
  setItem(key, value) { this.#values.set(String(key), String(value)); }
  removeItem(key) { this.#values.delete(String(key)); }
}

const storage = new MemoryStorage();
const context = vm.createContext({ localStorage: storage });
context.globalThis = context;
vm.runInContext(fs.readFileSync(new URL("../demo-data.js", import.meta.url), "utf8"), context);
const demo = context.CueScoreDemoData;

const normalKeys = {
  players: "rotationScoreboard.players.v1",
  records: "rotationScoreboard.matchRecords.v1",
  categories: "rotationScoreboard.matchCategories.v1",
  seasons: "rotationScoreboard.matchSeasons.v1"
};
const normalFixture = {
  players: JSON.stringify([{ id: "real-player", name: "Real" }]),
  records: JSON.stringify([{ id: "real-match", players: { 1: {}, 2: {} } }]),
  categories: JSON.stringify([{ id: "real-category", name: "Real" }]),
  seasons: JSON.stringify([{ id: "real-season", name: "Real" }])
};
Object.entries(normalKeys).forEach(([name, key]) => storage.setItem(key, normalFixture[name]));

const first = demo.create(storage);
assert.equal(first.players.length, 10);
assert.equal(first.records.length, 900);
assert.equal(first.players.filter(player => player.isPrimary).length, 1);
assert.equal(first.players[0].id, "demo-player-01");
assert.equal(first.players[0].name, "はると");
assert.equal(new Set(first.players.map(player => player.id)).size, 10);
assert.equal(new Set(first.records.map(record => record.id)).size, 900);
assert.deepEqual(new Set(first.records.map(record => record.gameType)), new Set(["rotation", "nineBall", "tenBall", "straightPool", "jpa9", "threeCushion"]));
first.players.forEach(player=>{
  const games=first.records.filter(record=>[1,2].some(side=>record.players?.[side]?.registeredPlayerId===player.id));
  for(const disciplineId of ["9ball","10ball","rotation","straightPool","jpa9","threeCushion"]){
    const disciplineGames=games.filter(record=>record.disciplineId===disciplineId);
    assert.ok(disciplineGames.length>=30,`${player.name} should have 30+ ${disciplineId} matches`);
  }
  const rivalCounts=new Map();
  games.forEach(record=>{const side=record.players[1].registeredPlayerId===player.id?1:2;const rival=record.players[side===1?2:1].registeredPlayerId;const key=`${record.disciplineId}:${rival}`;rivalCounts.set(key,(rivalCounts.get(key)||0)+1);});
  assert.ok(Math.max(...rivalCounts.values())>=20,`${player.name} should have a 20+ match rival`);
});
for(const disciplineId of ["9ball","10ball","rotation","straightPool","jpa9","threeCushion"]){
  assert.equal(first.records.filter(record=>record.disciplineId===disciplineId).length,150,`${disciplineId} should have 150 matches`);
}
assert.ok(first.records.every(record=>record.analysis?.report?.recordingMode==="detail"));
assert.ok(first.records.every(record=>record.analysis?.events?.some(event=>event.type==="ball_pocketed")));
assert.ok(first.records.every(record=>record.analysis?.events?.some(event=>event.type==="player_switch")));
assert.ok(first.records.some(record=>record.analysis?.events?.some(event=>event.type==="safety_result")));
assert.ok(first.records.some(record=>record.analysis?.events?.some(event=>event.type==="foul_result")));
const playedTimes=first.records.map(record=>Date.parse(record.playedAt));
assert.ok(Math.max(...playedTimes)-Math.min(...playedTimes)>=360*24*60*60*1000,"history should span about one year");
Object.entries(normalKeys).forEach(([name, key]) => assert.equal(storage.getItem(key), normalFixture[name]));

const deterministic = JSON.stringify(first);
assert.equal(JSON.stringify(demo.create(storage)), deterministic);
const legacyRecords=first.records.slice(0,24).map(record=>({...record,createdByAppVersion:"CueScore Official Demo Data v1.2"}));
storage.setItem(demo.keys.records,JSON.stringify(legacyRecords));
storage.setItem(demo.keys.metadata,JSON.stringify({version:"1.1",playerCount:10,matchCount:24}));
const upgraded=demo.upgrade(storage);
assert.equal(upgraded.records.length,900);
assert.notEqual(JSON.stringify(upgraded.records.slice(0,24)),JSON.stringify(legacyRecords));
assert.equal(JSON.parse(storage.getItem(demo.keys.metadata)).version,"2.0");
demo.setMode("demo", storage);
assert.equal(demo.isDemo(storage), true);
Object.entries(normalKeys).forEach(([name, key]) => assert.equal(demo.resolveKey(key, storage), demo.keys[name]));
assert.equal(demo.resolveSettingKey("cueScore.discipline.v1", storage), "cuescore-demo.settings.cueScore.discipline.v1");

storage.setItem(demo.keys.records, "[]");
assert.equal(JSON.parse(storage.getItem(normalKeys.records)).length, 1);
assert.equal(JSON.parse(storage.getItem(demo.keys.records)).length, 0);
assert.equal(JSON.stringify(demo.create(storage)), deterministic);

demo.setMode("normal", storage);
Object.entries(normalKeys).forEach(([name, key]) => {
  assert.equal(demo.resolveKey(key, storage), key);
  assert.equal(storage.getItem(key), normalFixture[name]);
});

storage.setItem("cuescore-demo.settings.cueScore.discipline.v1", "9ball");
demo.remove(storage);
assert.equal(demo.isDemo(storage), false);
Object.values(demo.keys).filter(key => key !== demo.keys.mode).forEach(key => assert.equal(storage.getItem(key), null));
assert.equal(storage.getItem("cuescore-demo.settings.cueScore.discipline.v1"), null);
Object.entries(normalKeys).forEach(([name, key]) => assert.equal(storage.getItem(key), normalFixture[name]));

console.log("Official Demo Data isolation tests passed (10 players, 900 detailed matches across 6 disciplines).");
