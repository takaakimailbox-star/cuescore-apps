import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import {createRequire} from "node:module";
import {fixtureUuid,nodeCodec,stage1Fixtures} from "./helpers/match-sharing-stage1-fixtures.mjs";

const require=createRequire(import.meta.url);
const validation=require("../match-sharing-validation-v1.js");
const adapters=require("../match-sharing-adapters-v1.js");
const format=require("../match-sharing-format-v1.js");
const fixtures=stage1Fixtures();

const expectCode=(code)=>error=>error?.code===code;
const clone=value=>structuredClone(value);
const forbidden=/\b(memo|reflection|playerReflections|avatar|photo|registeredPlayerId|category|season|entitlement|deviceIdentifier)\b/i;

function logicalFor(fixture){
  return adapters.buildSharedMatchV1(fixture.source,{sharedMatchId:fixture.sharedMatchId});
}

function assertProductionParity(logical,source,label){
  assert.deepEqual(logical.events,source.eventLog.events.length?source.eventLog.events:source.analysis.events,label);
  assert.deepEqual(logical.analysisSummary,source.analysis.summary,label);
  assert.deepEqual(logical.match.rackResults,source.rackResults,label);
  for(const side of [1,2])for(const field of adapters.PLAYER_FIELDS){
    const raw=source.players[side][field];
    const expected=field==="name"?String(raw||"").trim():(raw==null&&["goal","skillLevel"].includes(field)?null:Number(raw||0));
    assert.deepEqual(logical.players[side][field],expected,`${label} player ${side} ${field}`);
  }
  if(logical.gameType==="jpa9Ball"){
    for(const field of ["skillLevels","targetPoints","deadBalls","deadBallEvents"])assert.deepEqual(logical.discipline[field],source.jpa9[field],`${label} ${field}`);
  }else if(logical.gameType==="nineBall"){
    assert.equal(logical.discipline.initialBreaker,source.nineBall.initialBreaker,label);
  }else if(logical.gameType==="tenBall"){
    assert.equal(logical.discipline.initialBreaker,source.tenBall.initialBreaker,label);
    assert.deepEqual(logical.discipline.spotEvents,source.tenBall.spotEvents,label);
  }else if(logical.gameType==="straightPool"){
    for(const field of ["rackCycle","spotEvents","rerackEvents","openingBreakEvents"])assert.deepEqual(logical.discipline[field],source.straightPool[field],`${label} ${field}`);
  }else if(logical.gameType==="threeCushion"){
    for(const field of ["targetPoints","currentInning","completedTurns","highRun","averages","innings"])assert.deepEqual(logical.discipline[field],source.threeCushion[field],`${label} ${field}`);
  }else assert.deepEqual(logical.discipline,{},label);
}

async function mutateEnvelope(payload,mutator,{rehash=false}={}){
  const envelope=format.base45Decode(payload.slice(format.PREFIX.length));
  mutator(envelope);
  if(rehash){
    const compressed=envelope.slice(format.HEADER_BYTES+format.DIGEST_BYTES);
    const digest=await nodeCodec.digest(compressed);
    envelope.set(digest,format.HEADER_BYTES);
  }
  return format.PREFIX+format.base45Encode(envelope);
}

test("Base45 audited vectors and byte round-trip",()=>{
  for(const [plain,encoded] of [["AB","BB8"],["Hello!!","%69 VD92EX0"],["base-45","UJCLQE7W581"],["ietf!","QED8WEX0"]]){
    const bytes=new TextEncoder().encode(plain);
    assert.equal(format.base45Encode(bytes),encoded);
    assert.deepEqual(format.base45Decode(encoded),bytes);
  }
});

