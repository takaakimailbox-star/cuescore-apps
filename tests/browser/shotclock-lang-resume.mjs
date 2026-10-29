/* Build 94 preparation: a paused shot clock keeps its state when the language is changed and the interrupted match is resumed (real Chrome; NOT part of `node --test`).
 * Usage: node tests/browser/shotclock-lang-resume.mjs   (exit 1 on failure). Pairs: ja->ja, ja->en, ja->zh-Hans, en->ja, zh-Hans->en. */
import { startApp, seed } from "./p2-browser-kit.mjs";
let fail = 0;
async function run(from, to) {
  const app = await startApp({ lang: from, mode: "free", seedData: seed({ lang: from, rich: true }), watchdogMs: 300000 });
  await app.cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
  await ev(`await W(1200);window.confirm=()=>true;document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="9ball"]').click();await W(1000);
   if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);document.querySelector("[data-select-player]")?.click();await W(500)}
   document.querySelector(".cue-sc-switch").click();await W(300);
   for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await W(100);document.getElementById("startGameBtn").click();await W(1800);
   const ok=document.getElementById("breakResultSaveV695");if(ok&&ok.getClientRects().length){ok.click();await W(600)}
   document.querySelector(".cue-sc-main").click();await W(2500);document.querySelector(".cue-sc-main").click();await W(300)`);
  const before = await app.evalJs(`document.querySelector(".cue-sc-dock").dataset.st+"/"+document.querySelector(".cue-sc-num").textContent`);
  await ev(`localStorage.setItem("cueScore.language.v1",${JSON.stringify(to)})`);
  await app.cdp("Page.reload", {}); await new Promise(r => setTimeout(r, 3500));
  await ev(`window.confirm=()=>true;document.getElementById("cueResumeCardV1").click();await W(2400)`);
  const after = await app.evalJs(`(()=>{const d=document.querySelector(".cue-sc-dock");return d?d.dataset.st+"/"+document.querySelector(".cue-sc-num").textContent:"no dock"})()`);
  const label = await app.evalJs(`document.getElementById("proStartTime").textContent`);
  const ok = before === after && /^paused\//.test(after);
  if (!ok) fail++;
  console.log(ok ? "ok  " : "FAIL", from, "->", to, "| before", before, "| after", after, "|", label);
  await app.close();
}
for (const [a, b] of [["ja", "ja"], ["ja", "en"], ["ja", "zh-Hans"], ["en", "ja"], ["zh-Hans", "en"]]) await run(a, b);
console.log(fail ? "FAIL " + fail : "PASS");
process.exit(fail ? 1 : 0);
