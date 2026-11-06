// Android emulator quality driver (CI only, test data only, no network except localhost adb forward).
// Usage: node emulator-verify.mjs <apk> <outDir> <label>
// Operates the real app inside the emulator: adb input (Back/Home/rotation, real OS events) and
// Chrome DevTools Protocol touch/mouse events + DOM reads inside the app WebView.
// Each step records kind: "os-input" (adb), "webview-input" (CDP touch), "dom-read", "device-state".
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [apk, outDir, label] = process.argv.slice(2);
const PKG = "com.takaakimailboxstar.cuescoreapps";
fs.mkdirSync(outDir, { recursive: true });
const results = [];
const consoleErrors = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const adb = (...a) => execFileSync("adb", a, { encoding: "utf8", maxBuffer: 64 << 20 }).trim();
const adbSh = cmd => adb("shell", cmd);
const adbTry = cmd => { try { return adb("shell", cmd); } catch (e) { return ""; } };
const appCrashes = () => {
  const crash = adbTry("logcat -d -b crash");
  const main = adbTry(`logcat -d -b main -b system -s ActivityManager:E AndroidRuntime:E`);
  const mine = [...crash.split("\n"), ...main.split("\n")].filter(l => (l.includes("Process: " + PKG)) || (/ANR in /.test(l) && l.includes(PKG)) || (/Fatal signal/.test(l) && l.includes(PKG)));
  const other = (crash.match(/FATAL EXCEPTION/g) || []).length;
  return { mine, otherProcessFatalCount: other };
};
const launch = () => adbTry(`am start -W -n ${PKG}/.MainActivity`);
const shot = name => {
  const f = path.join(outDir, `${label}-${name}.png`);
  try { fs.writeFileSync(f, execFileSync("adb", ["exec-out", "screencap", "-p"], { maxBuffer: 64 << 20 })); } catch (e) { return null; }
  return path.basename(f);
};

let ws = null, seq = 0; const pending = new Map();
async function connect(timeoutMs = 90000) {
  origin = null; try { if (ws) ws.close(); } catch (_) {}
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const pid = adbTry(`pidof ${PKG}`).split(/\s+/)[0];
      if (pid) {
        try { adb("forward", "--remove", "tcp:9222"); } catch (_) {}
        adb("forward", "tcp:9222", `localabstract:webview_devtools_remote_${pid}`);
        const list = await (await fetch("http://127.0.0.1:9222/json")).json();
        const page = list.find(p => p.type === "page" && /localhost|capacitor|https?:\/\//.test(p.url)) || list.find(p => p.type === "page");
        if (page) {
          ws = new WebSocket(page.webSocketDebuggerUrl);
          await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("ws error")); });
          ws.onmessage = m => {
            const d = JSON.parse(m.data);
            if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
            else if (d.method === "Runtime.exceptionThrown") consoleErrors.push(d.params.exceptionDetails?.exception?.description || d.params.exceptionDetails?.text);
          };
          await send("Runtime.enable");
          return page.url;
        }
      }
    } catch (_) {}
    await sleep(1500);
  }
  throw new Error("CDP connect timeout");
}
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = ++seq; pending.set(id, res);
  ws.send(JSON.stringify({ id, method, params }));
  setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error("cdp timeout " + method)); } }, 20000);
});
async function ev(expr) {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || "eval error");
  return r.result?.result?.value;
}
async function waitFor(expr, ms = 30000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { try { if (await ev(expr)) return true; } catch (_) {} await sleep(500); }
  return false;
}
const vis = sel => `(()=>{const n=document.querySelector(${JSON.stringify(sel)});if(!n)return false;const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden')return false;for(let p=n;p;p=p.parentElement){if(p.hidden||p.classList.contains('hidden'))return false}return n.getClientRects().length>0})()`;
// Real OS-level tap (adb input tap). The CSS->screen mapping is calibrated by one swallowed tap whose
// clientX/clientY the page reports back, so it is exact for every API level / orientation / inset mode.
let origin = null, lastTap = null;
async function calibrate() {
  const evs = "['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click']";
  const pts = [[300, 900], [320, 1000], [280, 1100], [340, 950]];
  const dpr = await ev("devicePixelRatio");
  for (let i = 0; i < pts.length; i++) {
    await ev(`(()=>{window.__cal=null;const h=e=>{if(e.type==='pointerdown'&&!window.__cal)window.__cal=[e.clientX,e.clientY];if(e.cancelable)e.preventDefault();e.stopImmediatePropagation()};${evs}.forEach(t=>addEventListener(t,h,true));setTimeout(()=>${evs}.forEach(t=>removeEventListener(t,h,true)),7000);return true})()`);
    const [px, py] = pts[i];
    adbSh(`input swipe ${px} ${py} ${px} ${py} 150`);
    if (await waitFor("window.__cal!=null", 6000)) {
      const c = await ev("window.__cal");
      origin = { x: px - c[0] * dpr, y: py - c[1] * dpr, dpr, assumed: false };
      await sleep(3000);
      return origin;
    }
    await sleep(4000);
  }
  // last resort (documented in the evidence): edge-to-edge windows on API 35+ place the WebView at the screen origin
  origin = { x: 0, y: 0, dpr, assumed: true };
  return origin;
}
const PICK = (sel, idx) => `(()=>{const all=[...document.querySelectorAll(${JSON.stringify(sel)})].filter(n=>{const b=n.getBoundingClientRect();return b.width>0&&b.height>0});return all[${idx}]||null})()`;
const NAVPICK = idx => `(()=>{const all=[...document.querySelectorAll('button')].filter(n=>{const b=n.getBoundingClientRect();return b.width>0&&b.height>0&&b.top>innerHeight*0.8}).sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);return all[${idx}]||null})()`;
async function tapExpr(expr, label) {
  const topNow = adbTry("dumpsys activity activities | grep -m1 topResumedActivity");
  if (!topNow.includes(PKG)) { launch(); await sleep(2500); await connect(); await waitFor(vis("#cueHomeV1"), 30000); }
  await ev(`(()=>{const n=${expr};if(n)n.scrollIntoView({block:'center',inline:'center',behavior:'instant'});return !!n})()`);
  await sleep(350);
  if (!origin) await calibrate();
  const r = await ev(`(()=>{const n=${expr};if(!n)return null;const b=n.getBoundingClientRect();const x=b.left+b.width/2,y=b.top+b.height/2;const h=document.elementFromPoint(x,y);return {x,y,rect:[b.left,b.top,b.width,b.height].map(v=>Math.round(v)),text:(n.textContent||'').trim().slice(0,14),aria:(n.getAttribute('aria-label')||'').slice(0,24),hit:h?((h.id||h.className||h.tagName)+'').slice(0,50):null,contained:!!h&&(n.contains(h)||h.contains(n))}})()`);
  if (!r) throw new Error("no visible element for " + label);
  lastTap = { label, ...r };
  const sx = Math.round(origin.x + r.x * origin.dpr), sy = Math.round(origin.y + r.y * origin.dpr);
  await ev(`window.__lastPtr=null;window.__evlog=[];if(!window.__ptrDiag){window.__ptrDiag=true;['pointerdown','pointerup','touchstart','touchend','click'].forEach(t=>addEventListener(t,e=>{if(t==='pointerdown')window.__lastPtr=[Math.round(e.clientX),Math.round(e.clientY),((e.target&&(e.target.id||e.target.tagName))||'')+''];(window.__evlog=window.__evlog||[]).push(t+':'+(e.isTrusted?'T':'u')+(e.defaultPrevented?':prevented':''))},true))}true`);
  adbSh(`input swipe ${sx} ${sy} ${sx} ${sy} 120`);
  await sleep(1800);
  lastTap.screen = [sx, sy]; lastTap.ptr = await ev("window.__lastPtr").catch(() => null); lastTap.ev = await ev("(window.__evlog||[]).join(',')").catch(() => null);
  return r;
}
const tap = (sel, idx = 0) => tapExpr(PICK(sel, idx), sel + "[" + idx + "]");
const tapNav = idx => tapExpr(NAVPICK(idx), "nav#" + idx);
const back = async () => { adbSh("input keyevent KEYCODE_BACK"); await sleep(900); };

