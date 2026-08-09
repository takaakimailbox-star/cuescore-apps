import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

assert.match(html,/const WINNER_INK = "#171717"/);
assert.match(html,/\.match-detail-result-line-v2 strong\.winner,[\s\S]*?color:var\(--cue-foundation-ink\)!important/);
assert.doesNotMatch(html,/const WALNUT = "#6f3214"/);

assert.match(html,/disciplineV4==="rotation" \? \[\s*shotRowV4,highRunRowV4,foulRowV4/);
assert.match(html,/disciplineV4==="straightPool" \? \[\s*shotRowV4,highRunRowV4,\["平均得点／イニング"[\s\S]*?foulRowV4/);
assert.match(html,/disciplineV4==="jpa9" \? \[\s*\["イニング数",inningsCountV1\(record,1\),inningsCountV1\(record,2\)\],shotRowV4,highRunRowV4,foulRowV4/);
assert.match(html,/completedTurns:Number\(stats\.completedTurns\?\.\[1\]\?\?stats\.turnCount\?\.\[1\]\?\?0\)/);
assert.match(html,/function inningsCountNumberV1\(record,player\)/);
assert.match(html,/const storedAverage=Number\(record\?\.players\?\.\[player\]\?\.average\)/);

console.log("Discipline-specific match summary checks passed.");
