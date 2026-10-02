import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=readFileSync(new URL("../navigation-shell-phase1.css",import.meta.url),"utf8");
const js=readFileSync(new URL("../navigation-shell-phase1.js",import.meta.url),"utf8");
const revision=readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");
const playerListRule=css.match(/body\.cue-phase1-normal-mode \.player-management-formal-v1 \.player-library-list\{([^}]*)\}/)?.[1]||"";

test("Player root keeps a content-fit card and reserves Bottom Navigation outside its real scroll owner",()=>{
  assert.match(html,/class="player-library-main" id="playerLibraryMain"[\s\S]*?class="player-library-list" id="playerLibraryList"/);
  assert.match(html,/\.player-management-formal-v1 \.player-library-main\{[\s\S]*?overflow:hidden/);
  assert.match(html,/\.player-management-formal-v1 \.player-library-list\{[\s\S]*?overflow-y:auto/);
  assert.match(playerListRule,/margin-bottom:calc\(var\(--cue-phase1-nav-height\) \+ 18px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(playerListRule,/padding-bottom:0!important/);
  assert.match(playerListRule,/scroll-padding-bottom:18px/);
  assert.doesNotMatch(playerListRule,/padding-bottom:calc\(var\(--cue-phase1-nav-height\)/);
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

test("Player ordering keeps each information and edit action inside one registered Player row",()=>{
  assert.match(revision,/querySelectorAll\(":scope > \.player-management-row-v1"\)/);
  assert.match(revision,/const playerId=row=>String\(row\.querySelector\("\[data-stats-player\]"\)/);
  assert.match(revision,/wanted\.forEach\(id=>list\.appendChild\(rows\.get\(id\)\)\)/);
  assert.doesNotMatch(revision,/const current=\[\.\.\.list\.querySelectorAll\("\[data-stats-player\]"\)\]/);
});