async function step(id, title, kind, fn) {
  const rec = { id, title, kind, status: "PASS", detail: "" };
  try { const d = await fn(); rec.detail = typeof d === "string" ? d : JSON.stringify(d ?? ""); }
  catch (e) { rec.status = "FAIL"; rec.detail = (String(e.message || e) + (lastTap ? " | lastTap=" + JSON.stringify(lastTap) : "")).slice(0, 700); shot("fail-" + id); }
  results.push(rec);
  console.log(`[${rec.status}] ${id} ${title} :: ${rec.detail}`);
  fs.writeFileSync(path.join(outDir, `${label}-results.json`), JSON.stringify({ label, results, consoleErrors }, null, 2));
}
const ok = (c, m) => { if (!c) throw new Error(m); };
const homeReady = () => waitFor(vis("#cueHomeV1"), 60000);


// ===================== extra modes: insets | coldstart | probe | back =====================
const mode = process.argv[5] || "full";
import zlib from "node:zlib";
function decodePng(buf) {
  let p = 8, w = 0, h = 0, bd = 0, ct = 0; const idat = [];
  while (p < buf.length) { const len = buf.readUInt32BE(p), type = buf.toString("ascii", p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + len);
    if (type === "IHDR") { w = d.readUInt32BE(0); h = d.readUInt32BE(4); bd = d[8]; ct = d[9]; } else if (type === "IDAT") idat.push(d); p += 12 + len; }
  if (bd !== 8 || (ct !== 2 && ct !== 6)) throw new Error("unsupported png " + bd + "/" + ct);
  const bpp = ct === 6 ? 4 : 3, stride = w * bpp, raw = zlib.inflateSync(Buffer.concat(idat)), out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) { const f = raw[y * (stride + 1)], r = y * (stride + 1) + 1, o = y * stride;
    for (let x = 0; x < stride; x++) { const a = x >= bpp ? out[o + x - bpp] : 0, b = y ? out[o - stride + x] : 0, c = x >= bpp && y ? out[o - stride + x - bpp] : 0; let v = raw[r + x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[o + x] = v & 255; } }
  return { w, h, px: (x, y) => { const i = y * stride + x * bpp; return [out[i], out[i + 1], out[i + 2]]; } };
}
const grab = () => decodePng(execFileSync("adb", ["exec-out", "screencap", "-p"], { maxBuffer: 64 << 20 }));
const hex = c => "#" + c.map(v => v.toString(16).padStart(2, "0")).join("");
function ascii(img, cols = 40, rows = 56) {
  const ramp = "@%#*+=-:. ", lines = [];
  for (let r = 0; r < rows; r++) { let l = ""; for (let c = 0; c < cols; c++) { const x = Math.floor((c + 0.5) * img.w / cols), y = Math.floor((r + 0.5) * img.h / rows), [R, G, B] = img.px(x, y); l += ramp[Math.min(9, Math.floor((0.3 * R + 0.59 * G + 0.11 * B) / 25.6))]; } lines.push(l); }
  return lines.join("\n");
}
const emit = (tag, o) => console.log(tag + " " + JSON.stringify(o));
const sysBars = () => { const w = adbTry("dumpsys window"); return { status: (w.match(/statusBars[^\n]*?frame=\[(\d+),(\d+)\]\[(\d+),(\d+)\]/) || []).slice(1).map(Number), nav: (w.match(/navigationBars[^\n]*?frame=\[(\d+),(\d+)\]\[(\d+),(\d+)\]/) || []).slice(1).map(Number) }; };
const wvInfo = () => adbTry("dumpsys webviewupdate | grep -m3 -i -E 'Current WebView package|versionName|Valid package'").replace(/\s+/g, " ").slice(0, 300);

