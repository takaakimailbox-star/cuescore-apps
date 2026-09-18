(() => {
  "use strict";
  const diagnostic=Object.freeze({
    storeKitPlugin(capacitor,isNative){return isNative?capacitor?.Plugins?.CueScoreStoreKit??capacitor?.registerPlugin?.("CueScoreStoreKit")??null:null},
    fromError(error){const data=error?.data&&typeof error.data==="object"?error.data:error||{},code=String(error?.code||data?.diagnosticState||"");if(code==="PRODUCTS_EMPTY")return{state:"PRODUCTS_EMPTY",productsCount:Number(data.productsCount)||0};if(code==="STOREKIT_ERROR")return{state:"STOREKIT_ERROR",errorDomain:String(data.errorDomain||"unknown"),errorCode:Number.isFinite(Number(data.errorCode))?Number(data.errorCode):"unknown"};return{state:"BRIDGE_ERROR"}},
    fromProduct(product){return{state:"PRODUCTS_OK",productsCount:Number(product?.productsCount)||0,productIdMatched:product?.productIdMatched===true}},
    format(value){if(!value?.state)return"";if(value.state==="PRODUCTS_OK")return`Diagnostic: PRODUCTS_OK / count=${value.productsCount} / match=${value.productIdMatched?"YES":"NO"}`;if(value.state==="PRODUCTS_EMPTY")return`Diagnostic: PRODUCTS_EMPTY / count=${value.productsCount}`;if(value.state==="STOREKIT_ERROR")return`Diagnostic: STOREKIT_ERROR / domain=${value.errorDomain} / code=${value.errorCode}`;return"Diagnostic: BRIDGE_ERROR"},
    formatStorefront(product){const country=String(product?.storefrontCountryCode||"").toUpperCase(),id=String(product?.storefrontId||"");return country||id?`Storefront: ${country||"unknown"}${id?` / ${id}`:""}`:"Storefront: unavailable"},
    safeError(error){const data=error?.data&&typeof error.data==="object"?error.data:{},domain=String(data.errorDomain||error?.name||"unknown"),rawCode=error?.code??data.errorCode??"unknown",code=typeof rawCode==="string"||Number.isFinite(Number(rawCode))?String(rawCode):"unknown";return{domain,code,classification:code!=="unknown"?"CODED_ERROR":"UNKNOWN_ERROR"}},
    purchaseStatus(result){return["success","pending","cancelled"].includes(result?.status)?result.status:"failure"},
    createHistory(limit=20){const entries=[];return Object.freeze({push(value){entries.push(String(value));if(entries.length>limit)entries.splice(0,entries.length-limit);return entries.slice()},snapshot(){return entries.slice()}})},
    registerListener(plugin,eventName,listener,hooks={}){let handle=null;hooks.start?.();let ready;try{ready=Promise.resolve(plugin.addListener(eventName,listener)).then(next=>{handle=next;hooks.success?.();return true},error=>{hooks.reject?.(error);return false})}catch(error){hooks.reject?.(error);ready=Promise.resolve(false)}const cleanup=()=>{try{const removal=handle?.remove?.();if(removal?.catch)removal.catch(error=>hooks.removeReject?.(error))}catch(error){hooks.removeReject?.(error)}};cleanup.ready=ready;return cleanup}
  });
  const root=typeof window==="undefined"?globalThis:window;root.CueScoreIapDiagnostic=diagnostic;if(typeof document==="undefined")return;
  const PRO_PRODUCT_ID="com.takaakimailboxstar.cuescoreapps.pro";
  const sourceNames=Object.freeze({personalBest:"自己ベスト",analysis:"分析",opponents:"対戦相手別",historyLimit:"全履歴",backup:"バックアップ",restore:"データ復元"});
  const events=new EventTarget();
  const purchaseEvents=new EventTarget(),purchaseHistory=diagnostic.createHistory(20);
  const recordPurchase=value=>{const entries=purchaseHistory.push(value);purchaseEvents.dispatchEvent(new CustomEvent("change",{detail:entries}));return entries};
  const yesNo=value=>value===true?"YES":"NO";
  const recordSafeError=(phase,error)=>{const safe=diagnostic.safeError(error);recordPurchase(`${phase} / domain=${safe.domain} / code=${safe.code} / class=${safe.classification}`)};
  const recordNative=value=>{if(!value?.phase)return;const parts=[String(value.phase)];if(value.resultStatus)parts.push(`status=${value.resultStatus}`);if(Number.isFinite(Number(value.productsCount)))parts.push(`count=${Number(value.productsCount)}`);if(typeof value.productIdMatched==="boolean")parts.push(`match=${yesNo(value.productIdMatched)}`);if(typeof value.matchingVerifiedEntitlement==="boolean")parts.push(`entitlement=${yesNo(value.matchingVerifiedEntitlement)}`);if(typeof value.revoked==="boolean")parts.push(`revoked=${yesNo(value.revoked)}`);if(value.errorDomain)parts.push(`domain=${String(value.errorDomain)}`);if(value.errorCode!==undefined)parts.push(`code=${String(value.errorCode)}`);recordPurchase(parts.join(" / "))};
  const capacitor=window.Capacitor,isNative=Boolean(capacitor?.isNativePlatform?.());
  let adapter=null,state=Object.freeze({status:"unavailable",isPro:false,product:null,error:null,diagnostic:null});
  const emit=next=>{state=Object.freeze({...state,...next});events.dispatchEvent(new CustomEvent("change",{detail:state}));window.dispatchEvent(new CustomEvent("cuescore:entitlement-change",{detail:state}));};
  const verified=value=>Boolean(value?.verified===true&&value?.isPro===true);
  const entitlement=Object.freeze({
    get snapshot(){return state},isPro:()=>state.isPro===true,
    subscribe(listener){const fn=event=>listener(event.detail);events.addEventListener("change",fn);return()=>events.removeEventListener("change",fn)},
    async connect(next){adapter=next&&typeof next==="object"?next:null;if(!adapter){emit({status:"unavailable",isPro:false,product:null,error:null,diagnostic:isNative?{state:"BRIDGE_ERROR"}:null});return state}if(typeof adapter.subscribe==="function")adapter.subscribe(value=>{if(value?.verified===true)emit({status:"ready",isPro:Boolean(value.isPro),error:null})});return this.refresh()},
    async refresh(){recordPurchase("ENTITLEMENT_REFRESH_STARTED");if(!adapter?.currentEntitlement){emit({status:"unavailable",isPro:false,product:null,error:null,diagnostic:isNative?{state:"BRIDGE_ERROR"}:null});recordPurchase("ENTITLEMENT_REFRESH_RESULT / unavailable");return state}emit({status:"loading",error:null});let current;try{current=await adapter.currentEntitlement()}catch(error){emit({status:"error",isPro:false,product:null,error:String(error?.message||error),diagnostic:{state:"BRIDGE_ERROR"}});recordSafeError("ENTITLEMENT_REFRESH_REJECTED",error);return state}let product=null,productError=null,productDiagnostic=null;try{product=await adapter.product?.();if(product)productDiagnostic=diagnostic.fromProduct(product)}catch(error){productError=String(error?.message||error);productDiagnostic=diagnostic.fromError(error)}const isPro=verified(current);emit({status:product||isPro?"ready":"error",isPro,product:product||null,error:productError,diagnostic:productDiagnostic});recordPurchase(`ENTITLEMENT_REFRESH_RESULT / entitlement=${yesNo(isPro)}`);return state},
    async purchase(){recordPurchase("J02 JS_ENTITLEMENT_PURCHASE_ENTERED");if(!adapter?.purchase)return{status:"unavailable"};recordPurchase("J03 JS_NATIVE_PROMISE_WAIT");try{const result=await adapter.purchase(),resultStatus=diagnostic.purchaseStatus(result);recordPurchase(`J04 JS_NATIVE_PROMISE_RESOLVED / status=${resultStatus}`);if(["cancelled","pending"].includes(result?.status))return result;if(verified(result)){emit({status:"ready",isPro:true,error:null});recordPurchase("J06 JS_PRO_APPLIED");return{status:"success"}}return{status:"failure"}}catch(error){recordSafeError("J05 JS_NATIVE_PROMISE_REJECTED",error);return{status:"failure",error}}},
    async restore(){if(!adapter?.restore)return{status:"unavailable"};try{const result=await adapter.restore();if(verified(result)){emit({status:"ready",isPro:true,error:null});return{status:"success"}}return{status:"notFound"}}catch(error){return{status:"failure",error}}}
  });
  window.CueScoreEntitlement=entitlement;

  const storeKit=diagnostic.storeKitPlugin(capacitor,isNative);
  if(storeKit){
    const registerListener=(eventName,listener,label)=>diagnostic.registerListener(storeKit,eventName,listener,{start:()=>recordPurchase(`${label}_REGISTRATION_STARTED`),success:()=>recordPurchase(`${label}_REGISTRATION_SUCCESS`),reject:error=>recordSafeError(`${label}_REGISTRATION_REJECTION`,error),removeReject:error=>recordSafeError(`${label}_REMOVAL_REJECTION`,error)});
    const nativeAdapter={
      product:()=>storeKit.getProduct(),
      currentEntitlement:()=>storeKit.currentEntitlement(),
      purchase:()=>storeKit.purchase({productId:PRO_PRODUCT_ID}),
      restore:()=>storeKit.restore(),
      subscribe(listener){return registerListener("entitlementChanged",listener,"ENTITLEMENT_LISTENER")},
      subscribeDiagnostic(listener){return registerListener("purchaseDiagnostic",listener,"DIAGNOSTIC_LISTENER")}
    };
    nativeAdapter.subscribeDiagnostic(recordNative);
    void entitlement.connect(nativeAdapter).catch(error=>recordSafeError("ENTITLEMENT_CONNECT_REJECTION",error));
  }

  const policy=window.CueScoreRecordPolicyFactory.createRecordPolicy(()=>entitlement.isPro());
  window.CueScoreRecordAccess=policy;
  window.CueScoreFeatureAccess?.connectEntitlementProvider?.(defaults=>({...defaults,detailedAnalytics:entitlement.isPro(),ranking:entitlement.isPro(),backup:entitlement.isPro()}));

  const overlay=document.createElement("section");overlay.className="cue-pro-overlay-v1";overlay.hidden=true;overlay.setAttribute("aria-label","CueScore Pro");
  overlay.innerHTML=`<header class="cue-pro-header-v1"><button class="cue-pro-back-v1" type="button" aria-label="戻る">‹</button><h1>CueScore Pro</h1><span></span></header><main class="cue-pro-scroll-v1"><section class="cue-pro-hero-v1"><div class="cue-pro-mark-v1"><img src="src/assets/logo/CueScore_LogoMark_Black.svg" alt="" aria-hidden="true"></div><h2>CueScore Pro</h2><p class="cue-pro-lead-v1">記録をもっと残す。<br>プレーをもっと振り返る。</p></section><section class="cue-pro-values-v1"><div><i>✓</i><span>履歴無制限</span></div><div><i>✓</i><span>自己ベスト</span></div><div><i>✓</i><span>詳細分析・推移</span></div><div><i>✓</i><span>対戦相手別の振り返り</span></div><div><i>✓</i><span>Backup / Restore</span></div></section><p class="cue-pro-price-v1" data-pro-price>価格を取得できません</p><p class="cue-pro-diagnostic-v1" data-pro-diagnostic hidden></p><p class="cue-pro-storefront-v1" data-pro-storefront>Storefront: unavailable</p><section class="cue-pro-purchase-diagnostic-v1" aria-label="Purchase Diagnostic"><strong>Purchase Diagnostic</strong><pre data-purchase-diagnostic></pre></section><p class="cue-pro-once-v1">一度の購入でずっと利用できます</p><button class="cue-pro-buy-v1" type="button" data-pro-buy disabled>Proを購入</button><button class="cue-pro-restore-v1" type="button" data-pro-restore>購入を復元</button><p class="cue-pro-status-v1" data-pro-status></p></main>`;
  document.body.appendChild(overlay);
  let returnFocus=null,currentSource="",replay=null,bypass=false,originScroll=null;
  const status=overlay.querySelector("[data-pro-status]");
  const captureScroll=source=>{
    if(source==="historyLimit"){
      const screen=document.getElementById("recordsScreen"),scroll=document.getElementById("recordsList");
      return {kind:"globalHistory",screen,scroll,top:scroll?.scrollTop||0,left:scroll?.scrollLeft||0,filter:screen?.querySelector("[data-records-discipline-v2].is-selected")?.dataset.recordsDisciplineV2||"all"};
    }
    return {kind:"generic",windowX:window.scrollX,windowY:window.scrollY,elements:[...document.querySelectorAll("*")].filter(node=>node!==overlay&&(node.scrollTop||node.scrollLeft)).map(node=>({node,top:node.scrollTop,left:node.scrollLeft}))};
  };
  function restoreScroll(snapshot){
    if(!snapshot)return;
    if(snapshot.kind==="globalHistory"){
      snapshot.screen?.classList.remove("hidden");
      const selected=snapshot.screen?.querySelector("[data-records-discipline-v2].is-selected")?.dataset.recordsDisciplineV2;
      if(selected!==snapshot.filter)snapshot.screen?.querySelector(`[data-records-discipline-v2="${snapshot.filter}"]`)?.click();
      if(snapshot.scroll?.isConnected){snapshot.scroll.scrollTop=snapshot.top;snapshot.scroll.scrollLeft=snapshot.left}
      return;
    }
    window.scrollTo(snapshot.windowX,snapshot.windowY);snapshot.elements.forEach(({node,top,left})=>{if(node.isConnected){node.scrollTop=top;node.scrollLeft=left}});
  }
  function restoreAfterRender(snapshot){restoreScroll(snapshot);requestAnimationFrame(()=>{restoreScroll(snapshot);requestAnimationFrame(()=>restoreScroll(snapshot))});setTimeout(()=>restoreScroll(snapshot),80)}
  function close(unlocked=false){const snapshot=originScroll;overlay.hidden=true;document.body.classList.remove("cue-pro-open-v1");if(unlocked&&replay){const action=replay;replay=null;queueMicrotask(action)}else{try{returnFocus?.focus?.({preventScroll:true})}catch{returnFocus?.focus?.()}restoreAfterRender(snapshot)}originScroll=null;currentSource=""}
  function renderPurchaseDiagnostic(entries=purchaseHistory.snapshot()){overlay.querySelector("[data-purchase-diagnostic]").textContent=entries.join("\n")||"Waiting for diagnostic events"}
  function syncPaywall(){const s=entitlement.snapshot,diagnosticNode=overlay.querySelector("[data-pro-diagnostic]"),diagnosticText=diagnostic.format(s.diagnostic);overlay.querySelector("[data-pro-price]").textContent=s.product?.localizedPrice||"価格を取得できません";diagnosticNode.textContent=diagnosticText;diagnosticNode.hidden=!diagnosticText;overlay.querySelector("[data-pro-storefront]").textContent=diagnostic.formatStorefront(s.product);overlay.querySelector("[data-pro-buy]").disabled=!s.product||s.status!=="ready";renderPurchaseDiagnostic();if(s.isPro&&!overlay.hidden)close(true)}
  function open(source,options={}){currentSource=sourceNames[source]?source:"analysis";returnFocus=options.trigger||document.activeElement;replay=typeof options.replay==="function"?options.replay:null;originScroll=captureScroll(currentSource);status.textContent=`${sourceNames[currentSource]}はProで利用できます。`;status.classList.remove("is-error");overlay.hidden=false;document.body.classList.add("cue-pro-open-v1");syncPaywall();void entitlement.refresh();overlay.querySelector(".cue-pro-back-v1")?.focus({preventScroll:true})}
  window.CueScorePro=Object.freeze({open,close,source:()=>currentSource});
  overlay.querySelector(".cue-pro-back-v1").addEventListener("click",()=>close(false));
  overlay.querySelector("[data-pro-buy]").addEventListener("click",async()=>{recordPurchase("J01 JS_PURCHASE_CLICK");status.textContent="購入を確認しています…";const result=await entitlement.purchase();if(result.status==="success")return close(true);if(result.status==="cancelled"){status.textContent="";return}if(result.status==="pending"){status.textContent="購入は保留中です。承認後に自動で反映されます。";return}status.textContent="購入を完了できませんでした。時間をおいてもう一度お試しください。";status.classList.add("is-error")});
  overlay.querySelector("[data-pro-restore]").addEventListener("click",async()=>{status.textContent="購入状況を確認しています…";status.classList.remove("is-error");const result=await entitlement.restore();if(result.status==="success")return close(true);status.textContent=result.status==="notFound"?"復元できる購入は見つかりませんでした。":"購入情報を確認できませんでした。時間をおいてもう一度お試しください。";status.classList.toggle("is-error",result.status!=="notFound")});
  entitlement.subscribe(syncPaywall);
  purchaseEvents.addEventListener("change",event=>renderPurchaseDiagnostic(event.detail));
  document.addEventListener("visibilitychange",()=>{recordPurchase(`VISIBILITY_${String(document.visibilityState).toUpperCase()}`);if(document.visibilityState==="visible")void entitlement.refresh()});
  const gate=(event,source)=>{if(entitlement.isPro()||bypass)return false;const trigger=event.target.closest?.("button,[role=button]")||event.target;event.preventDefault();event.stopImmediatePropagation();open(source,{trigger,replay:()=>{bypass=true;try{trigger.click?.()}finally{bypass=false}}});return true};
  document.addEventListener("click",event=>{const target=event.target;
    if(target.closest?.(".hub-bests-v2 [data-hub-match],.pd7-bests [data-pd7-match],[data-pro-personal-best]"))return gate(event,"personalBest");
    if(target.closest?.('[data-hub-tab="analysis"],[data-hub-trends],#openRankingsBtn,[data-analytics-nav="analytics"]'))return gate(event,"analysis");
    if(target.closest?.("[data-hub-opponents],[data-pd7-rivals],[data-open-player-rival-v832],[data-rival-opponent]"))return gate(event,"opponents");
    if(target.closest?.('[data-settings-action="export"]'))return gate(event,"backup");
    if(target.closest?.('[data-settings-action="restore"]'))return gate(event,"restore");
    if(target.closest?.("[data-pro-history-limit]"))return gate(event,"historyLimit");
  },true);
  const badge=()=>'<span class="cue-pro-badge-v1" aria-label="Pro限定">🔒 Pro</span>';
  function decorate(){
    document.querySelectorAll('[data-hub-tab="analysis"]').forEach(node=>{if(!node.querySelector(".cue-pro-badge-v1"))node.insertAdjacentHTML("beforeend",badge())});
    document.querySelectorAll("[data-hub-opponents],[data-pd7-rivals]").forEach(node=>{node.classList.add("cue-pro-entry-v1");const title=node.querySelector("strong");if(title&&!title.querySelector(".cue-pro-badge-v1"))title.insertAdjacentHTML("beforeend",badge())});
    document.querySelectorAll('[data-settings-action="export"],[data-settings-action="restore"]').forEach(node=>{node.classList.add("cue-pro-entry-v1");const slot=node.children[node.children.length-2];if(slot&&!slot.querySelector?.(".cue-pro-badge-v1"))slot.innerHTML=badge()});
    document.querySelectorAll(".hub-bests-v2").forEach(section=>{const heading=section.previousElementSibling;if(heading?.classList.contains("hub-heading-v2")&&!heading.querySelector(".cue-pro-badge-v1"))heading.insertAdjacentHTML("beforeend",badge())});
  }
  new MutationObserver(()=>requestAnimationFrame(decorate)).observe(document.body,{subtree:true,childList:true});decorate();
  const guardFunction=(name,source)=>{const original=window[name];if(typeof original!=="function")return;window[name]=function(...args){if(!entitlement.isPro()){open(source);return}return original.apply(this,args)}};
  ["openPlayerOpponentRecordsV2","openPlayerAnalysisForPlayerV5","openMatchAnalysisForPlayerV5"].forEach(name=>guardFunction(name,name.includes("Opponent")?"opponents":"analysis"));
  if(window.CueScoreUiRevisionV12?.openTrends){const original=window.CueScoreUiRevisionV12.openTrends;window.CueScoreUiRevisionV12.openTrends=()=>entitlement.isPro()?original():open("analysis")}
  if(!storeKit)entitlement.refresh();
})();
