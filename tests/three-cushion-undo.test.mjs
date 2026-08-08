import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(html, /id="threeCushionActionsV1"[\s\S]*id="threeCushionUndoV1"/);
assert.match(html, /id="threeCushionUndoV1"[^>]*aria-label="ゲームの進行を1つ戻す"[^>]*disabled/);
assert.match(html, /function addThreeCushionPointV1\([\s\S]*?saveAndDo\(/);
assert.match(html, /function switchThreeCushionPlayerV1\([\s\S]*?saveAndDo\(/);
assert.match(html, /threeCushionUndoButton\.disabled = undoHistory\.length === 0/);
assert.match(html, /el\("threeCushionUndoV1"\)\?\.addEventListener\("click", undo\)/);
assert.match(html, /\.three-cushion-undo-v1\{grid-column:1\/-1/);

console.log("3 Cushion undo checks passed");