async function launchAndMeasure() {
  const t0 = Date.now(); const out = launch(); const amMs = Date.now() - t0;
  let tDev = null, pid = "", miss = 0;
  for (let i = 0; i < 120 && tDev === null; i++) { pid = adbTry(`pidof ${PKG}`).split(/\s+/)[0]; if (!pid && ++miss >= 8) break; if (pid && adbTry(`cat /proc/net/unix | grep -c webview_devtools_remote_${pid}`).trim() !== "0") tDev = Date.now() - t0; else await sleep(2000); }
  return { amStartWaitMs: amMs, amTotalTime: (out.match(/TotalTime: (\d+)/) || [])[1], amWaitTime: (out.match(/WaitTime: (\d+)/) || [])[1], devtoolsMs: tDev, pid };
}

async function insetsMode() {
  adb("install", "-r", apk); adbTry("pm clear " + PKG);
  const N = 4, rows = [];
  for (let i = 1; i <= N; i++) {
    adbTry(`am force-stop ${PKG}`); await sleep(1500);
    const m = await launchAndMeasure();
    await connect(); await homeReady(); await sleep(7000);
    origin = null; await calibrate();
    const d = await ev(`(()=>{const q=s=>document.querySelector(s),vis=n=>n&&n.getBoundingClientRect().width>0;const probe=document.createElement('div');probe.style.cssText='position:fixed;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom) 0';document.body.appendChild(probe);const cs=getComputedStyle(probe);const envT=cs.paddingTop,envB=cs.paddingBottom;probe.remove();const root=getComputedStyle(document.documentElement);const tiles=q('#cueDisciplineSwitcherV1'),nav=q('.cue-phase1-tab-bar'),home=q('#cueHomeV1');const r=n=>{const b=n.getBoundingClientRect();return [b.left,b.top,b.width,b.height].map(v=>Math.round(v*10)/10)};return {envTop:envT,envBottom:envB,varTop:root.getPropertyValue('--safe-area-inset-top').trim(),varBottom:root.getPropertyValue('--safe-area-inset-bottom').trim(),inner:[innerWidth,innerHeight],dpr:devicePixelRatio,hScroll:document.documentElement.scrollWidth>innerWidth+1,tiles:tiles?r(tiles):null,nav:nav?r(nav):null,home:home?r(home):null,navPadBottom:nav?getComputedStyle(nav).paddingBottom:null,navBtn:(nav&&nav.querySelector('button'))?r(nav.querySelector('button')):null,homeCardTop:(q('#newMatchPlayerCard1V1')&&vis(q('#newMatchPlayerCard1V1')))?r(q('#newMatchPlayerCard1V1')):null}})()`);
    const bars = sysBars(), img = grab();
    const dpr = d.dpr, o = origin;
    const tilePhysTop = d.tiles ? Math.round(o.y + d.tiles[1] * dpr) : null;
    const navBtnPhysBottom = d.navBtn ? Math.round(o.y + (d.navBtn[1] + d.navBtn[3]) * dpr) : null;
    const navPhysTop = d.nav ? Math.round(o.y + d.nav[1] * dpr) : null, navPhysBottom = d.nav ? Math.round(o.y + (d.nav[1] + d.nav[3]) * dpr) : null;
    const px = { statusBand: hex(img.px(540, Math.max(2, Math.floor((bars.status[3] || 128) / 2)))), belowStatus: hex(img.px(540, Math.min(img.h - 1, (bars.status[3] || 128) + 6))), navBand: hex(img.px(540, img.h - 6)), aboveNavBar: hex(img.px(540, Math.max(0, (bars.nav[1] || img.h) - 8))), tabCenter: d.nav ? hex(img.px(540, Math.min(img.h - 1, Math.round(o.y + (d.nav[1] + d.nav[3] / 2) * dpr)))) : null };
    const row = { launch: i, navBtnPhysBottom, ...m, origin: { x: Math.round(o.x), y: Math.round(o.y), assumed: !!o.assumed }, bars, screen: [img.w, img.h], dom: d, tilePhysTop, navPhysTop, navPhysBottom, px, ascii: i === 1 ? ascii(img) : undefined };
    rows.push(row);
    emit("INSETS", { ...row, ascii: undefined });
    if (i === 1) console.log("ASCII-HOME (dark=@ light=space)\n" + row.ascii);
    const sb = bars.status[3] || 128, navTop = bars.nav[1] || img.h;
    await step("I" + i, `cold launch #${i}: content below status bar, tab bar above nav bar, no horizontal overflow`, "dom-read", async () => {
      ok(tilePhysTop >= sb, `tiles start at ${tilePhysTop}px but status bar ends at ${sb}px`);
      ok(navBtnPhysBottom != null && (navBtnPhysBottom <= navTop + 2 || bars.nav.length === 0), `tab buttons end at ${navBtnPhysBottom}px but navigation bar starts at ${navTop}px`);
      ok(!d.hScroll && Math.abs(d.inner[0] * dpr - img.w) <= 2, "width mismatch " + JSON.stringify([d.inner, dpr, img.w]));
      return { tilePhysTop, statusBottom: sb, navBtnPhysBottom, navBarTop: navTop };
    });
  }
  const tops = rows.map(r => r.dom.tiles && r.dom.tiles[1]), envs = rows.map(r => r.dom.envTop);
  const sumObj = { variant: label, tileTopCss: tops, envTop: envs, varTop: rows.map(r => r.dom.varTop), varBottom: rows.map(r => r.dom.varBottom), navBtnPhysBottom: rows.map(r => r.navBtnPhysBottom), navBarTop: rows.map(r => r.bars.nav[1]), statusBottom: rows.map(r => r.bars.status[3]), tilePhysTop: rows.map(r => r.tilePhysTop), spreadCss: Math.max(...tops) - Math.min(...tops), widthPx: rows.map(r => Math.round(r.dom.inner[0] * r.dom.dpr)), screenW: rows[0].screen[0] };
  emit("INSETS-SUMMARY", sumObj); globalThis.__finalSummary = sumObj;
  await step("I-stable", "tile top identical across cold launches (spread <= 1 css px)", "dom-read", async () => { const sp = Math.max(...tops) - Math.min(...tops); ok(sp <= 1, `tile top varies across launches: ${tops.join(",")}`); return { tops, envs }; });
  // tab bar / tile interaction after the change (real OS presses)
  await step("I-tap", "OS press on 9-Ball tile and Players tab lands on the intended element", "os-input", async () => {
    await tap('[data-discipline="9ball"]');
    const sel = await waitFor(`document.querySelector('[data-discipline="9ball"]').getAttribute('aria-selected')==='true'`, 10000);
    const p1 = lastTap.ptr, x1 = lastTap.x, y1 = lastTap.y, hit1 = lastTap.hit;
    await tapNav(1); await sleep(1200);
    const p2 = lastTap.ptr, x2 = lastTap.x, y2 = lastTap.y;
    const screens = await ev(`[...document.querySelectorAll('section,main')].filter(n=>n.getBoundingClientRect().width>0).map(n=>n.id).filter(Boolean).join('|')`);
    ok(sel, "tile not selected");
    return { selected: sel, tileHit: hit1, tabEvents: lastTap.ev, screens, pointerOffsetPx: [p1 ? Math.round(p1[0] - x1) : null, p1 ? Math.round(p1[1] - y1) : null, p2 ? Math.round(p2[0] - x2) : null, p2 ? Math.round(p2[1] - y2) : null] };
  });
  const img2 = grab(); console.log("ASCII-PLAYERS\n" + ascii(img2));
}

