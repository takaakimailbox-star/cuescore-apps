import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

assert.match(html,/\.break-player-segment-v1\{[\s\S]*?box-sizing:border-box;[\s\S]*?border-width:1px!important;/);
assert.match(html,/\.break-player-segment-v1\.selected-v1\{[\s\S]*?border-width:2px!important;[\s\S]*?border-color:var\(--cue-discipline-accent\)!important;/);
assert.match(html,/\.break-scratch-icon-btn-v1 img\{\s*width:52px;\s*height:52px;/);
assert.match(html,/@media\(max-height:700px\)\{\s*\.break-scratch-icon-btn-v1 img\{width:46px;height:46px\}/);
for(const accent of ["#9A3F0A","#F4B400","#6F6F6F"]){
  assert.match(html,new RegExp(`accent:\"${accent}\"`));
}

console.log("Break-result RC scratch size and discipline-color breaker-card checks passed.");
