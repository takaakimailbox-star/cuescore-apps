/* P2-5-0 / L2 observer scenarios. NOT part of `node --test`.
 * Usage: node tests/browser/p2-5-0-observer-scenarios.mjs <outDir> [lang=ja] [mode=free|pro]
 * Drives the REAL application (isolated headless Chrome, Asia/Tokyo) through every scenario that matters to the 23 MutationObservers and
 * records, per scenario: returned DOM facts, and per-observer fires / text-bearing writes / CHANGED writes (attributed to the observer
 * that ran or scheduled the work). Synthetic DOM is injected ONLY into the throw-away browser's page; no production file is modified.
 * Reachability is explicit in each scenario: `ui` = reached through real clicks, `fn` = production function called directly,
 * `inject` = synthetic nodes inserted into a real root so the REAL callback runs on realistic input. */
import fs from "node:fs";
import path from "node:path";
import { startApp, delta, sleep, sha, seed, WORDING_CASES } from "./p2-browser-kit.mjs";
import { observerInventory } from "../helpers/p2-observers.mjs";

const OUT = path.resolve(process.argv[2] || "p2-5-0-scenarios-out");
const LANG = process.argv[3] || "ja";
const MODE = process.argv[4] || "free";
fs.mkdirSync(OUT, { recursive: true });

const inv = observerInventory();
const keyOf = site => { const m = /^([^:?]+)[^:]*:(\d+)$/.exec(site || ""); if (!m) return "?" + site; const hit = inv.find(o => o.file === m[1] && o.line === Number(m[2])); return hit ? hit.file + "#" + hit.k : "?" + site; };
const agg = snap => { const out = {}; for (const o of snap) { if (!/:\d+$/.test(String(o.site))) continue; /* observers created by this probe itself (evaluate scripts have no source URL) */ const k = keyOf(o.site); const sum = x => Object.values(x || {}).reduce((a, b) => a + b, 0); const a = out[k] || (out[k] = { instances: 0, fires: 0, writes: 0, changed: 0, jpWrites: 0 }); a.instances++; a.fires += sum(o.fires); a.writes += sum(o.writes); a.changed += sum(o.changed); a.jpWrites += sum(o.jpWrites); } return out; };
const diff = (a, b) => { const out = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const x = a[k] || { fires: 0, writes: 0, changed: 0, jpWrites: 0 }, y = b[k] || { fires: 0, writes: 0, changed: 0, jpWrites: 0 }; const d = { fires: y.fires - x.fires, writes: y.writes - x.writes, changed: y.changed - x.changed, jpWrites: y.jpWrites - x.jpWrites }; if (d.fires || d.writes || d.changed) out[k] = d; } return out; };

let app; let targetsOut = null; const totals = {}; const errorsAll = []; let created = 0, chromeVersion = "";
const ev = code => app.evalJs(`(async()=>{${code}})()`);
const H = `const h=s=>{let x=5381;for(const c of String(s))x=((x<<5)+x+c.codePointAt(0))>>>0;return x.toString(16)};`;
const W = ms => `await new Promise(r=>setTimeout(r,${ms}));`;
const snap = async () => agg(await app.evalJs("window.__p2.snapshot()"));
const sumInto = (into, a) => { for (const [k, v] of Object.entries(a)) { const t = into[k] || (into[k] = { instances: 0, fires: 0, writes: 0, changed: 0, jpWrites: 0 }); for (const f of Object.keys(t)) t[f] += v[f]; } };
const scenarios = {}; const dom = {};
const dumpFn = `const dump=()=>{const out=["lang="+document.documentElement.lang];const skip=new Set(["SCRIPT","STYLE","NOSCRIPT"]);const w=document.createTreeWalker(document.body,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);let n=w.currentNode;while((n=w.nextNode())){if(n.nodeType===3){const p=n.parentElement;if(p&&(skip.has(p.tagName)||p.closest("svg")))continue;const t=n.textContent.replace(/\\s+/g," ").trim();if(t)out.push("T "+t);}else if(n.nodeType===1&&!skip.has(n.tagName)){for(const a of["aria-label","placeholder","title","alt"]){const v=n.getAttribute(a);if(v)out.push("@"+a+" "+v.replace(/\\s+/g," ").trim());}}}return out;};`;
const capture = async name => { const lines = await app.evalJs(`(()=>{${dumpFn}return dump();})()`); dom[name] = { sha256: sha(lines.join("\n")), lines: lines.length }; fs.writeFileSync(path.join(OUT, `dom_${LANG}_${MODE}_${name}.txt`), lines.join("\n") + "\n"); };
async function scenario(name, reach, code, { wait = 500, shot } = {}) {
  await app.evalJs(`window.__p2.phase=${JSON.stringify(name)};true`);
  const before = await snap(); let result, error = null;
  try { result = await ev(code); } catch (e) { error = String(e.message).slice(0, 300); }
  await sleep(wait);
  const after = await snap();
  scenarios[name] = { reach, result: result === undefined ? null : result, error, observers: diff(before, after) };
  if (shot) await capture(shot);
}
const tab = key => `document.querySelector('[data-phase1-tab="${key}"]').click();${W(800)}`;

