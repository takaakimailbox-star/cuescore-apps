/*
 * CueScore i18n foundation v1 (Official 108 Part I §3 / §4 / §6 / §7 / §13).
 *
 * Display layer only. Nothing in this file reads or writes Match, Player,
 * Category, Season, Backup, QR or CSV data. The single persisted value is the
 * language preference at `cueScore.language.v1`.
 *
 * Japanese is the canonical catalog. When the resolved language is `ja` the
 * DOM is never rewritten, so the existing Japanese UI is invariant by
 * construction. There is no observer-driven or post-hoc text replacement.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.CueScoreI18nV1=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const STORAGE_KEY="cueScore.language.v1";
  const FALLBACK_LANGUAGE="ja";
  const SUPPORTED_LANGUAGES=Object.freeze(["ja","en","zh-Hans"]);
  const PREFERENCES=Object.freeze(["auto",...SUPPORTED_LANGUAGES]);
  const HTML_LANG=Object.freeze({ja:"ja",en:"en","zh-Hans":"zh-Hans"});
  const INTL_LOCALE=Object.freeze({ja:"ja-JP",en:"en-US","zh-Hans":"zh-Hans-CN"});
  // Each language name is shown in its own language and is never translated (Official 108 L-LANG-2).
  const LANGUAGE_NAMES=Object.freeze({ja:"日本語",en:"English","zh-Hans":"简体中文"});

  const catalogs=Object.create(null);
  function registerCatalog(language,dictionary){
    if(typeof language!=="string"||!language)throw new TypeError("language is required");
    if(!dictionary||typeof dictionary!=="object"||Array.isArray(dictionary))throw new TypeError("catalog must be an object");
    catalogs[language]=Object.freeze({...dictionary});
    return catalogs[language];
  }
  const getCatalog=language=>catalogs[language]||null;

  /* ---------- language tag classification (Part I §3 L-RES-1/2/6) ---------- */
  const normalizeTag=tag=>String(tag==null?"":tag).trim().replace(/_/g,"-").toLowerCase();

  // JA / EN / HANS / HANT / OTHER. Script subtags win over region subtags.
  function classifyTag(tag){
    const normalized=normalizeTag(tag);
    if(!normalized)return "OTHER";
    const parts=normalized.split("-");
    const primary=parts[0];
    if(primary==="ja")return "JA";
    if(primary==="en")return "EN";
    if(primary!=="zh")return "OTHER";
    const script=parts.slice(1).find(part=>part==="hans"||part==="hant");
    if(script)return script==="hans"?"HANS":"HANT";
    const region=parts.slice(1).find(part=>/^[a-z]{2}$/.test(part)||/^\d{3}$/.test(part));
    if(region==="tw"||region==="hk"||region==="mo")return "HANT";
    return "HANS"; // zh, zh-CN, zh-SG and other region-only tags default to the Simplified script (CLDR likely subtags; NOT VERIFIED on device)
  }

  // Part I §3 L-RES-3. A Traditional Chinese first preference resolves to ja (U10).
  function resolveDeviceLanguage(languages){
    const list=(Array.isArray(languages)?languages:[]).map(normalizeTag).filter(Boolean);
    if(!list.length)return {language:FALLBACK_LANGUAGE,reason:"no-device-language"};
    if(classifyTag(list[0])==="HANT")return {language:FALLBACK_LANGUAGE,reason:"traditional-chinese-first"};
    let traditionalSeen=false;
    for(const tag of list){
      const kind=classifyTag(tag);
      if(kind==="JA")return {language:"ja",reason:"device",tag};
      if(kind==="EN")return {language:"en",reason:"device",tag};
      if(kind==="HANS"){
        if(traditionalSeen)continue;
        return {language:"zh-Hans",reason:"device",tag};
      }
      if(kind==="HANT")traditionalSeen=true;
    }
    return {language:FALLBACK_LANGUAGE,reason:"no-supported-device-language"};
  }

  function deviceLanguages(env){
    const nav=env&&env.navigator;
    if(!nav)return [];
    if(Array.isArray(nav.languages)&&nav.languages.length)return Array.from(nav.languages);
    if(nav.languages&&typeof nav.languages.length==="number"&&nav.languages.length)return Array.from(nav.languages);
    return nav.language?[nav.language]:[];
  }

  /* ---------- persistence (class C: the only key this module may write) ---------- */
  function readPreference(storage){
    try{
      const value=storage&&storage.getItem(STORAGE_KEY);
      return PREFERENCES.includes(value)?value:"auto";
    }catch(_){return "auto";}
  }

  function resolve({storage,languages}={}){
    const preference=readPreference(storage);
    if(preference!=="auto")return {language:preference,preference,source:"manual"};
    const device=resolveDeviceLanguage(languages);
    return {language:device.language,preference,source:device.reason==="device"?"device":"fallback",reason:device.reason};
  }

  /* ---------- translation ---------- */
  function interpolate(template,params){
    if(typeof template!=="string")return template;
    if(!params||typeof params!=="object")return template;
    return template.replace(/\{([A-Za-z0-9_]+)\}/g,(match,name)=>Object.prototype.hasOwnProperty.call(params,name)?String(params[name]):match);
  }

  function createI18n(options={}){
    const env=options.env||(typeof globalThis!=="undefined"?globalThis:{});
    const storage=options.storage!==undefined?options.storage:(()=>{try{return env.localStorage;}catch(_){return null;}})();
    const resolution=options.language
      ?{language:SUPPORTED_LANGUAGES.includes(options.language)?options.language:FALLBACK_LANGUAGE,preference:options.language,source:"forced"}
      :resolve({storage,languages:options.languages||deviceLanguages(env)});
    const language=resolution.language;
    const missing=[];
    const reportMissing=key=>{if(!missing.includes(key)){missing.push(key);if(typeof options.onMissing==="function")options.onMissing(key,language);}};

    function lookup(key){
      const selected=catalogs[language];
      if(selected&&Object.prototype.hasOwnProperty.call(selected,key))return selected[key];
      const base=catalogs[FALLBACK_LANGUAGE];
      if(base&&Object.prototype.hasOwnProperty.call(base,key)){reportMissing(key);return base[key];}
      reportMissing(key);
      return undefined;
    }

    function t(key,params){
      let value=lookup(key);
      if(value===undefined)return String(key);
      if(value&&typeof value==="object"){
        const count=params&&Number(params.count);
        let form="other";
        if(Number.isFinite(count)&&typeof Intl!=="undefined"&&Intl.PluralRules){
          try{form=new Intl.PluralRules(INTL_LOCALE[language]||"ja-JP").select(count);}catch(_){form="other";}
        }
        value=value[form]!==undefined?value[form]:value.other;
        if(value===undefined)return String(key);
      }
      return interpolate(value,params);
    }

    const has=key=>Boolean(catalogs[language]&&Object.prototype.hasOwnProperty.call(catalogs[language],key))||Boolean(catalogs[FALLBACK_LANGUAGE]&&Object.prototype.hasOwnProperty.call(catalogs[FALLBACK_LANGUAGE],key));

    /* ---------- html lang and static markup ---------- */
    function applyHtmlLang(doc){
      const target=doc||env.document;
      const element=target&&target.documentElement;
      if(!element||language==="ja")return false; // ja markup already carries lang="ja"; no DOM write for Japanese
      element.setAttribute("lang",HTML_LANG[language]);
      return true;
    }

    const STATIC_ATTRIBUTES=Object.freeze([
      ["data-i18n-aria-label","aria-label"],["data-i18n-placeholder","placeholder"],
      ["data-i18n-title","title"],["data-i18n-alt","alt"]
    ]);
    // Rewrites only elements that carry an explicit data-i18n* key. For `ja` this is a no-op.
    function applyStatic(scope){
      const rootNode=scope||(env.document&&env.document.documentElement);
      if(!rootNode||language==="ja")return {changed:0};
      let changed=0;
      const selector=["[data-i18n]",...STATIC_ATTRIBUTES.map(([attribute])=>`[${attribute}]`)].join(",");
      const nodes=[...(rootNode.querySelectorAll?rootNode.querySelectorAll(selector):[])];
      if(rootNode.matches&&rootNode.matches(selector))nodes.unshift(rootNode);
      for(const node of nodes){
        const textKey=node.getAttribute("data-i18n");
        if(textKey){node.textContent=t(textKey);changed+=1;}
        for(const [source,target] of STATIC_ATTRIBUTES){
          const key=node.getAttribute(source);
          if(key){node.setAttribute(target,t(key));changed+=1;}
        }
      }
      return {changed};
    }

    /* ---------- formatters (Intl; stored dates remain ISO strings) ---------- */
    const locale=INTL_LOCALE[language]||INTL_LOCALE.ja;
    const formatDate=(value,opts)=>{
      const date=value instanceof Date?value:new Date(value);
      if(Number.isNaN(date.getTime()))return "";
      return new Intl.DateTimeFormat(locale,opts||{year:"numeric",month:"2-digit",day:"2-digit"}).format(date);
    };
    const formatNumber=(value,opts)=>new Intl.NumberFormat(locale,opts).format(value);

    return Object.freeze({
      language,preference:resolution.preference,source:resolution.source,locale,
      htmlLang:HTML_LANG[language],t,has,applyHtmlLang,applyStatic,formatDate,formatNumber,
      formatDatePattern:(value,id)=>formatDatePattern(language,value,id),
      missing:()=>missing.slice()
    });
  }

  /* ---------- language change request (Official 108 §6) ----------
   * Writes only STORAGE_KEY. Reads the guard (S-A / S-B / S-C) before and after
   * the write and rolls the key back if the situation changed (TOCTOU). */
  function evaluateGuard(guard){
    try{
      const state=guard&&typeof guard.state==="function"?guard.state():null;
      if(!state||typeof state!=="object")return {allowed:false,code:"GUARD_UNAVAILABLE",state:null};
      if(state.state==="S-A")return {allowed:false,code:"BLOCKED_ACTIVE_MATCH",state};
      if(state.state==="S-B"&&state.allowSavedInterrupted!==true)return {allowed:false,code:"BLOCKED_SAVED_INTERRUPTED_MATCH",state};
      if(state.state!=="S-B"&&state.state!=="S-C")return {allowed:false,code:"GUARD_UNAVAILABLE",state};
      return {allowed:true,code:"OK",state};
    }catch(_){return {allowed:false,code:"GUARD_UNAVAILABLE",state:null};}
  }

  function requestLanguageChange(preference,deps={}){
    const {guard,storage,reload}=deps;
    if(!PREFERENCES.includes(preference))return {ok:false,code:"INVALID_PREFERENCE"};
    const first=evaluateGuard(guard);
    if(!first.allowed)return {ok:false,code:first.code,state:first.state};
    if(!storage||typeof storage.setItem!=="function")return {ok:false,code:"STORAGE_UNAVAILABLE"};
    const previous=readPreference(storage);
    let hadValue=false;
    try{hadValue=storage.getItem(STORAGE_KEY)!==null;}catch(_){return {ok:false,code:"STORAGE_UNAVAILABLE"};}
    if(previous===preference&&(preference==="auto"||hadValue))return {ok:true,changed:false,preference};
    const restore=()=>{
      try{
        if(hadValue)storage.setItem(STORAGE_KEY,previous);else storage.removeItem(STORAGE_KEY);
      }catch(_){/* nothing more can be done; the original value was never replaced if setItem threw */}
    };
    try{storage.setItem(STORAGE_KEY,preference);}
    catch(_){return {ok:false,code:"WRITE_FAILED"};}
    let stored=null;
    try{stored=storage.getItem(STORAGE_KEY);}catch(_){stored=null;}
    if(stored!==preference){restore();return {ok:false,code:"WRITE_FAILED"};}
    const second=evaluateGuard(guard); // immediately before reload (Official 108 L-SW-2 (3))
    if(!second.allowed){restore();return {ok:false,code:second.code,state:second.state,rolledBack:true};}
    try{if(typeof reload==="function")reload();}
    catch(_){restore();return {ok:false,code:"RELOAD_FAILED",rolledBack:true};}
    return {ok:true,changed:true,preference};
  }

  /* ---------- Display Mapper (read only; stored values are never rewritten) ---------- */
  // Canonical Japanese break_result.resultLabel values map to catalog keys. Unknown values are returned unchanged.
  const RESULT_LABEL_KEYS=Object.freeze({
    "無得点":"mapper.resultLabel.noScore","1個":"mapper.resultLabel.one","2個":"mapper.resultLabel.two","2個以上":"mapper.resultLabel.twoOrMore",
    "3個以上":"mapper.resultLabel.threeOrMore","スクラッチ":"mapper.resultLabel.scratch","イリーガル":"mapper.resultLabel.illegal",
    "ブレイク失敗":"mapper.resultLabel.breakFailed","ブレイクファール":"mapper.resultLabel.breakFoul",
    "ファール（ブレイク交代）":"mapper.resultLabel.foulBreakChange","記録なし":"mapper.resultLabel.skipped"
  });
  function mapResultLabel(i18n,value){
    if(typeof value!=="string")return value;
    const key=RESULT_LABEL_KEYS[value];
    if(key)return i18n.t(key);
    const match=/^(\d+)球イン$/.exec(value);
    if(match)return i18n.t("mapper.resultLabel.pocketed",{count:Number(match[1])});
    return value;
  }
  // D4: only a default id whose stored name is still the untouched default name is translated.
  const DEFAULT_CATEGORIES=Object.freeze({category_tournament:{name:"大会",key:"mapper.category.tournament"},category_other:{name:"その他",key:"mapper.category.other"}});
  function mapCategoryName(i18n,category){
    const name=category&&typeof category.name==="string"?category.name:"";
    const rule=category&&DEFAULT_CATEGORIES[category.id];
    if(rule&&name===rule.name)return i18n.t(rule.key);
    return name;
  }

  /* ---------- Display date patterns (P2-6; Official 108 Part I §7 / C-R6; en and zh-Hans tables added in P3) ----------
   * Presentation only. Stored dates stay ISO strings; callers build the Date; nothing here parses a displayed date. Every ja pattern reproduces, character for
   * character, the Japanese output of the hand-built formatters it replaced, and uses LOCAL-time components exactly like them. The en / zh-Hans tables are
   * provisional (P3-PROVISIONAL, reviewed in P4). Tokens: YYYY MM DD (zero padded) M D (not padded) MMM (short month name) HH mm (zero padded) H (not padded) W (weekday). */
  const DATE_PATTERNS=Object.freeze({
    ja:Object.freeze({
      "md":"M/D","mmdd":"MM/DD","ymd":"YYYY/MM/DD","ymd-short":"YYYY/M/D","ymd-hm":"YYYY/MM/DD HH:mm","ymd-w":"YYYY/MM/DD（W）",
      "ymd-w-hm":"YYYY/MM/DD（W）HH:mm","ymd-w-sp-hm":"YYYY/MM/DD（W） HH:mm","md-w-sp-hm":"M/D（W） HH:mm","hm":"HH:mm","h-mm":"H:mm"
    }),
    en:Object.freeze({
      "md":"M/D","mmdd":"MM/DD","ymd":"MMM D, YYYY","ymd-short":"MMM D, YYYY","ymd-hm":"MMM D, YYYY HH:mm","ymd-w":"W, MMM D, YYYY",
      "ymd-w-hm":"W, MMM D, YYYY HH:mm","ymd-w-sp-hm":"W, MMM D, YYYY HH:mm","md-w-sp-hm":"W, MMM D HH:mm","hm":"HH:mm","h-mm":"H:mm"
    }),
    "zh-Hans":Object.freeze({
      "md":"M月D日","mmdd":"MM/DD","ymd":"YYYY年M月D日","ymd-short":"YYYY年M月D日","ymd-hm":"YYYY年M月D日 HH:mm","ymd-w":"YYYY年M月D日 周W",
      "ymd-w-hm":"YYYY年M月D日 周W HH:mm","ymd-w-sp-hm":"YYYY年M月D日 周W HH:mm","md-w-sp-hm":"M月D日 周W HH:mm","hm":"HH:mm","h-mm":"H:mm"
    })
  });
  const DATE_WEEKDAYS=Object.freeze({
    ja:Object.freeze(["日","月","火","水","木","金","土"]),
    en:Object.freeze(["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]),
    "zh-Hans":Object.freeze(["日","一","二","三","四","五","六"])
  });
  const DATE_MONTHS=Object.freeze({en:Object.freeze(["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"])});
  const DATE_TOKEN=/YYYY|MMM|MM|DD|HH|mm|M|D|H|W/g;
  function formatDatePattern(language,value,id){
    const date=value; // a Date (duck-typed): like the replaced code, anything else throws a TypeError at the first getter
    // No special case for an invalid Date: the replaced hand-built formatters printed "NaN" parts (and "undefined" for the weekday) and this keeps
    // that behaviour byte for byte. Callers that have a fallback text check validity before calling.
    const table=DATE_PATTERNS[language]||DATE_PATTERNS.ja;
    const pattern=table[id];
    if(typeof pattern!=="string")throw new RangeError("unknown date pattern: "+id);
    const weekdays=DATE_WEEKDAYS[language]||DATE_WEEKDAYS.ja;
    const two=n=>String(n).padStart(2,"0");
    return pattern.replace(DATE_TOKEN,token=>{
      switch(token){
        case "YYYY":return String(date.getFullYear());
        case "MMM":return (DATE_MONTHS[language]||DATE_MONTHS.en)[date.getMonth()];
        case "MM":return two(date.getMonth()+1);
        case "DD":return two(date.getDate());
        case "M":return String(date.getMonth()+1);
        case "D":return String(date.getDate());
        case "HH":return two(date.getHours());
        case "mm":return two(date.getMinutes());
        case "H":return String(date.getHours());
        default:return weekdays[date.getDay()];
      }
    });
  }

  return Object.freeze({
    STORAGE_KEY,FALLBACK_LANGUAGE,SUPPORTED_LANGUAGES,PREFERENCES,HTML_LANG,INTL_LOCALE,LANGUAGE_NAMES,
    normalizeTag,classifyTag,resolveDeviceLanguage,deviceLanguages,readPreference,resolve,
    registerCatalog,getCatalog,createI18n,requestLanguageChange,evaluateGuard,
    mapResultLabel,mapCategoryName,RESULT_LABEL_KEYS,DEFAULT_CATEGORIES,interpolate,
    DATE_PATTERNS,DATE_WEEKDAYS,DATE_MONTHS,formatDatePattern
  });
});
