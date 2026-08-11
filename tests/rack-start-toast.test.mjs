import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("Rack start toast keeps start and breaker information in separate elements",()=>{
  assert.match(html,/toast\.innerHTML = `<strong>\$\{title\}<\/strong><span>\$\{message\}<\/span>`/);
  assert.match(html,/\.toast\.rack-transition-toast-v1 \{[\s\S]*?flex-direction: column;[\s\S]*?gap: 2px;/);
  assert.match(html,/\.toast\.rack-transition-toast-v1 strong \{ white-space: nowrap; \}/);
  assert.match(html,/\.toast\.rack-transition-toast-v1 span \{[\s\S]*?white-space: normal;[\s\S]*?overflow-wrap: anywhere;/);
});

test("Rack 1 and later racks share the same toast formatter",()=>{
  assert.match(html,/function showRackStartToastV1\(rackNumber, breaker\)/);
  assert.match(html,/showToast\(`Rack \$\{safeRack\}を開始`, `\$\{playerName\(safeBreaker\)\}がブレイクします`\)/);
  assert.match(html,/showRackStartToastV1\(1,startingPlayer\);/);
  assert.match(html,/showRackStartToastV1\(nextRackNumberV1,nextBreakerV1\);/);
});

test("Rack 1/4 and Player 1/2 produce the adopted two-line text with a long name",()=>{
  const start=html.indexOf("  function showRackStartToastV1(");
  const end=html.indexOf("\n\n  function openPlayerInfo",start);
  assert.ok(start>=0&&end>start);
  const calls=[],classes=[];
  const context={
    showToast:(title,message)=>calls.push([title,message]),
    playerName:player=>player===2?"石塚 貴章 ロングネーム":"Player 1",
    document:{querySelector:()=>({classList:{add:value=>classes.push(value)}})}
  };
  vm.runInNewContext(`${html.slice(start,end)}\nshowRackStartToastV1(1,1);showRackStartToastV1(4,2);`,context);
  assert.deepEqual(calls,[["Rack 1を開始","Player 1がブレイクします"],["Rack 4を開始","石塚 貴章 ロングネームがブレイクします"]]);
  assert.deepEqual(classes,["rack-transition-toast-v1","rack-transition-toast-v1"]);
});

test("Existing toast timing, animation, position and color remain unchanged",()=>{
  assert.match(html,/top: calc\(18px \+ env\(safe-area-inset-top\)\);/);
  assert.match(html,/animation: toastIn \.25s ease-out;/);
  assert.match(html,/background: rgba\(23,23,23,\.96\);\s*color: #fff;/);
  assert.match(html,/\}, 1900\);/);
});

test("Rack notification remains on the shared Break path for four disciplines only",()=>{
  assert.match(html,/if \(!threeCushionModeV1 && !straightPoolModeV1 && recordingModeV611 === "detail"\)/);
  assert.match(html,/if \(recordingModeV611 !== "detail" \|\| gameEnded \|\| reviewMode \|\| isStraightPoolV1\(\)\) return;/);
});
