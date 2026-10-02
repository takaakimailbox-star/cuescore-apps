import assert from "node:assert/strict";
import test from "node:test";
import {createRequire} from "node:module";
import {nodeCodec,stage1Fixtures} from "./helpers/match-sharing-stage1-fixtures.mjs";

const require=createRequire(import.meta.url);
const adapters=require("../match-sharing-adapters-v1.js");
const format=require("../match-sharing-format-v1.js");
const persistence=require("../match-sharing-persistence-v1.js");
const receiver=require("../match-sharing-receiver-v1.js");
const sender=require("../match-sharing-sender-v1.js");
const clone=value=>structuredClone(value);
const UUID="dddddddd-dddd-4ddd-8ddd-dddddddddddd";

function completed(extra={}){
  const source=clone(stage1Fixtures()[0].source);
  delete source.sharedMatchId;
  return {...source,id:"build84-match",...extra};
}

function storageHarness(record=completed()){
  let records=(Array.isArray(record)?record:[record]).map(clone),writes=0;
  return {
    readRecord:id=>clone(records.find(item=>String(item.id)===String(id))||null),
    prepare:id=>persistence.prepareSharedMatchId({matchId:id,readRecords:()=>clone(records),uuidFactory:()=>UUID}),
    persist:(id,sharedMatchId)=>persistence.persistSharedMatchId({matchId:id,sharedMatchId,readRecords:()=>clone(records),replaceRecords:next=>{writes+=1;records=clone(next)}}),
    snapshot:()=>clone(records),get writes(){return writes},
  };
}

function fakeBridge(initial="denied"){
  let status=initial;
  const listeners=new Map();
  return {
    authCalls:0,requestCalls:0,startCalls:0,stopCalls:0,removed:0,settingsCalls:0,lastStartOptions:null,
    setStatus(value){status=value},
    async authorizationStatus(){this.authCalls+=1;return {status}},
    async requestPermission(){this.requestCalls+=1;return {status}},
    async startScan(options){this.startCalls+=1;this.lastStartOptions=clone(options);return {active:true}},
    async stopScan(){this.stopCalls+=1;return {active:false}},
    async addListener(name,handler){listeners.set(name,handler);return {remove:()=>{this.removed+=1;listeners.delete(name)}}},
    async openSettings(){this.settingsCalls+=1;return {opened:true}},
  };
}

test("real saved analysis events are rebuilt from the v1 allow-list before encode/decode",async()=>{
  for(const fixture of stage1Fixtures()){
    const source=clone(fixture.source);
    const target=source.analysis.events[0];
    target.category="private-category";
    target.season="private-season";
    target.memo="private-memo";
    target.unknownLocalOnly={category:"nested-private",journal:[{season:"nested-season"}]};
    const expected={type:target.type,player:target.player,sequence:target.sequence,rack:target.rack,inning:target.inning};
    const allowed=adapters.EVENT_SPECS[target.type][1];
    for(const key of allowed)if(target[key]!==undefined)expected[key]=clone(target[key]);
    const logical=adapters.buildSharedMatchV1(source,{sharedMatchId:fixture.sharedMatchId});
    const outputEvent=(logical.eventMode==="analysis"?logical.events:logical.analysisEvents)[0];
    assert.deepEqual(outputEvent,expected,fixture.fixtureId);
    assert.doesNotMatch(JSON.stringify(logical),/category|season|memo|unknownLocalOnly/i,fixture.fixtureId);
    const decoded=await format.decodeSharedMatchV1(await format.encodeSharedMatchV1(logical,nodeCodec),nodeCodec);
    assert.deepEqual(decoded,logical,fixture.fixtureId);
  }
});

test("validator still rejects a prohibited field injected directly into a logical payload",async()=>{
  const fixture=stage1Fixtures()[0];
  const logical=adapters.buildSharedMatchV1(fixture.source,{sharedMatchId:fixture.sharedMatchId});
  logical.events[0].category="malicious";
  await assert.rejects(()=>format.encodeSharedMatchV1(logical,nodeCodec),error=>error.code==="PRIVACY_FIELD");
});

test("encoding failure leaves a new sharedMatchId and every stored record untouched",async()=>{
  const harness=storageHarness([completed(),completed({id:"unrelated-match",sharedMatchId:"eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee"})]);
  const before=harness.snapshot();
  const failingCodec={compression:{bounded:true,async deflateRaw(){throw new Error("injected encode failure")},async inflateRaw(){throw new Error("unused")}}};
  await assert.rejects(()=>sender.prepareShare({matchId:"build84-match",readRecord:harness.readRecord,prepareSharedMatchId:harness.prepare,persistSharedMatchId:harness.persist,codec:failingCodec}),error=>Boolean(error?.code));
  assert.deepEqual(harness.snapshot(),before);
  assert.equal(harness.writes,0);
});

