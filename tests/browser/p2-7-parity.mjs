/* Normalisations (each is a documented, intentional P2 difference or a random value, never a data difference): the in-memory growth-analysis object gained an additive
 * `statusCode` field in P2-3 (its text/number fields are compared); the in-progress snapshot carries a random session UUID (crypto.randomUUID).
 * P2-7 Data / QR / Backup / Identity parity probe (NOT part of `node --test`).
 * Usage: [P2_APP_ROOT=<checkout>] node tests/browser/p2-7-parity.mjs <out.json> [lang=ja]
 * Drives the REAL app (Pro through the public adapter, frozen clock, seeded Math.random) and records, as digests + readable samples: the Backup export (file name and
 * bytes), the CSV export, every localStorage key, Analytics aggregates / growth analysis per player and discipline, Player Identity matching (incl. width / kana variants),
 * list orders, Free/Pro limits and the IAP product id, the in-progress snapshot written by a started match, and a Backup -> wipe -> Restore round trip.
 * Run on the pre-P2 baseline (a841cbc) and on the current tree; the outputs must be identical, and identical across UI languages. */
import fs from "node:fs";
import { startApp, seed } from "./p2-browser-kit.mjs";
const OUT = process.argv[2], LANG = process.argv[3] || "ja";
process.env.P2_DATE_EDGES = "1";
const base = seed({ lang: LANG, rich: true });
// Identity variants: names that only match through the identity rules (width, case, kana). No registeredPlayerId -> name matching.
const variant = (id, n1, n2, iso) => { const r = JSON.parse(JSON.stringify(base.records[0])); r.id = id; r.winner = 1; r.players = { ...r.players, 1: { ...r.players[1], name: n1 }, 2: { ...r.players[2], name: n2 } }; delete r.players[1].registeredPlayerId; delete r.players[2].registeredPlayerId; r.endedAt = r.playedAt = r.startedAt = iso; return r; };
const extra = [variant("id-var-1", "ＴＡＫＡ", "taka", "2026-04-01T03:00:00Z"), variant("id-var-2", "TaKa", "ひな", "2026-04-02T03:00:00Z"), variant("id-var-3", "ヒナ", "ﾋﾅ", "2026-04-03T03:00:00Z"), variant("id-var-4", "なおき", "さくら ", "2026-04-04T03:00:00Z")];
const records = [...extra, ...base.records];
const script = base.script.replace(/localStorage\.setItem\("rotationScoreboard\.matchRecords\.v1",[^)]*\)\);/, `localStorage.setItem("rotationScoreboard.matchRecords.v1",${JSON.stringify(JSON.stringify(records))});`);
const app = await startApp({ lang: LANG, mode: "pro", seedData: { ...base, records, script }, freezeTime: true, watchdogMs: Number(process.env.P2_WATCHDOG || 400000) });
const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
const PRE = `const h=s=>{let x=5381,y=52711;for(const c of String(s)){const k=c.codePointAt(0);x=((x<<5)+x+k)>>>0;y=((y<<5)^(y>>>2)^k)>>>0}return x.toString(16)+y.toString(16)};window.confirm=()=>true;window.alert=()=>{};`;
await ev(`let seedv=12345;Math.random=()=>{seedv=(seedv*1664525+1013904223)%4294967296;return seedv/4294967296};window.__dl=[];const oc=URL.createObjectURL;URL.createObjectURL=function(b){if(b instanceof Blob){b.text().then(t=>window.__dl.push({kind:"blob",type:b.type,size:b.size,text:t}))}return oc.call(this,b)};const ac=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){window.__dl.push({kind:"anchor",download:this.download||null});return ac.call(this)};return true`);
const R = {};
const dump = `(()=>{const o={};for(const k of Object.keys(localStorage).sort()){if(k==="__p2_seeded"||k==="cueScore.language.v1")continue;o[k]=h(localStorage.getItem(k))}return o})()`;
R.storageInitial = await ev(`${PRE}return ${dump}`);
// A. Backup export
await ev(`${PRE}window.__dl.length=0;await window.cueScoreExportBackup();await W(900);return true`);
R.backup = await ev(`${PRE}const d=window.__dl.filter(x=>x.kind==="blob"),a=window.__dl.filter(x=>x.kind==="anchor");const t=d[0]?.text||"";let parsed=null;try{parsed=JSON.parse(t)}catch(e){}return {files:a.map(x=>x.download),size:t.length,hash:h(t),keys:parsed?Object.keys(parsed):null,format:parsed?.format,schemaVersion:parsed?.schemaVersion,counts:parsed?{players:(parsed.players||parsed.data?.players||[]).length,records:(parsed.matchRecords||parsed.data?.matchRecords||[]).length}:null,head:t.slice(0,160)}`);
const backupText = await ev(`return (window.__dl.find(x=>x.kind==="blob")||{}).text||""`);
// B. CSV
await ev(`${PRE}window.__dl.length=0;document.getElementById("exportCsvBtn").click();await W(1200);return true`);
R.csv = await ev(`${PRE}const d=window.__dl.filter(x=>x.kind==="blob"),a=window.__dl.filter(x=>x.kind==="anchor");const t=d[0]?.text||"";const lines=t.split("\\n");return {files:a.map(x=>x.download),size:t.length,hash:h(t),rows:lines.length,header:lines[0]?.slice(0,200)}`);
// D. Analytics / growth
R.analytics = await ev(`${PRE}const ctx=window.CueScoreAnalysisV2Context;const out={};const players=readPlayerLibrary();for(const p of players){const recs=recordsForRegisteredPlayer(p);const per={};for(const d of ["9ball","10ball","rotation","jpa9","straightPool","threeCushion"]){const f=recs.filter(r=>ctx.discipline(r)===d);per[d]=h(JSON.stringify([ctx.aggregate(f.slice(0,10),p),ctx.aggregate(f.slice(10,20),p),f.length]))}
 let growth=null;try{const g=buildPlayerGrowthAnalysisV740(recs,p);const ins=buildPlayerInsightsV750(recs,p,g);growth=h(JSON.stringify([g,buildRionCoachV760(ins,g)],(k,v)=>k==="statusCode"?undefined:typeof v==="string"?(k==="comment"?"":(v.match(/[+\\-]?\\d+(?:\\.\\d+)?%?/g)||[]).join(",")):v))}catch(e){growth="err:"+e.message}
 out[p.id+":"+p.name]={records:recs.length,per,growth}}return out`);