async function boot() {
  app = await startApp({ lang: LANG, mode: MODE, seedData: seed({ lang: LANG }) });
  chromeVersion = app.version;
  /* write trap: every innerHTML write inside .analysis-v2 is logged synchronously (before any observer can react), with the observer context that performed it */
  await app.evalJs(`(()=>{const log=window.__p250=[];const d=Object.getOwnPropertyDescriptor(Element.prototype,"innerHTML");Object.defineProperty(Element.prototype,"innerHTML",{configurable:true,enumerable:d.enumerable,get:d.get,set(v){try{if(this.closest&&this.closest(".analysis-v2"))log.push({tag:this.tagName.toLowerCase(),cls:String(this.className||"").slice(0,40),view:this.dataset&&this.dataset.analysisView||null,obs:window.__p2.ctx,html:String(v).slice(0,160)});}catch(_){}return d.set.call(this,v);}});return true})()`);
}
async function endGroup() { const snapRaw = await app.evalJs("window.__p2.snapshot()"); if (!targetsOut) targetsOut = snapRaw.filter(o => /:\d+$/.test(String(o.site))).map(o => ({ key: keyOf(o.site), site: o.site.replace(/\?[^:]*:/, ":"), targets: o.targets }));  sumInto(totals, agg(snapRaw)); created += snapRaw.filter(o => /:\d+$/.test(String(o.site))).length; errorsAll.push(...(await app.evalJs("window.__p2.errors"))); await app.close(); }
await boot();
/* ---------- A. initial display / quiescence ---------- */
await scenario("A1-boot-idle", "ui", `${W(1500)}return {booted:!document.documentElement.classList.contains("cue-app-booting-v2"),lang:document.documentElement.lang}`, { wait: 100, shot: "home" });
await scenario("A2-idle-mutation-source", "ui+inject", `const seen={};const mo=new MutationObserver(ms=>{for(const m of ms){const t=m.target;const d=(t.nodeType===1?t.tagName.toLowerCase()+(t.id?"#"+t.id:"")+(typeof t.className==="string"&&t.className?"."+t.className.trim().split(/\\s+/)[0]:""):"#text");const k=m.type+":"+(m.attributeName||"")+"@"+d;seen[k]=(seen[k]||0)+1;}});mo.observe(document.body,{subtree:true,childList:true,attributes:true,characterData:true});${W(1200)}mo.disconnect();return Object.entries(seen).sort((a,b)=>b[1]-a[1]).slice(0,8)`, { wait: 50 });
/* ---------- B. screen transitions (tabs) ---------- */
await scenario("B1-tab-player", "ui", `${tab("player")}return {title:document.getElementById("playerLibraryTitle")?.textContent,rows:document.querySelectorAll(".player-management-row-v1").length}`, { shot: "player-list" });
await scenario("B2-tab-history", "ui", `${tab("history")}return {cards:document.querySelectorAll("#recordsList [data-record-id]").length}`, { shot: "history" });
await scenario("B3-tab-settings", "ui", `${tab("settings")}return {rows:document.querySelectorAll("[data-settings-action]").length}`, { shot: "settings" });
await scenario("B4-tab-home", "ui", `${tab("home")}return {newMatch:!!document.querySelector(".home-new-match-v2")}`, { shot: "home-again" });
/* ---------- C. modal: player editor (OBS-10) ---------- */
await scenario("C1-player-editor-edit-x3", "ui", `${tab("player")}
 const read=()=>({title:document.getElementById("playerEditorModalTitleV1")?.textContent,copy:document.getElementById("playerEditorModalCopyV1")?.innerHTML,save:document.getElementById("playerEditorSaveBtn")?.textContent,cancel:document.querySelector(".player-editor-cancel-v1")?.textContent,nameLabel:document.querySelector('label[for="playerEditorName"]')?.textContent,raceLabel:document.querySelector('label[for="playerEditorRace"]')?.textContent,placeholder:document.getElementById("playerEditorName")?.getAttribute("placeholder"),deleteHidden:document.getElementById("playerEditorDeleteBtn")?.classList.contains("hidden")??null,open:!document.getElementById("playerEditor").classList.contains("hidden")});
 const out=[];for(let i=0;i<3;i++){const b=document.querySelector("[data-edit-player]");if(!b)throw new Error("no edit button");b.click();${W(700)}out.push(read());document.querySelector(".player-editor-cancel-v1").click();${W(500)}}
 return out`, { shot: "player-editor-closed" });
