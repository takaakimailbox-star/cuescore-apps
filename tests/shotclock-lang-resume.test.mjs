import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

// Build 94 preparation: the clock's match identity must not depend on the language. The label word of `#proStartTime` ("開始時刻" / "Start time" / "开始时间") changes with the language,
// which used to make a paused clock restart from idle after a language change. Only the time digits are part of the key now. (Real-browser proof: tests/browser/shotclock-lang-resume.mjs)
const js = fs.readFileSync(new URL("../shotclock-v1.js", import.meta.url), "utf8");
test("LR-1: matchKey uses only the time token of the start-time label, not the localized label word", () => {
  const body = js.slice(js.indexOf("const matchKey = () => {"), js.indexOf("return \"m\" + h.toString(16);"));
  assert.match(body, /t\.match\(\/\\d\{1,2\}\[:：\]\\d\{2\}\/\)/);
  assert.match(body, /\[clockTime, part\("#proP1Name"\), part\("#proP2Name"\), part\("#proGameTitleV1"\)\]/);
  assert.ok(!/\["#proStartTime", "#proP1Name"/.test(body), "the raw label text is no longer hashed");
});
test("LR-2: the time token is the same for the three languages' labels", () => {
  const time = t => (t.match(/\d{1,2}[:：]\d{2}/) || [t])[0];
  for (const label of ["開始時刻 20:14", "Start time 20:14", "开始时间 20:14"]) assert.equal(time(label), "20:14");
  assert.notEqual(time("開始時刻 20:15"), time("開始時刻 20:14"));
  assert.equal(time("開始時刻 --:--"), "開始時刻 --:--", "an unset label falls back to the whole text (same as before)");
});
test("LR-3: storage key, clock calculation and snapshot shape are unchanged", () => {
  assert.match(js, /KEY = "cueScore\.shotClock\.v1"/);
  assert.match(js, /store\.clock = Object\.assign\(\{ key: matchKey\(\) \}, snap\)/);
});