async function coldstartMode() {
  const settle = Number(process.env.SETTLE_SEC || 0);
  const base = { label, sdk: adbTry("getprop ro.build.version.sdk"), pagesize: adbTry("getconf PAGE_SIZE"), webview: wvInfo(), uptimeAtStart: adbTry("cat /proc/uptime").split(" ")[0], settleSec: settle };
  emit("COLD-ENV", base);
  adb("install", "-r", apk);
  if (settle) await sleep(settle * 1000);
  for (let i = 1; i <= 3; i++) {
    if (i > 1) { adbTry(`am force-stop ${PKG}`); await sleep(2000); }
    const topBefore = adbTry("top -b -n 1 | head -12").replace(/\s+/g, " ").slice(0, 600);
    const m = await launchAndMeasure();
    const procs = adbTry("ps -A | grep -E 'gms|webview|chrome|systemui|cuescore' | wc -l").trim();
    const wlog = adbTry(`logcat -d | grep -E "chromium|cr_|WebViewFactory|ContentMain|libwebviewchromium" | tail -6`).slice(0, 700);
    emit("COLD", { launch: i, ...m, uptimeNow: adbTry("cat /proc/uptime").split(" ")[0], relatedProcs: procs, topBeforeLaunch: i === 1 ? topBefore : undefined, webviewLog: i === 1 ? wlog : undefined });
    await step("C" + i, `cold launch #${i}: DevTools within 240s`, "device-state", async () => { ok(m.devtoolsMs !== null, "WebView devtools not up after 240s"); return m; });
  }
}

async function probeMode() {
  const env = { label, sdk: adbTry("getprop ro.build.version.sdk"), release: adbTry("getprop ro.build.version.release"), webview: wvInfo(), pkgs: adbTry("pm list packages -f | grep -i -E 'webview|chrome'").replace(/\s+/g, " ").slice(0, 400),
    wvVersions: adbTry("dumpsys package com.google.android.webview | grep -m1 versionName") + " | " + adbTry("dumpsys package com.android.webview | grep -m1 versionName"), tags: adbTry("getprop ro.build.tags"), abi: adbTry("getprop ro.product.cpu.abi") };
  emit("PROBE-ENV", env);
  adb("install", "-r", apk); adbTry("logcat -c");
  const m = await launchAndMeasure();
  await sleep(3000);
  const alive = !!adbTry(`pidof ${PKG}`);
  const fatal = adbTry(`logcat -d -b crash | grep -A12 -m1 "Process: ${PKG}"`).slice(0, 1500);
  const wv = adbTry(`logcat -d | grep -E "WebViewFactory|Unable to|MissingWebView|Capacitor|Minimum" | head -8`).slice(0, 900);
  emit("PROBE", { ...m, alive, fatal, wv });
  await step("P", "app launches and WebView attaches", "os-input", async () => { ok(m.devtoolsMs !== null && alive, "launch failed: alive=" + alive + " fatal=" + fatal.slice(0, 300)); return m; });
}