await scenario("C2-player-editor-create", "ui", `const b=document.getElementById("playerLibraryAddBtn");b.click();${W(800)}const r={title:document.getElementById("playerEditorModalTitleV1")?.textContent,copy:document.getElementById("playerEditorModalCopyV1")?.innerHTML,save:document.getElementById("playerEditorSaveBtn")?.textContent,libTitle:document.getElementById("playerLibraryTitle")?.textContent,open:!document.getElementById("playerEditor").classList.contains("hidden")};document.querySelector(".player-editor-cancel-v1").click();${W(500)}return r`);
/* OBS-17: title writer, idempotence under repeated unrelated body mutations */
await scenario("C3-player-root-title-reconcile", "ui+inject", `const t=()=>document.getElementById("playerLibraryTitle")?.textContent;const first=t();for(let i=0;i<8;i++){document.body.dataset.p250=String(i);const s=document.createElement("span");document.body.appendChild(s);s.remove();${W(60)}}delete document.body.dataset.p250;return {first,after:t(),ctx:document.body.dataset.cuePlayerContext||null}`);
await scenario("C4-tab-home-again", "ui", tab("home"));
/* ---------- OBS-03 setup states (K reach: ui + function-level player library variations) ---------- */
await scenario("D1-match-setup-states", "ui+fn", `${tab("home")}document.querySelector(".home-new-match-v2").click();${W(800)}
 const key="rotationScoreboard.players.v1";const saved=localStorage.getItem(key);const all=JSON.parse(saved);
 const state=()=>({p1:document.getElementById("p1NameDisplayV1")?.textContent,p2:document.getElementById("p2NameDisplayV1")?.textContent,guide:(document.querySelector(".match-player-guide-v18")?.textContent||""),guideHidden:document.querySelector(".match-player-guide-v18")?.hidden,startDisabled:document.getElementById("startGameBtn")?.disabled,aria:document.getElementById("startGameBtn")?.getAttribute("aria-disabled")});
 const out={initial:state()};
 for(const [label,list] of [["none",[]],["one",all.slice(0,1)],["two",all.slice(0,2)]]){localStorage.setItem(key,JSON.stringify(list));window.CueScoreBuild18PlayerSelection.refresh();${W(300)}out[label]=state();}
 localStorage.setItem(key,saved);window.CueScoreBuild18PlayerSelection.refresh();${W(400)}out.restored=state();return out`, { shot: "match-setup" });
await scenario("D2-setup-observer-path", "ui+fn", `const key="rotationScoreboard.players.v1";const saved=localStorage.getItem(key);const all=JSON.parse(saved);const ov=document.getElementById("playerLibraryOverlay");
 const state=()=>({p1:document.getElementById("p1NameDisplayV1")?.textContent,p2:document.getElementById("p2NameDisplayV1")?.textContent,guideHidden:document.querySelector(".match-player-guide-v18")?.hidden,guide:document.querySelector(".match-player-guide-v18")?.textContent||""});
 const out={before:state()};
 localStorage.setItem(key,JSON.stringify([]));ov.classList.add("p250-toggle");${W(500)}ov.classList.remove("p250-toggle");${W(500)}out.noPlayers=state();
 localStorage.setItem(key,JSON.stringify(all.slice(0,1)));ov.classList.add("p250-toggle");${W(500)}ov.classList.remove("p250-toggle");${W(500)}out.onePlayer=state();
 localStorage.setItem(key,saved);ov.classList.add("p250-toggle");${W(500)}ov.classList.remove("p250-toggle");${W(500)}out.restored=state();return out`, { wait: 300 });
