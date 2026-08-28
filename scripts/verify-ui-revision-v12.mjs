import { chromium } from "/Users/Ludique/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";

const browser=await chromium.launch({headless:true,executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,colorScheme:"light"});
const base="http://127.0.0.1:4173";
const noOverflow=async selector=>page.locator(selector).evaluate(node=>node.scrollWidth<=node.clientWidth);

await page.goto(`${base}/scripts/ui-audit-enter-demo.html`);
await page.waitForURL(/index\.html$/);
await page.getByRole("button",{name:"プレーヤー一覧"}).click();
assert.equal(await page.getByRole("button",{name:"並び替え"}).count(),0);
const first=page.locator("[data-stats-player]").first();
assert.match(await first.getAttribute("aria-label"),/詳細を開く/);
assert.equal(await noOverflow("#playerLibraryList"),true);
await first.click();
await page.locator('#playerStatsOverlay [data-pd7-discipline="9ball"]').click();
await page.getByRole("button",{name:/グラフで見る/}).click();
await page.locator("#pd12Trends:not(.hidden)").waitFor();
assert.deepEqual(await page.locator(".pd12-trend-card h2").allTextContents(),["勝率","シュート率","ブレイクイン率","マス割り率","ファール率"]);
assert.equal(await page.locator("[data-pd7-trend-modal]").count(),0);
assert.equal(await noOverflow("#pd12Trends"),true);
await page.getByRole("button",{name:"競技詳細に戻る"}).click();
assert.equal(await page.locator("#pd12Trends.hidden").count(),1);

await page.locator("[data-pd7-rivals]").click();
assert.equal(await page.locator("#playerOpponentRecordsV2 .journey-summary-v2").count(),0);
assert.equal(await page.locator("#playerOpponentRecordsV2 [data-rival-sort]").count(),0);
assert.equal(await page.locator("#playerOpponentRecordsV2 .journey-discipline-v2 select").count(),0);
assert.equal(await noOverflow("#playerOpponentRecordsV2"),true);
await page.locator("#playerOpponentRecordsV2 [data-rival-opponent]").first().click();
assert.equal(await page.locator("#playerMatchHistoryV2 .journey-history-opponent-v11").count(),0);
assert.equal(await page.locator("#playerMatchHistoryV2 [data-history-period]").count(),0);
assert.equal(await page.locator("#playerMatchHistoryV2 [data-player-analysis-record-id]").count(),0);
assert.equal(await noOverflow("#playerMatchHistoryV2"),true);

console.log(JSON.stringify({viewport:"390x844",trends:"pass",opponents:"pass",opponentVsRow:"removed",history:"pass",overflow:"pass"}));
await browser.close();
