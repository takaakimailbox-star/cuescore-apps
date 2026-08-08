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
assert.equal(first.records.length, 132);
assert.equal(first.players.filter(player => player.isPrimary).length, 1);
assert.equal(first.players[0].id, "demo-player-01");
assert.equal(first.players[0].name, "Haruto");
assert.equal(new Set(first.players.map(player => player.id)).size, 10);
assert.equal(new Set(first.records.map(record => record.id)).size, 132);
assert.deepEqual(new Set(first.records.map(record => record.gameType)), new Set(["rotation", "nineBall", "tenBall", "straightPool", "jpa9", "threeCushion"]));
assert.equal(JSON.stringify(first.records.slice(0,24).map(record=>record.id)),JSON.stringify(Array.from({length:24},(_,index)=>`demo-match-${String(index+1).padStart(4,"0")}`)));
first.players.forEach(player=>{
  const games=first.records.filter(record=>[1,2].some(side=>record.players?.[side]?.registeredPlayerId===player.id));
  assert.ok(games.length>=15,`${player.name} should have enough demo matches`);
});
for(const disciplineId of ["9ball","10ball","rotation","straightPool","jpa9","threeCushion"]){
  assert.ok(first.records.filter(record=>record.disciplineId===disciplineId).length>=18,`${disciplineId} should have at least 18 matches`);
}
Object.entries(normalKeys).forEach(([name, key]) => assert.equal(storage.getItem(key), normalFixture[name]));

const deterministic = JSON.stringify(first);
assert.equal(JSON.stringify(demo.create(storage)), deterministic);
const legacyRecords=first.records.slice(0,24);
storage.setItem(demo.keys.records,JSON.stringify(legacyRecords));
storage.setItem(demo.keys.metadata,JSON.stringify({version:"1.1",playerCount:10,matchCount:24}));
const upgraded=demo.upgrade(storage);
assert.equal(upgraded.records.length,132);
assert.equal(JSON.stringify(upgraded.records.slice(0,24)),JSON.stringify(legacyRecords));
assert.equal(JSON.parse(storage.getItem(demo.keys.metadata)).version,"1.2");
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

console.log("Official Demo Data isolation tests passed (10 players, 132 matches across 6 disciplines).");