/* ---------- E/F/G generic: burst (multi-fire), re-entrancy, double rewrite ---------- */
await scenario("E1-burst-mutations", "inject", `const roots=[document.body,document.getElementById("playerLibraryOverlay"),document.querySelector(".analysis-v2"),document.getElementById("playerMatchHistoryV2"),document.getElementById("playerOpponentRecordsV2"),document.getElementById("playerStatsBody")].filter(Boolean);
 for(let i=0;i<60;i++)for(const r of roots){const n=document.createElement("i");n.dataset.p250="burst";r.appendChild(n);n.remove();}
 ${W(900)}return {roots:roots.length,leftovers:document.querySelectorAll('[data-p250="burst"]').length}`, { wait: 800 });
await scenario("E2-idle-after-burst", "ui", `${W(1500)}return true`, { wait: 50 });
/* ---------- L. Cloud Sync hidden path (OBS-09) ---------- */
await scenario("L1-cloud-reachability", "ui+fn", `${tab("settings")}
 const cloudRows=[...document.querySelectorAll('[data-settings-action="cloud"]')].map(n=>({hidden:n.hidden,display:getComputedStyle(n).display}));
 const feature=[...document.querySelectorAll('[data-release-feature="cloud-sync"]')].map(n=>({tag:n.tagName,id:n.id||null,cls:String(n.className).slice(0,40),hidden:n.hidden,display:getComputedStyle(n).display,head:(n.querySelector("h2,h3,strong")||n).textContent.trim().slice(0,30),visible:!!n.offsetParent}));
 const canUse=window.CueScoreFeatureAccess.canUse("cloudSync");
 const suiteOpeners=[...document.querySelectorAll("[data-suite-open]")].map(n=>n.dataset.suiteOpen);
 const targets=Object.fromEntries(["suiteConnectionStatus","suiteDeviceStatus","suiteSyncStatus"].map(id=>{const n=document.getElementById(id);return [id,n?{text:n.textContent,cls:n.className,visible:!!(n.offsetParent)}:null];}));
 const sources=Object.fromEntries(["supabaseConnectionStatus","deviceIdStatus","cloudSyncStatus"].map(id=>{const n=document.getElementById(id);return [id,n?{text:n.textContent,visible:!!(n.offsetParent)}:null];}));
 return {canUse,cloudRows,feature,suiteOpeners,targets,sources}`, { shot: "settings-cloud" });
await scenario("L3-suite-views-reachability", "ui+fn", `${tab("settings")}const out={};
 const views=()=>[...document.querySelectorAll(".settings-suite-view-v2")].map(v=>({view:v.dataset.suiteView||v.id||"?",hidden:v.hidden,shown:!!v.offsetParent,feature:v.dataset.releaseFeature||null,mirrorTargetsShown:["suiteConnectionStatus","suiteDeviceStatus","suiteSyncStatus"].filter(id=>{const n=v.querySelector("#"+id);return n&&n.offsetParent}).length}));
 out.top=views();out.dataScreen=document.getElementById("dataManagementScreen").className;
 // forced activation of the hidden cloud entry (production click handler runs; setView('cloud') must refuse)
 const cloud=document.querySelector('[data-settings-action="cloud"]');if(cloud){cloud.click();${W(600)}}
 out.afterForcedCloudClick={views:views().filter(v=>v.shown||v.feature),dataScreen:document.getElementById("dataManagementScreen").className};
 // a reachable suite view for comparison (Pro only; Free is paywalled)
 const ex=document.querySelector('[data-settings-action="export"]');if(ex&&window.CueScoreEntitlement.isPro()){ex.click();${W(800)}out.afterExport=views().filter(v=>v.shown);const back=document.querySelector(".settings-suite-back-v2");back&&back.click();${W(500)}}
 return out`, { wait: 300 });
