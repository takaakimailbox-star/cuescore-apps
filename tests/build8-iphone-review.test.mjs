import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const playerDetail=readFileSync(new URL("../player-detail-build6.js",import.meta.url),"utf8");
const plist=readFileSync(new URL("../ios/App/App/Info.plist",import.meta.url),"utf8");

test("native Take Photo declares the required iOS camera privacy purpose",()=>assert.match(plist,/<key>NSCameraUsageDescription<\/key>[\s\S]*プロフィール写真/));
test("photo completion returns directly to the active Player editor",()=>assert.match(html,/chooser\.setPhotoV5\(avatar\);\s*chooser\.classList\.add\("hidden"\);\s*updatePlayerEditorAvatarPreviewV2\(\);/));
test("Player deletion lives in edit mode and not Player information",()=>{assert.match(html,/playerEditorDeleteBtn"\)\.classList\.toggle\("hidden", !player\)/);assert.doesNotMatch(playerDetail,/data-player-detail-delete/);});
test("discipline detail removes recent matches and adds the official icon to its title",()=>{assert.doesNotMatch(playerDetail,/最近の試合/);assert.match(playerDetail,/header\(`\$\{def\(active\)\.label\} 詳細`,"",def\(active\)\.asset\)/);});
test("discipline-fixed history hides selectors, compacts actions and returns one level",()=>{assert.match(html,/\.pd8-discipline-fixed \.player-history-disciplines-v4\{display:none!important\}/);assert.match(playerDetail,/openPlayerMatchHistoryV2\?\.\(state\.playerId,state\.discipline\)/);assert.match(playerDetail,/render\(historyRoot\.dataset\.pd8PlayerId,"detail",historyRoot\.dataset\.pd8Discipline\)/);assert.match(playerDetail,/detail\.textContent="詳細"/);assert.match(playerDetail,/analysis\.textContent="分析"/);});
test("3 Cushion keeps zero as dash, leaves pending cells blank and uses one three-column action row",()=>{assert.match(html,/const cell=points=>points==null\?"":Number\.isFinite/);assert.match(html,/\.three-cushion-actions-v1\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);assert.match(html,/\.three-cushion-actions-v1 \.three-cushion-undo-v1\{grid-column:auto/);});
test("edge Back tracks the finger and has completion and cancellation",()=>{assert.match(html,/cue-edge-back-tracking-v3/);assert.match(html,/--cue-edge-back-x/);assert.match(html,/cancelInteractiveBack/);assert.match(html,/setProperty\("--cue-edge-back-x","100vw"\)/);});
test("break completion targets the current rack divider or row",()=>assert.match(html,/\.pro-rack-divider\[data-rack="\$\{currentRack\}"\],\.pro-log-row\[data-rack="\$\{currentRack\}"\]/));