test("18 production-adapter fixtures preserve facts through compact encode/decode",async()=>{
  assert.equal(fixtures.length,18);
  assert.deepEqual(new Set(fixtures.map(item=>item.source.gameType)),new Set(validation.GAME_TYPES));
  for(const fixture of fixtures){
    const logical=logicalFor(fixture);
    assert.equal(logical.gameType,fixture.source.gameType,fixture.fixtureId);
    assert.equal(logical.sharedMatchId,fixture.sharedMatchId,fixture.fixtureId);
    assert.equal(logical.winner,fixture.source.winner,fixture.fixtureId);
    assert.equal(logical.result,fixture.source.result,fixture.fixtureId);
    assert.equal(logical.startedAt,fixture.source.startedAt,fixture.fixtureId);
    assert.equal(logical.endedAt,fixture.source.endedAt,fixture.fixtureId);
    assert.equal(logical.players[1].name,fixture.source.players[1].name,fixture.fixtureId);
    assert.equal(logical.players[2].name,fixture.source.players[2].name,fixture.fixtureId);
    assert.deepEqual(logical.progress,fixture.source.progress,fixture.fixtureId);
    assertProductionParity(logical,fixture.source,fixture.fixtureId);
    assert.deepEqual(adapters.expandSharedMatchV1(adapters.compactSharedMatchV1(logical)),logical,fixture.fixtureId);
    const encoded=await format.encodeSharedMatchV1(logical,nodeCodec);
    assert.deepEqual(await format.decodeSharedMatchV1(encoded,nodeCodec),logical,fixture.fixtureId);
    assert.equal(await format.encodeSharedMatchV1(logical,nodeCodec),encoded,`${fixture.fixtureId} deterministic`);
  }
});

test("18 fixtures omit sender-private and app-policy fields",async()=>{
  for(const fixture of fixtures){
    const logical=logicalFor(fixture);
    const compact=adapters.compactSharedMatchV1(logical);
    const encoded=await format.encodeSharedMatchV1(logical,nodeCodec);
    assert.doesNotMatch(JSON.stringify(logical),forbidden,fixture.fixtureId);
    assert.doesNotMatch(JSON.stringify(compact),forbidden,fixture.fixtureId);
    assert.ok(!encoded.includes("Private"),fixture.fixtureId);
  }
});

test("privacy validator rejects prohibited fields at any depth",()=>{
  const logical=logicalFor(fixtures[0]);
  logical.players[1].memo="private";
  assert.throws(()=>validation.validateSharedMatchV1(logical),expectCode("PRIVACY_FIELD"));
});

test("production JPA identifier is jpa9Ball and prototype jpa9 normalizes only at adapter boundary",()=>{
  const jpa=fixtures.find(item=>item.gameType==="jpa9");
  assert.equal(jpa.source.gameType,"jpa9Ball");
  assert.equal(logicalFor(jpa).gameType,"jpa9Ball");
  assert.equal(adapters.normalizeProductionGameType("jpa9"),"jpa9Ball");
});

test("Demo records are valid fixture input but never export eligible in Demo mode",()=>{
  const source=fixtures[0].source;
  assert.equal(validation.isExportEligible(source),true);
  assert.equal(validation.isExportEligible(source,{demoMode:true}),false);
  assert.throws(()=>adapters.buildSharedMatchV1(source,{sharedMatchId:fixtureUuid(source.id),demoMode:true}),expectCode("DEMO_EXPORT_REJECTED"));
});

test("duplicate boundary helper is pure and case insensitive",()=>{
  const id=fixtures[0].sharedMatchId;
  const records=[{id:"local",sharedMatchId:id.toUpperCase()}];
  assert.equal(validation.findDuplicateSharedMatchId(records,id),records[0]);
  assert.equal(validation.findDuplicateSharedMatchId([],id),null);
});

test("decode negative boundary has stable typed error codes",async()=>{
  const encoded=await format.encodeSharedMatchV1(logicalFor(fixtures[0]),nodeCodec);
  await assert.rejects(()=>format.decodeSharedMatchV1("https://example.invalid",nodeCodec),expectCode("NON_CUESCORE"));
  await assert.rejects(()=>format.decodeSharedMatchV1(format.PREFIX+"0",nodeCodec),expectCode("MALFORMED_BASE45"));
  await assert.rejects(()=>format.decodeSharedMatchV1(format.PREFIX+format.base45Encode(new Uint8Array([0x43,0x53,0x4d,0x31])),nodeCodec),expectCode("TRUNCATED"));
  const unknownVersion=await mutateEnvelope(encoded,envelope=>{envelope[4]=2;});
  await assert.rejects(()=>format.decodeSharedMatchV1(unknownVersion,nodeCodec),expectCode("UNSUPPORTED_VERSION"));
  const digestMismatch=await mutateEnvelope(encoded,envelope=>{envelope[envelope.length-1]^=1;});
  await assert.rejects(()=>format.decodeSharedMatchV1(digestMismatch,nodeCodec),expectCode("DIGEST_MISMATCH"));
  const corruptDeflate=await mutateEnvelope(encoded,envelope=>{envelope.fill(0xff,format.HEADER_BYTES+format.DIGEST_BYTES);},{rehash:true});
  await assert.rejects(()=>format.decodeSharedMatchV1(corruptDeflate,nodeCodec),expectCode("INFLATE_FAILURE"));
  await assert.rejects(()=>format.decodeSharedMatchV1(format.PREFIX+"0".repeat(validation.LIMITS.maxEncodedChars),nodeCodec),expectCode("OVERSIZE"));
  const oversizedCompressed=new Uint8Array(validation.LIMITS.maxEnvelopeBytes+1);
  oversizedCompressed.set(format.MAGIC);oversizedCompressed[4]=format.ENVELOPE_VERSION;oversizedCompressed[5]=format.COMPRESSION_DEFLATE_RAW;
  await assert.rejects(()=>format.decodeSharedMatchV1(format.PREFIX+format.base45Encode(oversizedCompressed),nodeCodec),expectCode("OVERSIZE"));
  const oversizedInflate=await mutateEnvelope(encoded,envelope=>{
    const value=validation.LIMITS.maxInflatedBytes+1;
    envelope[6]=(value>>>24)&255;envelope[7]=(value>>>16)&255;envelope[8]=(value>>>8)&255;envelope[9]=value&255;
  });
  await assert.rejects(()=>format.decodeSharedMatchV1(oversizedInflate,nodeCodec),expectCode("OVERSIZE"));
});

