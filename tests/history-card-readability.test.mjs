import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const revision = await readFile(new URL("../ui-revision-v12.js", import.meta.url), "utf8");
const css = await readFile(new URL("../ui-revision-v12.css", import.meta.url), "utf8");

test("global history keeps seven tabs, both player lanes, score, chevron, and card navigation", () => {
  assert.match(index, /const recordsDisciplineDefsV2\s*=\s*\[/);
  assert.equal((index.match(/<button[^>]+data-records-discipline-v2=/g) || []).length, 7);
  assert.match(index, /record-matchup[^`]+record-match-player-v3[^`]+record-match-player-v3/);
  assert.match(index, /record-final-score/);
  assert.match(index, /record-race-v2"><img class="record-game-icon-v2"[^>]+>Race to/);
  assert.match(index, /record-chevron-v1/);
  assert.match(index, /installRecordsDelegatedClickV154\(\)/);
});

test("global history places the discipline icon beside Race to",()=>{
  assert.match(index,/grid-template-areas:"date race chevron" "matchup score chevron"!important/);
  assert.match(index,/\.record-race-v2\{grid-area:race;display:flex;align-items:center;justify-content:flex-end;gap:5px/);
});

test("global history reserves equal player lanes sized for six full-width characters", () => {
  assert.match(index, /grid-template-columns:minmax\(0,1fr\) auto minmax\(0,1fr\)!important/);
  assert.match(index, /font-size:clamp\(13px,3\.35vw,15px\)!important/);
  assert.match(index, /record-match-player-v3\{display:flex;min-width:0/);
  assert.match(index, /record-match-player-v3 strong\{min-width:0;overflow:hidden;text-overflow:ellipsis/);
});

test("discipline-fixed history uses the C balance with date, result, opponent, score, race and chevron", () => {
  assert.match(revision, /label=`\$\{def\(active\)\.label\}の全試合`/);
  assert.doesNotMatch(revision, /journey-game-v2"\)\?\.remove/);
  assert.match(revision, /if\(disciplineFixed\)[\s\S]+journey-match-vs-v3/);
  assert.match(revision, /row\.dataset\.pd13DetailLabel/);
  assert.match(css, /grid-template-areas:'date date date date result chevron' 'avatar opponent game race score chevron'/);
  assert.match(css, /match-card-c-all-matches-v37 \.journey-match-race-v3\{grid-area:race!important/);
  assert.match(css, /\.pd13-fixed-discipline-match \.journey-match-vs-v3 \{ display:none; \}/);
});

test("discipline-fixed history preserves six-character opponent space and detail path", () => {
  assert.match(css, /match-card-c-all-matches-v37 \.journey-match-opponent-v3>strong\{grid-area:opponent!important;font-size:14px/);
  assert.match(css, /match-card-c-all-matches-v37 \.journey-match-score-v3\{grid-area:score!important/);
  assert.match(css, /match-card-c-all-matches-v37 \.journey-match-open-v3\{grid-area:chevron!important/);
  assert.match(index, /data-player-record-id/);
  assert.match(index, /window\.openHistoricalRecordV2\s*=\s*openHistoricalRecord/);
  assert.match(index, /match-detail-race-v2/);
});
