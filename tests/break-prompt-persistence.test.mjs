import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const fn = name => { const start = html.indexOf(`function ${name}(`); assert.ok(start > 0, `${name} must exist`); return html.slice(start, html.indexOf("\n  }\n", start)); };

test("a Break prompt that is opened persists the snapshot at once (new match, Undo re-open, Resume re-open)", () => {
  assert.match(fn("showBreakResultPromptV61"), /overlay\.classList\.remove\("hidden"\);\s*markBreakResultHistoryV3\(\);[\s\S]*?if \(!options\.nextRack\) persistInProgressMatchV1\(\);\s*$/);
  assert.match(fn("restoreBreakPromptFromUndoV697"), /overlay\.classList\.remove\("hidden"\);\s*markBreakResultHistoryV3\(\);\s*persistInProgressMatchV1\(\);[^\n]*$/);
});

test("the next-rack prompt is not persisted twice: updateGame() already persists right after opening it", () => {
  assert.match(html, /showBreakResultPromptV61\(nextBreakerV1, nextRackNumberV1, \{ nextRack:true \}\)/);
  assert.match(fn("updateGame"), /persistInProgressMatchV1\(\);\s*$/);
});

test("persist keeps its live-context guard and is not a discard action; the persist triggers are unchanged", () => {
  const body = fn("persistInProgressMatchV1");
  assert.match(body, /if \(!currentGameSessionIdV104 \|\| !app\.classList\.contains\("pro-game-mode"\)\) return;/);
  assert.match(body, /state:snapshot\(\)/);
  assert.match(html, /document\.addEventListener\("visibilitychange", \(\) => \{ if \(document\.hidden\) persistInProgressMatchV1\(\); \}\);/);
  assert.match(html, /window\.addEventListener\("pagehide", persistInProgressMatchV1\);/);
});

test("the snapshot schema, snapshot() fields and the Restore read side are unchanged", () => {
  assert.match(html, /const IN_PROGRESS_MATCH_SCHEMA_V1 = 1/);
  assert.match(fn("snapshot"), /pendingBreakPlayerV61, pendingBreakRackV61, pendingBreakResultV695, pendingBreakPushOutV695/);
  assert.match(fn("restoreInProgressMatchV1"), /restoreBreakPromptFromUndoV697\(\{/);
  assert.doesNotMatch(fn("persistInProgressMatchV1"), /language|cueScore\.language/i);
});

test("the prompt-open persist writes only the snapshot: it never confirms or saves a Break result", () => {
  for (const name of ["showBreakResultPromptV61", "restoreBreakPromptFromUndoV697"]) assert.doesNotMatch(fn(name), /saveBreakResultV61\(|recordAnalysisEventV60\(|appendCommonEventV700\(/);
});
