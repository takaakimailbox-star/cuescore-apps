import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const css=readFileSync(new URL("../ui-revision-v12.css",import.meta.url),"utf8");

test("global history cards reserve one-line room for common seven-character Japanese names",()=>{
  assert.match(css,/Build 56: keep a common Japanese 3-character family/);
  assert.match(css,/\.records-list \.record-card\.match-card-c-global-v37\{[\s\S]*grid-template-columns:minmax\(0,1fr\) minmax\(50px,auto\) 10px!important/);
  assert.match(css,/\.match-card-c-global-v37 \.record-match-player-v3 strong\{[\s\S]*max-width:none!important;[\s\S]*font-size:11\.5px!important/);
  assert.match(css,/\.match-card-c-global-v37 \.record-match-avatar-v3\{[\s\S]*flex-basis:22px!important/);
});
