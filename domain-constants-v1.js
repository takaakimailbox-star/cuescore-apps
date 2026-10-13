/* CueScore Domain constants (i18n P2-1, Official 108 §7 class a).
 * These are STORED / identity values, not display text. They keep their existing Japanese canonical values and must never be
 * translated, normalized or merged. Display text for them lives in the i18n catalogs (Display Mapper, P2-2 / P3).
 * Pure data and pure helpers: no DOM, no storage, no language lookup. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.CueScoreDomainV1=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  /* ---- Fixed locales (Official 108 L-ID-1 / L-ID-2): independent of the UI language ---- */
  const IDENTITY_LOCALE="ja";                // case folding for player-name identity and name search
  const SORT_LOCALE="ja";                    // collation for names / ids / categories in rankings and lists
  const IDENTITY_NORMALIZATION_FORM="NFKC";  // only the two existing NFKC identity paths use it (not unified with the others)

  /* ---- break_result.resultLabel canonical values (stored in events, Backup and QR) ---- */
  const RESULT_LABELS=Object.freeze({
    NO_SCORE:"無得点",
    ONE:"1個",
    TWO:"2個",
    TWO_OR_MORE:"2個以上",
    THREE_OR_MORE:"3個以上",
    SCRATCH:"スクラッチ",
    ILLEGAL:"イリーガル",
    BREAK_FAILED:"ブレイク失敗",
    BREAK_FOUL:"ブレイクファール",
    PRE_BREAK_FOUL:"ファール（ブレイク交代）"
  });
  const pocketedLabel=count=>`${count}球イン`;

  /* ---- Match category defaults (stored names; ids are stored too) ---- */
  const FREE_CATEGORY=Object.freeze({id:"category_free",name:"Free"});
  const DEFAULT_CATEGORIES=Object.freeze({
    TOURNAMENT:Object.freeze({id:"category_tournament",name:"大会"}),
    OTHER:Object.freeze({id:"category_other",name:"その他"})
  });
  const LEGACY_REMOVED_CATEGORY_NAMES=Object.freeze(["JPA","KTCリーグ","練習試合"]);
  const RESERVED_CATEGORY_NAMES=Object.freeze([FREE_CATEGORY.name,...LEGACY_REMOVED_CATEGORY_NAMES]);

  return Object.freeze({
    IDENTITY_LOCALE,SORT_LOCALE,IDENTITY_NORMALIZATION_FORM,
    RESULT_LABELS,pocketedLabel,
    FREE_CATEGORY,DEFAULT_CATEGORIES,LEGACY_REMOVED_CATEGORY_NAMES,RESERVED_CATEGORY_NAMES
  });
});
