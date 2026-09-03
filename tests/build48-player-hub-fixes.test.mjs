import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=name=>readFileSync(new URL(`../${name}`,import.meta.url),"utf8");
const hub=read("navigation-phase2-6.js");
const hubCss=read("navigation-phase2-6.css");
const legacyCss=read("player-detail-build6.css");
const cardCss=read("ui-revision-v12.css");
const html=read("index.html");

test("9-Ball and 10-Ball omit break-in rate from self bests and cap the shared list at three",()=>{
  assert.match(hub,/\["9ball","10ball"\]\.includes\(disciplineId\)&&best\.key==="breakInRate"/);
  assert.match(hub,/\}\)\.slice\(0,3\)/);
  assert.match(read("player-detail-build6.js"),/\["9ball","10ball"\]\.includes\(active\)&&best\.key==="breakInRate"/);
});

test("self best cards use one vertical column in both player detail renderers",()=>{
  assert.match(hubCss,/\.hub-bests-v2\{display:grid;grid-template-columns:1fr\}/);
  assert.match(legacyCss,/\.pd7-bests\.count-3,\.pd7-bests\.count-2,\.pd7-bests\.count-1\{grid-template-columns:1fr\}/);
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
