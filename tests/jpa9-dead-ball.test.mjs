import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(html, /id="jpaDeadBtnV1"[^>]*aria-label="直前に選択したボールをデッドにする"[^>]*hidden disabled/);
assert.match(html, /function canMarkJPADeadV1\(\)[\s\S]*?ball >= 1 && ball <= 8/);
assert.match(html, /function markLastJPA9BallDeadV1\(\)[\s\S]*?deadBallsV1\.add\(ball\)/);
assert.match(html, /items\[Number\(target\.itemIndex\)\] = \{type:"jpa_dead",ball\}/);
assert.match(html, /analysisEvent\.points = 0;[\s\S]*?analysisEvent\.dead = true/);
assert.match(html, /commonEvent\.data\.points = 0;[\s\S]*?commonEvent\.data\.dead = true/);
assert.match(html, /state:"used"[\s\S]*?jpa-dead-ball-v1/);
assert.match(html, /jpaLastPocketV1:jpaLastPocketV1 \? JSON\.parse/);
assert.match(html, /jpaDeadEventsV1:JSON\.parse/);
assert.match(html, /deadBallEvents:JSON\.parse\(JSON\.stringify\(jpaDeadEventsV1\)\)/);
assert.match(html, /jpaDeadButton\.hidden = !isJPA9V1\(\)/);
assert.match(html, /el\("jpaDeadBtnV1"\)\?\.addEventListener\("click", markLastJPA9BallDeadV1\)/);
assert.doesNotMatch(html, />D<|>DEAD</);

console.log("JPA 9-Ball dead-ball checks passed");
