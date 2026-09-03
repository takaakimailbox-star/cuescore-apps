import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const revision=readFileSync(new URL("../ui-revision-v12.js",import.meta.url),"utf8");
const manifest=JSON.parse(readFileSync(new URL("../manifest.webmanifest",import.meta.url),"utf8"));
const appIcon=readFileSync(new URL("../ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png",import.meta.url));
const oldCapacitorIconSha256="29e4777e319de3ee5a52c3a8004ec19d0568414004257e36d7c94a077d71c93b";
const adoptedIosIconSha256="49b2aa25427930af44eb9f4d90fe00265c0396fe3af6f81e8d05ef7571b072d3";

test("global edge tracking and its pointer-event interception are removed",()=>{
  assert.doesNotMatch(html,/CueScoreEdgeBack|cue-edge-back|interactiveTargetSelector/);
  assert.doesNotMatch(html,/--cue-edge-back-x|cancelInteractiveBack/);
});

test("all current full-screen Back controls participate in the common contract",()=>{
  for(const selector of ["[data-journey-back]",".pd12-trends-back","[data-analysis-back]"]){
    assert.match(html,new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  }
  assert.match(html,/\.player-journey-back-v2,[\s\S]*?\.pd12-trends-back,[\s\S]*?\.match-detail-back-v1,[\s\S]*?\.analytics-home-back-v2\{/);
  assert.match(revision,/\.pd12-trends-back/);
});

test("Web, Home Screen and iOS use the adopted CueScore icon family",()=>{
  assert.equal(manifest.icons[0].src,"./icons/cuescore-app-icon-192.png");
  assert.equal(manifest.icons[1].src,"./icons/cuescore-app-icon-512.png");
  assert.match(html,/apple-touch-icon[^>]+cuescore-app-icon-180\.png/);
  const actualHash=createHash("sha256").update(appIcon).digest("hex");
  assert.notEqual(actualHash,oldCapacitorIconSha256);
  assert.equal(actualHash,adoptedIosIconSha256);
  assert.equal(appIcon.subarray(1,4).toString(),"PNG");
});
