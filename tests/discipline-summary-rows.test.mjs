import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

assert.match(html,/const WINNER_INK = "#171717"/);
assert.match(html,/\.match-detail-result-line-v2 strong\.winner,[\s\S]*?color:var\(--cue-foundation-ink\)!important/);
assert.doesNotMatch(html,/const WALNUT = "#6f3214"/);

assert.match(html,/disciplineV4==="rotation" \? \[\s*shotRowV4,highRunRowV4,foulRowV4/);
assert.match(html,/disciplineV4==="straightPool" \? \[\s*averageRowV4,highRunRowV4,foulRowV4/);
assert.match(html,/disciplineV4==="jpa9" \? \[\s*averageRowV4,highRunRowV4,foulRowV4/);
assert.match(html,/\] : \[inningsRowV4,highRunRowV4,averageRowV4\];/);
assert.match(html,/completedTurns:Number\(stats\.completedTurns\?\.\[1\]\?\?stats\.turnCount\?\.\[1\]\?\?0\)/);
assert.match(html,/function inningsCountNumberV1\(record,player\)/);
assert.match(html,/const storedAverage=Number\(record\?\.players\?\.\[player\]\?\.average\)/);
assert.match(html,/const jpaResultRowsV1=disciplineV4==="jpa9"/);

console.log("Discipline-specific match summary checks passed.");
