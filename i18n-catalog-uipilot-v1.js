/* CueScore i18n catalog: UI Pilot P1 comparison switch (internal TestFlight test UI, Build 90).
 * STATUS: CANDIDATE / P3-PROVISIONAL, NOT in the P4-approved main catalogs (same arrangement as i18n-catalog-shotclock-v1.js). Removed together with ui-pilot-v1.* if the Pilot is not adopted. */
(function(root){
  "use strict";
  const catalog=Object.freeze({
    "ja": Object.freeze({"uipilot.title":"操作画面の比較（試験）","uipilot.sub":"9-Ball／10-Ballの新しい操作画面を試します","uipilot.new":"新","uipilot.old":"旧","uipilot.aria":"操作画面を切り替える。現在: {state}"}),
    "en": Object.freeze({"uipilot.title":"Match controls comparison (test)","uipilot.sub":"Try the new match controls (9-Ball / 10-Ball)","uipilot.new":"New","uipilot.old":"Old","uipilot.aria":"Switch match controls. Current: {state}"}),
    "zh-Hans": Object.freeze({"uipilot.title":"操作界面对比（测试）","uipilot.sub":"试用新的操作界面（9-Ball / 10-Ball）","uipilot.new":"新","uipilot.old":"旧","uipilot.aria":"切换操作界面。当前：{state}"})
  });
  if(typeof module==="object"&&module.exports)module.exports=catalog;
  if(root)root.CueScoreUiPilotCatalogV1=catalog;
})(typeof globalThis!=="undefined"?globalThis:this);
