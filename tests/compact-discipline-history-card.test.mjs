import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const css=readFileSync(new URL("../navigation-shell-phase1.css",import.meta.url),"utf8");
const existing=readFileSync(new URL("../ui-revision-v12.css",import.meta.url),"utf8");

test("discipline-fixed history targets the adopted compact height",()=>{
  assert.match(css,/#playerMatchHistoryV2 \.pd13-fixed-discipline-match\{[\s\S]*min-height:98px!important;max-height:105px!important/);
  assert.match(css,/row-gap:6px!important;padding:9px 12px!important/);
});

test("compact override preserves six-character name, score, chevron and avatar contracts",()=>{
  assert.match(existing,/\.pd13-fixed-discipline-match \.journey-match-opponent-avatar-v3 \{ flex:0 0 32px; width:32px; height:32px; \}/);
  assert.match(existing,/\.pd13-fixed-discipline-match \.journey-match-opponent-v3 strong \{ min-width:0; overflow:hidden; font-size:14px; text-overflow:ellipsis; white-space:nowrap; \}/);
  assert.match(existing,/\.pd13-fixed-discipline-match \.journey-match-score-v3 \{ grid-area:score; flex:none; justify-self:end; padding-left:8px; font-size:17px; white-space:nowrap; \}/);
  assert.match(existing,/\.pd13-fixed-discipline-match \.journey-match-open-v3 \{ grid-area:chevron; \}/);
});

test("compact override does not change width or introduce horizontal scrolling",()=>{
  const block=css.match(/#playerMatchHistoryV2 \.pd13-fixed-discipline-match\{([\s\S]*?)\}/)?.[1]||"";
  assert.doesNotMatch(block,/width|overflow-x|font-size|avatar/);
});
