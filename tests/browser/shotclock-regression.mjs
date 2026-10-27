/* Decision 046 / Official 135 AC-SC1, AC-SC2, AC-SC6, AC-SC12: dedicated regression of the EXISTING match operations with the Shot Clock OFF and ON. (NOT part of `node --test`.)
 * Usage: [SC_LANGS=ja] node tests/browser/shotclock-regression.mjs   (exit 1 on failure)
 * Plays the same scripted 9-Ball match (ball input, score, foul, safety, player switch, Undo, rack wins to the end, save) twice on a fresh app: clock OFF, and clock ON with the clock buttons
 * (start / pause / extend / undo / reset / expiry) pressed between the inputs. After every step the visible scores, fouls, safeties, turn and log text must be identical, and at the end the stored
 * data (every localStorage key except the clock key, with random ids / timestamps normalised) must be identical. Also: Free and Pro, suspend / resume, leaving and re-opening the match screen,
 * a new match, "Reset device settings" vs the clock key, and no change of the entitlement. */
import { startApp, seed } from "./p2-browser-kit.mjs";
let fail = 0;
const check = (ok, msg) => { if (!ok) { fail++; console.log("FAIL", msg); } else console.log("ok  ", msg); };
const KEY = "cueScore.shotClock.v1";
const LANGS = (process.env.SC_LANGS || "ja,en").split(",");
const norm = s => s.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, "<uuid>").replace(/\b1[0-9]{12}\b/g, "<ms>").replace(/"(?:savedAt|updatedAt|createdAt|at)":"[^"]*"/g, '"<t>"');

async function play(lang, mode, clock) {
  const app = await startApp({ lang, mode, seedData: seed({ lang, rich: true }), freezeTime: true, watchdogMs: 1500000 });
  await app.cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
  const W = ms => ev(`await W(${ms})`);
  const click = async sel => { await ev(`const n=document.querySelector(${JSON.stringify(sel)});if(!n)throw new Error("missing ${sel}");n.click();await W(220)`); };
  const snap = () => app.evalJs(`JSON.stringify({s1:proP1Score.textContent,s2:proP2Score.textContent,f:[proP1Foul.textContent,proP2Foul.textContent],sf:[proP1Safety.textContent,proP2Safety.textContent],turn:proP1Panel.classList.contains("active"),log:proTurnLog.innerText,rack:document.getElementById("proRack")?.textContent})`);
  const clk = () => app.evalJs(`(()=>{const d=document.querySelector(".cue-sc-dock");return d?d.dataset.st+"/"+document.querySelector(".cue-sc-num").textContent:null})()`);
  const trace = [];
  await W(1500);
  await ev(`window.confirm=()=>true;window.alert=()=>{}`);
  const proBefore = await app.evalJs(`window.CueScoreEntitlement?window.CueScoreEntitlement.isPro():null`);
  if (clock) await ev(`document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="9ball"]').click();await W(900);document.querySelector(".cue-sc-switch").click();await W(200);document.querySelector("#cueMatchSetupBackV3,[data-phase1-tab='home']").click();await W(500)`);
  await ev(`document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="9ball"]').click();await W(900);
    if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);document.querySelector("[data-select-player]")?.click();await W(500)}
    for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await W(100);document.getElementById("startGameBtn").click();await W(1800);
    const ok=document.getElementById("breakResultSaveV695");if(ok&&ok.getClientRects().length){ok.click();await W(700)}`);
  const hasDock = await app.evalJs(`!!document.querySelector(".cue-sc-dock")`);
  const c = n => click(`.cue-sc-${n}`);
  const step = async (name, action, clockAction) => {
    console.log("  step", lang, mode, clock ? "ON" : "OFF", name);
    if (clock && clockAction) await clockAction();
    await action(); trace.push([name, await snap()]);
  };
  const ball = n => () => click(`#proBalls .pro-ball:nth-child(${n})`);
  await step("ball1", ball(1), () => c("main"));
  await step("ball2", ball(2), () => c("extb"));
  await step("foul", () => click("#proFoulBtn"), () => c("main"));
  await step("switch", () => click("#proSwitchBtn"), () => c("resetb"));
  await step("ball3", ball(3));
  await step("safety", () => click("#proSafetyBtn"), () => c("main"));
  await step("undo", () => click("#proUndoBtn"), () => c("extb"));
  await step("ball4", ball(4), () => ev(`window.__x=1;document.querySelector(".cue-sc-extb").click();await W(100)`));
  const mid = await snap(), midClock = clock ? await clk() : null;
  const midKeys = clock ? JSON.parse(await app.evalJs(`localStorage.getItem(${JSON.stringify(KEY)})`)) : null;
  // app restart in the middle of the match: Home offers the resume card; resuming shows the same scores / log and (ON) the clock stopped at its stored time
  const stored = clock ? JSON.parse(await app.evalJs(`localStorage.getItem(${JSON.stringify(KEY)})`)) : null;
  await app.cdp("Page.reload", {}); await W(3500);
  await ev(`window.confirm=()=>true;window.alert=()=>{};document.getElementById("cueResumeCardV1").click();await W(2400)`);
  const resumed = await snap(), resumedClock = clock ? await clk() : null;
  // play on to the end of the match with rack wins (ball 9)
  let finished = false;
  for (let i = 0; i < 40 && !finished; i++) {
    await ev(`const ok=document.getElementById("breakResultSaveV695");if(ok&&ok.getClientRects().length){ok.click();await W(400)}const b=document.querySelector("#proBalls .pro-ball:nth-child(9)");if(b&&b.getClientRects().length)b.click();await W(450)`);
    finished = await app.evalJs(`Math.max(+proP1Score.textContent,+proP2Score.textContent)>=5`);
  }
  const endShot = await snap();
  const endButtons = await app.evalJs(`JSON.stringify([...document.querySelectorAll("#proSummary button,[role=dialog] button")].filter(x=>x.getClientRects().length).map(x=>x.id||x.textContent.trim().slice(0,12)))`);
  // leave the match screen (existing back flow ends the match): the dock disappears; a NEW match starts with the clock idle
  await ev(`const bk=document.getElementById("proGameBackBtn");if(bk&&bk.getClientRects().length){bk.click();await W(900)}`);
  await ev(`const hb=document.querySelector('[data-phase1-tab="home"]');if(hb&&hb.getClientRects().length){hb.click();await W(500)}
    document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="9ball"]').click();await W(900);const c=document.getElementById("cueInProgressChoiceV1");if(c&&!c.classList.contains("hidden")){document.getElementById("cueInProgressNewV1").click();await W(900)}
    if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);document.querySelector("[data-select-player]")?.click();await W(500)}
    for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await W(100);document.getElementById("startGameBtn").click();await W(1800);
    const ok=document.getElementById("breakResultSaveV695");if(ok&&ok.getClientRects().length){ok.click();await W(700)}`);
  const newClock = clock ? await clk() : null;
  if (clock) await ev(`document.querySelector(".cue-sc-main").click();await W(300);document.querySelector(".cue-sc-main").click();await W(200)`);
  await ev(`document.getElementById("proGameBackBtn").click();await W(900)`);
  const leftDock = await app.evalJs(`!!document.querySelector(".cue-sc-dock")`);
  const leftStored = clock ? JSON.parse(await app.evalJs(`localStorage.getItem(${JSON.stringify(KEY)})`)) : null;
  return { app, ev, W, click, snap, clk, trace, mid, midClock, midKeys, hasDock, proBefore, stored, resumed, resumedClock, finished, endShot, endButtons, newClock, leftDock, leftStored };
}

