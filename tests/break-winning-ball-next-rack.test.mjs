import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(html, /\(isNineBallV1\(\) && decision\.pocketedBalls\.includes\(9\)\) \|\|\s*\(isTenBallV1\(\) && decision\.pocketedBalls\.includes\(10\)\)/);
assert.match(html, /completeNineBallRackV1\(player, isTenBallV1\(\) \? "legalBreakTen" : "legalBreakNine"/);
assert.match(html, /decision\.foul && decision\.pocketedBalls\.includes\(10\)\) spotTenBallV1\("break_foul", player\)/);
assert.doesNotMatch(html, /if \(decision\.pocketedBalls\.includes\(10\)\) spotTenBallV1/);
assert.match(html, /isRackGameV1\(\) && \(decision\.foul \|\| decision\.pocketedBalls\.length === 0\)/);
assert.doesNotMatch(html, /decision\.pocketedBalls\.filter\(ball => !\(isTenBallV1\(\) && ball === 10\)\)/);
assert.match(html, /showRackStartToastV1\(nextRackNumberV1,nextBreakerV1\)/);
assert.match(html, /\.toast\.rack-transition-toast-v1[\s\S]*?z-index: 20020/);
assert.match(html, /classList\.add\("rack-transition-toast-v1"\)/);
assert.match(html, /showBreakResultPromptV61\(nextBreakerV1, nextRackNumberV1, \{ nextRack:true \}\)/);
assert.match(html, /if \(!rackEnded \|\| gameEnded \|\| reviewMode\) return/);
assert.match(html, /classList\.contains\("hidden"\) \|\| el\("breakResultOverlayV61"\)\?\.classList\.contains\("is-closing-v2"\)/);

console.log("9-Ball and 10-Ball break winning-ball transition checks passed");
