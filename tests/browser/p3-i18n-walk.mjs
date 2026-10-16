/* P3 / 3-language runtime walk (NOT part of `node --test`). Drives the REAL app (isolated headless Chrome, Asia/Tokyo) through the screens of one language and
 * reports every visible text node / aria-label / title / placeholder / alt that still contains Japanese kana or kanji, plus every alert/confirm/prompt message.
 * Seeded user data (player names etc.) is excluded. Usage: [P2_APP_ROOT=<checkout>] node tests/browser/p3-i18n-walk.mjs <out.json> <lang> <free|pro> */
import fs from "node:fs";
import { createRequire } from "node:module";
import { startApp, seed } from "./p2-browser-kit.mjs";
const require = createRequire(import.meta.url);
const OUT = process.argv[2], LANG = process.argv[3] || "en", MODE = process.argv[4] || "free";
const sd = seed({ lang: LANG, rich: true });
const app = await startApp({ lang: LANG, mode: MODE, seedData: sd, freezeTime: true, watchdogMs: Number(process.env.P2_WATCHDOG || 420000) });
const ALLOW = [...new Set(sd.players.flatMap(p => [p.name]).concat(sd.records.flatMap(r => [r.players?.[1]?.name, r.players?.[2]?.name, r.category, r.season]).filter(Boolean)))];
const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
/* zh-Hans shares hanzi with Japanese, so a text counts as untranslated when it has kana or equals a Japanese catalog text that has a different zh-Hans translation. */
const jaCat = require("../../i18n-catalog-ja-v1.js"), zhCat = require("../../i18n-catalog-zh-hans-v1.js");
const JA_ONLY = LANG === "zh-Hans" ? [...new Set(Object.keys(jaCat).filter(k => zhCat[k] !== undefined && zhCat[k] !== jaCat[k]).map(k => jaCat[k]).filter(v => v.length >= 2 && !/[{}]/.test(v)))] : [];
const SCAN = `(()=>{const JAONLY=new Set(${JSON.stringify(JA_ONLY)});const KANA=/[\\u3040-\\u30ff]/;const JP={test:s=>{s=String(s).replace(/\\u30fb/g,"");return ${LANG === "zh-Hans" ? "(KANA.test(s)||JAONLY.has(s.trim()))" : "/[\\u3040-\\u30ff\\u4e00-\\u9fff]/.test(s)"}}};const allow=${JSON.stringify(ALLOW)};const strip=s=>{let t=String(s);for(const a of allow)if(a)t=t.split(a).join("");return t};
 const vis=e=>{if(!e||!e.isConnected)return false;const r=e.getClientRects();if(!r.length)return false;const cs=getComputedStyle(e);return cs.visibility!=="hidden"&&cs.display!=="none"&&Number(cs.opacity)!==0};
 const path=e=>{let s=e.tagName.toLowerCase()+(e.id?"#"+e.id:"")+(typeof e.className==="string"&&e.className?"."+e.className.trim().split(/\\s+/).slice(0,2).join("."):"");return s};
 const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(w.nextNode()){const n=w.currentNode,p=n.parentElement;if(!p||/^(SCRIPT|STYLE|NOSCRIPT)$/.test(p.tagName))continue;if(!JP.test(strip(n.nodeValue)))continue;if(!vis(p))continue;out.push({k:"text",v:n.nodeValue.trim().slice(0,90),at:path(p)});}
 for(const e of document.querySelectorAll("[aria-label],[title],[placeholder],[alt]")){if(!vis(e)&&!e.closest("[role=dialog],[aria-modal]"))continue;if(!vis(e))continue;for(const a of ["aria-label","title","placeholder","alt"]){const v=e.getAttribute(a);if(v&&JP.test(strip(v)))out.push({k:a,v:v.slice(0,90),at:path(e)});}}
 const d=(window.__dlg||[]).splice(0);for(const x of d)if(JP.test(strip(x.join(" "))))out.push({k:"dialog:"+x[0],v:String(x[1]).slice(0,120),at:"window"});
 return out;})()`;
const report = { lang: LANG, mode: MODE, states: {}, errors: [] };
const state = async (name, code, wait = 500) => {
  let err = null;
  try { await ev(`window.__dlg=window.__dlg||[];${code}\nawait W(${wait});return 1`); } catch (e) { err = String(e.message).slice(0, 160); }
  let found = []; try { found = await app.evalJs(SCAN); } catch (e) { err = (err || "") + " scan:" + String(e.message).slice(0, 80); }
  let sample = ""; try { sample = await app.evalJs(`(()=>{const v=[...document.querySelectorAll("section,div,main")].filter(e=>e.getClientRects().length&&getComputedStyle(e).position!=="static"&&e.scrollHeight>100&&(e.id||e.className));return document.body.innerText.replace(/\\s+/g," ").slice(0,260)})()`); } catch (_) { /* optional */ }
  report.states[name] = { err, sample, leftovers: found };
  console.log(name.padEnd(34), err ? "ERR " + err : "", found.length ? found.length + " JA" : "ok");
};
await app.evalJs(`window.__dlg=[];window.alert=m=>{window.__dlg.push(["alert",String(m)])};window.confirm=m=>{window.__dlg.push(["confirm",String(m)]);return true};window.prompt=(m,d)=>{window.__dlg.push(["prompt",String(m)]);return d||"テスト"};true`);
const { default: steps } = await import("./p3-i18n-walk-steps.mjs");
for (const s of steps) await state(s.name, s.code, s.wait || 500);
report.errors = await app.evalJs("window.__p2.errors");
fs.writeFileSync(OUT, JSON.stringify(report, null, 1));
const total = Object.values(report.states).reduce((a, s) => a + s.leftovers.length, 0);
console.log(JSON.stringify({ lang: LANG, mode: MODE, states: Object.keys(report.states).length, leftovers: total, errors: report.errors.length }));
await app.close(); process.exit(0);
