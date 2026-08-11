import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("Break completion reveals the current rack only after the existing close lifecycle completes",()=>{
  assert.match(html,/revealLatestGameLogAfterBreakV1 = true;\s*closeBreakResultPromptV61\(\);/);
  assert.match(html,/overlay\.classList\.add\("hidden"\);[\s\S]*if \(revealLatestGameLogAfterBreakV1\) \{[\s\S]*revealCurrentGameLogPositionV1\(\);/);
  assert.doesNotMatch(html,/function undo\([\s\S]{0,800}revealCurrentGameLogPositionV1/);
  assert.doesNotMatch(html,/dismissOfficialResultToGameV1\([\s\S]{0,1200}revealCurrentGameLogPositionV1/);
});

test("Game history rows expose rack and inning anchors",()=>{
  assert.match(html,/divider\.dataset\.rack = String\(rowData\.rack\);/);
  assert.match(html,/row\.dataset\.rack = String\(rowData\.rack\);/);
  assert.match(html,/row\.dataset\.inning = String\(rowData\.inning\);/);
});

test("Current-rack reveal scrolls only the history container to its latest row",()=>{
  const start=html.indexOf("  function revealCurrentGameLogPositionV1()");
  const end=html.indexOf("\n\n  // CueScore RC59",start);
  assert.ok(start>=0&&end>start);
  class FakeHTMLElement{}
  const first=new FakeHTMLElement(),latest=new FakeHTMLElement();
  latest.getBoundingClientRect=()=>({bottom:900});
  const calls=[];
  const log={scrollTop:0,scrollLeft:0,scrollHeight:1000,clientHeight:416,lastElementChild:latest,
    getBoundingClientRect:()=>({bottom:500}),
    querySelectorAll:selector=>selector.includes('data-rack="4"')?[first,latest]:[],
    querySelector:()=>latest,
    scrollTo:value=>calls.push(value)};
  const context={HTMLElement:FakeHTMLElement,rack:4,el:id=>id==="proTurnLog"?log:null,isThreeCushionV1:()=>false};
  vm.runInNewContext(`${html.slice(start,end)}\nrevealCurrentGameLogPositionV1();`,context);
  assert.deepEqual(JSON.parse(JSON.stringify(calls)),[{top:408,left:0,behavior:"auto"}]);
});

test("Break prompt scope remains 9-Ball, 10-Ball, Rotation and JPA while 14-1 and 3C stay excluded",()=>{
  assert.match(html,/if \(recordingModeV611 !== "detail" \|\| gameEnded \|\| reviewMode \|\| isStraightPoolV1\(\)\) return;/);
  assert.match(html,/if \(!threeCushionModeV1 && !straightPoolModeV1 && recordingModeV611 === "detail"\)/);
});