test("successful QR artifact persists exactly its identity and repeat sharing reuses it",async()=>{
  const harness=storageHarness();
  const options={matchId:"build84-match",readRecord:harness.readRecord,prepareSharedMatchId:harness.prepare,persistSharedMatchId:harness.persist};
  const first=await sender.prepareShare(options),second=await sender.prepareShare(options);
  assert.equal(first.logical.sharedMatchId,UUID);
  assert.equal(harness.snapshot()[0].sharedMatchId,UUID);
  assert.equal(first.payload,second.payload);
  assert.equal(harness.writes,1);
});

test("production share click handler reaches QR success and persists only after the artifact exists",async()=>{
  const harness=storageHarness();
  const button=new EventTarget();
  button.disabled=false;button.attributes=new Map();
  button.setAttribute=(key,value)=>button.attributes.set(key,value);
  button.removeAttribute=key=>button.attributes.delete(key);
  let shown=null,failure=null;
  sender.bindShareAction(button,{
    matchId:"build84-match",readRecord:harness.readRecord,prepareSharedMatchId:harness.prepare,persistSharedMatchId:harness.persist,
    onSuccess:prepared=>{shown=prepared},onError:error=>{failure=error},
  });
  button.dispatchEvent(new Event("click"));
  for(let index=0;index<50&&!shown&&!failure;index+=1)await new Promise(resolve=>setTimeout(resolve,2));
  assert.equal(failure,null);
  assert.ok(shown?.svg.includes("match-sharing-qr-svg-v1"));
  assert.match(shown.payload,/^CSM1:/);
  assert.equal(shown.logical.sharedMatchId,harness.snapshot()[0].sharedMatchId);
  assert.equal(button.disabled,true);
});

test("permission recovery waits for Settings and the next receiver entry before scanner start",async()=>{
  const bridge=fakeBridge("denied"),states=[];
  const controller=receiver.createScannerController({bridge,onState:value=>states.push(value)});
  const rect={x:10,y:100,width:280,height:280};
  await controller.enter(rect);
  assert.equal(states.at(-1).screen,"permission");
  assert.equal(states.some(state=>state.screen==="scanner"),false);
  assert.equal(bridge.startCalls,0);
  await controller.openSettings();
  assert.equal(bridge.settingsCalls,1);
  bridge.setStatus("authorized");
  await controller.enter(rect);
  assert.equal(bridge.authCalls,2);
  assert.equal(bridge.startCalls,1);
  assert.equal(states.at(-1).screen,"scanner");
  assert.equal(controller.diagnostic().phase,"running");
});

test("native start failure never emits a false scanner state",async()=>{
  const bridge=fakeBridge("authorized"),states=[];
  bridge.startScan=async function(){this.startCalls+=1;throw Object.assign(new Error("not running"),{code:"SESSION_NOT_RUNNING"})};
  const controller=receiver.createScannerController({bridge,onState:value=>states.push(value)});
  await controller.enter({x:0,y:0,width:280,height:280});
  assert.equal(states.some(state=>state.screen==="scanner"),false);
  assert.equal(states.at(-1).screen,"unavailable");
  assert.equal(controller.isActive(),false);
});

test("production receiver entry click reaches authorization, native start, preview geometry, and Back cleanup",async()=>{
  const bridge=fakeBridge("authorized"),states=[];
  const controller=receiver.createScannerController({bridge,onState:value=>states.push(value)});
  const button=new EventTarget();
  const rect={x:18,y:126,width:312,height:312};
  let overlayVisible=false,startFailure=null;
  receiver.bindReceiverEntry(button,async()=>{
    overlayVisible=true;
    await controller.enter(rect);
  });
  button.dispatchEvent(new Event("click"));
  for(let index=0;index<50&&!controller.isActive()&&!startFailure;index+=1)await new Promise(resolve=>setTimeout(resolve,2));
  assert.equal(startFailure,null);
  assert.equal(overlayVisible,true);
  assert.equal(bridge.authCalls,1);
  assert.equal(bridge.startCalls,1);
  assert.deepEqual(bridge.lastStartOptions,{previewRect:rect});
  assert.equal(states.at(-1).screen,"scanner");
  assert.equal(controller.isActive(),true);
  assert.deepEqual(rect,{x:18,y:126,width:312,height:312});
  await controller.back();
  assert.equal(controller.isActive(),false);
  assert.equal(states.at(-1).screen,"closed");
  assert.ok(bridge.stopCalls>=1);
  assert.ok(bridge.removed>=2);
});
