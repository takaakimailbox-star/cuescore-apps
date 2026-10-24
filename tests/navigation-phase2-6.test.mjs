import "./helpers/ja-fs.mjs";
import test from "node:test";
import { jaText } from "./helpers/i18n-ja-catalog.mjs";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const js=readFileSync(new URL("../navigation-phase2-6.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../navigation-phase2-6.css",import.meta.url),"utf8");
const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
const build=readFileSync(new URL("../scripts/build-native-web.mjs",import.meta.url),"utf8");

test("Phase 2 Player Hub has one selector and the adopted three tabs",()=>{
  assert.match(js,/discipline:"9ball",tab:"results"/);
  for(const label of ["成績","試合","分析"])assert.match(js,new RegExp(`"${label}"`));
  assert.match(js,/role="tab" data-hub-discipline/);
  assert.doesNotMatch(js,/<select data-hub-discipline/);
  assert.match(css,/overflow-x:auto/);
  assert.match(js,/playerState=new Map\(\)/);
  assert.doesNotMatch(js,/localStorage\.(?:setItem|removeItem)/);
});

test("Phase 3 match routes reuse shared Match Detail and consolidated opponent flow",()=>{
  assert.match(js,/openMatchDetailV1\?\.\(match\.dataset\.hubMatch\)/);
  assert.match(js,/CueScorePlayerJourneyV2\?\.openHistory[\s\S]*active\.playerId,active\.state\.discipline/);
  assert.match(js,/CueScorePlayerJourneyV2\?\.openRivals[\s\S]*active\.playerId,active\.state\.discipline/);
  assert.doesNotMatch(js,/function\s+openMatchDetail/);
});

test("Phase 4 keeps aggregate SSOT and moves Personal Best presentation to results",()=>{
  assert.match(js,/api\.aggregate\(records,player,helpers\)/);
  assert.match(js,/displayedBestsFor\(records,player,state\.discipline\)/);
  assert.match(js,/active\.state\.tab==="analysis"\?analysisView/);
  assert.match(js,/data-hub-full-analysis/);
  assert.match(js,/data-hub-trends/);
  assert.doesNotMatch(js,/ファール率|foulRate/);
});

test("Phase 5 consolidates browsing, information, registration, and editing in Player Hub",()=>{
  assert.match(js,/data-cue-player-context/);
  assert.doesNotMatch(js,/data-settings-player-management-v2/);
  assert.match(html,/class="player-hub-info-v3"[^>]*data-stats-player/);
  assert.match(html,/class="player-hub-edit-v3"[^>]*data-edit-player/);
  assert.match(html,/window\.cueT\("player\.row\.infoAria"/);
  assert.equal(jaText("player.row.infoAria",{name:"X"}),"Xの情報を表示");
  assert.match(html,/window\.cueT\("player\.row\.editAria"/);
  assert.equal(jaText("player.row.editAria",{name:"X"}),"Xを編集");
  assert.match(js,/add\?\.style\.setProperty\("display","grid","important"\)/);
  assert.match(css,/data-cue-player-context="browse"/);
  assert.match(css,/grid-template-columns:minmax\(0,1fr\) 44px/);
  assert.match(css,/min-height:56px/);
  assert.match(html,/data-release-feature="cloud-sync" hidden/);
  assert.match(html,/\.settings-data-row-v1\[hidden\]\s*\{\s*display:\s*none/);
});

test("Player root observation work is coalesced to one animation frame",()=>{
  assert.match(js,/let playerReconcileQueued=false/);
  assert.match(js,/new MutationObserver\(schedulePlayerReconcile\)/);
});

test("discipline changes avoid repeating setup initialization and active-match storage parsing",()=>{
  assert.match(html,/if\(home\.classList\.contains\("match-setup-active-v3"\)\)return;/);
  assert.match(html,/classList\.contains\("match-setup-active-v3"\)\)\{trace\?\.mark\("active-match-guard:skipped"/);
});

test("Home is reduced to the resume card and the six discipline tiles (Decision 045 / Official 133; replaces the Phase 6 resume + new-match button composition)",()=>{
  assert.doesNotMatch(js,/home-new-match-v2|data-home-new-match-v2/);
  assert.doesNotMatch(js,/data-home-recent-match/);
  assert.doesNotMatch(css,/home-recent-v2/);
  assert.match(css,/#cueHomeV1:not\(\.match-setup-active-v3\) #cueDisciplineSwitcherV1\{display:grid!important;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
  assert.match(css,/\.cue-home-menu-v3\{display:none!important\}/);
});

test("a discipline tile opens the setup, and the setup no longer shows a discipline menu (Decision 045; replaces the integrated icon-only selector of Build 25 / 32)",()=>{
  assert.doesNotMatch(js,/match-discipline-active-v3/);
  assert.doesNotMatch(js,/種目を選択/);
  assert.doesNotMatch(js,/beginSwipe|endSwipe|swipeStart|lastSwipeAt|suppressSwipeClick/);
  assert.doesNotMatch(js,/insertAdjacentElement\("afterend",switcher\)/);
  assert.match(js,/cueMatchSetupBackV3"\)\?\.remove\(\)/);
  assert.match(html,/button\.classList\.toggle\("is-selected", selected\)/);
  assert.match(html,/button\.setAttribute\("aria-selected", String\(selected\)\)/);
  assert.match(html,/cueDisciplineSwitcherV1"\)\?\.addEventListener\("click",event=>\{if\(event\.target\.closest\("\[data-discipline\]"\)\)openSetup\(\)\}\)/);
  assert.match(css,/#cueHomeV1\.match-setup-active-v3 #cueDisciplineSwitcherV1\{display:none!important\}/);
});

test("player registration and editing use a full-screen screen without autofocus",()=>{
  assert.match(html,/\.player-editor-dialog-v1\{[^}]*width:100%;height:100%;max-height:none/);
  assert.match(html,/\.player-editor-close-v1\{[^}]*width:64px;min-height:44px/);
  assert.match(html,/aria-label="戻る">‹ 戻る/);
  assert.match(html,/saveButton\.textContent = player \? "変更" : "登録"/); // P2-5a-1: was existingSave.textContent=editing?... inside the MutationObserver callback
  assert.doesNotMatch(html,/existingSave\.textContent=/);
  assert.match(html,/existingDelete\?\.classList\.toggle\("hidden",!editing\)/);
  assert.match(html,/document\.activeElement\?\.blur\?\.\(\)/);
  assert.doesNotMatch(html,/setTimeout\(\(\)=>playerEditorName\.focus\(\),0\)/);
});

test("Phase 2-6 assets load last, ship natively, and remain offline",()=>{
  assert.ok(html.indexOf("navigation-phase2-6.js")>html.indexOf("navigation-shell-phase1.js"));
  for(const asset of ["navigation-phase2-6.js","navigation-phase2-6.css"]){assert.match(sw,new RegExp(asset.replace(".","\\.")));assert.match(build,new RegExp(asset.replace(".","\\.")));}
});

test("390px Hub contracts remain width-safe",()=>{
  assert.match(css,/max-width:520px/);
  assert.match(css,/@media\(max-width:390px\)/);
  assert.doesNotMatch(css,/(?:^|[;{])width:\s*(?:4\d\d|[5-9]\d\d)px/);
});
