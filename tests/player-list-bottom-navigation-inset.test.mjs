import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=readFileSync(new URL("../navigation-shell-phase1.css",import.meta.url),"utf8");
const js=readFileSync(new URL("../navigation-shell-phase1.js",import.meta.url),"utf8");

test("Player root reserves Bottom Navigation and Safe Area on its real scroll owner",()=>{
  assert.match(html,/class="player-library-main" id="playerLibraryMain"[\s\S]*?class="player-library-list" id="playerLibraryList"/);
  assert.match(html,/\.player-management-formal-v1 \.player-library-main\{[\s\S]*?overflow:hidden/);
  assert.match(html,/\.player-management-formal-v1 \.player-library-list\{[\s\S]*?overflow-y:auto/);
  assert.match(css,/body\.cue-phase1-normal-mode \.player-management-formal-v1 \.player-library-list\{[\s\S]*?padding-bottom:calc\(var\(--cue-phase1-nav-height\) \+ 18px \+ env\(safe-area-inset-bottom\)\)!important/);
  assert.doesNotMatch(css,/body\.cue-phase1-normal-mode \.player-library-main,/);
});

test("Player navigation snapshots and resets the same real scroll owner",()=>{
  assert.match(js,/const scrollHost=node=>node\?\.querySelector\("\.player-library-list,/);
  assert.match(js,/querySelector\("#playerLibraryList"\)\?\.scrollTo\?\.\(0,0\)/);
  assert.doesNotMatch(js,/querySelector\("#playerLibraryMain"\)\?\.scrollTo/);
});

test("History keeps the same fixed-navigation clearance on its real scroll owner",()=>{
  assert.match(html,/class="records-list" id="recordsList"/);
  assert.match(css,/body\.cue-phase1-normal-mode \.records-list\{padding-bottom:calc\(var\(--cue-phase1-nav-height\) \+ 18px \+ env\(safe-area-inset-bottom\)\)!important\}/);
  assert.match(js,/querySelector\("#recordsList"\)\?\.scrollTo\?\.\(0,0\)/);
});

test("the fixed Bottom Navigation geometry is unchanged",()=>{
  assert.match(css,/:root\{--cue-phase1-nav-height:68px\}/);
  assert.match(css,/\.cue-phase1-tab-bar\{[\s\S]*?position:fixed;z-index:18000[\s\S]*?min-height:calc\(var\(--cue-phase1-nav-height\) \+ env\(safe-area-inset-bottom\)\)/);
});
