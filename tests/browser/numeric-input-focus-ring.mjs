/* Real-app Chrome proof for the PO-corrected numeric-input focus scope.
 * Uses real pointer coordinates and real Tab / Shift+Tab key events. */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";

const app = await startApp({ lang: "ja", mode: "free", seedData: seed({ lang: "ja", rich: true }), watchdogMs: 120000 });
let fail = 0;
const checks = [];
const check = (ok, label, detail = undefined) => {
  checks.push({ ok: Boolean(ok), label, ...(detail === undefined ? {} : { detail }) });
  if (!ok) fail += 1;
  console.log(ok ? "ok  " : "FAIL", label, detail ?? "");
};
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const evalJson = async code => JSON.parse(await app.evalJs(`JSON.stringify(${code})`));
const point = async selector => evalJson(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height}})()`);
const tap = async selector => {
  const p = await point(selector);
  await app.cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: p.x, y: p.y, button: "left", clickCount: 1 });
  await app.cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: p.x, y: p.y, button: "left", clickCount: 1 });
  await wait(350);
  return p;
};
const key = async (type, keyName, modifiers = 0) => {
  await app.cdp("Input.dispatchKeyEvent", { type, key: keyName, code: keyName === "Tab" ? "Tab" : keyName, windowsVirtualKeyCode: keyName === "Tab" ? 9 : 0, nativeVirtualKeyCode: keyName === "Tab" ? 9 : 0, modifiers });
};

await app.cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await app.cdp("Emulation.setSafeAreaInsetsOverride", { insets: { top: 47, bottom: 34, left: 0, right: 0 } });
await wait(1000);
await tap('#cueDisciplineSwitcherV1 [data-discipline="9ball"]');
await tap('[data-race-target="p1Race"]');
await tap('.cue-menu-row-v1.is-pinned-v1');   // 9-Ball is a tap menu now (Build 95 PO feedback): Other is the pinned row

const inputPoint = await point("#newMatchRaceCustomInputV1");
const focused = await evalJson(`(()=>{const n=document.getElementById("newMatchRaceCustomInputV1"),s=getComputedStyle(n),r=n.getBoundingClientRect();return {id:document.activeElement?.id,outlineColor:s.outlineColor,outlineStyle:s.outlineStyle,outlineWidth:s.outlineWidth,outlineOffset:s.outlineOffset,boxShadow:s.boxShadow,height:r.height,inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}})()`);
check(focused.id === "newMatchRaceCustomInputV1", "real-coordinate Other selection focuses the numeric input", focused.id);
check(focused.outlineStyle === "solid" && focused.outlineWidth === "2px" && focused.outlineOffset === "2px", "numeric input has a clear 2px neutral keyboard ring", focused);
check(/23, 23, 23/.test(focused.outlineColor) && !/255, 213, 74/.test(focused.outlineColor + focused.boxShadow), "numeric input focus has no yellow outline or shadow", { outlineColor: focused.outlineColor, boxShadow: focused.boxShadow });
check(/255, 255, 255/.test(focused.boxShadow), "white contrast halo preserves visibility on dark and light surroundings", focused.boxShadow);
check(inputPoint.h >= 44 && focused.inside, "focused numeric input remains a 44px+ visible target", inputPoint);

await key("keyDown", "Tab"); await key("keyUp", "Tab"); await wait(120);
check(await app.evalJs(`document.activeElement?.id === "newMatchRaceCustomApplyV1"`), "Tab moves from the numeric input to Apply");
const applyFocus = await evalJson(`(()=>{const s=getComputedStyle(document.getElementById("newMatchRaceCustomApplyV1"));return {outlineColor:s.outlineColor,outlineWidth:s.outlineWidth}})()`);
check(applyFocus.outlineWidth === "3px" && /255, 213, 74/.test(applyFocus.outlineColor), "the adjacent Apply button keeps the shared yellow focus ring", applyFocus);
await key("keyDown", "Tab", 8); await key("keyUp", "Tab", 8); await wait(120);
check(await app.evalJs(`document.activeElement?.id === "newMatchRaceCustomInputV1"`), "Shift+Tab returns to the numeric input");

const result = { timestamp: new Date().toISOString(), viewport: { width: 390, height: 844, safeArea: { top: 47, bottom: 34 } }, inputPoint, focused, applyFocus, checks, pass: fail === 0 };
if (process.env.FOCUS_EVIDENCE) fs.writeFileSync(process.env.FOCUS_EVIDENCE, JSON.stringify(result, null, 2) + "\n");
await app.close();
console.log(fail ? `FAIL ${fail}/${checks.length}` : `PASS ${checks.length}/${checks.length}`);
process.exit(fail ? 1 : 0);
