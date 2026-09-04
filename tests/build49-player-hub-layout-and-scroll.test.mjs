import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=name=>readFileSync(new URL(`../${name}`,import.meta.url),"utf8");
const hub=read("navigation-phase2-6.js");
const hubCss=read("navigation-phase2-6.css");
const legacyCss=read("player-detail-build6.css");
const cardCss=read("ui-revision-v12.css");
const html=read("index.html");

test("self best renderers consume the approved metric contract and cap the shared list at three",()=>{
  assert.match(hub,/api\.bests\(records,player,disciplineId,helpers\)\.slice\(0,3\)/);
  const legacy=read("player-detail-build6.js");
  assert.match(legacy,/api\.bests\(records,player,active,helpers\)\.slice\(0,3\)/);
  for(const source of [hub,legacy]){
    assert.match(source,/breakPocketCount:"最高ブレイクポケット数"/);
    assert.match(source,/breakScore:"最高ブレイク得点"/);
  }
});

test("self best cards use one horizontal row in both player detail renderers",()=>{
  assert.match(hubCss,/\.hub-bests-v2\{display:grid;grid-auto-flow:column;grid-auto-columns:minmax\(0,1fr\)\}/);
  assert.match(legacyCss,/\.pd7-metrics\.count-3,\.pd7-bests\.count-3\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)\}/);
  assert.match(legacyCss,/\.pd7-metrics\.count-2,\.pd7-bests\.count-2\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/);
});

test("recent match result and a two-digit score occupy independent fixed minimum tracks",()=>{
  assert.match(cardCss,/match-card-c-recent-v37\{grid-template-columns:[^}]*36px minmax\(80px,auto\)/);
  assert.match(cardCss,/match-card-c-score-v37\{min-width:80px;text-align:right;white-space:nowrap\}/);
});

test("Match Detail owns an explicit iOS scroll height and starts at its top",()=>{
  const scroller=html.match(/\.match-detail-scroll-v1\{([\s\S]*?)\n\}/)?.[1]||"";
  assert.match(scroller,/flex:1 1 0/);
  assert.match(scroller,/height:0/);
  assert.match(scroller,/overflow-y:scroll/);
  assert.match(html,/class="match-detail-scroll-v1" tabindex="0" aria-label="試合詳細の内容"/);
  assert.match(html,/const detailScroll=overlay\.querySelector\("\.match-detail-scroll-v1"\);\s*if\(detailScroll\)detailScroll\.scrollTop=0/);
});

test("Match Detail escapes the clipped app shell and owns the screen above navigation",()=>{
  assert.match(html,/if\(overlay\.parentElement!==document\.body\)document\.body\.appendChild\(overlay\)/);
  assert.match(html,/body\.match-detail-visible-v1 \.cue-phase1-tab-bar\{display:none!important;pointer-events:none!important\}/);
  assert.match(html,/const visibleModals = \(\) => Array\.from\(document\.querySelectorAll\(modalSelectors\.join\(','\)\)\)\.filter\(isVisible\)/);
});