// E. Identity
R.identity = await ev(`${PRE}const names=["ＴＡＫＡ","taka","TaKa","ひな","ヒナ","ﾋﾅ","なおき","さくら","さくら ","ＮＡＯＫＩ","Ｎａｏｋｉ"];const out={};for(const n of names)out[n]=recordsForRegisteredPlayer({id:"x-"+n,name:n}).map(r=>r.id).sort().join(",");const reg=readPlayerLibrary().map(p=>[p.id,recordsForRegisteredPlayer(p).map(r=>r.id).sort().join(",")]);return {byName:out,registered:reg}`);
// F. Orders
R.orders = await ev(`${PRE}const lib=readPlayerLibrary();const ord=window.CueScorePlayerLibraryOrderV1?window.CueScorePlayerLibraryOrderV1.orderPlayers(lib,p=>recordsForRegisteredPlayer(p)).map(p=>p.name):null;return {library:lib.map(p=>p.name),ordered:ord,records:readMatchRecords().map(r=>r.id),eligible:window.CueScoreRecordAccess.getEligibleRecords(readMatchRecords()).length}`);
// G. Free/Pro, IAP
R.entitlement = await ev(`${PRE}const t=await (await fetch("./monetization-v1.js")).text();const m=/const PRO_PRODUCT_ID="([^"]+)"/.exec(t);const ra=await (await fetch("./record-access-v1.js")).text();const lim=/FREE_LIMIT=(\\d+)/.exec(ra);
 const pro={isPro:window.CueScoreEntitlement.isPro(),features:window.CueScoreFeatureAccess.snapshot(),eligible:window.CueScoreRecordAccess.getEligibleRecords(readMatchRecords()).length};
 return {productId:m&&m[1],freeLimit:lim&&Number(lim[1]),pro}`);
