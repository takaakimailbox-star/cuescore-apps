/* P2-5-0 / L2 browser kit. NOT part of `node --test`. Boots the REAL application (read-only static server, isolated headless Chrome
 * profile, Asia/Tokyo) with the P2-0 observer instrumentation, and exposes evaluate/step helpers for scenario scripts.
 * Instrumentation wraps browser APIs inside the throw-away browser only; no production file is modified. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { stage1Fixtures } from "../helpers/match-sharing-stage1-fixtures.mjs";

export const sha = t => crypto.createHash("sha256").update(t).digest("hex");
export const sleep = ms => new Promise(r => setTimeout(r, ms));
const ROOT = path.resolve(new URL("../../", import.meta.url).pathname);
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/json", ".png": "image/png", ".svg": "image/svg+xml" };

const INSTRUMENT = `(()=>{ if(window.__p2) return;
const P2=window.__p2={observers:[],phase:"boot",ctx:null,errors:[]};
const JP=/[\\u3040-\\u30ff\\u4e00-\\u9fff]/;
const Orig=window.MutationObserver;
function site(){const lines=String(new Error().stack).split("\\n").slice(1);for(const l of lines){if(l.includes("__p2_instr"))continue;const m=/https?:\\/\\/[^\\/]+\\/([^\\s)]+?):(\\d+):\\d+/.exec(l);if(m)return m[1]+":"+m[2];}return "?";}
window.MutationObserver=class extends Orig{constructor(cb){const rec={id:P2.observers.length,site:site(),fires:{},writes:{},jpWrites:{},changed:{},samples:[]};P2.observers.push(rec);
 super(function(m,o){const prev=P2.ctx;P2.ctx=rec.id;rec.fires[P2.phase]=(rec.fires[P2.phase]||0)+1;try{return cb.call(this,m,o);}finally{P2.ctx=prev;}});Object.defineProperty(this,"__rec",{value:rec});Object.defineProperty(rec,"_nodes",{value:[],enumerable:false});}
 observe(target,opts){try{this.__rec._nodes.push({n:target,o:opts});}catch(_){}return super.observe(target,opts);}};
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
window.__p2.snapshot=()=>JSON.parse(JSON.stringify(P2.observers.map(r=>({...r,targets:r._nodes.map(({n,o})=>({desc:desc(n),connected:!!(n&&n.isConnected),live:!!(n&&n.id&&document.getElementById(n.id)===n),opts:o}))}))));
})();`;

/* Synthetic 9-ball records between the first two library players whose per-side maxRun / fouls produce every wording branch of the
 * analysis-v2 match view (renderMatch reads players[side].maxRun / .fouls). Winner is always side 1 (the viewer's perspective). */
export const WORDING_CASES = [
  ["p250-eq", 5, 5, 2, 2], ["p250-d10", 15, 5, 2, 12], ["p250-opp10", 5, 15, 2, 12], ["p250-d20", 25, 5, 2, 22],
  ["p250-ord", 7, 6, 3, 4], ["p250-d1", 6, 5, 3, 4], ["p250-opp3", 5, 8, 4, 4], ["p250-foulmore", 6, 6, 9, 3]
];
function syntheticRecords(base) {
  return WORDING_CASES.map(([id, h1, h2, f1, f2], i) => {
    const r = JSON.parse(JSON.stringify(base));
    r.id = id; r.winner = 1; r.disciplineId = "9ball"; r.gameType = "9ball";
    r.players = { ...r.players, 1: { ...r.players[1], name: "なおき", maxRun: h1, fouls: f1, score: 9, pocketCount: 9, misses: 3, shotRate: 75 }, 2: { ...r.players[2], name: "さくら", maxRun: h2, fouls: f2, score: 5, pocketCount: 5, misses: 5, shotRate: 50 } };
    const t = new Date(Date.UTC(2026, 2, 1 + i, 3, 4, 5)).toISOString(); r.endedAt = t; r.playedAt = t; r.startedAt = t;
    return r;
  });
}
export function seed({ extraRecords = [], lang = "ja", link = true, synthetic = true } = {}) {
  const fixtures = stage1Fixtures();
  const fixtureRecords = fixtures.map((f, i) => ({ ...f.source, endedAt: new Date(Date.UTC(2026, 0, 2 + i, 3, 4, 5)).toISOString(), playedAt: new Date(Date.UTC(2026, 0, 2 + i, 2, 0, 0)).toISOString(), startedAt: new Date(Date.UTC(2026, 0, 2 + i, 2, 0, 0)).toISOString() }));
  const records = [...extraRecords, ...(synthetic ? syntheticRecords(fixtureRecords[0]) : []), ...fixtureRecords];
  const names = [...new Set(records.flatMap(r => [r.players?.[1]?.name, r.players?.[2]?.name]).filter(Boolean))].slice(0, 4);
  const players = names.map((name, i) => ({ id: "p_probe_" + (i + 1), name, avatar: { type: "default", id: "default_silhouette" }, race: 120, skillLevel: 2, memo: "", isPrimary: i === 0, createdAt: 1767225600000 - i, updatedAt: 1767225600000 - i, lastUsed: 1767225600000 - i }));
  if (link) {
    const idByName = new Map(players.map(p => [p.name, p.id]));
    for (const r of records) for (const slot of [1, 2]) { const side = r.players?.[slot]; if (!side) continue; const id = idByName.get(side.name); if (id) side.registeredPlayerId = id; else delete side.registeredPlayerId; }
  }
  const script = `try{if(!localStorage.getItem("__p2_seeded")){localStorage.setItem("rotationScoreboard.players.v1",${JSON.stringify(JSON.stringify(players))});localStorage.setItem("rotationScoreboard.matchRecords.v1",${JSON.stringify(JSON.stringify(records))});${lang !== "ja" ? `localStorage.setItem("cueScore.language.v1",${JSON.stringify(lang)});` : ""}localStorage.setItem("__p2_seeded","1");}}catch(e){}`;
  return { records, players, script };
}

