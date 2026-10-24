/* P2-0 / L2 runtime probe. NOT part of `node --test`. Usage: node tests/browser/p2-observer-probe.mjs <outDir> [lang]
 * Serves the repository read-only on 127.0.0.1, drives the REAL application in an isolated headless Chrome profile and records
 *  - every MutationObserver the app creates (creation site), how often its callback fires per UI phase,
 *  - every text-bearing DOM write performed while an observer callback (or work it scheduled) is running,
 *  - a normalized ja DOM text dump per screen (hash) as the L-ARCH-5 baseline.
 * Instrumentation only wraps browser APIs inside the throw-away browser; no production file is modified. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { stage1Fixtures } from "../helpers/match-sharing-stage1-fixtures.mjs";

const OUT = path.resolve(process.argv[2] || "p2-probe-out");
const LANG = process.argv[3] || "ja";
const MODE = process.argv[4] || "free"; // "pro" simulates a verified entitlement through the public CueScoreEntitlement.connect() adapter protocol (throw-away profile only)
const ROOT = path.resolve(new URL("../../", import.meta.url).pathname);
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
fs.mkdirSync(OUT, { recursive: true });
const sha = t => crypto.createHash("sha256").update(t).digest("hex");

/* ---------- static server ---------- */
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/json", ".png": "image/png", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x"); let p = decodeURIComponent(url.pathname); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || /\/\.git\//.test(file) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end("nf"); return; }
  res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream", "cache-control": "no-store" });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const PORT = server.address().port;

/* ---------- seed data (production-shaped records from the stage-1 fixtures) ---------- */
const fixtures = stage1Fixtures();
const records = fixtures.map((f, i) => ({ ...f.source, endedAt: new Date(Date.UTC(2026, 0, 2 + i, 3, 4, 5)).toISOString(), playedAt: new Date(Date.UTC(2026, 0, 2 + i, 2, 0, 0)).toISOString(), startedAt: new Date(Date.UTC(2026, 0, 2 + i, 2, 0, 0)).toISOString() }));
// P2_LABEL_RECORD=1 (P2-2): add one record that carries every canonical break label, to verify the Display Mapper in the real UI.
const LABEL_RECORD = process.env.P2_LABEL_RECORD === "1";
const LABELS = ["無得点", "1個", "2個", "2個以上", "3個以上", "スクラッチ", "イリーガル", "ブレイク失敗", "ブレイクファール", "ファール（ブレイク交代）", "記録なし", "4球イン", "未知の値"];
if (LABEL_RECORD) {
  const base = JSON.parse(JSON.stringify(records[0]));
  base.id = "p22-label-record"; base.endedAt = new Date(Date.UTC(2026, 5, 1, 3, 0, 0)).toISOString(); base.playedAt = base.endedAt; base.startedAt = base.endedAt;
  base.analysis = { ...(base.analysis || {}), report: { ...((base.analysis || {}).report || {}), recordingMode: "detail" }, events: LABELS.map((resultLabel, i) => ({ type: "break_result", sequence: i + 1, player: 1, breakPlayer: 1, rack: i + 1, inning: 1, resultLabel })) };
  records.unshift(base);
}
const names = [...new Set(records.flatMap(r => [r.players?.[1]?.name, r.players?.[2]?.name]).filter(Boolean))].slice(0, 4);
const players = names.map((name, i) => ({ id: "p_probe_" + (i + 1), name, avatar: { type: "default", id: "default_silhouette" }, race: 120, skillLevel: 2, memo: "", isPrimary: i === 0, createdAt: 1767225600000 - i, updatedAt: 1767225600000 - i, lastUsed: 1767225600000 - i }));
const seedScript = `try{if(!localStorage.getItem("__p2_seeded")){localStorage.setItem("rotationScoreboard.players.v1",${JSON.stringify(JSON.stringify(players))});localStorage.setItem("rotationScoreboard.matchRecords.v1",${JSON.stringify(JSON.stringify(records))});${LANG !== "ja" ? `localStorage.setItem("cueScore.language.v1",${JSON.stringify(LANG)});` : ""}localStorage.setItem("__p2_seeded","1");}}catch(e){}`;