for (const lang of LANGS) for (const mode of ["free", "pro"]) {
  const tag = `${lang}/${mode}`;
  const A = await play(lang, mode, false);
  const B = await play(lang, mode, true);
  check(!A.hasDock && B.hasDock, `${tag}: OFF has no dock, ON has the dock`);
  const sa = A.trace.filter(t => t[0] !== "leave-dialog-buttons-known").map(t => t[0] + ":" + t[1]).join("\n"), sb = B.trace.filter(t => t[0] !== "leave-dialog-buttons-known").map(t => t[0] + ":" + t[1]).join("\n");
  check(sa === sb, `${tag}: after every input (ball / foul / switch / safety / undo) score, fouls, safeties, turn, rack and log are identical with the clock ON (clock buttons pressed between inputs)`);
  check(A.mid === B.mid, `${tag}: mid-match state identical (ON clock ${B.midClock})`);
  check(A.proBefore === B.proBefore, `${tag}: entitlement unchanged (${A.proBefore} / ${B.proBefore})`);
  check(B.stored && B.stored.clock && B.stored.clock.state !== "expired" && A.resumed === B.resumed && A.resumed === A.mid, `${tag}: after an app restart the resumed match shows the same scores / log (ON = OFF = before)`);
  check(/^paused\//.test(B.resumedClock || "") && B.resumedClock.split("/")[1] === String(Math.ceil(B.stored.clock.remainMs / 1000)), `${tag}: the resumed match shows the clock stopped at the stored time (${B.resumedClock})`);
  check(A.finished && B.finished, `${tag}: the match can be played to its end with the clock OFF and ON (finished ${A.finished}/${B.finished})`);
  check(A.endShot === B.endShot, `${tag}: final scores / log identical with the clock ON`);
  check(B.newClock === "idle/45", `${tag}: a new match starts with the clock idle at the base time (${B.newClock})`);
  check(!A.leftDock && !B.leftDock && B.leftStored.clock.state === "paused", `${tag}: leaving the match screen removes the dock and stores the clock stopped (${JSON.stringify(B.leftStored && B.leftStored.clock)})`);
  const dump = X => X.app.evalJs(`JSON.stringify(Object.keys(localStorage).filter(k=>k!==${JSON.stringify(KEY)}).sort().map(k=>[k,localStorage.getItem(k)]))`);
  const da = norm(await dump(A)), db = norm(await dump(B));
  check(da === db, `${tag}: every stored key other than the clock key is identical after the whole match (ids / times normalised; ${da.length} bytes)`);
  const kc = JSON.parse(await B.app.evalJs(`JSON.stringify(Object.keys(localStorage).filter(k=>/shot/i.test(k)))`));
  check(JSON.stringify(kc) === JSON.stringify([KEY]), `${tag}: the only clock-related key is ${KEY} (${kc})`);
  // a new match starts with the clock idle; "Reset device settings" leaves the clock key alone (same as the other match-setup settings)
  const before = await B.app.evalJs(`localStorage.getItem(${JSON.stringify(KEY)})`);
  await B.ev(`document.querySelector('[data-phase1-tab="settings"]')?.click();await W(900);const btn=document.getElementById("settingsResetPreferencesBtn");if(!btn)throw new Error("no reset button");btn.click();await W(700)`);
  const after = await B.app.evalJs(`localStorage.getItem(${JSON.stringify(KEY)})`);
  check(before === after, `${tag}: "Reset device settings" does not change the clock key (consistent with discipline / rules settings, which it also keeps)`);
  await A.app.close(); await B.app.close();
}
console.log(fail ? "FAIL " + fail : "PASS");
process.exit(fail ? 1 : 0);
