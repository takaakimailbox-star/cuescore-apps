import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {createRequire} from "node:module";
import {nodeCodec,stage1Fixtures} from "./helpers/match-sharing-stage1-fixtures.mjs";

const require=createRequire(import.meta.url);
const adapters=require("../match-sharing-adapters-v1.js");
const format=require("../match-sharing-format-v1.js");
const persistence=require("../match-sharing-persistence-v1.js");
const sender=require("../match-sharing-sender-v1.js");
const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const nativeBuild=fs.readFileSync(new URL("../scripts/build-native-web.mjs",import.meta.url),"utf8");
const serviceWorker=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");
const senderSource=fs.readFileSync(new URL("../match-sharing-sender-v1.js",import.meta.url),"utf8");
const fixtures=stage1Fixtures();
const clone=value=>structuredClone(value);
const UUID="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function completed(extra={}){
  const record=clone(fixtures[0].source);
  return {...record,id:"sender-match",sharedMatchId:UUID,...extra};
}
function shareHarness(record=completed()){
  let records=[clone(record)],writes=0;
  return {
    readRecord:id=>clone(records.find(item=>String(item.id)===String(id))||null),
    prepareSharedMatchId:id=>persistence.prepareSharedMatchId({matchId:id,readRecords:()=>clone(records),uuidFactory:()=>UUID}),
    persistSharedMatchId:(id,sharedMatchId)=>persistence.persistSharedMatchId({
      matchId:id,sharedMatchId,readRecords:()=>clone(records),replaceRecords:next=>{writes+=1;records=clone(next)},
    }),
    get records(){return clone(records)},get writes(){return writes},
  };
}

test("sender eligibility allows completed normal Match and rejects Demo, unfinished, interrupted and invalid records",()=>{
  assert.equal(sender.assertSenderEligible(completed()),true);
  assert.throws(()=>sender.assertSenderEligible(completed(),{demoMode:true}),error=>error.code==="DEMO_EXPORT_REJECTED");
  assert.throws(()=>sender.assertSenderEligible(completed({endedAt:null})),error=>error.code==="INELIGIBLE_MATCH");
  assert.throws(()=>sender.assertSenderEligible(completed({interrupted:true})),error=>error.code==="INELIGIBLE_MATCH");
  assert.throws(()=>sender.assertSenderEligible(completed({players:null})),error=>error.code==="INELIGIBLE_MATCH");
});

test("first share persists one UUID and repeat share reuses deterministic payload",async()=>{
  const initial=completed();delete initial.sharedMatchId;
  const harness=shareHarness(initial);
  const first=await sender.prepareShare({matchId:initial.id,readRecord:harness.readRecord,prepareSharedMatchId:harness.prepareSharedMatchId,persistSharedMatchId:harness.persistSharedMatchId});
  const second=await sender.prepareShare({matchId:initial.id,readRecord:harness.readRecord,prepareSharedMatchId:harness.prepareSharedMatchId,persistSharedMatchId:harness.persistSharedMatchId});
  assert.equal(harness.writes,1);
  assert.equal(first.logical.sharedMatchId,UUID);
  assert.equal(second.logical.sharedMatchId,UUID);
  assert.equal(first.payload,second.payload);
  assert.equal(first.qr.version,second.qr.version);
  assert.equal(first.svg,second.svg);
});

test("Demo rejects before UUID persistence, compression and QR generation",async()=>{
  const harness=shareHarness(completed({sharedMatchId:undefined}));let prepareCalls=0;
  await assert.rejects(()=>sender.prepareShare({matchId:"sender-match",demoMode:true,readRecord:harness.readRecord,prepareSharedMatchId:()=>{prepareCalls+=1;return UUID},persistSharedMatchId:()=>{}}),error=>error.code==="DEMO_EXPORT_REJECTED");
  assert.equal(prepareCalls,0);assert.equal(harness.writes,0);
});

test("persistence/read-back failure never returns a QR",async()=>{
  const record=completed({sharedMatchId:undefined});
  await assert.rejects(()=>sender.prepareShare({matchId:record.id,readRecord:()=>clone(record),prepareSharedMatchId:()=>UUID,persistSharedMatchId:()=>{}}),error=>error.code==="PERSISTENCE_READBACK_FAILED");
});

test("production fflate runtime remains Stage 1 decode-compatible",async()=>{
  for(const fixture of fixtures){
    const logical=adapters.buildSharedMatchV1(fixture.source,{sharedMatchId:fixture.sharedMatchId});
    const runtimePayload=await format.encodeSharedMatchV1(logical,sender.runtimeCodec);
    assert.deepEqual(await format.decodeSharedMatchV1(runtimePayload,nodeCodec),logical,fixture.fixtureId);
    const nodePayload=await format.encodeSharedMatchV1(logical,nodeCodec);
    assert.deepEqual(await format.decodeSharedMatchV1(nodePayload,sender.runtimeCodec),logical,fixture.fixtureId);
  }
});

