import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const demoSource=fs.readFileSync(new URL("../demo-data.js",import.meta.url),"utf8");

for(const removed of [
  /data-records-filter="memo"/,
  /data-records-tag=/,
  /id="statisticsTag"/,
  /detectMemoTagsV331/,
  /GAME_MEMO_TAGS_V32/,
  /data-game-memo-tag=/,
  /historicalEditMemoV35/,
  /試合タグ（共通/
]) assert.doesNotMatch(html,removed,`removed match memo/tag UI or logic remains: ${removed}`);

assert.doesNotMatch(demoSource,/matchMemo\s*:/);
assert.doesNotMatch(demoSource,/tags\s*:/);
assert.doesNotMatch(demoSource,/category:[^\n]+memo\s*:/);

// Decision 013 player reflections and profile memos remain separate, adopted features.
assert.match(html,/プレーヤー別の振り返り/);
assert.match(html,/playerReflections:/);
assert.match(html,/playerEditorMemoV2/);
assert.match(demoSource,/definition\.memo/);

// Old record fields remain readable in Match Detail and exportable through the existing CSV shape.
assert.match(html,/record\.memo \|\| record\.matchMemo/);
assert.match(html,/Array\.isArray\(record\.tags\)/);
assert.match(html,/tags: Array\.isArray\(record\.tags\) \? record\.tags\.join/);
assert.match(html,/memo: record\.memo \|\| ""/);

class MemoryStorage {
  #values=new Map();
  get length(){return this.#values.size;}
  key(index){return [...this.#values.keys()][index]??null;}
  getItem(key){return this.#values.has(key)?this.#values.get(key):null;}
  setItem(key,value){this.#values.set(String(key),String(value));}
  removeItem(key){this.#values.delete(String(key));}
}
const context=vm.createContext({localStorage:new MemoryStorage()});
context.globalThis=context;
vm.runInContext(demoSource,context);
const demo=context.CueScoreDemoData.create(context.localStorage);
assert.equal(demo.records.length,120);
assert.ok(demo.records.every(record=>!("memo" in record)&&!("matchMemo" in record)&&!("tags" in record)));
assert.ok(demo.players.every(player=>typeof player.memo==="string"),"player profile memos must remain");

console.log("Match memo/tag Phase 1 removal and compatibility boundaries passed.");