// H. Snapshot of a started match
await ev(`${PRE}document.querySelector('[data-phase1-tab="home"]').click();await W(500);document.querySelector(".home-new-match-v2").click();await W(700);document.querySelector('.cue-discipline-v1[data-discipline="9ball"]').click();await W(500);
 if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);document.querySelector("[data-select-player]")?.click();await W(500)}
 for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await W(100);document.getElementById("startGameBtn").click();for(let i=0;i<60&&!document.querySelector(".app").classList.contains("pro-game-mode");i++)await W(100);await W(1200);return true`);
R.snapshot = await ev(`${PRE}const after=${dump};const before=${JSON.stringify(R.storageInitial)};const added={};for(const k of Object.keys(after))if(before[k]!==after[k])added[k]=k.indexOf("inProgress")>=0?"<random-uuid-bearing>":after[k];const snap={};for(const k of Object.keys(localStorage)){if(/inProgress|snapshot|inprogress/i.test(k)){const raw=localStorage.getItem(k);let p=null;try{p=JSON.parse(raw)}catch(e){}snap[k]={hash:h(raw.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,"<uuid>")),keys:p&&typeof p==="object"?Object.keys(p).sort():null,game:p?.state?.activeGameTypeV1??null,schema:p?.schemaVersion??p?.version??null}}}return {changedKeys:Object.keys(added).sort(),snap}`);
// I. Backup -> wipe -> restore round trip (the restore flow reloads the page, so the steps are split)
const DATA_KEYS = ["rotationScoreboard.players.v1", "rotationScoreboard.matchRecords.v1", "rotationScoreboard.matchCategories.v1", "rotationScoreboard.matchSeasons.v1"];
const keep = await ev(`${PRE}return Object.fromEntries(${JSON.stringify(DATA_KEYS)}.map(k=>[k,h(localStorage.getItem(k)||"")]))`);
await ev(`${PRE}for(const k of ${JSON.stringify(DATA_KEYS)})localStorage.removeItem(k);const input=document.getElementById("backupFileInput");const dt=new DataTransfer();dt.items.add(new File([${JSON.stringify(backupText)}],"CueScore_Backup.json",{type:"application/json"}));input.files=dt.files;setTimeout(()=>input.dispatchEvent(new Event("change",{bubbles:true})),50);return true`);
await new Promise(r => setTimeout(r, 6000));
let restored = null;
for (let i = 0; i < 20 && !restored; i++) { try { restored = await ev(`${PRE}return Object.fromEntries(${JSON.stringify(DATA_KEYS)}.map(k=>[k,h(localStorage.getItem(k)||"")]))`); } catch (e) { await new Promise(r => setTimeout(r, 1000)); } }
R.restore = { before: keep, after: restored, equal: JSON.stringify(keep) === JSON.stringify(restored) };
// source regions of the data-bearing code (byte identity of the code paths that the P2 changes must not touch)
R.sourceRegions = await ev(`${PRE}const t=await (await fetch("./index.html")).text();const grab=(start)=>{const i=t.indexOf(start);if(i<0)return null;let d=0,j=t.indexOf("{",i);for(let k=j;k<t.length;k++){if(t[k]==="{")d++;else if(t[k]==="}"){d--;if(d===0)return h(t.slice(i,k+1))}}return null};/* P3: exportCsv / exportBackup contain translated UI messages; their output bytes are compared above and their source identity is pinned (ja-resolved) in tests/p2-7-data-parity-static.test.mjs */return {makeBackupPayload:grab("function makeBackupPayload()"),dateStamp:grab("function dateStamp("),formatCsvDateParts:grab("function formatCsvDateParts("),saveMatchRecordV1:grab("function saveMatchRecordV1("),persistInProgressSnapshotV1:grab("function persistInProgressSnapshotV1("),normalizePlayers:grab("window.cueScoreNormalizePlayersToDefaultAvatarV4")}`);
R.errors = await app.evalJs("window.__p2.errors");
fs.writeFileSync(OUT, JSON.stringify({ lang: LANG, results: R }, null, 1));
await app.close();
console.log(JSON.stringify({ lang: LANG, categories: Object.keys(R), backupSize: R.backup.size, csvRows: R.csv.rows, errors: R.errors.length }));
process.exit(0);
