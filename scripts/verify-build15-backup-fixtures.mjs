import fs from "node:fs";
import { chromium } from "/Users/Ludique/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const fixtures=process.argv.slice(2);
const browser=await chromium.launch({headless:true,executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
for(const file of fixtures){
  const backup=JSON.parse(fs.readFileSync(file,"utf8"));
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto("http://127.0.0.1:4173/index.html");
  const consoleErrors=[];
  page.on("console",message=>{if(message.type()==="error")consoleErrors.push(message.text())});
  const migration=await page.evaluate(data=>{
    localStorage.clear();
    const canonical=window.cueScoreMigrateBackupToCanonicalV170(data);
    localStorage.setItem("rotationScoreboard.players.v1",JSON.stringify(canonical.players));
    localStorage.setItem("rotationScoreboard.matchRecords.v1",JSON.stringify(canonical.matchRecords));
    localStorage.setItem("rotationScoreboard.matchCategories.v1",JSON.stringify(canonical.matchCategories||[]));
    localStorage.setItem("rotationScoreboard.matchSeasons.v1",JSON.stringify(canonical.matchSeasons||[]));
    const playerIds=new Set(canonical.players.map(player=>player.id));
    const refs=canonical.matchRecords.flatMap(record=>[record.players?.[1]?.registeredPlayerId,record.players?.[2]?.registeredPlayerId]).filter(Boolean);
    const roundTrip=window.cueScoreMigrateBackupToCanonicalV170({...canonical,exportedAt:new Date().toISOString()});
    return {schemaVersion:canonical.schemaVersion,players:canonical.players.length,records:canonical.matchRecords.length,primary:canonical.players.filter(player=>player.isPrimary===true).length,orphanRefs:refs.filter(id=>!playerIds.has(id)).length,roundTripPlayers:roundTrip.players.length,roundTripRecords:roundTrip.matchRecords.length};
  },backup);
  await page.reload();
  page.on("dialog",dialog=>dialog.accept());
  const result=await page.evaluate(data=>{
    const playerId=data.players.at(-1)?.id;
    const before=JSON.parse(localStorage.getItem("rotationScoreboard.players.v1")||"[]").length;
    const deleted=playerId?window.deleteCueScorePlayerV1?.(playerId):false;
    const after=JSON.parse(localStorage.getItem("rotationScoreboard.players.v1")||"[]").length;
    return {playerId,before,deleted,after,recordCount:JSON.parse(localStorage.getItem("rotationScoreboard.matchRecords.v1")||"[]").length};
  },backup);
  let matchDelete={skipped:true};
  if(backup.matchRecords.length){
    await page.locator("#cueHomeHistoryV3").click();
    const card=page.locator("#recordsList [data-record-id]").first();
    await card.waitFor();
    const domId=await card.getAttribute("data-record-id");
    await card.click();
    const button=page.locator("#matchDetailDeleteV1:visible, #recordDetailDeleteBtnV35:visible").first();
    const buttonCount=await button.count();
    if(buttonCount){
      const before=await page.evaluate(()=>JSON.parse(localStorage.getItem("rotationScoreboard.matchRecords.v1")||"[]").length);
      await button.click();
      await page.waitForTimeout(100);
      const after=await page.evaluate(()=>JSON.parse(localStorage.getItem("rotationScoreboard.matchRecords.v1")||"[]").length);
      matchDelete={skipped:false,domId,before,after,deleted:after===before-1};
    }else matchDelete={skipped:false,domId,buttonCount};
  }
  console.log(JSON.stringify({file:file.split("/").pop(),migration,...result,matchDelete,consoleErrors}));
  await page.close();
}
await browser.close();
