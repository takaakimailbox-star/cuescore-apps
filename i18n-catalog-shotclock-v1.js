/* CueScore i18n catalog: Shot Clock (Decision 046 / Official 135 Appendix A).
 * STATUS: CANDIDATE terms, P3-PROVISIONAL. They are NOT in the three main catalogs because every main-catalog key must carry a P4-APPROVED record (tests/p4-po-approval.test.mjs);
 * the 20 shot-clock terms have no P4-APPROVED record yet. PO-preferred terms: zh "出杆计时器" / "已暂停", en "Undo −60" (ARIA names the extension undo explicitly).
 * Moving these keys into the main catalogs happens only together with their P4 approval record. Human independent review: NOT PERFORMED. zh competition-term primary sources: NOT VERIFIED. */
(function(root){
  "use strict";
  const catalog=Object.freeze({
    "ja": Object.freeze({
      "shotclock.title": "ショットクロック",
      "shotclock.supplement": "残り時間を手動で計ります",
      "shotclock.baseTime": "基本時間",
      "shotclock.sec": "秒",
      "shotclock.ready": "待機中",
      "shotclock.paused": "停止中",
      "shotclock.expired": "時間切れ",
      "shotclock.start": "開始",
      "shotclock.pause": "一時停止",
      "shotclock.resume": "再開",
      "shotclock.reset": "リセット",
      "shotclock.extend": "延長",
      "shotclock.undo": "取消",
      "shotclock.aria.role": "ショットクロック",
      "shotclock.aria.left": "残り{count}秒",
      "shotclock.aria.expired": "時間切れ",
      "shotclock.aria.extend": "延長、60秒を追加",
      "shotclock.aria.undo": "延長を取り消す",
      "shotclock.aria.reset": "リセット、残り時間を基本時間に戻す",
      "shotclock.aria.extCount": "延長{count}回"
    }),
    "en": Object.freeze({
      "shotclock.title": "Shot Clock",
      "shotclock.supplement": "Count the time manually",
      "shotclock.baseTime": "Base time",
      "shotclock.sec": "sec",
      "shotclock.ready": "Ready",
      "shotclock.paused": "Paused",
      "shotclock.expired": "Time up",
      "shotclock.start": "Start",
      "shotclock.pause": "Pause",
      "shotclock.resume": "Resume",
      "shotclock.reset": "Reset",
      "shotclock.extend": "Extend",
      "shotclock.undo": "Undo",
      "shotclock.aria.role": "Shot clock",
      "shotclock.aria.left": {"one": "{count} second left", "other": "{count} seconds left"},
      "shotclock.aria.expired": "Time up",
      "shotclock.aria.extend": "Extend, add 60 seconds",
      "shotclock.aria.undo": "Undo extension",
      "shotclock.aria.reset": "Reset, return to base time",
      "shotclock.aria.extCount": {"one": "Extended {count} time", "other": "Extended {count} times"}
    }),
    "zh-Hans": Object.freeze({
      "shotclock.title": "出杆计时器",
      "shotclock.supplement": "手动计时",
      "shotclock.baseTime": "基本时间",
      "shotclock.sec": "秒",
      "shotclock.ready": "待机",
      "shotclock.paused": "已暂停",
      "shotclock.expired": "时间到",
      "shotclock.start": "开始",
      "shotclock.pause": "暂停",
      "shotclock.resume": "继续",
      "shotclock.reset": "重置",
      "shotclock.extend": "延长",
      "shotclock.undo": "撤销",
      "shotclock.aria.role": "出杆计时器",
      "shotclock.aria.left": "剩余{count}秒",
      "shotclock.aria.expired": "时间到",
      "shotclock.aria.extend": "延长，增加60秒",
      "shotclock.aria.undo": "撤销延长",
      "shotclock.aria.reset": "重置，恢复为基本时间",
      "shotclock.aria.extCount": "已延长{count}次"
    })
  });
  if(typeof module==="object"&&module.exports)module.exports=catalog;
  if(root)root.CueScoreShotClockCatalogV1=catalog;
})(typeof globalThis!=="undefined"?globalThis:this);
