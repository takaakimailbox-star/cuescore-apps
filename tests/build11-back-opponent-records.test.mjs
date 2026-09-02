import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const detail=readFileSync(new URL("../player-detail-build6.js",import.meta.url),"utf8");

test("Back removes fixed gesture waits and provides immediate touch feedback",()=>{
  assert.doesNotMatch(html,/setTimeout\(\(\)=>\{backButton\.click\(\);clearInteractiveBack\(\);backTransitionActive=false;\},190\)/);
  assert.doesNotMatch(html,/setTimeout\(finish,280\)/);
  assert.match(html,/requestBackContract\(backButton\)/);
  assert.match(html,/touch-action:manipulation/);
  assert.match(html,/cue-back-feedback-v11/);
});

test("Back instrumentation separates receipt, handler, DOM and usable timing",()=>{
  assert.match(detail,/CueScoreBackPerfV11/);
  assert.match(detail,/received:performance\.now\(\)/);
  assert.match(detail,/handlerStart/);
  assert.match(detail,/domComplete/);
  assert.match(detail,/visuallyUsable/);
  assert.match(html,/measureBackV11/);
});

test("cached visible contexts return before non-critical rebuild work",()=>{
  assert.match(html,/function restorePlayerDetail\(\)/);
  assert.match(detail,/state\.infoSnapshot/);
  assert.match(detail,/restoreInfo\(\)/);
  assert.match(detail,/requestAnimationFrame\(\(\)=>showPlayerLibraryMain\(\)\)/);
  assert.match(detail,/historyRoot\.dataset\.pd8Opponent/);
});

test("opponent records are compact, precise and contain no W L history badges",()=>{
  assert.match(html,/page-journey-heading-v1">対戦相手/);
  assert.match(html,/rateText = value => Number\.isFinite\(value\)\?`\$\{Number\(value\)\.toFixed\(1\)\}%`/);
  assert.doesNotMatch(html,/data-rival-sort="games"/);
  assert.doesNotMatch(html,/data-rival-sort="rate"/);
  const render=html.slice(html.indexOf("function renderRivals()"),html.indexOf("function openRivals"));
  assert.doesNotMatch(render,/journey-form-v2|>W<|>L</);
  assert.match(render,/data-rival-opponent/);
});

test("opponent card opens a discipline and opponent fixed history with Match Detail only",()=>{
  assert.match(html,/function openOpponentHistory\(key\)/);
  assert.match(html,/opponentKey:String\(key\|\|""\)/);
  assert.match(html,/disc\(r\)===historyState\.filter/);
  assert.match(html,/registeredPlayerId\|\|opponent\(r,side\(r,p\)\)\?\.name/);
  assert.match(html,/openPlayerJourneyMatchV4/);
  assert.match(html,/historyState\.origin==="rivals"/);
  assert.doesNotMatch(html,/if\(row\)\{const key=String\(row\.dataset\.rivalOpponent\|\|""\);hide\(rivalRoot\);window\.openRivalAnalysisForPlayerV832/);
});

test("missing opponent results remain unavailable instead of fabricated losses",()=>{
  assert.match(html,/resolved=items\.filter/);
  assert.match(html,/rate:resolved\.length\?wins\/resolved\.length\*100:null/);
  assert.match(html,/s\.resolved\?`\$\{s\.wins\}勝\$\{s\.losses\}敗`:"勝敗 —"/);
});
