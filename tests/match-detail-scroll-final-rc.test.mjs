import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("Match Detail uses the live visual viewport instead of a fixed 100dvh scroll boundary",()=>{
  const overlay=html.match(/\.record-detail-overlay\.match-detail-overlay-v1\{([\s\S]*?)\n\}/)?.[1]||"";
  assert.match(overlay,/position:fixed!important/);
  assert.match(overlay,/height:var\(--cue-visual-height,100dvh\)!important/);
  assert.match(overlay,/min-height:var\(--cue-visual-height,100dvh\)!important/);
  assert.match(overlay,/max-height:var\(--cue-visual-height,100dvh\)!important/);
  assert.doesNotMatch(overlay,/(?:height|min-height|max-height):100dvh!important/);
  assert.match(html,/window\.visualViewport\?\.addEventListener\('resize', syncVisualHeight/);
  assert.match(html,/window\.visualViewport\?\.addEventListener\('scroll', syncVisualHeight/);
});

test("Match Detail has one bounded vertical scroll container with safe-area clearance",()=>{
  const scroller=html.match(/\.match-detail-scroll-v1\{([\s\S]*?)\n\}/)?.[1]||"";
  assert.match(scroller,/flex:1 1 auto/);
  assert.match(scroller,/min-height:0/);
  assert.match(scroller,/overflow-y:auto/);
  assert.match(scroller,/overflow-x:hidden/);
  assert.match(scroller,/overscroll-behavior:contain/);
  assert.match(scroller,/touch-action:pan-y/);
  assert.match(scroller,/-webkit-overflow-scrolling:touch/);
  assert.match(scroller,/max\(24px,env\(safe-area-inset-bottom\)\)/);
  assert.match(html,/\.match-detail-v1\{[\s\S]*?display:flex;[\s\S]*?flex-direction:column;[\s\S]*?overflow:hidden!important/);
  assert.match(html,/body\.match-detail-visible-v1\{overflow:hidden!important\}/);
});

test("all six disciplines continue to use the same formal Match Detail path",()=>{
  for(const discipline of ["9ball","10ball","rotation","jpa9","straightPool","threeCushion"]){
    assert.ok(html.includes(`id:"${discipline}"`),`missing ${discipline} Match Detail definition`);
  }
  assert.match(html,/window\.openMatchDetailV1=openMatchDetailV1/);
  assert.match(html,/const history=resultMode\?"":gameHistoryV1\(record\)/);
  assert.match(html,/class="match-detail-game-history-v1" aria-label="ゲーム履歴"/);
});

test("Game Result and other overlays keep their independent scroll rules",()=>{
  assert.match(html,/\.official-result-scroll-v1\{[\s\S]*?overflow-y:auto/);
  assert.match(html,/\.player-stats-body\{[\s\S]*?overflow-y:auto/);
  assert.doesNotMatch(html,/\.official-result-scroll-v1[^}]*--cue-visual-height/);
});

console.log("Match Detail Final RC scroll regression checks passed");
