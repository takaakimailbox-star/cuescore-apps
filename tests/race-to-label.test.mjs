import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

// Race to label fix (9-Ball / 10-Ball scorecard): the Race to line shows only "Race to <goal>"; ball-in-hand is a separate badge; foul data and log are untouched.
const html = globalThis.__p3RawReadFileSync.call(fs, new URL("../index.html", import.meta.url), "utf8");

test("RT-1: the rack-game Race to label no longer carries 'Ball in hand' or '2 Fouls' / '3 Fouls!'", () => {
  const fn = html.slice(html.indexOf("function nineBallGoalLabelV1"), html.indexOf("function nineBallNoticeV1"));
  assert.match(fn, /return "Race to";/);
  assert.ok(!/notices|Fouls|e2e7544e/.test(fn), "no notice text in the label function");
  assert.ok(!html.includes("`Race to · "), "no 'Race to · ...' template remains");
  assert.ok(!html.includes('classList.toggle("nine-ball-status-v1"'), "the status-colour toggle on the label is gone");
});

test("RT-2: ball-in-hand keeps its existing catalog key on a separate badge, only for 9-Ball / 10-Ball; the goal value is still read from the match goals", () => {
  assert.match(html, /function nineBallNoticeV1\(player\) \{\s*if \(!isRackGameV1\(\)\) return "";\s*return Number\(activeRackStateV1\(\)\.ballInHandFor\) === Number\(player\) \? window\.cueT\("p3\.e2e7544e"\) : "";/);
  assert.match(html, /id="proP1NoticeV1" hidden/); assert.match(html, /id="proP2NoticeV1" hidden/);
  assert.match(html, /setGameTextV155\("proP1Goal", goals\[1\]\);\s*setGameTextV155\("proP2Goal", goals\[2\]\);/);
  assert.match(html, /if \(!isRackGameV1\(\)\) \{ renderRackNoticeV1\(1, ""\); renderRackNoticeV1\(2, ""\); \}/);
});

test("RT-3: foul / safety / score data, log and the 'Target · 2 Fouls' labels of Rotation and 14-1 are not touched", () => {
  assert.match(html, /setGameTextV155\("proP1Foul", fouls\[1\]\);/);
  assert.match(html, /consecutiveFouls\?\.\[player\] \|\| 0\) === 2\) \? window\.cueT\("p3\.62b6556c"\)|rotationFoulCountV1\(player\) === 2 \? window\.cueT\("p3\.62b6556c"\)/);
  assert.match(html, /\.pro-notice-v1\{position:absolute;top:0;/);
});