test("known events with future detail fields fall back losslessly",()=>{
  const event={sequence:1,type:"ball_pocketed",rack:1,inning:1,player:1,ball:3,points:1,pocketCount:1,futureFact:"kept"};
  const logical=logicalFor(fixtures[0]);logical.events=[event];
  const roundTrip=adapters.expandSharedMatchV1(adapters.compactSharedMatchV1(logical));
  assert.deepEqual(roundTrip.events,[event]);
});

test("logical schema negative boundary covers UUID, games, players, result and discipline",()=>{
  const base=logicalFor(fixtures[0]);
  const cases=[
    ["INVALID_UUID",value=>{value.sharedMatchId="not-a-uuid";}],
    ["UNSUPPORTED_GAME_TYPE",value=>{value.gameType="snooker";}],
    ["MISSING_PLAYER_A",value=>{delete value.players[1];}],
    ["MISSING_PLAYER_B",value=>{delete value.players[2];}],
    ["INVALID_RESULT",value=>{value.result="pending";}],
    ["MISSING_GAME_DATA",value=>{value.discipline={};}],
  ];
  for(const [code,mutate] of cases){const value=clone(base);mutate(value);assert.throws(()=>validation.validateSharedMatchV1(value),expectCode(code),code);}
});

test("bounded object limits reject depth, array and event abuse",()=>{
  let deep={};let cursor=deep;for(let index=0;index<validation.LIMITS.maxObjectDepth+1;index+=1){cursor.next={};cursor=cursor.next;}
  assert.throws(()=>validation.assertBoundedStructure(deep),expectCode("OVERSIZE"));
  assert.throws(()=>validation.assertBoundedStructure(new Array(validation.LIMITS.maxArrayItems+1).fill(0)),expectCode("OVERSIZE"));
  const logical=logicalFor(fixtures[0]);logical.events=new Array(validation.LIMITS.maxEvents+1).fill({type:"shot",player:1});
  assert.throws(()=>validation.validateSharedMatchV1(logical),expectCode("INVALID_SCHEMA"));
});

test("Stage 1 modules contain no storage, DOM, camera, QR or backup integration",()=>{
  const names=["match-sharing-validation-v1.js","match-sharing-adapters-v1.js","match-sharing-format-v1.js"];
  for(const name of names){
    const source=fs.readFileSync(new URL(`../${name}`,import.meta.url),"utf8");
    assert.doesNotMatch(source,/localStorage|sessionStorage|document\.|navigator\.mediaDevices|BarcodeDetector|QRCode|CueScoreBackup/i,name);
  }
});

test("codec rejects adapters that do not promise bounded inflate",async()=>{
  const logical=logicalFor(fixtures[0]);
  await assert.rejects(()=>format.encodeSharedMatchV1(logical,{compression:{deflateRaw(){},inflateRaw(){}}}),expectCode("CODEC_UNAVAILABLE"));
});

test("UUID v4 validation accepts only version 4 / RFC variant",()=>{
  assert.match(fixtures[0].sharedMatchId,validation.UUID_V4);
  for(const id of ["00000000-0000-1000-8000-000000000000","00000000-0000-4000-7000-000000000000",crypto.randomUUID().replace(/-/g,"")])assert.doesNotMatch(id,validation.UUID_V4);
});
