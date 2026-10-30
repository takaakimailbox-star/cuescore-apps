/* CueScore i18n catalog: match-setup UX trial (Build 95 candidate; design basis: the isolated Prototype of 2026-10-30).
 * STATUS: CANDIDATE terms, P3-PROVISIONAL. They are NOT in the three main catalogs because every main-catalog key must carry a P4-APPROVED record (tests/p4-po-approval.test.mjs).
 * Moving these keys into the main catalogs happens only together with their P4 approval record. Human independent review: NOT PERFORMED. */
(function(root){
  "use strict";
  const catalog=Object.freeze({
    "ja": Object.freeze({
      "setupux.reason.both": "プレーヤーを選ぶと試合を開始できます",
      "setupux.reason.p1": "先攻プレーヤーを選ぶと試合を開始できます",
      "setupux.reason.p2": "対戦相手を選ぶと試合を開始できます",
      "setupux.reason.other": "別々のプレーヤーを選ぶと試合を開始できます",
      "setupux.reason.aria": "試合を開始できない理由",
      "setupux.menu.other": "その他…",
      "setupux.menu.close": "メニューを閉じる"
    }),
    "en": Object.freeze({
      "setupux.reason.both": "Select players to start the match",
      "setupux.reason.p1": "Select the first player to start the match",
      "setupux.reason.p2": "Select an opponent to start the match",
      "setupux.reason.other": "Select two different players to start the match",
      "setupux.reason.aria": "Why the match cannot start yet",
      "setupux.menu.other": "Other…",
      "setupux.menu.close": "Close menu"
    }),
    "zh-Hans": Object.freeze({
      "setupux.reason.both": "选择球员后即可开始比赛",
      "setupux.reason.p1": "选择先手球员后即可开始比赛",
      "setupux.reason.p2": "选择对手后即可开始比赛",
      "setupux.reason.other": "选择两位不同的球员后即可开始比赛",
      "setupux.reason.aria": "暂时无法开始比赛的原因",
      "setupux.menu.other": "其他…",
      "setupux.menu.close": "关闭菜单"
    })
  });
  if(typeof module==="object"&&module.exports)module.exports=catalog;
  if(root)root.CueScoreSetupUxCatalogV1=catalog;
})(typeof globalThis!=="undefined"?globalThis:this);
