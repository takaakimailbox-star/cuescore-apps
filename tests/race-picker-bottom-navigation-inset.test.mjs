import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=readFileSync(new URL("../navigation-shell-phase1.css",import.meta.url),"utf8");

test("Race picker clears the fixed Bottom Navigation and iPhone safe area in Normal Mode",()=>{
  assert.match(css,/--cue-phase1-nav-height:68px/);
  assert.match(css,/\.cue-phase1-tab-bar\{[\s\S]*?position:fixed;z-index:18000/);
  assert.match(html,/\.new-match-race-picker-v1\{[\s\S]*?position:fixed;inset:0;z-index:10050/);
  assert.match(css,/body\.cue-phase1-normal-mode \.new-match-race-picker-v1\{[\s\S]*?padding-bottom:calc\(16px \+ var\(--cue-phase1-nav-height\) \+ env\(safe-area-inset-bottom\)\)/);
});

test("Race picker and sheet retain touch scrolling when their content exceeds the viewport",()=>{
  assert.match(css,/body\.cue-phase1-normal-mode \.new-match-race-picker-v1\{[\s\S]*?overflow-y:auto[\s\S]*?scroll-padding-bottom:calc\(16px \+ var\(--cue-phase1-nav-height\) \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(css,/body\.cue-phase1-normal-mode \.new-match-race-sheet-v1\{[\s\S]*?max-height:calc\(100dvh - 32px - var\(--cue-phase1-nav-height\) - env\(safe-area-inset-bottom\)\)[\s\S]*?overflow-y:auto/);
});

test("9-Ball and 10-Ball keep the shared Race 1-15 presets and custom route through 100",()=>{
  assert.match(html,/else if \(\(nineBall \|\| tenBall\) && options\)/);
  assert.match(html,/Array\.from\(\{length:15\},\(_,index\)=>index\+1\)/);
  assert.match(html,/data-race-value="other"/);
  assert.match(html,/const validation = validateNewMatchGoalV1\(disciplineId, value\)/);
  assert.match(html,/if \(nineBall\)[\s\S]*?dataset\.nineBallRace/);
  assert.match(html,/if \(tenBall\)[\s\S]*?dataset\.tenBallRace/);
});

test("Rotation, 14-1, 3C, and JPA9 keep their existing selector branches",()=>{
  assert.match(html,/if \(jpa && options\)/);
  assert.match(html,/else if \(straightPool && options\)/);
  assert.match(html,/else if \(threeCushion && options\)/);
  assert.match(html,/else if \(options && !options\.querySelector\('\[data-race-value="61"\]'\)\)/);
});
