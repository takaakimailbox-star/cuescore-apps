import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("global history shortens only asymmetric race labels to preserve player names",()=>{
  assert.match(html,/const raceLabelV2 = goal1V2 === goal2V2 \? `Race to \$\{goal1V2\}` : `Race \$\{goal1V2\}\/\$\{goal2V2\}`/);
  assert.match(html,/record-race-v2[^>]*><img[^>]+>\$\{raceLabelV2\}<\/span>/);
  assert.doesNotMatch(html,/const raceV2 = goal1V2 === goal2V2/);
});
