import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const screen=html.match(/<section class="records-screen[\s\S]*?<section id="recordDetailOverlay"/)?.[0]||"";

test("global match history uses the adopted list title",()=>{
  assert.match(screen,/<h1>試合履歴一覧<\/h1>/);
});

test("global match history exposes no search, filter, or sort controls",()=>{
  assert.doesNotMatch(screen,/recordsSearchInput|recordsFilterToggleV1|recordsSortSelectV1|recordsAdvancedFiltersV1/);
  assert.doesNotMatch(screen,/>絞り込み<|>新しい順<|対戦相手・日付を検索/);
});

test("all six discipline tabs and the all tab remain in official order",()=>{
  assert.deepEqual([...screen.matchAll(/data-records-discipline-v2="([^"]+)"/g)].map(match=>match[1]),[
    "all","9ball","10ball","rotation","straightPool","jpa9","threeCushion"
  ]);
});

test("count is immediately followed by the history list without an advanced panel",()=>{
  assert.match(screen,/id="recordsCount">0試合<\/strong>[\s\S]*?<\/div>\s*<\/div>\s*<div class="records-list" id="recordsList">/);
});

test("history ordering is fixed newest-first with match id as deterministic tie-break",()=>{
  assert.match(html,/const timeOrder = \(Number\.isFinite\(bTime\) \? bTime : 0\) - \(Number\.isFinite\(aTime\) \? aTime : 0\)/);
  assert.match(html,/return timeOrder \|\| String\(a\.id \|\| ""\)\.localeCompare\(String\(b\.id \|\| ""\), "ja"\)/);
  assert.doesNotMatch(html,/recordsSortOrderV1/);
});

test("discipline filtering, tab count, empty state, and Match Detail entry remain wired",()=>{
  assert.match(html,/recordsDisciplineV2 === "all" \|\| recordDisciplineV2\(record\) === recordsDisciplineV2/);
  assert.match(html,/count\.textContent = `\$\{records\.length\}試合`/);
  assert.match(html,/まだ対戦履歴はありません/);
  assert.match(html,/openHistoricalRecord\(recordButton\.dataset\.recordId\)/);
});
