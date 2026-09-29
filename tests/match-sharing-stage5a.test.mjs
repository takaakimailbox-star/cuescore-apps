import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";
import {createRequire} from "node:module";
import {stage1Fixtures} from "./helpers/match-sharing-stage1-fixtures.mjs";

const require=createRequire(import.meta.url);
const adapters=require("../match-sharing-adapters-v1.js");
const format=require("../match-sharing-format-v1.js");
const sender=require("../match-sharing-sender-v1.js");
const receiver=require("../match-sharing-receiver-v1.js");
const receiverSource=fs.readFileSync(new URL("../match-sharing-receiver-v1.js",import.meta.url),"utf8");
const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const swift=fs.readFileSync(new URL("../ios/App/App/CueScoreQRScannerPlugin.swift",import.meta.url),"utf8");
const bridgeController=fs.readFileSync(new URL("../ios/App/App/CueScoreBridgeViewController.swift",import.meta.url),"utf8");
const plist=fs.readFileSync(new URL("../ios/App/App/Info.plist",import.meta.url),"utf8");
const project=fs.readFileSync(new URL("../ios/App/App.xcodeproj/project.pbxproj",import.meta.url),"utf8");
const fixtures=stage1Fixtures();

function fakeBridge(status="authorized"){
  const callbacks=new Map();
  let current=status;
  return {
    authCalls:0,permissionCalls:0,startCalls:0,stopCalls:0,settingsCalls:0,listenerRemoveCalls:0,lastRect:null,
    async authorizationStatus(){this.authCalls+=1;return {status:current}},
    async requestPermission(){this.permissionCalls+=1;current=current==="notDetermined"?"authorized":current;return {status:current}},
    async startScan({previewRect}){this.startCalls+=1;this.lastRect=previewRect;return {active:true}},
    async stopScan(){this.stopCalls+=1;return {active:false}},
    async openSettings(){this.settingsCalls+=1;return {opened:true}},
    async addListener(name,callback){callbacks.set(name,callback);return {remove:()=>{this.listenerRemoveCalls+=1;callbacks.delete(name)}}},
    async emit(name,data){return callbacks.get(name)?.(data)},
  };
}

async function fixturePayload(fixture){
  const logical=adapters.buildSharedMatchV1(fixture.source,{sharedMatchId:fixture.sharedMatchId});
  return {logical,payload:await format.encodeSharedMatchV1(logical,sender.runtimeCodec)};
}

function payloadWithCompact(compact,{version=1}={}){
  const plain=Buffer.from(format.stableStringify(compact));
  const compressed=zlib.deflateRawSync(plain,{level:9});
  const header=Buffer.alloc(10);Buffer.from("CSM1").copy(header);header[4]=version;header[5]=1;header.writeUInt32BE(plain.length,6);
  const digest=crypto.createHash("sha256").update(compressed).digest();
  return format.PREFIX+format.base45Encode(Buffer.concat([header,digest,compressed]));
}

test("native bridge is registered and compiled into the App target",()=>{
  assert.match(bridgeController,/registerPluginInstance\(CueScoreQRScannerPlugin\(\)\)/);
  assert.match(project,/CueScoreQRScannerPlugin\.swift in Sources/);
  assert.match(swift,/jsName = "CueScoreQRScanner"/);
  for(const method of ["authorizationStatus","requestPermission","startScan","stopScan","openSettings"])assert.match(swift,new RegExp(`name: "${method}"`));
});

