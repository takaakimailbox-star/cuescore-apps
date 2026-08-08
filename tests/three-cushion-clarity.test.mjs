import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(html, /const cell=points=>[\s\S]*?Number\(points\)>0\?Number\(points\):"-"/);
assert.doesNotMatch(html, /const cell=\(points,total\)/);
assert.doesNotMatch(html, /<i><\/i>/);
assert.match(html, /three-cushion-row-v1[\s\S]*?current-v1/);
assert.match(html, /html body \.three-cushion-game-v1 \.pro-scoreboard \.pro-player-panel\.active\{[\s\S]*?border:2px solid #363634!important/);
assert.match(html, /\.three-cushion-game-v1 \.three-cushion-row-v1 b\.current-v1\{[\s\S]*?border:2px solid #171717/);
assert.match(html, /id="threeCushionAddV1"/);
assert.match(html, /id="threeCushionSwitchV1"/);
assert.match(html, /id="threeCushionUndoV1"/);

console.log("3 Cushion clarity checks passed");