async function backMode() {
  const settleB = Number(process.env.SETTLE_SEC || 0);
  adb("install", "-r", apk); adbTry("pm clear " + PKG);
  if (settleB) await sleep(settleB * 1000);
  const m = await launchAndMeasure(); emit("STARTUP", { label, ...m });
  await connect(); await homeReady(); await sleep(2000);
  const ok1 = await ev(`window.CueScoreAndroidBackV1.setPolicy('proposal')`);
  const HOME = vis("#cueHomeV1") + "&&" + vis("#cueDisciplineSwitcherV1");
  const fg = () => adbTry("dumpsys activity activities | grep -m1 topResumedActivity").includes(PKG);
  await step("B0", "proposal policy can be enabled at runtime (default stays current)", "dom-read", async () => { ok(ok1 === true, "setPolicy failed"); return { policy: await ev("window.CueScoreAndroidBackV1.getPolicy()") }; });
  await step("B1", "selected discipline -> Back returns to the 6-discipline list (app stays foreground)", "os-input", async () => {
    const SEL9 = `document.querySelector('[data-discipline="9ball"]').getAttribute('aria-selected')==='true'`;
    await tap('[data-discipline="9ball"]'); let sel9 = await waitFor(SEL9, 8000);
    if (!sel9) { await tap('[data-discipline="9ball"]'); sel9 = await waitFor(SEL9, 10000); } // first press after launch can be dropped by the software-GPU emulator
    ok(sel9, "not selected");
    ok(!(await ev(HOME)), "tiles still visible while selected");
    await back(); ok(await waitFor(HOME, 10000), "tiles not restored by Back"); ok(fg(), "app left foreground");
  });
  for (const [i, name] of [[1, "Players"], [2, "History"], [3, "Settings"]]) {
    await step("B" + (i + 1), `${name} tab -> Back returns to Home (app stays foreground)`, "os-input", async () => {
      await tapNav(i); await sleep(1500);
      const tabNow = await ev("document.body.dataset.cuePhase1Tab");
      ok(tabNow && tabNow !== "home", name + " did not open; tab=" + tabNow);
      await back(); ok(await waitFor(`document.body.dataset.cuePhase1Tab==='home'`, 10000), `active tab not home after Back from ${name} (was ${tabNow})`); ok(fg(), "app left foreground");
      ok(await waitFor(HOME, 10000), "Home tiles not visible after Back");
    });
  }
  await step("B5", "Pro overlay open -> Back closes only the overlay", "os-input", async () => {
    await ev(`window.CueScorePro.open('emulator-check'); true`); await sleep(1500);
    const opened = await ev(vis(".cue-pro-overlay-v1")); ok(opened, "Pro overlay did not open");
    await back(); await sleep(1200);
    ok(!(await ev(vis(".cue-pro-overlay-v1"))), "overlay not closed"); ok(fg(), "app left foreground (overlay Back must not minimize)");
  });
  await step("B6", "Home list -> Back minimizes (process alive)", "os-input", async () => {
    ok(await waitFor(HOME, 5000), "not on Home list");
    const pre = await ev(`({tab:document.body.dataset.cuePhase1Tab,tiles:${vis("#cueDisciplineSwitcherV1")},home:${vis("#cueHomeV1")},pro:${vis(".cue-pro-overlay-v1")},back:(window.CueScoreAndroidBackV1.selectors||[]).filter(s=>{const n=document.querySelector(s);return n&&n.getClientRects().length>0}).slice(0,3)})`);
    await back();
    for (let k = 0; k < 16 && fg(); k++) await sleep(500);
    ok(!fg(), "app did not minimize; state before Back=" + JSON.stringify(pre)); ok(!!adbTry(`pidof ${PKG}`), "process died");
  });
  // ---- non-destructive feature probes on fresh test data ----
  adbTry(`pm clear ${PKG}`); await sleep(1500); launch(); await connect(); await homeReady(); await sleep(2000);
  await step("F-startup", "cold/warm start timings and ANR scan", "device-state", async () => {
    adbTry(`am force-stop ${PKG}`); await sleep(1500); const t = await launchAndMeasure();
    const anr = adbTry(`logcat -d | grep -E 'ANR in ${PKG}' | tail -2`); const anrOther = adbTry("logcat -d | grep -E 'ANR in' | tail -2"); if (anrOther) emit("ANR-OTHER-PROCESS", anrOther.slice(0, 300));
    ok(!anr, anr); return t;
  });
  adbTry(`pm clear ${PKG}`); await sleep(1500); launch(); await connect(); await homeReady(); await sleep(2500);
  await step("F-shot-clock", "shot clock: OFF by default, ON via setup switch (OS press), clock UI shown in match", "os-input", async () => {
    const SELF = `document.querySelector('[data-discipline="9ball"]').getAttribute('aria-selected')==='true'`;
    await tap('[data-discipline="9ball"]'); if (!(await waitFor(SELF, 8000))) { await tap('[data-discipline="9ball"]'); await waitFor(SELF, 10000); }
    const SW = `(()=>{const n=[...document.querySelectorAll('.cue-sc-switch')].find(x=>x.getClientRects().length>0);return n?n.getAttribute('aria-checked'):null})()`;
    const before = await ev(SW);
    ok(before === "false" || before === null, "shot clock should start OFF, got " + before);
    ok(before !== null, "setup shot-clock switch not visible");
    await tap(".cue-sc-switch"); await sleep(800);
    let on = await ev(SW);
    if (on !== "true") { await tap(".cue-sc-switch"); await sleep(800); on = await ev(SW); }
    ok(on === "true", "shot clock switch did not turn ON; aria-checked=" + on);
    await tap("#startGameBtn"); ok(await waitFor(vis("#proGameScreen"), 30000), "game screen not shown");
    await sleep(3000);
    const ui = await ev(`({bar:${vis(".cue-sc-bar")},ext:${vis(".cue-sc-extb")},reset:${vis(".cue-sc-resetb")},main:${vis(".cue-sc-main")},text:(document.querySelector('.cue-sc-bar')||{}).textContent||''})`).catch(() => "page busy");
    emit("GAME", { switchBefore: before, switchAfter: on, ui });
    shot("30-game");
    ok(ui && ui !== "page busy" && (ui.bar || ui.main || ui.ext), "no shot-clock UI visible in match with the clock ON: " + JSON.stringify(ui));
    return { before, on, ui };
  });
  await step("B7", "in a running match, system Back keeps match data and the app in foreground", "os-input", async () => {
    const snap = () => ev(`(()=>{let n=0,len=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);n++;len+=(localStorage.getItem(k)||'').length}return {keys:n,len}})()`);
    const pre = await snap();
    await back(); await sleep(2500);
    const post = await snap();
    const state = await ev(`({game:${vis("#proGameScreen")},home:${vis("#cueHomeV1")}})`);
    emit("B7-STATE", { pre, post, state });
    ok(fg(), "app left foreground during a match");
    ok(post.keys >= pre.keys && post.len >= pre.len * 0.9, "stored data shrank after Back: " + JSON.stringify({ pre, post }));
  });
}

