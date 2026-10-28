import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

// Race to label fix (9-Ball / 10-Ball scorecard): the Race to line shows only "Race to <goal>"; ball-in-hand is a separate badge; foul data and log are untouched.
const html = globalThis.__p3RawReadFileSync.call(fs, new URL("../index.html", import.meta.url), "utf8");

test("RT-1: the rack-game Race to label no longer carries 'Ball in hand' or '2 Fouls' / '3 Fouls!'", () => {
  const fn = html.slice(html.indexOf("function nineBallGoalLabelV1"), html.indexOf("function updateGame()"));
  assert.match(fn, /return "Race to";/);
  assert.ok(!/notices|Fouls|e2e7544e/.test(fn.replace(/\/\*[\s\S]*?\*\//g, "")), "no notice text in the label function");
  assert.ok(!html.includes("`Race to · "), "no 'Race to · ...' template remains");
  assert.ok(!html.includes('classList.toggle("nine-ball-status-v1"'), "the status-colour toggle on the label is gone");
});

test("RT-2: no 'Ball in hand' badge or notice is drawn anywhere (PO 2026-10-28); the internal state and the goal value are untouched", () => {
  assert.ok(!html.includes("pro-notice-v1") && !html.includes("proP1NoticeV1") && !html.includes("nineBallNoticeV1") && !html.includes("renderRackNoticeV1"), "badge markup / functions removed");
  assert.ok(!html.includes('cueT("p3.e2e7544e")') && !html.includes("cueT(`p3.ef088e10`"), "the 'Ball in hand' strings are no longer rendered");
  assert.match(html, /rackState\.ballInHandFor = decision\.preBreakFoul \? null : opponent;/, "ballInHandFor state is still set by the foul rules");
  assert.match(html, /setGameTextV155\("proP1Goal", goals\[1\]\);\s*setGameTextV155\("proP2Goal", goals\[2\]\);/);
  assert.match(html, /showToast\(window\.cueT\("p3\.5afbe4ce"\)\);/, "push-out foul toast keeps its title, without the ball-in-hand sentence");
});

test("RT-3: foul / safety / score data, log and the 'Target · 2 Fouls' labels of Rotation and 14-1 are not touched", () => {
  assert.match(html, /setGameTextV155\("proP1Foul", fouls\[1\]\);/);
  assert.match(html, /rotationFoulCountV1\(player\) === 2 \? window\.cueT\("p3\.62b6556c"\)/);
});