await scenario("L2-cloud-mirror-live-copy", "inject", `const src=document.getElementById("cloudSyncStatus"),dst=document.getElementById("suiteSyncStatus");if(!src||!dst)return "missing";const before=dst.textContent;src.textContent="P250-PROBE";${W(300)}const mid={text:dst.textContent,cls:dst.className};src.textContent="";${W(300)}return {before,mid,after:dst.textContent,visible:!!dst.offsetParent}`);
/* ---------- I/OBS-16: Free/Pro badge decoration ---------- */
await scenario("I1-badges-per-screen", "ui", `const out={};const count=()=>({badges:document.querySelectorAll(".cue-pro-badge-v1").length,entries:document.querySelectorAll(".cue-pro-entry-v1").length,perHostMax:Math.max(0,...[...document.querySelectorAll(".cue-pro-badge-v1")].map(b=>b.parentElement?b.parentElement.querySelectorAll(":scope > .cue-pro-badge-v1").length:0)),text:[...new Set([...document.querySelectorAll(".cue-pro-badge-v1")].map(b=>b.textContent))],aria:[...new Set([...document.querySelectorAll(".cue-pro-badge-v1")].map(b=>b.getAttribute("aria-label")))]});
 ${tab("settings")}out.settings=count();
 ${tab("player")}document.querySelector(".player-management-row-v1 .player-hub-info-v3").click();${W(900)}out.hubResults=count();
 for(const t of ["matches","analysis"]){const b=[...document.querySelectorAll('[role="tab"]')].find(x=>x.dataset.hubTab===t);b&&b.click();${W(700)}out["hub-"+t]=count();}
 const back=document.getElementById("playerStatsBackBtn");back&&back.click();${W(500)}
 out.edgeNote=window.CueScoreEntitlement.isPro();return out`, { shot: "badges-hub" });
await scenario("I2-badge-state-toggle", "fn", `
 let cb;await window.CueScoreEntitlement.connect({subscribe(f){cb=f;return()=>{}}});
 const n=()=>document.querySelectorAll(".cue-pro-badge-v1").length;const seq=[];
 ${tab("settings")}seq.push(["start",window.CueScoreEntitlement.isPro(),n()]);
 cb({verified:true,isPro:true});${W(600)}seq.push(["pro",window.CueScoreEntitlement.isPro(),n()]);
 cb({verified:true,isPro:false});${W(600)}seq.push(["free-again",window.CueScoreEntitlement.isPro(),n()]);
 for(let i=0;i<3;i++){const s=document.createElement("div");document.body.appendChild(s);s.remove();${W(120)}}
 seq.push(["free-after-mutations",window.CueScoreEntitlement.isPro(),n(),Math.max(0,...[...document.querySelectorAll(".cue-pro-badge-v1")].map(b=>b.parentElement.querySelectorAll(":scope > .cue-pro-badge-v1").length))]);
 return seq`, { wait: 400 });
/* ---------- OBS-15/14 wording guard: injection matrix (real callbacks, real roots) ---------- */
await scenario("G1-wording-guard-inject-matrix", "inject", `const root=document.querySelector(".analysis-v2");const view=root.querySelector('[data-analysis-view="match"]');
 const texts=${JSON.stringify(["ファールを相手より0回少なく抑えた", "ファールを相手より1回少なく抑えた", "ファールを相手より10回少なく抑えた", "ファールを相手より20回少なく抑えた", "ファールが相手より10回多かった", "ハイランで相手を0上回った", "ハイランで相手を5上回った", "ハイランで相手を10上回った", "ハイランでは相手が10上回った", "ハイランでは相手が3上回った", "シュート成功率で相手を0ポイント上回った"])};
 const host=document.createElement("div");host.dataset.p250="matrix";host.innerHTML=texts.map(t=>'<div class="analysis-v2-point"><i>1</i><span>'+t+'</span></div>').join("");view.appendChild(host);${W(700)}
 const first=[...host.querySelectorAll("span")].map(s=>s.textContent);
 const s=document.createElement("i");host.appendChild(s);s.remove();${W(500)}const second=[...host.querySelectorAll("span")].map(s=>s.textContent);host.remove();
 return {inputs:texts,first,stable:JSON.stringify(first)===JSON.stringify(second),unchanged:JSON.stringify(first)===JSON.stringify(texts)}`);
