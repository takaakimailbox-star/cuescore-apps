(() => {
  "use strict";
  const app=document.querySelector(".app");
  if(!app||document.querySelector(".cue-phase1-tab-bar"))return;

  const roots=["home","player","history","settings"];
  const labels={home:"ホーム",player:"プレーヤー",history:"履歴",settings:"設定"};
  const state={active:"home",previous:{},historyDiscipline:"all"};
  const nav=document.createElement("nav");
  nav.className="cue-phase1-tab-bar";
  nav.setAttribute("aria-label","メインナビゲーション");
  nav.innerHTML=roots.map(key=>`<button type="button" role="tab" data-phase1-tab="${key}" aria-selected="${key==="home"}"><span class="cue-phase1-tab-icon ${key}" aria-hidden="true"></span><span>${labels[key]}</span></button>`).join("");
  document.body.appendChild(nav);

  const visible=node=>Boolean(node&&!node.classList.contains("hidden")&&getComputedStyle(node).display!=="none");
  const rootSelector={
    player:"#playerLibraryOverlay,#playerStatsOverlay,.player-journey-overlay-v2,.pd12-trends",
    history:"#recordsScreen",
    settings:"#settingsScreen,#settingsSuiteScreenV2,.settings-suite-screen-v2,#dataManagementScreen"
  };
  const scrollHost=node=>node?.querySelector(".player-library-main,.player-stats-body,.player-journey-scroll-v2,.pd12-trends-scroll,.records-list,.settings-formal-scroll-v1,.settings-suite-scroll-v2,.data-management-content")||node;
  const snapshot=key=>{
    if(key==="home")return {selector:"home",scroll:window.scrollY};
    const nodes=[...document.querySelectorAll(rootSelector[key]||"")];
    const node=nodes.reverse().find(visible);
    if(!node)return {selector:"root",scroll:0};
    if(!node.id)node.dataset.phase1StateId=node.dataset.phase1StateId||`${key}-${Date.now()}`;
    return {selector:node.id?`#${node.id}`:`[data-phase1-state-id="${node.dataset.phase1StateId}"]`,scroll:scrollHost(node)?.scrollTop||0};
  };
  const setActive=key=>{
    state.active=key;
    roots.forEach(item=>nav.querySelector(`[data-phase1-tab="${item}"]`)?.setAttribute("aria-selected",String(item===key)));
    document.body.dataset.cuePhase1Tab=key;
    document.querySelector("#recordsBackV2")?.toggleAttribute("data-phase1-root-back",key==="history");
    document.querySelector("[data-settings-home-back]")?.toggleAttribute("data-phase1-root-back",key==="settings");
    document.querySelector("#playerLibraryBackBtn")?.toggleAttribute("data-phase1-root-back",key==="player"&&visible(document.querySelector("#playerLibraryMain")));
  };
  const closeMatchDetail=()=>{
    const detail=document.getElementById("recordDetailOverlay");
    if(!visible(detail))return;
    if(typeof window.closeFormalMatchDetailV2==="function")window.closeFormalMatchDetailV2();
    detail.classList.add("hidden");detail.setAttribute("aria-hidden","true");
    document.body.classList.remove("match-detail-visible-v1");
  };
  const hideTransientPlayerViews=()=>document.querySelectorAll("#playerLibraryOverlay,#playerStatsOverlay,.player-journey-overlay-v2,.pd12-trends").forEach(node=>{node.classList.add("hidden");node.setAttribute("aria-hidden","true")});
  const closeSettingsRoot=()=>{
    if(!app.classList.contains("settings-mode"))return;
    document.getElementById("settingsBackBtn")?.click();
    app.classList.remove("settings-mode");
    const screen=document.getElementById("settingsScreen");
    screen?.classList.add("hidden");screen?.setAttribute("aria-hidden","true");
  };
  const closeHistoryRoot=()=>{
    if(!app.classList.contains("records-mode"))return;
    document.getElementById("recordsBackV2")?.click();
    app.classList.remove("records-mode");
    const screen=document.getElementById("recordsScreen");
    screen?.classList.add("hidden");screen?.setAttribute("aria-hidden","true");
  };
  const leaveTopLevel=key=>{
    closeMatchDetail();
    if(key!=="settings")closeSettingsRoot();
    if(key!=="history")closeHistoryRoot();
    if(key!=="player")hideTransientPlayerViews();
  };
  const enforceRootVisibility=key=>{
    const settings=document.getElementById("settingsScreen"),history=document.getElementById("recordsScreen");
    settings?.classList.toggle("hidden",key!=="settings");settings?.setAttribute("aria-hidden",String(key!=="settings"));
    history?.classList.toggle("hidden",key!=="history");history?.setAttribute("aria-hidden",String(key!=="history"));
    if(key!=="player")hideTransientPlayerViews();
    app.classList.toggle("settings-mode",key==="settings");
    app.classList.toggle("records-mode",key==="history");
  };
  const openRoot=key=>{
    leaveTopLevel(key);
    if(key==="home"){window.scrollTo(0,0)}
    if(key==="player"){document.body.dataset.cuePlayerContext="browse";hideTransientPlayerViews();document.getElementById("playerManagementBtn")?.click();const title=document.getElementById("playerLibraryTitle");if(title)title.textContent="プレーヤー";document.querySelector("#playerLibraryMain")?.scrollTo?.(0,0)}
    if(key==="history"){document.getElementById("recordsBtn")?.click();document.querySelector("#recordsList")?.scrollTo?.(0,0)}
    if(key==="settings"){document.getElementById("settingsBtn")?.click();document.querySelector(".settings-formal-scroll-v1")?.scrollTo?.(0,0)}
    enforceRootVisibility(key);
    setActive(key);
  };
  const restore=key=>{
    const saved=state.previous[key];
    if(!saved||saved.selector==="root"||saved.selector==="home"){openRoot(key);if(key==="home"&&saved)window.scrollTo(0,saved.scroll||0);return}
    if(key==="player")openRoot("player");
    else if(key==="history"){openRoot("history");const filter=state.historyDiscipline||"all";if(filter!=="all")document.querySelector(`[data-records-discipline-v2="${filter}"]`)?.click()}
    else if(key==="settings")openRoot("settings");
    const node=document.querySelector(saved.selector);
    if(node){if(key==="player")document.getElementById("playerLibraryOverlay")?.classList.add("hidden");node.classList.remove("hidden");node.setAttribute("aria-hidden","false");requestAnimationFrame(()=>{const host=scrollHost(node);if(host)host.scrollTop=saved.scroll||0})}
    setActive(key);
  };
  const go=key=>{
    if(!roots.includes(key)||isMatchMode())return;
    const retap=key===state.active;
    state.previous[state.active]=snapshot(state.active);
    const selected=document.querySelector('[data-records-discipline-v2].is-selected')?.dataset.recordsDisciplineV2;
    if(selected)state.historyDiscipline=selected;
    if(retap)openRoot(key);else restore(key);
  };
  nav.addEventListener("click",event=>{const key=event.target.closest("[data-phase1-tab]")?.dataset.phase1Tab;if(key)go(key)});

  const isMatchMode=()=>app.classList.contains("pro-game-mode")||(!document.getElementById("proGameScreen")?.classList.contains("hidden")&&document.getElementById("proGameScreen")?.offsetParent!==null);
  const reconcile=()=>{
    const match=isMatchMode();
    nav.hidden=match;
    document.body.classList.toggle("cue-phase1-normal-mode",!match);
    document.body.classList.toggle("cue-phase1-match-mode",match);
    if(!match){
      if(app.classList.contains("records-mode"))setActive("history");
      else if(app.classList.contains("settings-mode"))setActive("settings");
      else if(visible(document.getElementById("playerLibraryOverlay"))||visible(document.getElementById("playerStatsOverlay"))||[...document.querySelectorAll(".player-journey-overlay-v2,.pd12-trends")].some(visible))setActive("player");
    }
    const title=document.getElementById("playerLibraryTitle");
    if(state.active==="player"&&title?.textContent==="プレーヤー一覧")title.textContent="プレーヤー";
  };
  let reconcileQueued=false;
  const scheduleReconcile=()=>{
    if(reconcileQueued)return;
    reconcileQueued=true;
    requestAnimationFrame(()=>{reconcileQueued=false;reconcile()});
  };
  new MutationObserver(scheduleReconcile).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class","aria-hidden"]});
  document.addEventListener("click",event=>{if(event.target.closest("[data-records-discipline-v2]")){const key=event.target.closest("[data-records-discipline-v2]").dataset.recordsDisciplineV2;state.historyDiscipline=key||"all"}},true);
  window.CueScoreNavigationPhase1=Object.freeze({go,openRoot,restore,state,isMatchMode,reconcile,leaveTopLevel,enforceRootVisibility,tabCount:()=>nav.querySelectorAll("[data-phase1-tab]").length});
  reconcile();
})();
