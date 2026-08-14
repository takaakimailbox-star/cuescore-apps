import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const phase3=html.match(/<style id="faIphone003Phase3PaintSafetyV1">([\s\S]*?)<\/style>/)?.[1]||"";

test("Home resume card stays on the normal iOS paint invalidation path",()=>{
  assert.ok(phase3);
  const scrollRule=phase3.match(/\.cue-home-v1,[\s\S]*?\}/)?.[0]||"";
  assert.match(scrollRule,/-webkit-overflow-scrolling:\s*auto/);
  assert.doesNotMatch(scrollRule,/transform|translateZ|will-change|contain\s*:/);
});

test("Player Library removes the shared stale scroll layer and paint containment",()=>{
  assert.match(phase3,/\.player-management-formal-v1 \.player-library-list,[\s\S]*?\.player-selection-formal-v1 \.player-library-list[\s\S]*?-webkit-overflow-scrolling:\s*auto/);
  assert.match(phase3,/#playerLibraryList\s*\{\s*contain:\s*none/);
  assert.match(phase3,/#playerLibraryOverlay,[\s\S]*?#playerLibraryList > \*[\s\S]*?content-visibility:\s*visible/);
});

test("fresh startup still writes both Player names synchronously before returning",()=>{
  const render=html.match(/function renderInProgressHomeCardV1\(\) \{([\s\S]*?)\n  \}/)?.[1]||"";
  assert.ok(render);
  assert.match(render,/cueResumePlayer1V1"\)\.textContent=player1/);
  assert.match(render,/cueResumePlayer2V1"\)\.textContent=player2/);
  assert.doesNotMatch(render,/setTimeout|requestAnimationFrame|Promise|queueMicrotask/);
});

test("Home return keeps the existing card DOM without a navigation-time rewrite",()=>{
  const close=html.match(/function closePlayerLibrary\([^)]*\)\s*\{([\s\S]*?)\n  \}/)?.[1]||"";
  assert.ok(close);
  assert.doesNotMatch(close,/renderInProgressHomeCardV1|initializePlayerUiV1|textContent/);
});

test("Compact Card v4 dimensions and spacing remain unchanged",()=>{
  assert.match(html,/\.cue-resume-card-v1\{[^}]*min-height:64px!important/);
  assert.match(html,/\.cue-resume-game-v4 img\{width:34px;height:34px\}/);
  assert.match(html,/\.cue-resume-player-v4 img\{width:24px;height:24px/);
  assert.match(html,/\.cue-resume-matchup-v4\{[^}]*gap:5px/);
  assert.doesNotMatch(html,/\.cue-resume-game-v4\{[^}]*border-right/);
  assert.match(html,/\.cue-resume-action-v1\{[^}]*white-space:nowrap/);
});

test("Phase 3 adds no forced reflow, timer repaint or data-path workaround",()=>{
  assert.doesNotMatch(phase3,/offsetWidth|offsetHeight|getBoundingClientRect|animation/);
  const phase3Scripts=html.match(/FA-IPHONE-003 Phase 3[\s\S]{0,1600}/)?.[0]||"";
  assert.doesNotMatch(phase3Scripts,/setTimeout|setInterval|requestAnimationFrame|readPlayerLibrary\(/);
});
