import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync} from "node:fs";
const require=createRequire(import.meta.url);
const {createRecordPolicy,FREE_LIMIT}=require("../record-access-v1.js");
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const monetization=readFileSync(new URL("../monetization-v1.js",import.meta.url),"utf8");
const monetizationCss=readFileSync(new URL("../monetization-v1.css",import.meta.url),"utf8");
const storeKitPlugin=readFileSync(new URL("../ios/App/App/CueScoreStoreKitPlugin.swift",import.meta.url),"utf8");
const records=Array.from({length:35},(_,index)=>({id:`match-${String(index+1).padStart(2,"0")}`,endedAt:new Date(2026,0,index+1).toISOString(),disciplineId:index%2?"9ball":"10ball"}));

test("Free eligible records are the newest 20 globally and never mutate storage input",()=>{
  const policy=createRecordPolicy(()=>false),before=records.map(record=>record.id);
  const eligible=policy.getEligibleRecords(records);
  assert.equal(FREE_LIMIT,20);assert.equal(eligible.length,20);assert.equal(eligible[0].id,"match-35");assert.equal(eligible.at(-1).id,"match-16");assert.deepEqual(records.map(record=>record.id),before);
  assert.deepEqual(eligible.filter(record=>record.disciplineId==="9ball"),records.slice().sort(policy.stableNewest).slice(0,20).filter(record=>record.disciplineId==="9ball"));
});

test("Pro receives every saved record and Free reports retained hidden records",()=>{
  assert.equal(createRecordPolicy(()=>true).getEligibleRecords(records).length,35);
  assert.equal(createRecordPolicy(()=>false).hasHiddenRecords(records),true);
  assert.equal(createRecordPolicy(()=>false).hasHiddenRecords(records.slice(0,20)),false);
});

test("all record consumers start from the common policy while match writes keep raw records",()=>{
  assert.match(html,/sourceRecords = window\.CueScoreRecordAccess\?\.getEligibleRecords\(allSavedRecordsV1\)/);
  assert.match(html,/eligibleRecordsV1 = window\.CueScoreRecordAccess\?\.getEligibleRecords\(allSavedRecordsV1\)/);
  assert.match(html,/const existingRecords = readMatchRecords\(\)/);
  assert.match(html,/record-access-v1\.js[\s\S]*monetization-v1\.js/);
});

test("CueScore Pro hero uses the official CueScore logo mark",()=>{
  assert.match(monetization,/CueScore_LogoMark_Black\.svg/);
  assert.doesNotMatch(monetization,/CueScore_LogoMark_White\.svg/);
  assert.doesNotMatch(monetization,/cue-pro-mark-v1\">C</);
});

test("minimal Pro UI stays compact and restores its exact origin",()=>{
  assert.match(monetizationCss,/\.cue-pro-scroll-v1\{[^}]*overflow:hidden/);
  assert.match(monetizationCss,/\.settings-data-row-v1 \.cue-pro-badge-v1\{[^}]*white-space:nowrap/);
  assert.doesNotMatch(monetization,/cue-pro-legal-v1/);
  assert.match(monetization,/originScroll=captureScroll\(currentSource\)/);
  assert.match(monetization,/source==="historyLimit"[\s\S]*?document\.getElementById\("recordsList"\)/);
  assert.match(monetization,/filter:screen\?\.querySelector\("\[data-records-discipline-v2\]\.is-selected"\)/);
  assert.match(monetization,/restoreAfterRender\(snapshot\)/);
  assert.match(monetization,/requestAnimationFrame\(\(\)=>\{restoreScroll\(snapshot\);requestAnimationFrame/);
  assert.match(monetization,/focus\?\.\(\{preventScroll:true\}\)/);
  assert.match(monetization,/requestAnimationFrame\(\(\)=>restoreScroll\(snapshot\)\)/);
  assert.match(html,/🔒 Proですべての履歴を見る/);
});

test("one Pro screen owns all approved entry sources without a persisted entitlement flag",()=>{
  for(const source of ["personalBest","analysis","opponents","historyLimit","backup","restore"])assert.match(monetization,new RegExp(`${source}:`));
  assert.doesNotMatch(monetization,/localStorage\.(getItem|setItem).*pro/i);
  assert.match(monetization,/verified===true/);
});

test("StoreKit 2 bridge uses the exact approved Product ID and verified entitlement",()=>{
  const productId="com.takaakimailboxstar.cuescoreapps.pro";
  assert.match(monetization,new RegExp(productId.replaceAll(".","\\.")));
  assert.match(storeKitPlugin,new RegExp(productId.replaceAll(".","\\.")));
  assert.match(storeKitPlugin,/Transaction\.currentEntitlements/);
  assert.match(storeKitPlugin,/case \.verified/);
  assert.match(storeKitPlugin,/AppStore\.sync\(\)/);
});
