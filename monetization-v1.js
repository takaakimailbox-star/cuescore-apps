(() => {
  "use strict";
  const PRO_PRODUCT_ID="com.takaakimailboxstar.cuescoreapps.pro";
  const sourceNames=Object.freeze({personalBest:"自己ベスト",analysis:"分析",opponents:"対戦相手別",historyLimit:"全履歴",backup:"バックアップ",restore:"データ復元"});
  const events=new EventTarget();
  let adapter=null,state=Object.freeze({status:"unavailable",isPro:false,product:null,error:null});
  const emit=next=>{state=Object.freeze({...state,...next});events.dispatchEvent(new CustomEvent("change",{detail:state}));window.dispatchEvent(new CustomEvent("cuescore:entitlement-change",{detail:state}));};
  const verified=value=>Boolean(value?.verified===true&&value?.isPro===true);
  const entitlement=Object.freeze({
    get snapshot(){return state},isPro:()=>state.isPro===true,
    subscribe(listener){const fn=event=>listener(event.detail);events.addEventListener("change",fn);return()=>events.removeEventListener("change",fn)},
    async connect(next){adapter=next&&typeof next==="object"?next:null;if(!adapter){emit({status:"unavailable",isPro:false,product:null,error:null});return state}if(typeof adapter.subscribe==="function")adapter.subscribe(value=>{if(value?.verified===true)emit({status:"ready",isPro:Boolean(value.isPro),error:null})});return this.refresh()},
    async refresh(){if(!adapter?.currentEntitlement){emit({status:"unavailable",isPro:false,product:null,error:null});return state}emit({status:"loading",error:null});try{const [current,product]=await Promise.all([adapter.currentEntitlement(),adapter.product?.()]);emit({status:"ready",isPro:verified(current),product:product||null,error:null})}catch(error){emit({status:"error",isPro:false,product:null,error:String(error?.message||error)})}return state},
    async purchase(){if(!adapter?.purchase)return{status:"unavailable"};try{const result=await adapter.purchase();if(["cancelled","pending"].includes(result?.status))return result;if(verified(result)){emit({status:"ready",isPro:true,error:null});return{status:"success"}}return{status:"failure"}}catch(error){return{status:"failure",error}}},
    async restore(){if(!adapter?.restore)return{status:"unavailable"};try{const result=await adapter.restore();if(verified(result)){emit({status:"ready",isPro:true,error:null});return{status:"success"}}return{status:"notFound"}}catch(error){return{status:"failure",error}}}
  });
  window.CueScoreEntitlement=entitlement;

  const capacitor=window.Capacitor;
  const storeKit=capacitor?.isNativePlatform?.()&&capacitor?.registerPlugin?capacitor.registerPlugin("CueScoreStoreKit"):null;
  if(storeKit){
    const nativeAdapter={
      product:()=>storeKit.getProduct(),
      currentEntitlement:()=>storeKit.currentEntitlement(),
      purchase:()=>storeKit.purchase({productId:PRO_PRODUCT_ID}),
      restore:()=>storeKit.restore(),
      subscribe(listener){let handle=null;storeKit.addListener("entitlementChanged",listener).then(next=>{handle=next});return()=>handle?.remove?.()}
    };
    entitlement.connect(nativeAdapter);
  }

  const policy=window.CueScoreRecordPolicyFactory.createRecordPolicy(()=>entitlement.isPro());
  window.CueScoreRecordAccess=policy;
  window.CueScoreFeatureAccess?.connectEntitlementProvider?.(defaults=>({...defaults,detailedAnalytics:entitlement.isPro(),ranking:entitlement.isPro(),backup:entitlement.isPro()}));

  const overlay=document.createElement("section");overlay.className="cue-pro-overlay-v1";overlay.hidden=true;overlay.setAttribute("aria-label","CueScore Pro");
  overlay.innerHTML=`<header class="cue-pro-header-v1"><button class="cue-pro-back-v1" type="button" aria-label="戻る">‹</button><h1>CueScore Pro</h1><span></span></header><main class="cue-pro-scroll-v1"><section class="cue-pro-hero-v1"><div class="cue-pro-mark-v1"><img src="src/assets/logo/CueScore_LogoMark_Black.svg" alt="" aria-hidden="true"></div><h2>CueScore Pro</h2><p class="cue-pro-lead-v1">記録をもっと残す。<br>プレーをもっと振り返る。</p></section><section class="cue-pro-values-v1"><div><i>✓</i><span>履歴無制限</span></div><div><i>✓</i><span>自己ベスト</span></div><div><i>✓</i><span>詳細分析・推移</span></div><div><i>✓</i><span>対戦相手別の振り返り</span></div><div><i>✓</i><span>Backup / Restore</span></div></section><p class="cue-pro-price-v1" data-pro-price>価格を取得できません</p><p class="cue-pro-once-v1">一度の購入でずっと利用できます</p><button class="cue-pro-buy-v1" type="button" data-pro-buy disabled>Proを購入</button><button class="cue-pro-restore-v1" type="button" data-pro-restore>購入を復元</button><p class="cue-pro-status-v1" data-pro-status></p></main>`;
  document.body.appendChild(overlay);
  let returnFocus=null,currentSource="",replay=null,bypass=false,originScroll=null;
  const status=overlay.querySelector("[data-pro-status]");
  const captureScroll=()=>({windowX:window.scrollX,windowY:window.scrollY,elements:[...document.querySelectorAll("*")].filter(node=>node!==overlay&&(node.scrollTop||node.scrollLeft)).map(node=>({node,top:node.scrollTop,left:node.scrollLeft}))});
  function restoreScroll(snapshot){if(!snapshot)return;window.scrollTo(snapshot.windowX,snapshot.windowY);snapshot.elements.forEach(({node,top,left})=>{if(node.isConnected){node.scrollTop=top;node.scrollLeft=left}})}
  function close(unlocked=false){const snapshot=originScroll;overlay.hidden=true;document.body.classList.remove("cue-pro-open-v1");if(unlocked&&replay){const action=replay;replay=null;queueMicrotask(action)}else{try{returnFocus?.focus?.({preventScroll:true})}catch{returnFocus?.focus?.()}restoreScroll(snapshot);requestAnimationFrame(()=>restoreScroll(snapshot))}originScroll=null;currentSource=""}
  function syncPaywall(){const s=entitlement.snapshot;overlay.querySelector("[data-pro-price]").textContent=s.product?.localizedPrice||"価格を取得できません";overlay.querySelector("[data-pro-buy]").disabled=!s.product||s.status!=="ready";if(s.isPro&&!overlay.hidden)close(true)}
  function open(source,options={}){currentSource=sourceNames[source]?source:"analysis";returnFocus=options.trigger||document.activeElement;replay=typeof options.replay==="function"?options.replay:null;originScroll=captureScroll();status.textContent=`${sourceNames[currentSource]}はProで利用できます。`;status.classList.remove("is-error");overlay.hidden=false;document.body.classList.add("cue-pro-open-v1");syncPaywall();overlay.querySelector(".cue-pro-back-v1")?.focus({preventScroll:true})}
  window.CueScorePro=Object.freeze({open,close,source:()=>currentSource});
  overlay.querySelector(".cue-pro-back-v1").addEventListener("click",()=>close(false));
  overlay.querySelector("[data-pro-buy]").addEventListener("click",async()=>{status.textContent="購入を確認しています…";const result=await entitlement.purchase();if(result.status==="success")return close(true);if(result.status==="cancelled"){status.textContent="";return}if(result.status==="pending"){status.textContent="購入は保留中です。承認後に自動で反映されます。";return}status.textContent="購入を完了できませんでした。時間をおいてもう一度お試しください。";status.classList.add("is-error")});
  overlay.querySelector("[data-pro-restore]").addEventListener("click",async()=>{status.textContent="購入状況を確認しています…";status.classList.remove("is-error");const result=await entitlement.restore();if(result.status==="success")return close(true);status.textContent=result.status==="notFound"?"復元できる購入は見つかりませんでした。":"購入情報を確認できませんでした。時間をおいてもう一度お試しください。";status.classList.toggle("is-error",result.status!=="notFound")});
  entitlement.subscribe(syncPaywall);
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
