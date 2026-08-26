import { chromium } from "/Users/Ludique/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "docs/assets/ui-audit/2026-08-26-current-app");
const base = "http://127.0.0.1:4173";
const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: ["--disable-background-networking", "--force-color-profile=srgb"]
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "light", deviceScaleFactor: 1 });
const page = await context.newPage();
const captured = [];

async function shot(relative, note = "") {
  const destination = path.join(output, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await page.screenshot({ path: destination, animations: "disabled" });
  captured.push({ relative, note });
}
async function clickRole(role, name, options = {}) {
  const target = page.getByRole(role, { name, exact: options.exact ?? true }).first();
  await target.waitFor({ state: "visible" });
  await target.click();
  await page.waitForTimeout(options.wait ?? 120);
}
async function home() {
  const homeBack = page.getByRole("button", { name: /ホームへ戻る/ }).first();
  if (await homeBack.isVisible().catch(() => false)) await homeBack.click();
  await page.locator('[aria-label="CueScore Home"]:not(.hidden)').waitFor({ state: "visible" });
}
async function attempt(label, action) {
  try { await action(); }
  catch (error) { console.warn(`[skip] ${label}: ${error.message.split("\n")[0]}`); }
}
async function openFirstPlayer9Ball() {
  await page.goto(`${base}/scripts/ui-audit-enter-demo.html`, { waitUntil: "domcontentloaded" });
  await page.waitForURL(/index\.html$/);
  await clickRole("button", "プレーヤー一覧");
  await page.locator("[data-stats-player]").first().click();
  await page.locator('#playerStatsOverlay [data-pd7-discipline="9ball"]').click();
  await page.waitForTimeout(150);
}

page.on("dialog", async dialog => dialog.accept());
await page.goto(`${base}/scripts/ui-audit-enter-demo.html`, { waitUntil: "domcontentloaded" });
await page.waitForURL(/index\.html$/);
await page.locator('[aria-label="CueScore Home"]:not(.hidden)').waitFor({ state: "visible" });

await shot("v1/001_Home_Sample_Data.png", "Adopted v1.0 / Sample Data");
await clickRole("button", "設定");
await shot("v1/090_Settings_Sample_Data.png", "Adopted v1.0");
await clickRole("button", "About CueScore ›");
await shot("modals/091_About_CueScore.png", "Modal");
await page.getByRole("button", { name: "閉じる" }).first().click();
await home();

await clickRole("button", "プレーヤー一覧");
await shot("v1/002_Player_List.png", "Adopted v1.0 / Sample Data");
const firstPlayer = page.locator("[data-stats-player]").first();
await firstPlayer.click();
await page.locator("#playerStatsOverlay:not(.hidden)").waitFor({ state: "visible" });
await shot("v1/003_Player_Info_Main.png", "Adopted v1.0 / Main Player");

const disciplines = [
  ["9ball", "9-Ball", "010_9Ball_Detail.png"], ["10ball", "10-Ball", "020_10Ball_Detail.png"],
  ["rotation", "Rotation", "030_Rotation_Detail.png"], ["straightPool", "14-1", "040_14-1_Detail.png"],
  ["jpa9", "JPA 9-Ball", "050_JPA9_Detail.png"], ["threeCushion", "3 Cushion", "060_3Cushion_Detail.png"]
];
for (const [id, name, file] of disciplines) {
  await page.locator(`#playerStatsOverlay [data-pd7-discipline="${id}"]`).click();
  await page.waitForTimeout(120);
  await shot(`v1/${file}`, `Adopted v1.0 / ${name}`);
  const back = page.locator("#playerStatsOverlay .player-stats-back").first();
  if (await back.isVisible().catch(() => false)) await back.click();
  await page.waitForTimeout(100);
}

await openFirstPlayer9Ball();
const trends = [
  ["winRate", "011_9Ball_Trend_WinRate.png"],
  ["shotRate", "012_9Ball_Trend_ShootRate.png"],
  ["breakInRate", "013_9Ball_Trend_BreakInRate.png"],
  ["masuwariRate", "014_9Ball_Trend_MasuwariRate.png"],
  ["foulRate", "015_9Ball_Trend_FoulRate.png"]
];
for (const [metric, file] of trends) await attempt(file, async () => {
  await page.locator(`[data-pd7-metric-trend="${metric}"]`).click();
  await page.waitForTimeout(100);
  const point = page.locator("[data-pd7-chart] button, [data-pd7-chart] [tabindex='0']").last();
  if (await point.isVisible().catch(() => false)) await point.click();
  await shot(`modals/${file}`, "Metric trend popup / Sample Data");
  await page.locator("[data-pd7-trend-close]:visible").first().click().catch(async()=>page.keyboard.press("Escape"));
});

await openFirstPlayer9Ball();
await attempt("opponent records", async () => {
  await page.locator("[data-pd7-rivals]").click();
  await page.waitForTimeout(150);
  await shot("v1/070_Opponent_Records_Match_Count_Sort.png", "Opponent records / match-count sort");
  await page.locator('[data-rival-sort="rate"]').click();
  await shot("v1/071_Opponent_Records_Win_Rate_Sort.png", "Opponent records / win-rate sort");
  await page.locator("[data-rival-opponent]").first().click();
  await shot("v1/072_Opponent_Specific_Match_History.png", "Opponent-specific history");
  await page.locator("[data-player-record-id]").first().click();
  await page.waitForTimeout(150);
  await shot("v1/074_Match_Detail.png", "Match detail from opponent history");
});

await openFirstPlayer9Ball();
await attempt("player history", async () => {
  await page.locator("[data-pd7-history]").click();
  await page.waitForTimeout(150);
  await shot("v1/073_Player_Match_History.png", "Discipline-fixed player history");
});

await page.goto(`${base}/scripts/ui-audit-leave-demo.html`, { waitUntil: "domcontentloaded" });
await page.waitForURL(/index\.html$/);
await page.locator('[aria-label="CueScore Home"]:not(.hidden)').waitFor({ state: "visible" });
await clickRole("button", "設定");
await clickRole("button", "バックアップ", { exact: false });
await shot("modals/092_Backup.png", "Modal / Normal Data");
await page.keyboard.press("Escape");
await attempt("restore", async () => {
  await clickRole("button", "データ復元", { exact: false });
  await shot("modals/093_Restore.png", "Modal / Normal Data");
});

console.log(JSON.stringify({ count: captured.length, captured }, null, 2));
await browser.close();