test("18 production fixtures generate deterministic ECC-M alphanumeric Single QR in Version 19-30",async()=>{
  const versions=[];
  for(const fixture of fixtures){
    const logical=adapters.buildSharedMatchV1(fixture.source,{sharedMatchId:fixture.sharedMatchId});
    const payload=await format.encodeSharedMatchV1(logical,sender.runtimeCodec);
    const first=sender.createQr(payload),second=sender.createQr(payload);
    versions.push(first.version);
    assert.equal(first.ecc,"M",fixture.fixtureId);
    assert.equal(first.quietZone,4,fixture.fixtureId);
    assert.equal(first.size,first.version*4+17,fixture.fixtureId);
    assert.equal(second.version,first.version,fixture.fixtureId);
    assert.equal(sender.qrPathData(second),sender.qrPathData(first),fixture.fixtureId);
    assert.match(payload,/^CSM1:[0-9A-Z $%*+\-./:]+$/,fixture.fixtureId);
  }
  assert.equal(fixtures.length,18);
  assert.equal(Math.min(...versions),19);
  assert.equal(Math.max(...versions),30);
});

test("QR SVG is standard black/white with four-module quiet zone and no payload accessibility leak",async()=>{
  const logical=adapters.buildSharedMatchV1(fixtures.at(-1).source,{sharedMatchId:fixtures.at(-1).sharedMatchId});
  const qr=sender.createQr(await format.encodeSharedMatchV1(logical,sender.runtimeCodec));
  const svg=sender.renderQrSvg(qr);
  assert.match(svg,new RegExp(`viewBox="0 0 ${qr.size+8} ${qr.size+8}"`));
  assert.match(svg,/shape-rendering="crispEdges"/);
  assert.match(svg,/fill="#fff"/);assert.match(svg,/fill="#000"/);
  assert.doesNotMatch(svg,/CSM1:|logo|filter=|rx=/i);
});

test("oversize and invalid QR input fail without a partial QR",()=>{
  assert.throws(()=>sender.createQr("not-cuescore"),error=>error.code==="INVALID_QR_PAYLOAD");
  assert.throws(()=>sender.createQr(`CSM1:${"A".repeat(2200)}`),error=>error.code==="OVERSIZE");
});

test("Match Detail exposes adopted sender action while Demo and result mode remain hidden",()=>{
  assert.match(html,/id="matchDetailShareV1"[^>]+aria-label="試合を共有"/);
  assert.match(html,/match-detail-share-v1[^`]+<span>共有<\/span>/);
  assert.match(html,/if\(resultMode\|\|window\.CueScoreDemoData\?\.isDemo\?\.\(\)\)return false/);
  assert.match(html,/CueScoreMatchSharingSenderV1\?\.assertSenderEligible/);
  assert.match(html,/matchId:record\.id[\s\S]+prepareSharedMatchId:prepareSharedMatchIdV1[\s\S]+persistSharedMatchId:persistSharedMatchIdV1/);
});

test("Sender QR screen preserves adopted copy, Back and accessibility contract",()=>{
  assert.match(html,/<h1>試合を共有<\/h1>/);
  assert.match(html,/相手のCueScoreでこのQRコードを読み取ってください/);
  assert.match(senderSource,/label="この試合を共有するQRコード"/);
  assert.match(html,/aria-label="試合詳細へ戻る"/);
  assert.match(html,/openMatchDetailV1\(record\.id,\{restoreScrollTop:returnScrollTop,focusShareAction:true\}\)/);
  assert.match(html,/width:min\(292px,calc\(100vw - 48px\)\)/);
});

test("Sender errors stay on Match Detail and use the existing toast pattern",()=>{
  assert.match(html,/showToast\("試合を共有できません",matchSharingSenderErrorV1\(error\)\)/);
  assert.match(senderSource,/button\.disabled=false/);
  assert.match(senderSource,/button\.removeAttribute\?\.\("aria-busy"\)/);
  assert.doesNotMatch(html,/Match Sharing sender failed[^\n]+alert\(/);
});

test("browser/native asset registration contains pinned vendors, format and sender runtime",()=>{
  for(const name of ["vendor/fflate-0.8.3.js","vendor/qrcodegen-1.8.0.js","match-sharing-format-v1.js","match-sharing-sender-v1.js"]){
    assert.ok(html.includes(name),name);assert.ok(nativeBuild.includes(name),name);assert.ok(serviceWorker.includes(name),name);
  }
  assert.match(fs.readFileSync(new URL("../vendor/qrcodegen-1.8.0.LICENSE",import.meta.url),"utf8"),/MIT License/);
  assert.match(fs.readFileSync(new URL("../vendor/fflate-0.8.3.LICENSE",import.meta.url),"utf8"),/MIT License/);
});
