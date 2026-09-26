import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

function sourceBetween(start, end) {
  const from = html.indexOf(start);
  const to = html.indexOf(end, from);
  assert.ok(from >= 0 && to > from, `source range not found: ${start}`);
  return html.slice(from, to);
}

const context = {
  window: {
    CueScoreBallIcon: {
      html(number, options = {}) {
        return `<ball number="${number}" state="${options.state || "normal"}" class="${options.classes || ""}"></ball>`;
      }
    }
  },
  esc(value) { return String(value); }
};
vm.createContext(context);
vm.runInContext(`${sourceBetween("function jpaDeadBallNumberV1", "// Ver.7.0.0: Break is a first-class rule-engine event.")}
${sourceBetween("function miniBallV1", "function rackGameMasuwariCountsV1")}
this.helpers={jpaDeadBallNumberV1,jpaBreakDeadBallsV1,jpaDeadBallEntriesV1,jpaDeadBallCountV1,historyRowsV1,gameHistoryV1,deadMiniBallV1};`, context);

const h = context.helpers;
const plain = value => JSON.parse(JSON.stringify(value));
const event = (id, sourceType, data = {}, extras = {}) => ({
  id, sourceType, type: ({ball_dead:"DeadBall",break_result:"Break",ball_pocketed:"Shot",foul:"Foul"})[sourceType],
  rackNumber: 1, inningNumber: 1, player: 1, data, ...extras
});

test("normal Dead one ball counts from ball_dead", () => {
  assert.equal(h.jpaDeadBallCountV1([event("d1", "ball_dead", {ball:3})]), 1);
});

test("multiple normal Dead balls count cumulatively", () => {
  const events = [event("d1", "ball_dead", {ball:2}), event("d2", "ball_dead", {ball:7})];
  assert.equal(h.jpaDeadBallCountV1(events), 2);
});

test("break scratch plus ball 3 records one Dead", () => {
  assert.deepEqual([...h.jpaBreakDeadBallsV1([3], true)], [3]);
});

test("break scratch plus multiple balls records unique 1-8 Dead", () => {
  assert.deepEqual([...h.jpaBreakDeadBallsV1([1,3,3,8], true)], [1,3,8]);
});

test("dry break scratch records zero Dead", () => {
  assert.deepEqual([...h.jpaBreakDeadBallsV1([], true)], []);
});

test("normal foul plus pocket is represented by normal ball_dead event", () => {
  const events = [
    event("s1", "ball_pocketed", {ball:3,dead:true}),
    event("d1", "ball_dead", {ball:3}),
    event("f1", "foul", {foulType:"standard"})
  ];
  assert.equal(h.jpaDeadBallCountV1(events), 1);
  assert.deepEqual(plain(h.historyRowsV1({eventLog:{events}})[0].p1), [{type:"jpa_dead",ball:3}, "F"]);
});

test("ball 9 is explicitly excluded from break Dead", () => {
  assert.deepEqual([...h.jpaBreakDeadBallsV1([9], true)], []);
  assert.equal(h.jpaDeadBallCountV1([event("b1", "break_result", {deadBalls:[9]})]), 0);
});

test("Undo removes the reverted event from cumulative Dead", () => {
  const beforeUndo = [event("d1", "ball_dead", {ball:2}), event("d2", "ball_dead", {ball:4})];
  const afterUndo = beforeUndo.slice(0, -1);
  assert.equal(h.jpaDeadBallCountV1(beforeUndo), 2);
  assert.equal(h.jpaDeadBallCountV1(afterUndo), 1);
});

test("Undo then re-entry derives the current cumulative Dead", () => {
  const events = [event("d1", "ball_dead", {ball:2}), event("d3", "ball_dead", {ball:6})];
  assert.equal(h.jpaDeadBallCountV1(events), 2);
});

test("in-progress JSON save and restore preserves derived cumulative Dead", () => {
  const events = [event("d1", "ball_dead", {ball:1}), event("b1", "break_result", {deadBalls:[5,7]})];
  const restored = JSON.parse(JSON.stringify({commonEventsV7:events}));
  assert.equal(h.jpaDeadBallCountV1(restored.commonEventsV7), 3);
});

test("normal Dead and break Dead use the same existing state=used renderer", () => {
  assert.match(html, /function jpaDeadBallHtmlV1[\s\S]*?size:"history", state:"used"/);
  assert.match(html, /logItemHtmlV1[\s\S]*?jpaDeadBallHtmlV1/);
  assert.match(html, /deadMiniBallV1[\s\S]*?jpaDeadBallHtmlV1/);
  assert.doesNotMatch(html, /jpa-dead-ball-v1[^}]*?(?:opacity|filter|saturate|brightness)\s*:/);
});

test("duplicate ball within one event is not double-counted", () => {
  const events = [event("b1", "break_result", {deadBalls:[3,3]})];
  assert.equal(h.jpaDeadBallCountV1(events), 1);
});

test("break history preserves B ball F slash order while marking only Dead balls", () => {
  const events = [event("b1", "break_result", {pocketedBalls:[3,9],deadBalls:[3],scratch:true,foul:true})];
  assert.deepEqual(plain(h.historyRowsV1({eventLog:{events}})[0].p1), ["B",{type:"jpa_dead",ball:3},9,"F","/"]);
});

test("JPA Dead summary is cumulative, JPA-only, and does not alter saved schema", () => {
  assert.match(html, /id="jpaDeadSummaryV1"[^>]*hidden/);
  assert.match(html, /setGameTextV155\("jpaDeadCountV1", isJPA9V1\(\) \? jpaDeadBallCountV1\(\) : 0\)/);
  assert.match(html, /jpaDeadSummaryV1\.hidden = !isJPA9V1\(\)/);
  assert.doesNotMatch(html, /jpaDeadCountV1\s*:/);
});

test("break decision filters Dead to 1-8 for every JPA break foul", () => {
  assert.match(html, /jpaBreakDeadBallsV1\(pocketedBalls, isJPA9V1\(\) && foul && !preBreakFoul\)/);
  assert.match(html, /\(isJPA9V1\(\) && foul\)[\s\S]*?\? \[\] : \[\.\.\.pocketedBalls\]/);
});

test("no DEAD text label or new Dead badge is added to game history", () => {
  const historySource = sourceBetween("function logItemHtmlV1", "function revealCurrentGameLogPositionV1")
    + sourceBetween("function miniBallV1", "function rackGameMasuwariCountsV1");
  assert.doesNotMatch(historySource, />\s*(?:DEAD|デッド)\s*</i);
  assert.doesNotMatch(historySource, /dead[-_ ]badge/i);
});
