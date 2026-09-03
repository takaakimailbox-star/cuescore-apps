import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const hub=readFileSync(new URL("../navigation-phase2-6.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../navigation-phase2-6.css",import.meta.url),"utf8");
const homeIcon=readFileSync(new URL("../assets/icons/navigation/nav-home.svg",import.meta.url),"utf8");

test("Home adopts the monochrome three-dot cue-ball icon and adjusted reach layout",()=>{
  assert.match(homeIcon,/aria-label="3ドット手球"/);
  assert.equal((homeIcon.match(/<ellipse /g)||[]).length,3);
  assert.doesNotMatch(homeIcon,/#(?:[0-9a-f]{3}){1,2}|gradient|filter/i);
  assert.match(css,/cue-home-brand-v1 \[data-cuescore-logo\]\{height:42px!important\}/);
  assert.match(css,/margin:calc\(clamp\(190px,38svh,330px\) - var\(--cue-home-logo-shift-v32,0px\)\) auto 0/);
});

test("Player root uses a small name badge and no avatar pin",()=>{
  const start=html.indexOf("renderPlayerLibrary = function() {");
  const end=html.indexOf("function openPlayerManagementV145",start);
  const renderer=html.slice(start,end);
  assert.match(renderer,/player-primary-badge-v1">メインプレーヤー/);
  assert.doesNotMatch(renderer,/player-primary-pin-v2/);
});

test("Player Hub discipline selector is six icon-only accessible tabs",()=>{
  assert.match(hub,/grid|selector=state/);
  assert.match(hub,/aria-label="\$\{item\.label\}"/);
  assert.doesNotMatch(hub,/<span>\$\{item\.label\}<\/span>/);
  assert.match(css,/\.hub-discipline-v2\{display:grid;grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
});

test("Settings root has no Back control and keeps compact legal/data content",()=>{
  const settingsStart=html.indexOf('root.className = "settings-formal-shell-v1"');
  const settingsEnd=html.indexOf("screen.appendChild(root)",settingsStart);
  const settings=html.slice(settingsStart,settingsEnd);
  assert.doesNotMatch(settings,/data-settings-home-back/);
  for(const label of ["バックアップ","データ復元","データ削除","About CueScore","利用規約","プライバシーポリシー"])assert.match(settings,new RegExp(label));
  assert.match(css,/Build 31 final-review batch: compact Settings root/);
  assert.match(css,/min-height:62px/);
});

test("text-selection protections remain while swipe interception is absent",()=>{
  assert.doesNotMatch(html,/interactiveTargetSelector\s*=|cue-edge-back-tracking-v3/);
  assert.match(html,/document\.addEventListener\("selectstart"/);
  assert.match(html,/input,textarea,\[contenteditable="true"\]/);
});
