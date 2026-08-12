import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const normalizeStart=html.indexOf("  function normalizeRaceGoalV109");
const validateEnd=html.indexOf("\n\n  function updateCustomGoalValidationV1",normalizeStart);
assert.ok(normalizeStart>=0&&validateEnd>normalizeStart,"shared new-match goal validator must exist");
const context={Object,Number};
vm.runInNewContext(`${html.slice(normalizeStart,validateEnd)}\nthis.validate=validateNewMatchGoalV1;`,context);

const cases={
  "9ball": [["1",true],["100",true],["101",false]],
  "10ball": [["1",true],["100",true],["101",false]],
  rotation: [["1",true],["1000",true],["1001",false]],
  straightPool: [["1",true],["1000",true],["1001",false]],
  threeCushion: [["1",true],["100",true],["101",false]]
};
for(const [discipline,values] of Object.entries(cases)){
  for(const [value,valid] of values) assert.equal(context.validate(discipline,value).valid,valid,`${discipline} ${value}`);
  for(const value of ["0","-1","1.5","","abc"]) assert.equal(context.validate(discipline,value).valid,false,`${discipline} rejects ${JSON.stringify(value)}`);
}
assert.equal(context.validate("jpa9","not-free-input").valid,true,"JPA9 remains governed by its existing SL targets");

assert.match(html,/id="newMatchRaceCustomInputV1"[^>]*min="1"[^>]*step="1"[^>]*inputmode="numeric"/);
assert.match(html,/input\.max = String\(limit\.max\)/);
assert.match(html,/apply\.disabled = !result\.valid/);
assert.match(html,/newMatchRaceCustomErrorV1[^>]*role="status"[^>]*aria-live="polite"/);
assert.match(html,/const p1ValidationV1 = jpaModeV1 \? null : validateNewMatchGoalV1/);
assert.match(html,/const p2ValidationV1 = jpaModeV1 \? null : validateNewMatchGoalV1/);
assert.match(html,/\[25,50,75,100,125,150\]/,"14-1 presets remain unchanged");
assert.match(html,/\[15,20,25,30,35,40,50\]/,"3C presets remain unchanged");
assert.match(html,/Array\.from\(\{length:15\}/,"9/10-Ball presets remain unchanged");
assert.match(html,/Object\.entries\(JPA9_SL_TARGETS\)/,"JPA9 SL picker remains unchanged");

console.log("Numeric input upper-limit regression checks passed");
