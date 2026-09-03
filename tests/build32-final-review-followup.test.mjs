import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=readFileSync(new URL("../navigation-phase2-6.css",import.meta.url),"utf8");
const homeIcon=readFileSync(new URL("../assets/icons/navigation/nav-home.svg",import.meta.url),"utf8");
const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");

test("Home lowers the existing logo without moving New Match or Bottom Navigation",()=>{
  assert.match(css,/--cue-home-logo-shift-v32:30px/);
  assert.match(css,/padding:calc\(8px \+ var\(--cue-home-logo-shift-v32\)\) 0 18px/);
  assert.match(css,/calc\(clamp\(190px,38svh,330px\) - var\(--cue-home-logo-shift-v32,0px\)\)/);
});

test("Home icon uses three perspective ellipses and a lighter monochrome outline",()=>{
  assert.equal((homeIcon.match(/<ellipse /g)||[]).length,3);
  assert.match(homeIcon,/stroke-width="5\.5"/);
  assert.match(homeIcon,/rx="10" ry="4\.8"/);
  assert.match(homeIcon,/rx="4\.9" ry="9\.4"/);
  assert.match(homeIcon,/rotate\(-28 34\.5 69\)/);
  assert.doesNotMatch(homeIcon,/#(?:[0-9a-f]{3}){1,2}|gradient|filter|shadow/i);
});

test("New Match moves its main content down as one layout without forcing the start button to the viewport edge",()=>{
  assert.match(css,/--cue-new-match-main-shift-v32:30px/);
  assert.match(css,/padding:var\(--cue-new-match-main-shift-v32\) 2px 16px/);
  assert.doesNotMatch(css,/cue-home-start-v2\{transform:translateY/);
});

test("Player journey visibility synchronizes hidden, aria-hidden, and hit testing",()=>{
  assert.match(html,/function show\(root\)\{root\.classList\.remove\("hidden"\);root\.setAttribute\("aria-hidden","false"\)/);
  assert.match(html,/function hide\(root\)\{root\.classList\.add\("hidden"\);root\.setAttribute\("aria-hidden","true"\);\}/);
  assert.doesNotMatch(html,/CueScoreEdgeBack|cue-edge-back/);
});

test("changed layout assets use a fresh app-shell version",()=>{
  assert.match(html,/navigation-phase2-6\.css\?v=2\.0-build56-history-names/);
  assert.match(html,/navigation-phase2-6\.js\?v=2\.0-build56-history-names/);
  assert.match(sw,/APP_VERSION = "2\.0-build56-history-names"/);
});
