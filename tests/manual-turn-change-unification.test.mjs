import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const section = (start, end) => {
  const from = html.indexOf(start);
  const to = html.indexOf(end, from);
  assert.ok(from >= 0 && to > from, `missing source section: ${start}`);
  return html.slice(from, to);
};

const actions = section('<section class="pro-actions" id="proActionsV730">', '<section class="three-cushion-actions-v1"');
assert.ok(actions.indexOf('id="jpaDeadBtnV1"') < actions.indexOf('id="proSafetyBtn"'), "JPA Dead must be the leftmost visible JPA action");
assert.ok(actions.indexOf('id="jpaDeadBtnV1"') < actions.indexOf('id="proFoulBtn"'));
assert.ok(actions.indexOf('id="jpaDeadBtnV1"') < actions.indexOf('id="proSwitchBtn"'));

assert.match(html, /function beginManualTurnChangeV1\(reason\) \{[\s\S]*?foulLocked = true;[\s\S]*?turnLockReasonV62 = reason;/);

const safety = section("function safetyEvent()", "function foulEvent()");
assert.match(safety, /beginPendingSafetyV62\(current\)/);
assert.match(safety, /beginManualTurnChangeV1\("safety"\)/);
assert.doesNotMatch(safety, /current = current === 1 \? 2 : 1/);

const foul = section("function foulEvent()", "function renderPushOutBallsV730()");
assert.match(foul, /isRackGameV1\(\)[\s\S]*?state\.ballInHandFor = opponent;[\s\S]*?beginManualTurnChangeV1\("foul"\)/);
assert.match(foul, /isStraightPoolV1\(\)[\s\S]*?else\{[\s\S]*?beginManualTurnChangeV1\("foul"\)/);
assert.match(foul, /isJPA9V1\(\)[\s\S]*?beginManualTurnChangeV1\("foul"\)/);
assert.match(foul, /activeGameTypeV1 === ROTATION_GAME_TYPE[\s\S]*?incrementRotationFoulV1\(current\);[\s\S]*?beginManualTurnChangeV1\("foul"\)/);
assert.doesNotMatch(foul, /current = current === 1 \? 2 : 1/);

const buttons = section("function updateButtons()", "// CueScore RC76");
assert.match(buttons, /safetyButton\.disabled = rackEnded \|\| foulLocked/);
assert.match(buttons, /foulButton\.disabled = rackEnded \|\| foulLocked/);
assert.match(buttons, /jpaDeadButton\.disabled = !canMarkJPADeadV1\(\) \|\| rackEnded \|\| foulLocked/);
assert.doesNotMatch(buttons, /switchButton\.disabled = [^;]*foulLocked/);
assert.match(buttons, /undoButton\.disabled = undoHistory\.length === 0/);

const pocket = section("function pocketBall(number)", "function canMarkJPADeadV1()");
assert.match(pocket, /gameEnded \|\| rackEnded \|\| foulLocked/);
assert.match(html, /function isPushOutAvailableV730\(\)[\s\S]*?!foulLocked/);

const snapshot = section("function snapshot()", "function restore(state)");
assert.match(snapshot, /rackEnded, foulLocked/);
assert.match(snapshot, /turnLockReasonV62/);
const restore = section("function restore(state)", "// FA-IPHONE-001");
assert.match(restore, /foulLocked = state\.foulLocked/);
assert.match(restore, /turnLockReasonV62 = state\.turnLockReasonV62/);

assert.doesNotMatch(foul, /threeCushionStateV1|threeCushionAddV1|threeCushionSwitchV1/);

console.log("Manual turn-change unification and JPA Dead order checks passed.");