/* ---------- in-page instrumentation ---------- */
const instrument = `(()=>{ if(window.__p2) return;
const P2=window.__p2={observers:[],phase:"boot",ctx:null,errors:[]};
const JP=/[\\u3040-\\u30ff\\u4e00-\\u9fff]/;
const Orig=window.MutationObserver;
function site(){const lines=String(new Error().stack).split("\\n").slice(1);for(const l of lines){if(l.includes("__p2_instr"))continue;const m=/https?:\\/\\/[^\\/]+\\/([^\\s)]+?):(\\d+):\\d+/.exec(l);if(m)return m[1]+":"+m[2];}return "?";}
window.MutationObserver=class extends Orig{constructor(cb){const rec={id:P2.observers.length,site:site(),fires:{},writes:{},jpWrites:{},changed:{},samples:[]};P2.observers.push(rec);
 super(function(m,o){const prev=P2.ctx;P2.ctx=rec.id;rec.fires[P2.phase]=(rec.fires[P2.phase]||0)+1;try{return cb.call(this,m,o);}finally{P2.ctx=prev;}});}};
const wrapAsync=(name)=>{const o=window[name];window[name]=function(fn,...a){if(typeof fn!=="function")return o.call(this,fn,...a);const c=P2.ctx;return o.call(this,function(...x){const prev=P2.ctx;P2.ctx=c;try{return fn.apply(this,x);}finally{P2.ctx=prev;}},...a);};};
["requestAnimationFrame","setTimeout","queueMicrotask"].forEach(wrapAsync);
const desc=n=>{try{return (n.tagName||n.nodeName||"?").toLowerCase()+(n.id?"#"+n.id:"")+(n.className&&typeof n.className==="string"?"."+n.className.trim().split(/\\s+/).slice(0,2).join("."):"");}catch(_){return "?";}};
function note(kind,node,value,changed){ if(P2.ctx==null)return; const r=P2.observers[P2.ctx]; const ph=P2.phase; const v=String(value??"");
 r.writes[ph+"|"+kind]=(r.writes[ph+"|"+kind]||0)+1; if(changed)r.changed[ph+"|"+kind]=(r.changed[ph+"|"+kind]||0)+1; if(JP.test(v))r.jpWrites[ph+"|"+kind]=(r.jpWrites[ph+"|"+kind]||0)+1;
 if(r.samples.length<6&&(changed||JP.test(v)))r.samples.push({ph,kind,target:desc(node),changed,value:v.slice(0,70)}); }
const hook=(proto,prop,getOld)=>{const d=Object.getOwnPropertyDescriptor(proto,prop);if(!d||!d.set)return;Object.defineProperty(proto,prop,{configurable:true,enumerable:d.enumerable,get:d.get,set(v){let old;if(P2.ctx!=null){try{old=d.get.call(this);}catch(_){}}const res=d.set.call(this,v);if(P2.ctx!=null){let now;try{now=d.get.call(this);}catch(_){}note(prop,this,v,old!==now);}return res;}});};
hook(Node.prototype,"textContent");hook(Element.prototype,"innerHTML");hook(Element.prototype,"outerHTML");hook(HTMLElement.prototype,"innerText");hook(CharacterData.prototype,"data");hook(Node.prototype,"nodeValue");
const sa=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(P2.ctx!=null&&/^(aria-label|title|placeholder|alt)$/.test(n)){const old=this.getAttribute(n);note("attr:"+n,this,v,old!==String(v));}return sa.call(this,n,v);};
const iah=Element.prototype.insertAdjacentHTML;Element.prototype.insertAdjacentHTML=function(p,h){note("insertAdjacentHTML",this,h,true);return iah.call(this,p,h);};
window.addEventListener("error",e=>P2.errors.push(String(e.message)+" @"+e.filename+":"+e.lineno));
window.__p2.snapshot=()=>JSON.parse(JSON.stringify(P2.observers));
})();`;

