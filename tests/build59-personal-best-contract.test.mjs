import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const hub=readFileSync(new URL("../navigation-phase2-6.js",import.meta.url),"utf8");
const analysis=readFileSync(new URL("../analysis-build4.js",import.meta.url),"utf8");
const legacy=readFileSync(new URL("../player-detail-build6.js",import.meta.url),"utf8");

test("player self-best labels include the approved break metrics",()=>{
  for(const source of [hub,analysis,legacy]){
    assert.match(source,/breakPocketCount:"最高ブレイクポケット数"/);
    assert.match(source,/breakScore:"最高ブレイク得点"/);
    assert.match(source,/discipline(?:Id)?==="jpa9"\?"最短イニング"/);
  }
});