test("AVFoundation scanner is QR-only, one-shot and never captures frames or images",()=>{
  assert.match(swift,/AVCaptureSession\(\)/);
  assert.match(swift,/AVCaptureDeviceInput/);
  assert.match(swift,/AVCaptureMetadataOutput\(\)/);
  assert.match(swift,/metadataObjectTypes = \[\.qr\]/);
  assert.match(swift,/guard requestedActive, !didEmitResult/);
  assert.match(swift,/didEmitResult = true/);
  assert.doesNotMatch(swift,/AVCapturePhotoOutput|AVCaptureVideoDataOutput|UIImage|write\(|upload/i);
});

test("native lifecycle pauses in background, conditionally resumes, and Back can remove preview",()=>{
  assert.match(swift,/UIApplication\.didEnterBackgroundNotification/);
  assert.match(swift,/UIApplication\.willEnterForegroundNotification/);
  assert.match(swift,/guard requestedActive else \{ return \}/);
  assert.match(swift,/requestedActive, !self\.session\.isRunning/);
  assert.match(swift,/stop\(clearRequest: true, removePreview: true\)/);
  assert.match(swift,/previewView\?\.removeFromSuperview\(\)/);
});

test("native preview UI is installed on main, converted from WebView coordinates and kept above the WebView",()=>{
  assert.match(swift,/DispatchQueue\.main\.async \{ \[weak self\] in/);
  assert.match(swift,/webView\.convert\(rect, to: hostView\)/);
  assert.match(swift,/insertSubview\(view, aboveSubview: webView\)/);
  assert.match(swift,/bringSubviewToFront\(view\)/);
  assert.match(swift,/private final class ScannerPreviewView/);
  assert.match(swift,/previewLayer\?\.frame = bounds/);
  assert.match(swift,/private let guideLayer = CAShapeLayer\(\)/);
  assert.match(swift,/guideLayer\.path = path\.cgPath/);
  assert.match(swift,/output\.setMetadataObjectsDelegate\(self, queue: sessionQueue\)/);
});

test("native scanner keeps typed capture failures without production diagnostic logging",()=>{
  for(const code of ["CAMERA_NOT_AUTHORIZED","INVALID_PREVIEW_RECT","SCANNER_UNAVAILABLE","PREVIEW_UNAVAILABLE","INVALID_PREVIEW_FRAME","SESSION_NOT_RUNNING","CAMERA_UNAVAILABLE","CAMERA_INPUT_FAILED","CAMERA_INPUT_UNAVAILABLE","CAMERA_OUTPUT_UNAVAILABLE","QR_UNAVAILABLE","SCANNER_START_FAILED"]){
    assert.match(swift,new RegExp(code));
  }
  assert.doesNotMatch(swift,/CueScoreStage5A/);
  assert.doesNotMatch(receiverSource,/CueScoreStage5A/);
  assert.doesNotMatch(html,/CueScoreStage5A/);
  assert.doesNotMatch(swift,/uniqueID/);
});

test("camera authorization covers notDetermined, authorized, denied, restricted and unavailable",async()=>{
  for(const expected of ["authorized","denied","restricted","unavailable"]){
    const bridge=fakeBridge(expected),states=[];
    const controller=receiver.createScannerController({bridge,onState:value=>states.push(value)});
    await controller.enter({x:1,y:2,width:280,height:280});
    assert.equal(bridge.startCalls,expected==="authorized"?1:0,expected);
    assert.equal(states.at(-1).permission,expected,expected);
  }
  const bridge=fakeBridge("notDetermined"),states=[];
  await receiver.createScannerController({bridge,onState:value=>states.push(value)}).enter({x:0,y:0,width:280,height:280});
  assert.equal(bridge.permissionCalls,1);assert.equal(bridge.startCalls,1);assert.equal(states.at(-1).permission,"authorized");
});

test("Demo rejects before permission, camera, decode or receiver state",async()=>{
  const bridge=fakeBridge(),memory=receiver.createMemoryState();
  const controller=receiver.createScannerController({bridge,memory,isDemo:()=>true});
  await assert.rejects(()=>controller.enter({x:0,y:0,width:280,height:280}),error=>error.code==="DEMO_RECEIVER_REJECTED");
  assert.deepEqual({auth:bridge.authCalls,permission:bridge.permissionCalls,start:bridge.startCalls,state:memory.get()},{auth:0,permission:0,start:0,state:null});
  await assert.rejects(()=>receiver.decodeScannedPayload({payload:"CSM1:A",demoMode:true}),error=>error.code==="DEMO_RECEIVER_REJECTED");
});

test("all 18 production fixtures decode, validate and stay memory-only",async()=>{
  const memory=receiver.createMemoryState();
  for(const fixture of fixtures){
    const {logical,payload}=await fixturePayload(fixture);
    const result=await receiver.decodeScannedPayload({payload});
    assert.equal(result.status,"VALID_MATCH_SHARING_QR",fixture.fixtureId);
    assert.deepEqual(result.logicalMatch,logical,fixture.fixtureId);
    memory.setValid(result.logicalMatch);
    assert.equal(memory.get().sharedMatchId,fixture.sharedMatchId,fixture.fixtureId);
    memory.clear();assert.equal(memory.get(),null);
  }
  assert.equal(fixtures.length,18);
});

test("Stage 4 production A/B/C equivalents decode at QR Versions 19, 25 and 30",async()=>{
  const expected=new Map([["sample-match-0372",19],["sample-match-0796",25],["sample-match-0633",30]]);
  for(const [id,version] of expected){
    const fixture=fixtures.find(item=>item.fixtureId===id);assert.ok(fixture,id);
    const {payload}=await fixturePayload(fixture);
    assert.equal(sender.createQr(payload).version,version,id);
    assert.equal((await receiver.decodeScannedPayload({payload})).sharedMatchId,fixture.sharedMatchId,id);
  }
});

test("non-CueScore, malformed, digest mismatch, unknown version, invalid schema and oversize map to safe product errors",async()=>{
  const {logical,payload}=await fixturePayload(fixtures[0]);
  const envelope=format.base45Decode(payload.slice(format.PREFIX.length));
  const unknown=envelope.slice();unknown[4]=2;
  const corrupted=envelope.slice();corrupted[corrupted.length-1]^=1;
  const compact=adapters.compactSharedMatchV1(logical);delete compact.p;
  const cases=[
    ["https://example.com","NON_CUESCORE"],
    ["CSM1:?","MALFORMED_BASE45"],
    [format.PREFIX+format.base45Encode(corrupted),"DIGEST_MISMATCH"],
    [format.PREFIX+format.base45Encode(unknown),"UNSUPPORTED_VERSION"],
    [payloadWithCompact(compact),"INVALID_SCHEMA"],
    [`CSM1:${"A".repeat(5001)}`,"OVERSIZE"],
  ];
  for(const [value,code] of cases){
    await assert.rejects(()=>receiver.decodeScannedPayload({payload:value}),error=>{
      assert.equal(error.code,code);assert.ok(receiver.productError(error).message);return true;
    });
  }
});

test("duplicate is detected against the full completed collection with zero writes",async()=>{
  const {logical,payload}=await fixturePayload(fixtures[0]);
  const records=[{id:"local-existing",sharedMatchId:logical.sharedMatchId,players:{1:{name:"A"},2:{name:"B"}},endedAt:new Date().toISOString(),result:"win",winner:1}];
  await assert.rejects(()=>receiver.decodeScannedPayload({payload,records}),error=>error.code==="DUPLICATE");
});

test("controller accepts one callback, fully re-enters after error, and Back clears camera and memory",async()=>{
  const bridge=fakeBridge(),states=[],memory=receiver.createMemoryState();
  const controller=receiver.createScannerController({bridge,memory,onState:value=>states.push(value)});
  const rect={x:10,y:120,width:280,height:280};await controller.enter(rect);
  await bridge.emit("scanResult",{value:"https://example.com"});
  assert.equal(states.at(-1).screen,"error");assert.equal(memory.get(),null);assert.equal(bridge.stopCalls,1);
  await controller.retry(rect);assert.equal(bridge.startCalls,2);assert.equal(bridge.authCalls,2);assert.equal(bridge.listenerRemoveCalls,2);
  assert.equal(controller.diagnostic().phase,"running");
  const {payload}=await fixturePayload(fixtures[0]);
  await bridge.emit("scanResult",{value:payload});
  await bridge.emit("scanResult",{value:payload});
  assert.equal(states.filter(item=>item.screen==="success").length,1);
  assert.equal(memory.get().status,"VALID_MATCH_SHARING_QR");
  await controller.back();assert.equal(memory.get(),null);assert.equal(controller.isActive(),false);assert.ok(bridge.stopCalls>=2);
});

test("bridge and native startup failures remain camera errors and retry uses the full stopped re-entry path",async()=>{
  const states=[];
  const failedAuth={async authorizationStatus(){throw Object.assign(new Error("bridge"),{code:"BRIDGE_FAILURE"})}};
  const authController=receiver.createScannerController({bridge:failedAuth,onState:value=>states.push(value)});
  await authController.enter({x:0,y:0,width:280,height:280});
  assert.equal(states.at(-1).screen,"unavailable");
  assert.equal(authController.diagnostic().errorCode,"BRIDGE_FAILURE");

  const bridge=fakeBridge();bridge.startScan=async function(){this.startCalls+=1;throw Object.assign(new Error("start"),{code:"SESSION_NOT_RUNNING"})};
  const startController=receiver.createScannerController({bridge,onState:value=>states.push(value)});
  await startController.enter({x:0,y:0,width:280,height:280});
  assert.equal(states.at(-1).screen,"unavailable");
  assert.equal(startController.diagnostic().phase,"start-failed");
  await startController.retry({x:0,y:0,width:280,height:280});
  assert.equal(bridge.stopCalls,1);assert.equal(bridge.authCalls,2);assert.equal(bridge.listenerRemoveCalls,2);
});

test("History receiver entry, scanner copy, accessibility and error recovery match the adopted UI",()=>{
  assert.match(html,/readRecords:\s*readMatchRecords/);
  assert.doesNotMatch(html,/\n\s*readRecords,\s*\n/);
  assert.match(html,/id="matchSharingReceiveV1"[^>]+aria-label="試合を受け取る"[^>]+hidden/);
  assert.match(html,/<span>受け取る<\/span>/);
  assert.match(html,/<h1>試合を受け取る<\/h1>/);
  assert.match(html,/相手のCueScoreに表示されている/);
  assert.match(html,/QRコードを読み取ってください/);
  assert.match(html,/QRコードを枠内に合わせてください/);
  assert.match(html,/min-height:44px/);
  assert.match(html,/設定を開く/);
  assert.match(html,/もう一度読み取る/);
  assert.match(html,/syncMatchSharingReceiverEntryV1/);
  assert.match(html,/button\.hidden=Boolean\(window\.CueScoreDemoData\?\.isDemo/);
  assert.match(html,/registerPlugin\?\.\("CueScoreQRScanner"\)/);
  assert.match(html,/scannerDiagnostic/);
});

test("Info.plist states both real camera uses without changing Version or Build",()=>{
  assert.match(plist,/プレーヤーのプロフィール写真の撮影と、試合共有QRコードの読み取りにカメラを使用します。/);
  assert.match(project,/MARKETING_VERSION = 1\.1;/);assert.match(project,/CURRENT_PROJECT_VERSION = 79;/);
});

test("receiver runtime is bundled for PWA and native without adding a dependency",()=>{
  const nativeBuild=fs.readFileSync(new URL("../scripts/build-native-web.mjs",import.meta.url),"utf8");
  const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");
  assert.match(html,/match-sharing-receiver-v1\.js/);
  assert.match(nativeBuild,/match-sharing-receiver-v1\.js/);
  assert.match(sw,/match-sharing-receiver-v1\.js/);
});
