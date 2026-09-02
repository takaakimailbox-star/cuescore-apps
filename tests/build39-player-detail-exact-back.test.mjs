import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const hub=readFileSync(new URL("../navigation-phase2-6.js",import.meta.url),"utf8");
const revision=readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");

test("Player Hub owns an exact navigation snapshot",()=>{
  assert.match(hub,/const snapshot=\(\)=>/);
  for(const field of ["playerId","discipline","tab","scrollTop"])assert.match(hub,new RegExp(`${field}:`));
  assert.match(hub,/window\.CueScorePlayerHubV2=Object\.freeze\(\{snapshot,restore\}\)/);
});

test("Player Hub restore closes Player root and restores the same context",()=>{
  assert.match(hub,/library\?\.classList\.add\("hidden"\)/);
  assert.match(hub,/overlay\?\.classList\.remove\("hidden"\)/);
  assert.match(hub,/render\(saved\.playerId,\{discipline:state\.discipline,tab:state\.tab\}\)/);
  assert.match(hub,/state\.scroll\[state\.tab\]=Number\(saved\.scrollTop\)\|\|0/);
});

test("Match Detail exact origin delegates Player entries to the Player Hub SSOT",()=>{
  assert.match(revision,/#playerStatsBody \.hub-bests-v2 \[data-hub-match\].*kind="personal-best"/);
  assert.match(revision,/const playerHub=window\.CueScorePlayerHubV2\?\.snapshot\?\.\(\)\|\|null/);
  assert.match(revision,/playerId:historyRoot\?\.dataset\.pd8PlayerId\|\|playerHub\?\.playerId/);
  assert.match(revision,/discipline:historyRoot\?\.dataset\.pd8Discipline\|\|playerHub\?\.discipline/);
  assert.match(revision,/window\.CueScorePlayerHubV2\?\.restore\?\.\(origin\.playerHub\)/);
});

test("Build 35 close contract and all five entry kinds remain shared",()=>{
  assert.match(revision,/const closeMatchDetailExactBase=window\.closeFormalMatchDetailV2/);
  for(const kind of ["personal-best","player-recent","player-history","opponent-history","global-history"])assert.match(revision,new RegExp(`"${kind}"`));
});