await endGroup();
if (MODE === "pro") {
  await boot();
  /* ---------- J. analytics display / E2E wording (reach: ui + localStorage manipulation of record dates so the chosen record is the 'latest') ---------- */
  await scenario("J1-analysis-match-e2e-wording", "ui+fn", `${H}const key="rotationScoreboard.matchRecords.v1";const saved=localStorage.getItem(key);const recs=JSON.parse(saved);const out={};window.__p250.length=0;
 for(const [id] of ${JSON.stringify(WORDING_CASES)}){const r2=recs.map(r=>r.id===id?{...r,endedAt:"2030-01-01T00:00:00.000Z",playedAt:"2030-01-01T00:00:00.000Z",startedAt:"2030-01-01T00:00:00.000Z"}:r);localStorage.setItem(key,JSON.stringify(r2));
  window.__p250.length=0;window.openMatchAnalysisForPlayerV5(id,"p_probe_1","");${W(1000)}
  const v=document.querySelector('[data-analysis-view="match"]');
  out[id]={textHash:h(v.textContent.replace(/\\s+/g," ")),meta:v.querySelector(".analysis-v2-match-meta")?.textContent,finalPoints:[...v.querySelectorAll(".analysis-v2-point span")].map(s=>s.textContent),legacyWordingInFinalDom:/ハイランで相手を|ハイランでは相手が|ファールを相手より|ファールが相手より/.test(v.textContent),
   transientWrites:window.__p250.filter(w=>w.view==="match").map(w=>({obs:w.obs,html:w.html.slice(0,60)})).slice(0,6)};
  const b=document.querySelector("[data-analysis-back]");b&&b.click();${W(400)}}
 localStorage.setItem(key,saved);return out`, { wait: 400, shot: "analysis-v2-match" });
  await scenario("J2-analysis-player-6-disciplines", "fn", `${H}const out={};for(const d of ["9ball","10ball","rotation","jpa9","straightPool","threeCushion"]){window.openPlayerAnalysisForPlayerV5("p_probe_1",d);${W(1100)}const v=document.querySelector('[data-analysis-view="player"]');out[d]={hidden:v.hidden,status:v.querySelector(".analysis-v2-status")?.textContent??null,change:v.querySelector(".analysis-v2-change")?.textContent?.slice(0,60)??null,prior:v.querySelector(".analysis-v2-target")?.dataset.priorGames??null,len:v.textContent.length,textHash:h(v.textContent.replace(/\\s+/g," ")),headings:[...v.querySelectorAll("h2")].map(x=>x.textContent)};const b=document.querySelector("[data-analysis-back]");b&&b.click();${W(350)}}return out`, { wait: 300, shot: "analysis-v2-player" });
  await endGroup(); await boot();
  /* ---------- K. journey lists (OBS-19/22/23) ---------- */
  await scenario("K1-journey-all-matches", "ui", `${tab("player")}document.querySelector(".player-management-row-v1 .player-hub-info-v3").click();${W(900)}
 document.querySelector('[data-hub-discipline="9ball"]').click();${W(600)}[...document.querySelectorAll('[role="tab"]')].find(x=>x.dataset.hubTab==="matches").click();${W(600)}
 document.querySelector("[data-hub-all-matches]").click();${W(1300)}
 const r=document.getElementById("playerMatchHistoryV2");const rows=[...r.querySelectorAll("[data-player-record-id]")];
 return {visible:!r.classList.contains("hidden"),title:r.querySelector(".player-journey-header-v2 h1")?.textContent,titleAria:r.querySelector(".player-journey-header-v2 h1")?.getAttribute("aria-label"),rows:rows.length,wrappers:r.querySelectorAll(".pd8-history-match").length,dates:rows.map(n=>n.querySelector(".journey-match-date-v3")?.textContent).slice(0,4),aria:rows.map(n=>n.getAttribute("aria-label")).slice(0,3),open:[...new Set([...r.querySelectorAll(".journey-match-open-v3")].map(n=>n.textContent))],analysisBtns:r.querySelectorAll("[data-player-analysis-record-id]").length,hiddenAnalysis:[...r.querySelectorAll("[data-player-analysis-record-id]")].filter(n=>n.hidden).length,fixedDiscipline:r.dataset.pd8Discipline||null,classes:[...new Set(rows.map(n=>n.className))].slice(0,3)}`, { shot: "journey-history" });
  await scenario("K2-journey-history-inject-compactHistory", "inject", `const r=document.getElementById("playerMatchHistoryV2");const host=document.createElement("div");host.dataset.p250="compact";
 host.innerHTML='<div class="journey-match-v3"><span class="journey-match-open-v3">試合詳細</span></div><button data-player-analysis-record-id="x1">試合分析</button><div class="journey-match-v3"><span class="journey-match-open-v3">試合詳細</span></div>';
 r.appendChild(host);${W(700)}const first={wrappers:host.querySelectorAll(".pd8-history-match").length,open:[...host.querySelectorAll(".journey-match-open-v3")].map(n=>n.textContent),analysis:[...host.querySelectorAll("[data-player-analysis-record-id]")].map(n=>({text:n.textContent,hidden:n.hidden,aria:n.getAttribute("aria-hidden"),tab:n.tabIndex}))};
 const x=document.createElement("i");host.appendChild(x);x.remove();${W(500)}const second={wrappers:host.querySelectorAll(".pd8-history-match").length,open:[...host.querySelectorAll(".journey-match-open-v3")].map(n=>n.textContent)};host.remove();return {first,second}`);
  await scenario("K3-journey-rivals", "ui", `const back=document.querySelector("#playerMatchHistoryV2 [data-journey-back],#playerMatchHistoryV2 button");back&&back.click();${W(800)}
 document.querySelector('[data-hub-discipline="9ball"]').click();${W(600)}[...document.querySelectorAll('[role="tab"]')].find(x=>x.dataset.hubTab==="matches").click();${W(600)}
 const o=document.querySelector("[data-hub-opponents]");if(!o)throw new Error("no opponents link");o.click();${W(1400)}
 const r=document.getElementById("playerOpponentRecordsV2");return {visible:!r.classList.contains("hidden"),fixed:r.querySelector(".pd12-fixed-discipline")?.textContent,ctxAria:r.querySelector(".pd13-rival-context")?.getAttribute("aria-label"),rivalRows:[...r.querySelectorAll("[data-rival-opponent]")].map(n=>n.dataset.rivalOpponent),selectLeft:r.querySelectorAll(".journey-discipline-v2 select").length,summaries:r.querySelectorAll(".journey-summary-v2,.journey-segment-v2").length}`, { shot: "journey-rivals" });
  await scenario("K4-journey-rival-history", "ui", `const row=document.querySelector("#playerOpponentRecordsV2 [data-rival-opponent]");if(!row)throw new Error("no rival row");row.click();${W(1500)}
 const r=document.getElementById("playerMatchHistoryV2");const rows=[...r.querySelectorAll("[data-player-record-id]")];return {visible:!r.classList.contains("hidden"),opponentFixed:r.dataset.pd8Opponent||null,rows:rows.length,dates:rows.map(n=>n.querySelector(".journey-match-date-v3")?.textContent).slice(0,4),aria:rows.map(n=>n.getAttribute("aria-label")).slice(0,2),oppRemoved:r.querySelectorAll(".journey-history-opponent-v11").length,vsLeft:r.querySelectorAll(".journey-match-vs-v3").length}`, { shot: "journey-rival-history" });
  /* ---------- M. legacy player detail (function-level: not reachable through the current UI) ---------- */
  await scenario("M1-legacy-player-detail-fn", "fn", `const b=window.CueScoreBuild6PlayerDetail;const body=document.getElementById("playerStatsBody");const out={api:!!b,shellBefore:!!document.querySelector(".pd7-shell")};try{b.render("p_probe_1","detail","rotation");${W(900)}}catch(e){out.err=String(e.message)}out.shellAfter=!!document.querySelector(".pd7-shell");out.bestKeys=[...document.querySelectorAll(".pd7-best")].map(n=>n.dataset.pd7BestKey);out.len=body?body.textContent.length:0;return out`, { wait: 300 });
}
if (MODE === "pro") await endGroup();
fs.writeFileSync(path.join(OUT, `scenarios_${LANG}_${MODE}.json`), JSON.stringify({ chrome: chromeVersion, lang: LANG, mode: MODE, tz: "Asia/Tokyo", viewport: "430x932", errors: errorsAll, created, observerTargets: targetsOut, totals, dom, scenarios }, null, 1));
console.log(JSON.stringify({ lang: LANG, mode: MODE, chrome: chromeVersion, created, scenarios: Object.keys(scenarios).length, scenarioErrors: Object.entries(scenarios).filter(([, s]) => s.error).map(([n, s]) => n + ": " + s.error), pageErrors: errorsAll.length }));
process.exit(0);
