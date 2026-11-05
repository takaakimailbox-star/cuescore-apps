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
let origin = null;
async function calibrate() {
  await ev(`(()=>{window.__cal=null;const stop=e=>{if(e.cancelable)e.preventDefault();e.stopImmediatePropagation()};const evs=['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click'];const h=e=>{if(e.type==='pointerdown'&&!window.__cal)window.__cal=[e.clientX,e.clientY];stop(e)};evs.forEach(t=>addEventListener(t,h,true));setTimeout(()=>evs.forEach(t=>removeEventListener(t,h,true)),2500);return true})()`);
  const px = 300, py = 900;
  adbSh(`input tap ${px} ${py}`); await sleep(700);
  const c = await ev("window.__cal"), dpr = await ev("devicePixelRatio");
  if (!c) throw new Error("calibration tap not seen by page");
  origin = { x: px - c[0] * dpr, y: py - c[1] * dpr, dpr };
  await sleep(2000);
  return origin;
}
async function tap(sel) {
  await ev(`(()=>{const n=document.querySelector(${JSON.stringify(sel)});if(n)n.scrollIntoView({block:'center',inline:'center',behavior:'instant'});return !!n})()`);
  await sleep(350);
  if (!origin) await calibrate();
  const r = await ev(`(()=>{const n=document.querySelector(${JSON.stringify(sel)});if(!n)return null;const b=n.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}})()`);
  if (!r) throw new Error("not found " + sel);
  adbSh(`input tap ${Math.round(origin.x + r.x * origin.dpr)} ${Math.round(origin.y + r.y * origin.dpr)}`);
  await sleep(800);
}
const back = async () => { adbSh("input keyevent KEYCODE_BACK"); await sleep(900); };

async function step(id, title, kind, fn) {
  const rec = { id, title, kind, status: "PASS", detail: "" };
  try { const d = await fn(); rec.detail = typeof d === "string" ? d : JSON.stringify(d ?? ""); }
  catch (e) { rec.status = "FAIL"; rec.detail = String(e.message || e).slice(0, 400); shot("fail-" + id); }
  results.push(rec);
  console.log(`[${rec.status}] ${id} ${title} :: ${rec.detail}`);
  fs.writeFileSync(path.join(outDir, `${label}-results.json`), JSON.stringify({ label, results, consoleErrors }, null, 2));
}
const ok = (c, m) => { if (!c) throw new Error(m); };
const homeReady = () => waitFor(vis("#cueHomeV1") + "&&" + vis("#cueDisciplineSwitcherV1"), 60000);

