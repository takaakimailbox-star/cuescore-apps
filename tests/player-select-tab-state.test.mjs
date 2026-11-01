import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const nav = readFileSync(new URL("../navigation-shell-phase1.js", import.meta.url), "utf8");

test("root cause is pinned: reconcile() only ever set Player/History/Settings, so closing a setup-opened player picker left Player selected", () => {
  assert.match(nav, /\.some\(visible\)\)setActive\("player"\);\s*\/\/[^\n]*\n\s*else if\(state\.active==="player"\)setActive\("home"\);/);
});

test("the Home fallback is scoped to the not-in-match branch and the existing tab contract is untouched", () => {
  const body = nav.match(/const reconcile=\(\)=>\{[\s\S]*?\n  \};/)[0];
  assert.ok(body.indexOf("if(!match){") < body.indexOf('else if(state.active==="player")setActive("home")'), "fallback is inside !match");
  assert.match(body, /if\(app\.classList\.contains\("records-mode"\)\)setActive\("history"\);/);
  assert.match(body, /else if\(app\.classList\.contains\("settings-mode"\)\)setActive\("settings"\);/);
  assert.match(nav, /if\(!roots\.includes\(key\)\|\|isMatchMode\(\)\)return;/, "tabs stay disabled during a match");
  assert.match(nav, /if\(key==="player"\)\{document\.body\.dataset\.cuePlayerContext="browse";/, "real Player tab entry unchanged");
});
