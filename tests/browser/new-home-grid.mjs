/* Decision 045 / Official 132-133 (v1.3 New Home): measured proof (NOT part of `node --test`).
 * Usage: [P2_APP_ROOT=<checkout>] node tests/browser/new-home-grid.mjs   (exit 1 on failure)
 * Real headless Chrome via the P2 browser kit, real mouse presses, ja/en/zh-Hans x 390x844 / 320x568 (+ Pro for ja 390). Checks (AC-H1..H10):
 *  - Home: six tiles, 2 columns x 3 rows, row-major order 9-Ball|10-Ball / JPA 9-Ball|Rotation / 14-1|3 Cushion, adopted icons, no new-match button, no horizontal overflow, 4 tabs;
 *  - each tile >= 44x44 (and >= 72 high) and every tile reachable (scrolling allowed);
 *  - pressing each tile opens the setup of THAT discipline (selected name/icon), the setup shows no discipline menu and no extra back button, the Home tab returns to Home;
 *  - start + record still work; after a reload the resume card is shown, a tile press shows the existing resume/new/cancel choice, resume restores the match. */
import { startApp, seed } from "./p2-browser-kit.mjs";
let fail = 0;
const check = (ok, msg) => { if (!ok) { fail++; console.log("FAIL", msg); } };
const EXPECT = [["9ball", "game-9ball.svg", "9-Ball"], ["10ball", "game-10ball.svg", "10-Ball"], ["jpa9", "game-jpa-9ball.svg", "JPA 9-Ball"], ["rotation", "game-rotation.svg", "Rotation"], ["straightPool", "game-14-1.svg", "14-1"], ["threeCushion", "game-3cushion.svg", "3 Cushion"]];
const cases = [];
for (const lang of ["ja", "en", "zh-Hans"]) for (const [w, h] of [[390, 844], [320, 568], [430, 932]]) cases.push([lang, "free", w, h]);
cases.push(["ja", "pro", 390, 844]);
for (const [lang, mode, w, h] of cases) {
  const tag = `${lang}/${mode} ${w}x${h}`;
  const app = await startApp({ lang, mode, seedData: seed({ lang, rich: true }), freezeTime: true, watchdogMs: 240000 });
  await app.cdp("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 3, mobile: true });
  const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
  const W = ms => ev(`await W(${ms})`);
  const press = async sel => {
    await app.evalJs(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:"center"})`); await W(250);
    const r = await app.evalJs(`(()=>{const q=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:q.left+q.width/2,y:q.top+q.height/2}})()`);
    for (const ty of ["mousePressed", "mouseReleased"]) await app.cdp("Input.dispatchMouseEvent", { type: ty, x: r.x, y: r.y, button: "left", clickCount: 1 });
    await W(800);
  };
  const state = () => app.evalJs(`(()=>{const home=document.getElementById("cueHomeV1"),sw=document.getElementById("cueDisciplineSwitcherV1"),vis=n=>!!(n&&n.getClientRects().length&&getComputedStyle(n).visibility!=="hidden");
    return {setup:home.classList.contains("match-setup-active-v3"),switcherVisible:vis(sw),backBtn:!!document.getElementById("cueMatchSetupBackV3"),newMatchBtn:!!document.querySelector(".home-new-match-v2"),
      selName:document.getElementById("cueSelectedGameNameV1")?.textContent.trim(),selIcon:(document.getElementById("cueSelectedGameIconV1")?.getAttribute("src")||"").split("/").pop(),
      matchMode:document.querySelector(".app").classList.contains("pro-game-mode"),tabs:document.querySelectorAll("[data-phase1-tab]").length,tabBarHidden:document.querySelector(".cue-phase1-tab-bar").hidden,
      resumeVisible:vis(document.getElementById("cueResumeCardV1")),choiceOpen:!document.getElementById("cueInProgressChoiceV1").classList.contains("hidden"),
      snapshot:localStorage.getItem("cueScore.inProgressMatch.v1"),overflowX:document.documentElement.scrollWidth>innerWidth+1}})()`);
  await W(1500);
  // ---- Home layout
  const g = await app.evalJs(`(()=>{const sw=document.getElementById("cueDisciplineSwitcherV1");return [...sw.querySelectorAll("[data-discipline]")].map(b=>{const r=b.getBoundingClientRect();return {id:b.dataset.discipline,icon:(b.querySelector("img")?.getAttribute("src")||"").split("/").pop(),label:b.querySelector("strong")?.textContent.trim(),x:r.left,y:r.top+scrollY,w:r.width,h:r.height}})})()`);
  check(JSON.stringify(g.map(t => [t.id, t.icon, t.label])) === JSON.stringify(EXPECT), `${tag}: DOM order/icons/labels ${JSON.stringify(g.map(t => t.id))}`);
  const rows = [...new Set(g.map(t => Math.round(t.y)))].sort((a, b) => a - b), cols = [...new Set(g.map(t => Math.round(t.x)))].sort((a, b) => a - b);
  check(rows.length === 3 && cols.length === 2, `${tag}: grid is 2 columns x 3 rows (rows=${rows.length}, cols=${cols.length})`);
  const visual = [...g].sort((a, b) => Math.round(a.y) - Math.round(b.y) || a.x - b.x).map(t => t.id);
  check(JSON.stringify(visual) === JSON.stringify(EXPECT.map(e => e[0])), `${tag}: visual row-major order ${visual}`);
  for (const t of g) check(t.h >= 72 && t.w >= 44 && t.h >= 44, `${tag}: ${t.id} hit area ${Math.round(t.w)}x${Math.round(t.h)} < 72/44`);
  // Gate 025: every tile name is fully readable (own measurement, not ellipsis-hidden): text box inside the tile, no clipping box, not transparent, repaint marker settled
  const lab = await app.evalJs(`(()=>[...document.querySelectorAll("#cueDisciplineSwitcherV1 [data-discipline]")].map(b=>{const st=b.querySelector("strong"),r=document.createRange();r.selectNodeContents(st);const t=r.getBoundingClientRect(),br=b.getBoundingClientRect(),cs=getComputedStyle(st),lc=getComputedStyle(b.querySelector(".cue-discipline-label-v1"));return {id:b.dataset.discipline,text:st.textContent.trim(),inside:t.left>=br.left-0.5&&t.right<=br.right+0.5&&t.top>=br.top-0.5&&t.bottom<=br.bottom+0.5,w:t.width,clipped:st.scrollWidth>st.clientWidth+1,overflow:cs.overflowX+"/"+lc.overflowX,ellipsis:cs.textOverflow,color:cs.color,vis:cs.visibility,op:cs.opacity,lines:Math.round(t.height/parseFloat(cs.lineHeight))}}))()`);
  const settled = await app.evalJs(`!document.getElementById("cueDisciplineSwitcherV1").classList.contains("home-label-repaint-v3")`);
  check(settled, `${tag}: label repaint marker settled`);
  for (const l of lab) check(l.inside && !l.clipped && l.w > 20 && l.overflow === "visible/visible" && l.ellipsis !== "ellipsis" && l.vis === "visible" && l.op === "1" && !/rgba\(.*, 0\)/.test(l.color), `${tag}: ${l.id} name "${l.text}" readable ${JSON.stringify(l)}`);
  let s = await state();
  check(!s.newMatchBtn && s.tabs === 4 && !s.setup && !s.overflowX, `${tag}: Home composition (newMatchBtn=${s.newMatchBtn}, tabs=${s.tabs}, overflowX=${s.overflowX})`);
  // ---- each tile opens ITS setup; no menu / no extra back; Home tab returns
  for (const [id, icon, label] of EXPECT) {
    await press(`#cueDisciplineSwitcherV1 [data-discipline="${id}"]`);
    s = await state();
    check(s.setup && s.selName === label && s.selIcon === icon, `${tag}: tile ${id} opens its setup (setup=${s.setup}, name=${s.selName}, icon=${s.selIcon})`);
    check(!s.switcherVisible && !s.backBtn, `${tag}: setup of ${id} shows no discipline menu / extra back (menu=${s.switcherVisible}, back=${s.backBtn})`);
    await press('[data-phase1-tab="home"]');
    s = await state();
    check(!s.setup && !s.matchMode, `${tag}: Home tab returns from ${id} setup to Home (setup=${s.setup})`);
  }
  // ---- start + resume (9-Ball)
  await press('#cueDisciplineSwitcherV1 [data-discipline="9ball"]');
  await ev(`if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);document.querySelector("[data-select-player]")?.click();await W(500)}
    for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await W(100);document.getElementById("startGameBtn").click();await W(1500)`);
  s = await state();
  check(s.matchMode && s.tabBarHidden && !!s.snapshot, `${tag}: match starts as before (matchMode=${s.matchMode}, tabBarHidden=${s.tabBarHidden}, snapshot=${!!s.snapshot})`);
  await app.cdp("Page.reload", {}); await W(3000);
  s = await state();
  check(s.resumeVisible && !s.setup, `${tag}: after reload the resume card is shown (resume=${s.resumeVisible})`);
  await press('#cueDisciplineSwitcherV1 [data-discipline="rotation"]');
  s = await state();
  check(s.choiceOpen && !s.setup, `${tag}: tile press with a suspended match shows the resume/new/cancel choice (choice=${s.choiceOpen}, setup=${s.setup})`);
  await ev(`document.getElementById("cueInProgressCancelV1").click();await W(500)`);
  await press("#cueResumeCardV1"); await W(1200);
  s = await state();
  check(s.matchMode, `${tag}: resume restores the match (matchMode=${s.matchMode})`);
  await app.close();
}
console.log(fail ? "FAIL " + fail : "PASS");
process.exit(fail ? 1 : 0);
