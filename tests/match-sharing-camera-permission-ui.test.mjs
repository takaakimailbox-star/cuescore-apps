import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {createRequire} from "node:module";

const require=createRequire(import.meta.url);
const receiver=require("../match-sharing-receiver-v1.js");
const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

function fakeBridge(initial="denied"){
  let status=initial;
  return {
    authCalls:0,requestCalls:0,startCalls:0,settingsCalls:0,
    setStatus(value){status=value},
    async authorizationStatus(){this.authCalls+=1;return {status}},
    async requestPermission(){this.requestCalls+=1;return {status}},
    async startScan(){this.startCalls+=1;return {active:true}},
    async stopScan(){return {active:false}},
    async addListener(){return {remove(){}}},
    async openSettings(){this.settingsCalls+=1;return {opened:true}},
  };
}

test("denied and restricted permission UI exposes Settings only",()=>{
  for(const permission of ["denied","restricted"]){
    const actions=receiver.receiverActionState({screen:"permission",permission});
    assert.equal(actions.showSettings,true,permission);
    assert.equal(actions.showRetry,false,permission);
  }
  assert.doesNotMatch(html,/カメラを確認する/);
  assert.match(html,/id="matchSharingReceiverSettingsV1"[^>]*>設定を開く<\/button>/);
  assert.match(html,/id="matchSharingReceiverBackV1"[^>]*aria-label="試合履歴へ戻る"/);
});

test("scan and duplicate failures retain their existing retry actions",()=>{
  assert.deepEqual(receiver.receiverActionState({screen:"error",code:"INVALID"}),{
    showSettings:false,showRetry:true,retryLabel:"もう一度読み取る",
  });
  assert.deepEqual(receiver.receiverActionState({screen:"error",code:"DUPLICATE"}),{
    showSettings:false,showRetry:true,retryLabel:"他の試合を読み取る",
  });
});

test("denied never starts scanner and Settings remains the recovery action",async()=>{
  const bridge=fakeBridge("denied"),states=[];
  const controller=receiver.createScannerController({bridge,onState:value=>states.push(value)});
  await controller.enter({x:0,y:100,width:300,height:300});
  assert.equal(states.at(-1).permission,"denied");
  assert.equal(bridge.startCalls,0);
  await controller.openSettings();
  assert.equal(bridge.settingsCalls,1);
});

test("authorized and notDetermined contracts still reach scanner correctly",async()=>{
  const rect={x:0,y:100,width:300,height:300};
  const authorized=fakeBridge("authorized"),authorizedStates=[];
  await receiver.createScannerController({bridge:authorized,onState:value=>authorizedStates.push(value)}).enter(rect);
  assert.equal(authorized.requestCalls,0);
  assert.equal(authorized.startCalls,1);
  assert.equal(authorizedStates.at(-1).screen,"scanner");

  const undecided=fakeBridge("notDetermined"),undecidedStates=[];
  undecided.requestPermission=async function(){this.requestCalls+=1;this.setStatus("authorized");return {status:"authorized"}};
  await receiver.createScannerController({bridge:undecided,onState:value=>undecidedStates.push(value)}).enter(rect);
  assert.equal(undecided.requestCalls,1);
  assert.equal(undecided.startCalls,1);
  assert.equal(undecidedStates.at(-1).screen,"scanner");
});

test("permission granted in Settings starts scanner on the next receiver entry",async()=>{
  const bridge=fakeBridge("denied"),states=[];
  const controller=receiver.createScannerController({bridge,onState:value=>states.push(value)});
  const rect={x:0,y:100,width:300,height:300};
  await controller.enter(rect);
  await controller.openSettings();
  bridge.setStatus("authorized");
  await controller.enter(rect);
  assert.equal(bridge.authCalls,2);
  assert.equal(bridge.startCalls,1);
  assert.equal(states.at(-1).screen,"scanner");
});
