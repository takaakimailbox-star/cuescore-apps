import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");

assert.match(html,/CueScore Rival Analysis v2\.0/);
assert.match(html,/class="rival-matchup-v2"/);
assert.match(html,/data-rival-discipline-v2/);
assert.match(html,/次の対戦ポイント/);
assert.match(html,/活かしたい強み/);
assert.match(html,/注意したい場面/);
assert.match(html,/りおんのワンポイント/);
assert.match(html,/成績比較/);
assert.match(html,/最近の直接対戦/);
assert.match(html,/data-rival-record-id/);
assert.match(html,/window\.openMatchDetailV1\?\.\(row\.dataset\.rivalRecordId\)/);
assert.match(html,/rivalDisciplineV2=window\.__cueScoreRivalReturnV2\?\.discipline/);
assert.match(sw,/const APP_VERSION = "2\.0-[^"]+"/);

console.log("Rival Analysis v2 player-journey design and navigation checks passed.");