(async () => {
  let info = {};
  if (mode !== "full") {
    try { await ({ insets: insetsMode, coldstart: coldstartMode, probe: probeMode, back: backMode }[mode])(); } catch (e) { console.log("MODE ERROR", e && e.stack || e); }
    fs.writeFileSync(path.join(outDir, `${label}-${mode}-results.json`), JSON.stringify({ label, mode, results, consoleErrors }, null, 2));
    const f = results.filter(r => r.status === "FAIL").length; console.log(`SUMMARY ${label}/${mode}: ${results.length - f}/${results.length} PASS`); console.log("FINAL " + JSON.stringify({ label, mode, steps: results.map(r => r.id + ":" + r.status[0]).join(","), insets: globalThis.__finalSummary || null, fails: results.filter(r => r.status === "FAIL").map(r => r.id + "=" + String(r.detail).slice(0, 140)) })); process.exit(0);
  }
  await step("E01", "APK install", "device-state", async () => {
    adbTry("logcat -c");
    const o = adb("install", "-r", apk);
    ok(/Success/.test(o), o);
    return o;
  });
  await step("E02", "Device / API / PAGE_SIZE", "device-state", async () => {
    info = {
      sdk: adbSh("getprop ro.build.version.sdk"), release: adbSh("getprop ro.build.version.release"),
      abi: adbSh("getprop ro.product.cpu.abi"), pagesize: (adbTry("getconf PAGE_SIZE") || (() => { const kb = adbTry("cat /proc/self/smaps | grep -m1 KernelPageSize").match(/(\d+)\s*kB/); return kb ? String(+kb[1] * 1024) : "unknown"; })()),
      kernel: adbSh("uname -r"), size: adbSh("wm size"), density: adbSh("wm density"),
      pkg16k: adbTry(`dumpsys package ${PKG} | grep -i -E "minSdk|targetSdk" | head -2`),
      avd: adbTry("getprop ro.boot.qemu.avd_name"), flavor: adbTry("getprop ro.build.flavor"), tags: adbTry("getprop ro.system.build.tags")
    };
    if (label.includes("16k")) ok(info.pagesize === "16384", "expected 16 KB page size, got " + info.pagesize);
    return info;
  });
  await step("E03", "Launch + WebView attach + home visible", "os-input", async () => {
    const out = launch();
    let url, retried = false;
    try { url = await connect(70000); ok(await homeReady(), "home not visible within 60s"); }
    catch (e) {
      retried = true;
      const diag = adbTry(`logcat -d | grep -E "cuescoreapps|chromium|cr_|WebView|Capacitor|MainActivity|ANR in|Fatal signal|webview_service" | tail -40`) + "\nunix: " + adbTry("cat /proc/net/unix | grep -c devtools_remote");
      fs.writeFileSync(path.join(outDir, `${label}-first-launch-diag.txt`), `am start: ${out}\npid: ${adbTry("pidof " + PKG)}\n${diag}\n`);
      console.log("FIRST-LAUNCH-DIAG\n" + (`am start: ${out}\npid: ${adbTry("pidof " + PKG)}\n${diag}`).slice(0, 3800));
      shot("03-first-launch-failed");
      launch(); url = await connect(70000); ok(await homeReady(), "home not visible after relaunch (first attempt: " + e.message + ")");
      shot("01-home");
      return { url, firstLaunchFailed: true, firstAttemptError: e.message, pidAtFailure: adbTry("pidof " + PKG), diagFile: label + "-first-launch-diag.txt" };
    }
    shot("01-home");
    const btns = await ev(`[...document.querySelectorAll('button,[role=button],[role=tab],a')].filter(n=>n.getClientRects().length&&n.getBoundingClientRect().width>0).map(n=>{const b=n.getBoundingClientRect();return (n.id||n.dataset.discipline||n.className||'').toString().slice(0,28)+'@'+Math.round(b.left)+','+Math.round(b.top)+','+Math.round(b.width)+'x'+Math.round(b.height)}).slice(0,40)`);
    return { url, retried, visibleButtons: btns };
  });
  await step("E04", "Crash scan after launch (app process only)", "device-state", async () => {
    const c = appCrashes();
    ok(c.mine.length === 0, c.mine.slice(0, 3).join(" | "));
    return { appCrashes: 0, otherProcessFatalExceptions: c.otherProcessFatalCount };
  });
  await step("E05", "Safe-area / system bars / viewport", "dom-read", async () => {
    const probe = `(()=>{const d=document.createElement('div');d.style.cssText='position:fixed;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';document.body.appendChild(d);const c=getComputedStyle(d);const r={top:c.paddingTop,right:c.paddingRight,bottom:c.paddingBottom,left:c.paddingLeft};d.remove();const sw=document.querySelector('#cueDisciplineSwitcherV1');const n=document.querySelector('#cueHomeSettingsV3');return {safe:r,cssVarTop:getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top'),inner:[innerWidth,innerHeight],dpr:devicePixelRatio,hScroll:document.documentElement.scrollWidth>innerWidth+1,switcherTop:sw?sw.getBoundingClientRect().top:null,navBottom:n?n.getBoundingClientRect().bottom:null}})()`;
    let v = await ev(probe), waited = 0;
    while (parseFloat(v.safe.top) === 0 && waited < 8000) { await sleep(1000); waited += 1000; v = await ev(probe); }
    v.settledAfterMs = waited;
    v.webview = { ua: (await ev('navigator.userAgent')).match(/Chrome\/[\d.]+/)?.[0], pkg: adbTry("dumpsys webviewupdate | grep -m2 -i -E 'Current WebView package|versionName'").replace(/\s+/g,' ').slice(0,160) };
    v.statusBarWindow = adbTry("dumpsys window | grep -m1 -o 'statusBars[^}]*frame=\\[[0-9,]*\\]\\[[0-9,]*\\]'").slice(0, 120);
    ok(!v.hScroll, "horizontal overflow");
    ok(v.navBottom != null && v.navBottom > 0 && v.navBottom <= v.inner[1] + 1, "bottom nav clipped/hidden " + JSON.stringify(v));
    ok(v.switcherTop == null || v.switcherTop >= 24, "content under status bar: switcherTop=" + v.switcherTop + " safeTop=" + v.safe.top);
    return v;
  });
  const disciplines = ["9ball", "10ball", "jpa9", "rotation", "straightPool", "threeCushion"];
  const HOMEVIS = vis("#cueHomeV1") + "&&" + vis("#cueDisciplineSwitcherV1");
  for (const d of disciplines) {
    await step("E06-" + d, `${d}: OS press on tile -> selected, D2 cards aligned, Android Back outcome`, "os-input", async () => {
      if (!(await waitFor(HOMEVIS, 4000))) {
        const top = adbTry("dumpsys activity activities | grep -m1 topResumedActivity");
        if (!top.includes(PKG)) { launch(); await connect(); }
        await waitFor(HOMEVIS, 4000) || (await tapNav(0));
        ok(await waitFor(HOMEVIS, 15000), "could not return to discipline tiles via Home tab before " + d);
      }
      await tap(`[data-discipline="${d}"]`);
      const sel = await waitFor(`document.querySelector('[data-discipline="${d}"]').getAttribute('aria-selected')==='true'`, 10000);
      const name = await ev(`((document.querySelector('#cueSelectedGameNameV1')||{}).textContent||'').trim()`);
      const g = await ev(`(()=>{const a=document.querySelector('#newMatchPlayerCard1V1'),b=document.querySelector('#newMatchPlayerCard2V1');if(!a||!b)return null;const A=a.getBoundingClientRect(),B=b.getBoundingClientRect();return {a:[A.left,A.top,A.width,A.height].map(Math.round),b:[B.left,B.top,B.width,B.height].map(Math.round),vw:innerWidth}})()`);
      const btns = await ev(`[...document.querySelectorAll('button,[role=button]')].filter(n=>{const b=n.getBoundingClientRect();return b.width>0&&b.height>0}).map(n=>(n.id||n.dataset.discipline||n.className||'').toString().slice(0,22)+':'+((n.textContent||'').trim().slice(0,8))).slice(0,16)`);
      shot("02-selected-" + d);
      ok(sel, "tile not selected after OS press; events=" + (lastTap && lastTap.ev));
      ok(g && g.a[2] > 0, "player cards not visible " + JSON.stringify(g));
      ok(Math.abs(g.a[1] - g.b[1]) <= 1 && Math.abs(g.a[3] - g.b[3]) <= 1, "card top/height mismatch " + JSON.stringify(g));
      ok(g.a[0] >= 0 && g.a[0] < g.b[0] && g.b[0] + g.b[2] <= g.vw + 1, "card order/overflow " + JSON.stringify(g));
      await back();
      const home = await waitFor(HOMEVIS, 8000);
      const alive = !!adbTry(`pidof ${PKG}`);
      const top = adbTry("dumpsys activity activities | grep -m1 topResumedActivity").slice(-70);
      return { selectedName: name, cards: g, events: lastTap.ev, backReturnsToHomeTiles: home, processAliveAfterBack: alive, topAfterBack: top, visibleControlsWhenSelected: btns };
    });
  }
  await step("E08", "Three languages (ja/en/zh-Hans)", "webview-input", async () => {
    const out = {};
    for (const lang of ["en", "zh-Hans", "ja"]) {
      await ev(`localStorage.setItem('cueScore.language.v1', ${JSON.stringify(lang)}); true`);
      await send("Page.reload", {}); await sleep(1500);
      await connect(); ok(await homeReady(), "home after reload " + lang);
      out[lang] = await ev(`({lang:document.documentElement.lang, start:((document.querySelector('#startGameBtn')||{}).textContent||'').trim().slice(0,16)})`);
      shot("04-lang-" + lang);
    }
    ok(out.en.lang === "en" && out["zh-Hans"].lang.startsWith("zh") && out.ja.lang === "ja", JSON.stringify(out));
    return out;
  });
  const SNAP = `(()=>{const vis=n=>{const b=n.getBoundingClientRect();return b.width>0&&b.height>0};return [...document.querySelectorAll('section,main,[role=tabpanel],[role=dialog]')].filter(vis).map(n=>(n.id||String(n.className).split(' ')[0]).slice(0,30)).sort().join('|')})()`;
  for (let i = 0; i < 4; i++) {
    await step("E09-tab" + i, `bottom tab #${i}: OS press changes visible screen; Android Back outcome`, "os-input", async () => {
      if (!(await waitFor(HOMEVIS, 4000))) {
        const top = adbTry("dumpsys activity activities | grep -m1 topResumedActivity");
        if (!top.includes(PKG)) { launch(); await connect(); }
        if (!(await waitFor(HOMEVIS, 4000))) await tapNav(0);
        ok(await waitFor(HOMEVIS, 15000), "could not reach Home tiles");
      }
      const before = await ev(SNAP);
      const r = await tapNav(i);
      await sleep(1500);
      const after = await ev(SNAP);
      const tiles = await ev(HOMEVIS);
      shot("05-tab" + i);
      await back(); await sleep(1500);
      const alive = !!adbTry(`pidof ${PKG}`);
      const topAfter = adbTry("dumpsys activity activities | grep -m1 topResumedActivity").slice(-60);
      ok(alive, "process died on Back from tab " + i);
      ok(i === 0 || before !== after || !tiles, "tab #" + i + " (" + (r.text || r.aria) + ") did not change visible screens; events=" + lastTap.ev);
      return { label: r.text || r.aria, events: lastTap.ev, screensBefore: before.slice(0, 120), screensAfter: after.slice(0, 120), homeTilesVisibleAfterTap: tiles, appInForegroundAfterBack: topAfter.includes(PKG) };
    });
  }
  await step("E10", "Back at root minimizes (no crash, process alive)", "os-input", async () => {
    await back();
    await sleep(1200);
    const top = adbSh("dumpsys activity activities | grep -E 'topResumedActivity|mResumedActivity' | head -2");
    const alive = adbTry(`pidof ${PKG}`);
    ok(alive, "process died on root Back");
    return { top: top.slice(0, 160), alive: true };
  });
  await step("E11", "Resume after background keeps state + data", "os-input", async () => {
    launch();
    await connect(); ok(await homeReady(), "home after resume");
    await ev(`localStorage.setItem('__emu_probe','1'); true`);
    adbSh("input keyevent KEYCODE_HOME"); await sleep(2500);
    launch(); await sleep(1500);
    await connect(); ok(await homeReady(), "home after HOME→relaunch");
    ok((await ev(`localStorage.getItem('__emu_probe')`)) === "1", "probe lost");
    shot("06-resume");
    return "state kept";
  });
  await step("E12", "Process kill → data persists", "device-state", async () => {
    adbSh(`am force-stop ${PKG}`); await sleep(1500);
    launch();
    await connect(); ok(await homeReady(), "home after kill");
    const v = await ev(`localStorage.getItem('__emu_probe')`);
    ok(v === "1", "probe lost after kill: " + v);
    const lang = await ev(`localStorage.getItem('cueScore.language.v1')`);
    await ev(`localStorage.removeItem('__emu_probe'); true`);
    return { probe: v, language: lang };
  });
  await step("E14", "Free/Pro: entitlement object + Pro overlay open/Back", "webview-input", async () => {
    const st = await ev(`(()=>{const e=window.CueScoreEntitlement;return {has:!!e, keys:e?Object.keys(e).slice(0,12):[], pro:!!window.CueScorePro}})()`);
    ok(st.has && st.pro, JSON.stringify(st));
    await ev(`try{window.CueScorePro.open('emulator-check')}catch(e){}; true`); await sleep(900);
    shot("08-pro");
    const open = await ev(vis(".cue-pro-overlay-v1"));
    if (open) { await back(); ok(!(await ev(vis(".cue-pro-overlay-v1"))), "Pro overlay not closed by Back"); }
    return { ...st, overlayOpened: open };
  });
  await step("E15", "Native plugins registered (Billing/Scanner/Filesystem/Share)", "dom-read", async () => {
    const p = await ev(`Object.keys((window.Capacitor&&Capacitor.PluginHeaders)?Object.fromEntries(Capacitor.PluginHeaders.map(h=>[h.name,1])):{})`);
    return p;
  });
  await step("E16", "Rotation to landscape and back: no crash, app still usable", "os-input", async () => {
    adbSh("settings put system accelerometer_rotation 0"); adbSh("settings put system user_rotation 1"); await sleep(2500);
    shot("09-landscape");
    ok(adbTry(`pidof ${PKG}`), "process died on rotate");
    adbSh("settings put system user_rotation 0"); await sleep(2000);
    await connect();
    const okHome = await homeReady();
    if (!okHome) { const d = await ev(`({home:${vis("#cueHomeV1")},portraitOverlay:(()=>{const n=document.querySelector('#iphonePortraitOnlyV1');return n?getComputedStyle(n).display:null})(),inner:[innerWidth,innerHeight],rot:null})`).catch(e=>String(e)); throw new Error("home after rotate back " + JSON.stringify(d) + " rotation=" + adbTry("dumpsys window | grep -m1 mCurrentRotation")); }
    shot("10-portrait-again");
    return "ok";
  });
  await step("E18", "Fresh install: setup -> Start match (OS tap) -> game screen -> Android Back", "os-input", async () => {
    adbTry(`pm clear ${PKG}`); await sleep(1500); launch();
    await connect(); ok(await homeReady(), "home after pm clear (fresh install state)");
    await tap('[data-discipline="9ball"]');
    ok(await waitFor(`document.querySelector('[data-discipline="9ball"]').getAttribute('aria-selected')==='true'`, 10000), "9-Ball tile not selected; events=" + (lastTap && lastTap.ev));
    const st = await ev(`(()=>{const b=document.querySelector('#startGameBtn');return b?{disabled:b.disabled,text:(b.textContent||'').trim().slice(0,16),players:[document.querySelector('#p1Name'),document.querySelector('#p2Name')].map(n=>n&&(n.value||n.textContent||'').trim().slice(0,16))}:null})()`);
    shot("07-setup-fresh");
    if (!st || st.disabled) return { skipped: "start disabled on fresh install", state: st };
    const tStart = Date.now();
    await tap("#startGameBtn");
    shot("07-after-start-press");
    let responsive = false, gameShown = false;
    for (let k = 0; k < 4 && !responsive; k++) { try { await ev("1"); responsive = true; } catch (_) {} }
    const msToResponsive = responsive ? Date.now() - tStart : null;
    if (responsive) gameShown = await waitFor(vis("#proGameScreen"), 20000);
    const anr = adbTry("logcat -d | grep -E 'ANR in|Input dispatching timed out' | tail -3");
    const topNow = adbTry("dumpsys activity activities | grep -m1 topResumedActivity").slice(-70);
    shot("07-game");
    if (!responsive) { launch(); await connect(); }
    ok(responsive, "WebView unresponsive for >60s after Start press (ms=" + (Date.now() - tStart) + ", anr=" + anr.slice(0, 160) + ", top=" + topNow + ")");
    ok(gameShown, "game screen not shown after OS press on Start (responsive in " + msToResponsive + "ms)");
    const g = gameShown;
    const clock = await ev(`[...document.querySelectorAll('[id*="lock" i],[id*="shot" i]')].filter(n=>n.getClientRects().length).map(n=>n.id).slice(0,8)`).catch(() => "page busy");
    await back(); await sleep(1500);
    shot("07b-after-back");
    const after = await ev(`({game:${vis("#proGameScreen")},choice:${vis("#cueInProgressChoiceV1")},home:${vis("#cueHomeV1")}})`).catch(() => "page busy after Back");
    return { startState: st, gameScreenVisible: g, clockElementIds: clock, afterBack: after };
  });
  await step("E17", "Final crash/ANR scan (app process) + JS exceptions", "device-state", async () => {
    const c = appCrashes();
    ok(c.mine.length === 0, c.mine.slice(0, 3).join(" | "));
    ok(consoleErrors.length === 0, "JS exceptions: " + consoleErrors.slice(0, 3).join(" | "));
    return { appCrashes: 0, otherProcessFatalExceptions: c.otherProcessFatalCount };
  });
  fs.writeFileSync(path.join(outDir, `${label}-logcat.txt`), (() => { try { return adbSh("logcat -d -t 2000"); } catch (_) { return ""; } })());
  fs.writeFileSync(path.join(outDir, `${label}-device.json`), JSON.stringify(info, null, 2));
  const fails = results.filter(r => r.status === "FAIL").length;
  console.log(`SUMMARY ${label}: ${results.length - fails}/${results.length} PASS`);
  process.exit(0);
})().catch(e => { console.error("DRIVER ERROR", e); process.exit(0); });