/* ---------- CDP ---------- */
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "p2probe-"));
// Watchdog: a stalled browser must fail the run (exit 2) instead of hanging the whole test session.
const WATCHDOG = setTimeout(() => { console.error("WATCHDOG: probe exceeded 270 s"); try { chrome.kill("SIGKILL"); } catch (_) { /* already gone */ } process.exit(2); }, 270000);
const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--window-size=430,932", "--disable-features=Translate", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
const wsUrl = await new Promise((resolve, reject) => {
  let buf = ""; const t = setTimeout(() => reject(new Error("chrome start timeout")), 20000);
  chrome.stderr.on("data", d => { buf += d; const m = /DevTools listening on (ws:\/\/\S+)/.exec(buf); if (m) { clearTimeout(t); resolve(m[1]); } });
});
const version = await (await fetch(wsUrl.replace(/^ws:/, "http:").replace(/\/devtools\/.*/, "/json/version"))).json();
const targets = await (await fetch(wsUrl.replace(/^ws:/, "http:").replace(/\/devtools\/.*/, "/json/list"))).json();
const page = targets.find(t => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener("open", r));
let nextId = 1; const pending = new Map();
ws.addEventListener("message", ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const { resolve, reject } = pending.get(m.id); pending.delete(m.id); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); } });
const cdp = (method, params = {}) => new Promise((resolve, reject) => { const id = nextId++; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
const evalJs = async (expr) => {
  const r = await cdp("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true, timeout: 60000 });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
await cdp("Page.enable"); await cdp("Runtime.enable");
await cdp("Emulation.setDeviceMetricsOverride", { width: 430, height: 932, deviceScaleFactor: 1, mobile: true });
await cdp("Emulation.setTimezoneOverride", { timezoneId: "Asia/Tokyo" });
await cdp("Emulation.setLocaleOverride", { locale: LANG === "ja" ? "ja-JP" : LANG === "en" ? "en-US" : "zh-CN" }).catch(() => {});
await cdp("Page.addScriptToEvaluateOnNewDocument", { source: "/*__p2_instr*/" + seedScript + ";" + instrument });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = []; const stepLog = (name, ok, detail) => { log.push({ step: name, ok, detail }); };

await cdp("Page.navigate", { url: `http://127.0.0.1:${PORT}/index.html` });
await sleep(4000);
await evalJs(`(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<100&&document.documentElement.classList.contains("cue-app-booting-v2");i++)await w(100);await w(800);return true;})()`);

const phase = name => evalJs(`window.__p2.phase=${JSON.stringify(name)};true`);
const step = async (name, code, wait = 700) => {
  try { fs.writeFileSync(path.join(OUT, `observer_runtime_${LANG}_${MODE}.partial.json`), JSON.stringify({ lastStep: name, observers: await evalJs("window.__p2.snapshot()") })); } catch (_) { /* partial snapshot only */ }
  try { const v = await evalJs(`(async()=>{${code}})()`); stepLog(name, true, v === undefined ? null : v); }
  catch (e) { stepLog(name, false, String(e.message).slice(0, 200)); }
  await sleep(wait);
};
const dumpFn = `const dump=()=>{const out=["lang="+document.documentElement.lang];const skip=new Set(["SCRIPT","STYLE","NOSCRIPT"]);const w=document.createTreeWalker(document.body,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);let n=w.currentNode;while((n=w.nextNode())){if(n.nodeType===3){const p=n.parentElement;if(p&&(skip.has(p.tagName)||p.closest("svg")))continue;const t=n.textContent.replace(/\\s+/g," ").trim();if(t)out.push("T "+t);}else if(n.nodeType===1&&!skip.has(n.tagName)){for(const a of["aria-label","placeholder","title","alt"]){const v=n.getAttribute(a);if(v)out.push("@"+a+" "+v.replace(/\\s+/g," ").trim());}}}return out;};`;
const dom = {};
const capture = async name => {
  const lines = await evalJs(`(()=>{${dumpFn}return dump();})()`);
  dom[name] = { sha256: sha(lines.join("\n")), lines: lines.length };
  fs.writeFileSync(path.join(OUT, `dom_${MODE}_${name}.txt`), lines.join("\n") + "\n");
};

const tab = key => `document.querySelector('[data-phase1-tab="${key}"]').click();await new Promise(r=>setTimeout(r,800));`;
if (MODE === "pro") {
  await evalJs(`(async()=>{let cb;await window.CueScoreEntitlement.connect({subscribe(f){cb=f;return()=>{}}});cb({verified:true,isPro:true});await new Promise(r=>setTimeout(r,500));return window.CueScoreEntitlement.isPro()})()`).then(v => stepLog("simulate-pro", v === true, v));
}
await phase("home"); await capture("home");
await step("tab:player", tab("player")); await phase("player-list"); await sleep(600); await capture("player-list");
await phase("player-hub");
await step("open-first-player-hub", `const b=document.querySelector(".player-management-row-v1 .player-hub-info-v3");if(!b)throw new Error("no player row info button");b.click();await new Promise(r=>setTimeout(r,900));return "ok"`, 900);
await capture("player-hub-results");
for (const d of ["9ball", "10ball", "rotation", "jpa9", "straightPool", "threeCushion"]) {
  await phase("hub-" + d);
  await step("hub-discipline:" + d, `const b=document.querySelector('[data-hub-discipline="${d}"]');if(!b)throw new Error("no discipline button");b.click();await new Promise(r=>setTimeout(r,700));return "ok"`);
  for (const t of ["results", "matches", "analysis"]) {
    await step(`hub-tab:${d}/${t}`, `const b=[...document.querySelectorAll('[role="tab"]')].find(x=>x.dataset.hubTab==="${t}"||x.getAttribute("data-hub-tab")==="${t}");if(!b)throw new Error("no tab");b.click();await new Promise(r=>setTimeout(r,700));return "ok"`);
    if (d === "9ball") await capture(`hub-${d}-${t}`);
  }
}
await phase("player-back");
await step("tab:player-again", tab("player"));
await phase("player-editor");
await step("open-editor", `const row=document.querySelector(".player-management-row-v1");const btn=[...row.querySelectorAll("button")].find(b=>!b.classList.contains("player-hub-info-v3"));if(!btn)throw new Error("no edit button");btn.click();await new Promise(r=>setTimeout(r,900));const g=id=>document.getElementById(id);return {title:g("playerLibraryTitle")?.textContent,modalTitle:g("playerEditorModalTitleV1")?.textContent,modalCopy:g("playerEditorModalCopyV1")?.innerHTML,saveText:g("playerEditorSaveBtn")?.textContent,deleteHidden:g("playerEditorDeleteBtn")?.classList.contains("hidden")}`);
await capture("player-editor");
await step("close-editor", `const b=document.querySelector("#playerLibraryBackBtn,[data-player-editor-cancel],#playerEditorCancel");if(b)b.click();await new Promise(r=>setTimeout(r,700));return !!b`);
await phase("player-add");
await step("open-add-player", `const b=document.querySelector("#playerLibraryAddBtn,[data-player-add],.player-add-v1,#addPlayerBtn");if(!b)throw new Error("no add button");b.click();await new Promise(r=>setTimeout(r,900));const g=id=>document.getElementById(id);return {title:g("playerLibraryTitle")?.textContent,modalTitle:g("playerEditorModalTitleV1")?.textContent,modalCopy:g("playerEditorModalCopyV1")?.innerHTML,saveText:g("playerEditorSaveBtn")?.textContent,deleteHidden:g("playerEditorDeleteBtn")?.classList.contains("hidden")}`);
await capture("player-add");
await step("close-add", `const b=document.querySelector("#playerLibraryBackBtn,[data-player-editor-cancel],#playerEditorCancel");if(b)b.click();await new Promise(r=>setTimeout(r,700));return !!b`);
await phase("history");
await step("tab:history", tab("history"), 1200); await capture("history");
await step("open-first-record", `const c=document.querySelector("#recordsList [data-record-id],.record-card-v1,[data-open-record],.history-card-v2,#recordsList button");if(!c)throw new Error("no record card");c.click();await new Promise(r=>setTimeout(r,1200));return "ok"`, 1200);
await capture("history-record");
for (const d of ["9ball", "rotation", "straightPool", "threeCushion"]) {
  await phase("analysis-v2-" + d);
  await step("analysis-v2-player:" + d, `if(typeof window.openPlayerAnalysisForPlayerV5!=="function")throw new Error("no api");window.openPlayerAnalysisForPlayerV5("p_probe_1","${d}");await new Promise(r=>setTimeout(r,1200));return !!document.querySelector(".analysis-v2")`, 1200);
  if (d === "9ball") await capture("analysis-v2-player-9ball");
  await step("analysis-v2-back:" + d, `const b=document.querySelector("[data-analysis-back]");if(b)b.click();await new Promise(r=>setTimeout(r,700));return !!b`);
}
await phase("analysis-v2-match");
await step("analysis-v2-match", `const rec=JSON.parse(localStorage.getItem("rotationScoreboard.matchRecords.v1"))[0];window.openMatchAnalysisForPlayerV5(rec.id,"p_probe_1","");await new Promise(r=>setTimeout(r,1200));return !!document.querySelector(".analysis-v2")`, 1200);
await capture("analysis-v2-match");
await step("analysis-v2-match-back", `const b=document.querySelector("[data-analysis-back]");if(b)b.click();await new Promise(r=>setTimeout(r,700));return !!b`);
if (LABEL_RECORD) {
  await phase("history-break-labels");
  await step("open-label-record", `document.querySelector('[data-phase1-tab="history"]').click();await new Promise(r=>setTimeout(r,800));const c=document.querySelector('#recordsList [data-record-id="p22-label-record"]');if(!c)throw new Error("label record card missing");c.click();await new Promise(r=>setTimeout(r,1200));const rows=[...document.querySelectorAll(".analysis-log-result-v65")].map(n=>n.textContent);return {legacyAnalysisLogPages:document.querySelectorAll("[data-history-page-v67]").length,rows,matchDetailVisible:!!document.querySelector("#recordDetailOverlay .match-detail-v1")}`, 800);
  await step("mapper-runtime", `return Object.fromEntries(${JSON.stringify(LABELS)}.map(l=>[l,window.cueResultLabel(l)]))`, 200);
  const rec = log.find(s => s.step === "open-label-record"), map = log.find(s => s.step === "mapper-runtime");
  fs.writeFileSync(path.join(OUT, `break_label_rows_${LANG}.json`), JSON.stringify({ lang: LANG, openRecord: rec, mapperRuntime: map }, null, 1));
}
if (process.env.P2_TREND_PROBE === "1") {
  // P2-3: the legacy / formal player-detail renderers are replaced by the hub in the current UI, so the analytics builders
  // are exercised directly in the REAL page (real boot, real language instance) with fixed inputs, and the outputs are recorded.
  // The same step runs on the pre-change main; extra arguments are ignored by the old signature.
  await phase("analytics-direct");
  await step("analytics-direct", `
    const clean=v=>JSON.parse(JSON.stringify(v===undefined?null:v));
    const players=readPlayerLibrary();const out={lang:document.documentElement.lang,players:[]};
    for(const player of players){const recs=recordsForRegisteredPlayer(player);const growth=buildPlayerGrowthAnalysisV740(recs,player);const insight=buildPlayerInsightsV750(recs,player,growth);const coach=buildRionCoachV760(insight,growth);
      out.players.push({id:player.id,records:recs.length,growth:clean({ready:growth.ready,status:growth.status,score:growth.score,dirs:growth.metrics&&growth.metrics.map(m=>m.direction)}),coach:clean(coach)});}
    const series={up:[10,11,13,16],down:[16,13,11,10],flat:[10,10,10,10],rate:[50,51,52,52.5],rateSmall:[50,50.5,51,51.9],tiny:[5,5.2,5.4,5.45]};
    const charts=[["勝率",false,"%",true],["シュート率",false,"%",true],["ハイラン",false,"",false],["ファール数",true,"回",false],["得点／Inning",false,"",false]];
    out.trend={};for(const [sn,v] of Object.entries(series))for(const [label,lower,suffix,isRate] of charts)out.trend[sn+"|"+label]=clean(buildGrowthTrendCommentV810(v.map(value=>({value})),label,lower,suffix,isRate));
    const f=window.CueScoreAnalyticsFinalRC;out.finalRc={};
    for(const d of ["9ball","10ball","rotation","jpa9","straightPool","threeCushion"]){const defs=f.definitionsFor(d);const mk=fn=>Object.fromEntries([["winRate",50],...defs.map((x,i)=>[x.key,fn(x,i)])]);const val=(x,dl)=>10+(x.higher?dl:-dl);const prev=mk(()=>10);
      out.finalRc[d]={improved:f.evaluate(mk(x=>val(x,2)),prev,d),worsened:f.evaluate(mk(x=>val(x,-2)),prev,d),same:f.evaluate(mk(()=>10),prev,d),insufficient:f.evaluate(mk(x=>val(x,2)),prev,d,{sufficient:false}),mixed:f.evaluate(mk((x,i)=>val(x,i===0?2:-2)),prev,d)};}
    return clean(out)`, 300);
  fs.writeFileSync(path.join(OUT, `analytics_direct_${LANG}_${MODE}.json`), JSON.stringify({ lang: LANG, mode: MODE, run: log.find(s => s.step === "analytics-direct") }, null, 1));
}
await phase("settings");
await step("tab:settings", tab("settings"), 1000); await capture("settings");
await step("open-suite-generation", `const b=document.querySelector('[data-suite-open="generation"]');if(!b)throw new Error("no suite generation button");b.click();await new Promise(r=>setTimeout(r,800));return "ok"`); await capture("settings-suite-generation");
await step("open-language", `document.querySelector("[data-settings-open-language]").click();await new Promise(r=>setTimeout(r,800));return "ok"`); await capture("language");
await phase("home-match-setup");
await step("tab:home", tab("home"));
await step("new-match", `document.querySelector("#cueDisciplineSwitcherV1 [data-discipline]").click();await new Promise(r=>setTimeout(r,700));return "ok"`);
for (const d of ["9ball", "rotation", "threeCushion"]) {
  await step("setup-discipline:" + d, `const b=document.querySelector('.cue-discipline-v1[data-discipline="${d}"]');if(!b)throw new Error("no discipline");b.click();await new Promise(r=>setTimeout(r,800));return "ok"`);
}
await capture("match-setup");
await phase("match-live");
await step("start-match-9ball", `document.querySelector('.cue-discipline-v1[data-discipline="9ball"]').click();await new Promise(r=>setTimeout(r,500));
 if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await new Promise(r=>setTimeout(r,500));const s=document.querySelector("[data-select-player]");if(s){s.click();await new Promise(r=>setTimeout(r,500));}}
 for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await new Promise(r=>setTimeout(r,100));
 document.getElementById("startGameBtn").click();
 for(let i=0;i<60&&!document.querySelector(".app").classList.contains("pro-game-mode");i++)await new Promise(r=>setTimeout(r,100));
 await new Promise(r=>setTimeout(r,900));return document.querySelector(".app").classList.contains("pro-game-mode")`, 1500);
await capture("match-live");

const snap = await evalJs("window.__p2.snapshot()");
const errors = await evalJs("window.__p2.errors");
const created = snap.length;
const storage = await evalJs(`(async()=>{const h=async s=>[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,"0")).join("");const keys=["rotationScoreboard.players.v1","rotationScoreboard.matchRecords.v1","rotationScoreboard.matchCategories.v1","rotationScoreboard.matchSeasons.v1"];const o={};for(const k of keys){const v=localStorage.getItem(k);o[k]=v===null?null:{sha256:await h(v),bytes:v.length}}{const ps=JSON.parse(localStorage.getItem("rotationScoreboard.players.v1")||"[]").map(p=>{const q={...p};delete q.updatedAt;delete q.lastUsed;delete q.createdAt;return q});o.playersNormalized={sha256:await h(JSON.stringify(ps)),count:ps.length};}o.allKeys=Object.keys(localStorage).sort();return o})()`);
const pro = await evalJs(`(()=>{try{return {isPro:window.CueScoreEntitlement&&window.CueScoreEntitlement.isPro&&window.CueScoreEntitlement.isPro(),lang:document.documentElement.lang,guard:window.CueScoreLanguageGuardV1&&window.CueScoreLanguageGuardV1.state&&window.CueScoreLanguageGuardV1.state()}}catch(e){return String(e)}})()`);
fs.writeFileSync(path.join(OUT, `observer_runtime_${LANG}_${MODE}.json`), JSON.stringify({ chrome: version.Browser, mode: MODE, lang: LANG, tz: "Asia/Tokyo", viewport: "430x932", created, observers: snap, errors, pro, storage, seed: { recordsSha256: sha(JSON.stringify(records)), playersSha256: sha(JSON.stringify(players)), recordCount: records.length, playerCount: players.length }, steps: log, dom }, null, 1));
const pass = log.filter(s => s.ok).length;
console.log(JSON.stringify({ mode: MODE, lang: LANG, chrome: version.Browser, observersCreated: created, steps: `${pass}/${log.length}`, errors: errors.length }));
clearTimeout(WATCHDOG); ws.close(); chrome.kill("SIGKILL"); server.close();
try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) { /* best effort */ }
process.exit(0);