export async function startApp({ lang = "ja", mode = "free", seedData, watchdogMs = 270000 } = {}) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://x"); let p = decodeURIComponent(url.pathname); if (p === "/") p = "/index.html";
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT) || /\/\.git\//.test(file) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end("nf"); return; }
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "p2probe-"));
  let chrome;
  const WATCHDOG = setTimeout(() => { console.error("WATCHDOG: exceeded " + watchdogMs + " ms"); try { chrome.kill("SIGKILL"); } catch (_) { /* gone */ } process.exit(2); }, watchdogMs);
  chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--window-size=430,932", "--disable-features=Translate", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  const wsUrl = await new Promise((resolve, reject) => {
    let buf = ""; const t = setTimeout(() => reject(new Error("chrome start timeout")), 20000);
    chrome.stderr.on("data", d => { buf += d; const m = /DevTools listening on (ws:\/\/\S+)/.exec(buf); if (m) { clearTimeout(t); resolve(m[1]); } });
  });
  const version = await (await fetch(wsUrl.replace(/^ws:/, "http:").replace(/\/devtools\/.*/, "/json/version"))).json();
  const targets = await (await fetch(wsUrl.replace(/^ws:/, "http:").replace(/\/devtools\/.*/, "/json/list"))).json();
  const ws = new WebSocket(targets.find(t => t.type === "page").webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));
  let nextId = 1; const pending = new Map();
  ws.addEventListener("message", ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const { resolve, reject } = pending.get(m.id); pending.delete(m.id); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); } });
  const cdp = (method, params = {}) => new Promise((resolve, reject) => { const id = nextId++; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  const evalJs = async expr => {
    const r = await cdp("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true, timeout: 60000 });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  await cdp("Page.enable"); await cdp("Runtime.enable");
  await cdp("Emulation.setDeviceMetricsOverride", { width: 430, height: 932, deviceScaleFactor: 1, mobile: true });
  await cdp("Emulation.setTimezoneOverride", { timezoneId: "Asia/Tokyo" });
  await cdp("Emulation.setLocaleOverride", { locale: lang === "ja" ? "ja-JP" : lang === "en" ? "en-US" : "zh-CN" }).catch(() => {});
  const sd = seedData || seed({ lang });
  await cdp("Page.addScriptToEvaluateOnNewDocument", { source: "/*__p2_instr*/" + sd.script + ";" + INSTRUMENT });
  await cdp("Page.navigate", { url: `http://127.0.0.1:${port}/index.html` });
  await sleep(4000);
  await evalJs(`(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<100&&document.documentElement.classList.contains("cue-app-booting-v2");i++)await w(100);await w(800);return true;})()`);
  if (mode === "pro") {
    const ok = await evalJs(`(async()=>{let cb;await window.CueScoreEntitlement.connect({subscribe(f){cb=f;return()=>{}}});cb({verified:true,isPro:true});await new Promise(r=>setTimeout(r,500));return window.CueScoreEntitlement.isPro()})()`);
    if (ok !== true) throw new Error("Pro simulation failed");
  }
  const close = async () => { clearTimeout(WATCHDOG); try { ws.close(); } catch (_) { /* closed */ } chrome.kill("SIGKILL"); server.close(); try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) { /* best effort */ } };
  return { evalJs, cdp, close, version: version.Browser, seed: sd, mode, lang };
}

/* Per-observer activity delta between two snapshots (sum over phases). */
export function delta(before, after) {
  const sum = o => Object.values(o || {}).reduce((a, b) => a + b, 0);
  return after.map((o, i) => {
    const b = before[i] || { fires: {}, writes: {}, changed: {}, jpWrites: {} };
    return { id: i, site: o.site, fires: sum(o.fires) - sum(b.fires), writes: sum(o.writes) - sum(b.writes), changed: sum(o.changed) - sum(b.changed), jpWrites: sum(o.jpWrites) - sum(b.jpWrites) };
  }).filter(d => d.fires || d.writes || d.changed);
}
