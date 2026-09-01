import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const index=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const js=readFileSync(new URL("../navigation-shell-phase1.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../navigation-shell-phase1.css",import.meta.url),"utf8");
const build=readFileSync(new URL("../scripts/build-native-web.mjs",import.meta.url),"utf8");
const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");

test("Normal Mode navigation has exactly the four adopted top-level tabs",()=>{
  assert.match(js,/const roots=\["home","player","history","settings"\]/);
  assert.match(js,/home:"ホーム",player:"プレーヤー",history:"履歴",settings:"設定"/);
  assert.doesNotMatch(js,/練習/);
  assert.match(js,/tabCount:\(\)=>nav\.querySelectorAll\("\[data-phase1-tab\]"\)\.length/);
});

test("Player root uses the adopted title and all four directions share one state container",()=>{
  assert.match(js,/title\.textContent="プレーヤー"/);
  assert.doesNotMatch(js,/title\.textContent="プレーヤー一覧"/);
  assert.match(js,/const state=\{active:"home",previous:\{\},historyDiscipline:"all"\}/);
  for(const key of ["home","player","history","settings"])assert.match(js,new RegExp(`key==="${key}"`));
});

test("retap returns to root while cross-tab navigation restores saved runtime state",()=>{
  assert.match(js,/const retap=key===state\.active/);
  assert.match(js,/if\(retap\)openRoot\(key\);else restore\(key\)/);
  assert.match(js,/state\.previous\[state\.active\]=snapshot\(state\.active\)/);
  assert.match(js,/state\.historyDiscipline=selected/);
});

test("cross-tab moves close the previous top-level mode before opening the destination",()=>{
  assert.match(js,/const leaveTopLevel=key=>/);
  assert.match(js,/if\(key!=="settings"\)closeSettingsRoot\(\)/);
  assert.match(js,/if\(key!=="history"\)closeHistoryRoot\(\)/);
  assert.match(js,/if\(key!=="player"\)hideTransientPlayerViews\(\)/);
  assert.match(js,/leaveTopLevel\(key\);[\s\S]*?if\(key==="history"\)\{document\.getElementById\("recordsBtn"\)\?\.click\(\)/);
  assert.match(js,/const enforceRootVisibility=key=>/);
  assert.match(js,/enforceRootVisibility\(key\);\s*setActive\(key\)/);
});

test("root navigation coalesces observation work and history avoids a duplicate all-filter render",()=>{
  assert.doesNotMatch(js,/recordsBtn"\)\?\.click\(\);document\.querySelector\('\[data-records-discipline-v2="all"\]'/);
  assert.match(js,/if\(filter!=="all"\)/);
  assert.match(js,/let reconcileQueued=false/);
  assert.match(js,/new MutationObserver\(scheduleReconcile\)/);
});

test("Match Detail closes before a cross-tab move and existing Back ownership stays intact",()=>{
  assert.match(js,/const closeMatchDetail=/);
  assert.match(js,/window\.closeFormalMatchDetailV2\(\)/);
  assert.match(js,/document\.body\.classList\.remove\("match-detail-visible-v1"\)/);
  assert.match(index,/window\.closeFormalMatchDetailV2=/);
});

test("active Match Mode hides navigation and normal result exit restores it",()=>{
  assert.match(js,/const isMatchMode=.*app\.classList\.contains\("pro-game-mode"\)/s);
  assert.match(js,/nav\.hidden=match/);
  assert.match(js,/classList\.toggle\("cue-phase1-normal-mode",!match\)/);
  assert.match(css,/\.cue-phase1-tab-bar\[hidden\]\{display:none!important\}/);
});

test("active-match resume entry remains and the shell does not add saved-data keys",()=>{
  assert.match(index,/id="cueResumeCardV1"/);
  assert.doesNotMatch(js,/localStorage\.(?:setItem|removeItem)/);
  assert.doesNotMatch(js,/sessionStorage\.(?:setItem|removeItem)/);
});

test("Safe Area and content bottom inset are applied to normal browsing roots",()=>{
  assert.match(css,/env\(safe-area-inset-bottom\)/);
  assert.match(css,/\.records-list\{padding-bottom:calc\(var\(--cue-phase1-nav-height\)/);
  assert.match(css,/\.player-journey-scroll-v2/);
  assert.match(css,/\.settings-formal-scroll-v1/);
  assert.match(css,/\.match-detail-scroll-v1/);
});

test("Phase 1 assets load last, ship in native web, and remain offline",()=>{
  assert.ok(index.indexOf("final-ui-build18.js")<index.indexOf("navigation-shell-phase1.js"));
  assert.ok(index.indexOf("ui-revision-v12.css")<index.lastIndexOf("navigation-shell-phase1.css"));
  for(const file of ["navigation-shell-phase1.css","navigation-shell-phase1.js"]){
    assert.ok(build.includes(`"${file}"`));
    assert.ok(sw.includes(`"./${file}"`));
  }
});
