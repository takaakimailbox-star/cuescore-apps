import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(
  html,
  /if\(discipline==="9ball"\|\|discipline==="10ball"\)/,
  "9-Ball and 10-Ball must both use the shared rack-progress branch"
);
assert.match(
  html,
  /discipline==="10ball"\?record\?\.tenBall\?\.rackResults:record\?\.nineBall\?\.rackResults/,
  "10-Ball must support its discipline-specific rack-results archive"
);
assert.match(
  html,
  /const targetBall=recordDisciplineV2\(record\)==="10ball"\?10:9;/,
  "10-Ball run-outs must be validated with the 10 ball"
);
assert.match(
  html,
  /\["9ball","10ball"\]\.includes\(disciplineV4\) \? \[/,
  "9-Ball and 10-Ball must share the same three-row result summary"
);
assert.match(html, /\["マスワリ回数",String\(masuwariV4\[1\]\),String\(masuwariV4\[2\]\)\]/);
assert.match(html, /\["ファール回数",Number\.isFinite/);

console.log("10-Ball result/detail parity checks passed.");
