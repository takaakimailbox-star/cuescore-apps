import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const existing=readFileSync(new URL("../ui-revision-v12.css",import.meta.url),"utf8");

test("discipline-fixed history targets the adopted compact height",()=>{
  assert.match(existing,/#playerMatchHistoryV2 \.pd13-fixed-discipline-match \{[\s\S]*grid-template-rows:auto auto auto !important/);
  assert.match(existing,/min-height:76px !important; column-gap:8px !important; row-gap:3px !important/);
});

test("compact override preserves six-character name, score, chevron and avatar contracts",()=>{
  assert.match(existing,/\.pd13-fixed-discipline-match \.journey-match-opponent-avatar-v3 \{ flex:0 0 32px; width:32px; height:32px; \}/);
  assert.match(existing,/\.pd13-fixed-discipline-match \.journey-match-opponent-v3 strong \{ min-width:0; overflow:hidden; font-size:14px; text-overflow:ellipsis; white-space:nowrap; \}/);
  assert.match(existing,/\.pd13-fixed-discipline-match \.journey-match-score-v3 \{ grid-area:score; flex:none; justify-self:end; padding-left:8px; font-size:17px; white-space:nowrap; \}/);
  assert.match(existing,/\.pd13-fixed-discipline-match \.journey-match-open-v3 \{ grid-area:chevron; \}/);
});

test("compact override does not change width or introduce horizontal scrolling",()=>{
  const block=existing.match(/#playerMatchHistoryV2 \.pd13-fixed-discipline-match \{([\s\S]*?)\}/)?.[1]||"";
  assert.doesNotMatch(block,/overflow-x/);
});