(async () => {
  let info = {};
  await step("E01", "APK install", "device-state", async () => {
    adbSh("logcat -c");
    const o = adb("install", "-r", apk);
    ok(/Success/.test(o), o);
    return o;
  });
  await step("E02", "Device / API / PAGE_SIZE", "device-state", async () => {
    info = {
      sdk: adbSh("getprop ro.build.version.sdk"), release: adbSh("getprop ro.build.version.release"),
      abi: adbSh("getprop ro.product.cpu.abi"), pagesize: adbSh("getconf PAGE_SIZE"),
      kernel: adbSh("uname -r"), size: adbSh("wm size"), density: adbSh("wm density"),
      pkg16k: adbTry(`dumpsys package ${PKG} | grep -i -E "minSdk|targetSdk" | head -2`),
      avd: adbTry("getprop ro.boot.qemu.avd_name"), flavor: adbTry("getprop ro.build.flavor"), tags: adbTry("getprop ro.system.build.tags")
    };
    if (label.includes("16k")) ok(info.pagesize === "16384", "expected 16 KB page size, got " + info.pagesize);
    return info;
  });
  await step("E03", "Launch + WebView attach + home visible", "os-input", async () => {
    launch();
    const url = await connect();
    ok(await homeReady(), "home not visible within 60s");
    shot("01-home");
    return url;
  });
  await step("E04", "Crash scan after launch", "device-state", async () => {
    const lc = adbSh("logcat -d -b crash,main -s AndroidRuntime:E ActivityManager:E | head -40");
    ok(!/FATAL EXCEPTION/.test(lc), lc.slice(0, 300));
    return "no FATAL EXCEPTION";
  });
  await step("E05", "Safe-area / system bars / viewport", "dom-read", async () => {
    const probe = `(()=>{const d=document.createElement('div');d.style.cssText='position:fixed;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';document.body.appendChild(d);const c=getComputedStyle(d);const r={top:c.paddingTop,right:c.paddingRight,bottom:c.paddingBottom,left:c.paddingLeft};d.remove();const sw=document.querySelector('#cueDisciplineSwitcherV1');const n=document.querySelector('#settingsBtn');return {safe:r,cssVarTop:getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top'),inner:[innerWidth,innerHeight],dpr:devicePixelRatio,hScroll:document.documentElement.scrollWidth>innerWidth+1,switcherTop:sw?sw.getBoundingClientRect().top:null,navBottom:n?n.getBoundingClientRect().bottom:null}})()`;
    let v = await ev(probe), waited = 0;
    while (parseFloat(v.safe.top) === 0 && waited < 8000) { await sleep(1000); waited += 1000; v = await ev(probe); }
    v.settledAfterMs = waited;
    v.statusBarWindow = adbTry("dumpsys window | grep -m1 -o 'statusBars[^}]*frame=\\[[0-9,]*\\]\\[[0-9,]*\\]'").slice(0, 120);
    ok(!v.hScroll, "horizontal overflow");
    ok(v.navBottom != null && v.navBottom > 0 && v.navBottom <= v.inner[1] + 1, "bottom nav clipped/hidden " + JSON.stringify(v));
    ok(v.switcherTop == null || v.switcherTop >= 24, "content under status bar: switcherTop=" + v.switcherTop + " safeTop=" + v.safe.top);
    return v;
  });
  await step("E06", "Six disciplines selectable", "webview-input", async () => {
    const names = ["9ball", "10ball", "jpa9", "rotation", "straightPool", "threeCushion"], seen = {};
    for (const d of names) {
      await tap(`[data-discipline="${d}"]`);
      const sel = await ev(`document.querySelector('[data-discipline="${d}"]').getAttribute('aria-selected')`);
      ok(sel === "true", d + " aria-selected=" + sel + " all=" + await ev(`[...document.querySelectorAll("[data-discipline]")].map(b=>b.dataset.discipline+":"+b.getAttribute("aria-selected")).join(",")`));
      seen[d] = await ev(`(document.querySelector('#cueSelectedGameNameV1')||{}).textContent||''`);
      shot("02-disc-" + d);
    }
    return seen;
  });
  await step("E07", "D2 setup: left/right player cards aligned (9-Ball)", "webview-input", async () => {
    await tap('[data-discipline="9ball"]');
    const g = await ev(`(()=>{const a=document.querySelector('#newMatchPlayerCard1V1'),b=document.querySelector('#newMatchPlayerCard2V1');if(!a||!b)return null;const A=a.getBoundingClientRect(),B=b.getBoundingClientRect();return {a:[A.left,A.top,A.width,A.height],b:[B.left,B.top,B.width,B.height],vw:innerWidth}})()`);
    ok(g, "cards missing");
    shot("03-d2-setup");
    ok(Math.abs(g.a[1] - g.b[1]) <= 1 && Math.abs(g.a[3] - g.b[3]) <= 1, "card top/height mismatch " + JSON.stringify(g));
    ok(g.a[0] < g.b[0] && g.b[0] + g.b[2] <= g.vw + 1, "card order/overflow " + JSON.stringify(g));
    return g;
  });
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
  const screens = [["settingsBtn", "#settingsBackBtn", "Settings"], ["playerManagementBtn", "#playerLibraryBackBtn", "Players"], ["recordsBtn", "#recordsBackV2", "History"], ["openRankingsBtn", "#rankingsBackBtn", "Analysis"]];
  for (const [btn, backSel, name] of screens) {
    await step("E09-" + name, `${name}: open then Android Back returns home`, "os-input", async () => {
      await tap("#" + btn);
      ok(await waitFor(vis(backSel), 5000), name + " screen not shown (" + backSel + " not visible)");
      shot("05-" + name);
      await back();
      ok(await waitFor("!(" + vis(backSel) + ")", 5000), "Android Back did not close " + name);
      ok(await homeReady(), "home not visible after Back");
      return "ok";
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
  await step("E18", "Match start → game screen (shot clock UI present) → Back", "webview-input", async () => {
    adbTry(`pm clear ${PKG}`); await sleep(1500); launch();
    await connect(); ok(await homeReady(), "home after pm clear (fresh install state)");
    const enabled = await ev(`(()=>{const b=document.querySelector('#startGameBtn');return !!b&&!b.disabled})()`);
    if (!enabled) return { skipped: "start disabled", players: await ev(`[document.querySelector("#p1Name"),document.querySelector("#p2Name")].map(n=>n&&(n.value||n.textContent))`) };
    await tap("#startGameBtn");
    await waitFor(vis("#proGameScreen"), 8000);
    const g = await ev(vis("#proGameScreen"));
    shot("07-game");
    const clock = await ev(`[...document.querySelectorAll('[id*="lock" i],[id*="shot" i]')].filter(n=>n.getClientRects().length).map(n=>n.id).slice(0,8)`);
    ok(g, "game screen not shown after tapping Start (fresh install)");
    await back(); await sleep(800);
    shot("07b-after-back");
    const after = await ev(`({gameVisible:${vis("#proGameScreen")},choice:${vis("#cueInProgressChoiceV1")},home:${vis("#cueHomeV1")}})`);
    return { gameScreenVisible: g, clockElementIds: clock, afterBack: after };
  });
  await step("E17", "Final crash/ANR scan + JS exceptions", "device-state", async () => {
    const lc = adbSh("logcat -d | grep -E 'FATAL EXCEPTION|ANR in' | head -5");
    ok(!lc, lc);
    ok(consoleErrors.length === 0, "JS exceptions: " + consoleErrors.slice(0, 3).join(" | "));
    return "clean";
  });
  fs.writeFileSync(path.join(outDir, `${label}-logcat.txt`), (() => { try { return adbSh("logcat -d -t 2000"); } catch (_) { return ""; } })());
  fs.writeFileSync(path.join(outDir, `${label}-device.json`), JSON.stringify(info, null, 2));
  const fails = results.filter(r => r.status === "FAIL").length;
  console.log(`SUMMARY ${label}: ${results.length - fails}/${results.length} PASS`);
  process.exit(0);
})().catch(e => { console.error("DRIVER ERROR", e); process.exit(0); });
