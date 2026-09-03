import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("Rotation dry break changes to the opponent and releases the scoring lock", () => {
  assert.match(html, /activeGameTypeV1 === ROTATION_GAME_TYPE[\s\S]*?decision\.pocketedBalls\.length === 0[\s\S]*?current = player === 1 \? 2 : 1;[\s\S]*?foulLocked = false;[\s\S]*?turnLockReasonV62 = null;/);
});
