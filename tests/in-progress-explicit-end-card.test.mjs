import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("explicit end from the match (Back + OK) re-renders the Home resume card right after clearing the snapshot", () => {
  assert.match(html, /function requestBackToPlayerInfo\(\)[\s\S]*?confirm\(window\.cueT\("p3\.3961ce36"\)\)\) return;\s*clearInProgressMatchV1\(\);\s*renderInProgressHomeCardV1\(\);/);
});

test("abandoning a new match from the break prompt re-renders the Home resume card right after clearing the snapshot", () => {
  assert.match(html, /function interruptNewMatchFromBreakV3\(\)[\s\S]*?currentGameRecordIdV100 = null;\s*clearInProgressMatchV1\(\);\s*renderInProgressHomeCardV1\(\);/);
});

test("replacement of an interrupted match keeps its existing clear + re-render contract", () => {
  assert.match(html, /cueInProgressNewV1"\)\?\.addEventListener\("click",\(\)=>\{[\s\S]*?clearInProgressMatchV1\(\);\s*renderInProgressHomeCardV1\(\);\s*allowNewMatchAfterChoiceV1=true;/);
});

test("storage contract is unchanged: clearing only removes the in-progress key, the card is hidden when no snapshot exists", () => {
  assert.match(html, /function clearInProgressMatchV1\(\) \{\s*try \{ localStorage\.removeItem\(inProgressMatchStorageKeyV1\(\)\); \}/);
  assert.match(html, /const payload=readInProgressMatchV1\(\);\s*card\.hidden=!payload;\s*if\(!payload\)return false;/);
  assert.match(html, /const IN_PROGRESS_MATCH_KEY_V1 = "cueScore\.inProgressMatch\.v1"/);
  assert.match(html, /const IN_PROGRESS_MATCH_SCHEMA_V1 = 1/);
});
