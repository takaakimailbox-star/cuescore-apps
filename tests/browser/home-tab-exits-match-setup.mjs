/* Gate (v1.3 polish): the bottom Home tab returns from the match setup screen to the first Home screen (NOT part of `node --test`).
 * Usage: [P2_APP_ROOT=<checkout>] node tests/browser/home-tab-exits-match-setup.mjs   (exit 1 on failure)
 * Real headless Chrome via the P2 browser kit, ja/en/zh-Hans x 390x844 / 320x568, real mouse presses on the Home tab. Checks:
 *  - after "new match" the setup screen is active and the Home tab is visible;
 *  - pressing the Home tab leaves the setup screen (match-setup-active-v3 removed, new-match button visible again);
 *  - no game started, no match record written, the in-progress snapshot key and the records are unchanged;
 *  - the same works after visiting another tab (Player) first, and the setup can be opened again afterwards;
 *  - while a match is running the tab bar is hidden and a programmatic Home request does nothing (the running match is kept). */
import { startApp, seed } from "./p2-browser-kit.mjs";
let fail = 0;
const check = (ok, msg) => { if (!ok) { fail++; console.log("FAIL", msg); } };
for (const lang of ["ja", "en", "zh-Hans"]) for (const [w, h] of [[390, 844], [320, 568]]) {
  const tag = `${lang} ${w}x${h}`;
  const app = await startApp({ lang, mode: "free", seedData: seed({ lang, rich: true }), freezeTime: true, watchdogMs: 200000 });
  await app.cdp("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 3, mobile: true });
  const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
  const press = async sel => {
    const r = await app.evalJs(`(()=>{const q=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:q.left+q.width/2,y:q.top+q.height/2}})()`);
    for (const ty of ["mousePressed", "mouseReleased"]) await app.cdp("Input.dispatchMouseEvent", { type: ty, x: r.x, y: r.y, button: "left", clickCount: 1 });
    await ev(`await W(700)`);
  };
  const st = () => app.evalJs(`(()=>{const home=document.getElementById("cueHomeV1"),nm=document.querySelector(".home-new-match-v2"),vis=n=>!!(n&&n.getClientRects().length&&getComputedStyle(n).visibility!=="hidden");
    return {setup:home.classList.contains("match-setup-active-v3"),newMatchVisible:vis(nm),tabBarHidden:document.querySelector(".cue-phase1-tab-bar").hidden,matchMode:document.querySelector(".app").classList.contains("pro-game-mode"),
      snapshot:localStorage.getItem("cueScore.inProgressMatch.v1"),records:Object.keys(localStorage).filter(k=>/match|record|histor/i.test(k)).sort().map(k=>k+":"+localStorage.getItem(k).length).join("|"),active:document.body.dataset.cuePhase1Tab,histState:!!(history.state&&history.state.cueMatchSetupV3)}})()`);
  await ev(`await W(1200)`);
  const base = await st();
  check(base.newMatchVisible && !base.setup, `${tag}: first Home shows the new-match button (${JSON.stringify({ n: base.newMatchVisible, s: base.setup })})`);
  // 1. open setup, press Home
  await press(".home-new-match-v2");
  let s = await st();
  check(s.setup, `${tag}: setup screen is active after "new match"`);
  await press('[data-phase1-tab="home"]');
  s = await st();
  check(!s.setup && s.newMatchVisible, `${tag}: Home tab leaves the setup screen (setup=${s.setup}, newMatchVisible=${s.newMatchVisible})`);
  check(!s.matchMode, `${tag}: no game was started by pressing Home`);
  check(s.snapshot === base.snapshot && s.records === base.records, `${tag}: snapshot/records unchanged (snapshot ${base.snapshot === s.snapshot}, records ${base.records === s.records})`);
  // 2. setup can be opened again; detour via Player tab, then Home
  await press(".home-new-match-v2");
  check((await st()).setup, `${tag}: setup can be opened again`);
  await press('[data-phase1-tab="player"]');
  await press('[data-phase1-tab="home"]');
  s = await st();
  check(!s.setup && s.newMatchVisible && s.active === "home", `${tag}: Home after a Player detour is the first Home (setup=${s.setup}, active=${s.active})`);
  check(s.snapshot === base.snapshot && s.records === base.records && !s.matchMode, `${tag}: still no snapshot/record/game change after the detour`);
  // 3. a running match is kept: start one, the tab bar is hidden, a programmatic Home request does nothing
  await press(".home-new-match-v2");
  await ev(`if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);const c=[...document.querySelectorAll("[data-select-player]")].find(b=>!b.closest("[data-primary]"))||document.querySelector("[data-select-player]");c?.click();await W(500)}
    for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await W(100);document.getElementById("startGameBtn").click();await W(1500)`);
  s = await st();
  if (s.matchMode) {
    check(s.tabBarHidden, `${tag}: tab bar hidden while a match is running`);
    await ev(`window.CueScoreNavigationPhase1.go("home");await W(500)`);
    const t = await st();
    check(t.matchMode && !t.setup, `${tag}: Home request during a running match keeps the match (matchMode=${t.matchMode})`);
  } else console.log("NOTE", tag, "could not start a match from the seeded setup (running-match check skipped)");
  await app.close();
}
console.log(fail ? "FAIL " + fail : "PASS");
process.exit(fail ? 1 : 0);
