(() => {
  "use strict";
  const body=document.getElementById("playerStatsBody"),title=document.getElementById("playerStatsTitle"),action=document.getElementById("playerStatsRace");
  const api=window.CueScoreBuild4Metrics;
  if(!body||!api||typeof window.renderFormalPlayerDetailV1!=="function")return;

  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const defs=[
    {id:"9ball",label:"9-Ball",asset:"assets/icons/games/game-9ball.svg"},{id:"10ball",label:"10-Ball",asset:"assets/icons/games/game-10ball.svg"},
    {id:"rotation",label:"Rotation",asset:"assets/icons/games/game-rotation.svg"},{id:"straightPool",label:"14-1",asset:"assets/icons/games/game-14-1.svg"},
    {id:"jpa9",label:"JPA 9-Ball",asset:"assets/icons/games/game-jpa-9ball.svg"},{id:"threeCushion",label:"3 Cushion",asset:"assets/icons/games/game-3cushion.svg"}
  ];
  const labels={winRate:window.cueT("p3.bab1876f"),shotRate:window.cueT("p3.274e5e0c"),breakInRate:window.cueT("p3.535112ba"),masuwariRate:window.cueT("p3.991f3795"),average:window.cueT("p3.d247b2e7"),highRun:window.cueT("p3.761345d1")};
  const metricKeys={"9ball":["shotRate","breakInRate","masuwariRate"],"10ball":["shotRate","breakInRate","masuwariRate"],rotation:["shotRate","breakInRate","highRun"],jpa9:["average","breakInRate","highRun"],straightPool:["average","highRun"],threeCushion:["average","highRun"]};
  const bestLabels={shotRate:window.cueT("p3.0cb79ad2"),breakInRate:window.cueT("p3.efe3b953"),masuwariRate:window.cueT("p3.f2a866da"),masuwariCount:window.cueT("p3.c4fa5775"),breakPocketCount:window.cueT("p3.e3861823"),breakScore:window.cueT("p3.fd906f8d"),highRun:window.cueT("p3.1badb93c"),score:window.cueT("p3.176c82bc"),average:window.cueT("p3.f92ff052"),leastWinningInnings:window.cueT("p3.97184347")};
  const percent=new Set(["winRate","shotRate","breakInRate","masuwariRate"]),playerState=new Map();
  const def=id=>defs.find(item=>item.id===id)||defs[0];
  const players=()=>typeof readPlayerLibrary==="function"?readPlayerLibrary():[];
  const side=(record,player)=>typeof playerSideInRecord==="function"?Number(playerSideInRecord(record,player))||0:0;
  const discipline=record=>window.CueScoreAnalysisV2Context?.discipline?.(record)||"rotation";
  const dateValue=record=>new Date(record?.endedAt||record?.playedAt||record?.startedAt||0).getTime()||0;
  const recordsFor=player=>(typeof recordsForRegisteredPlayer==="function"?recordsForRegisteredPlayer(player):[]).filter(record=>side(record,player)).sort((a,b)=>dateValue(b)-dateValue(a));
  const won=(record,s)=>Number(record?.winner||record?.winnerSide||record?.result?.winnerSide||0)===Number(s);
  const metric=(record,s)=>typeof savedPlayerMetricsV113==="function"?savedPlayerMetricsV113(record,s)||{}:{};
  const recordPlayer=(record,s)=>record?.players?.[s]||{};
  const helpers={side,won,metric,recordPlayer,completedTurns:(record,s)=>window.CueScoreAnalysisV2Context?.completedTurns?.(record,s)??window.inningsCountNumberV1?.(record,s),discipline,masuwariCounts:record=>window.rackGameMasuwariCountsV1?.(record)||{1:0,2:0}};
  const fmt=(key,value)=>value==null?"—":percent.has(key)?`${Number(value).toFixed(1)}%`:key==="average"?Number(value).toFixed(3).replace(/0+$/,"").replace(/\.$/,""):String(Math.round(Number(value)*100)/100);
  const avatar=player=>typeof playerAvatarHtmlV2==="function"?playerAvatarHtmlV2(player,"player-avatar-v2"):"";
  const playerProfile=data=>players().find(item=>String(item.id)===String(data?.registeredPlayerId||""))||data||{};
  const opponent=(record,s)=>playerProfile(recordPlayer(record,s===1?2:1));
  const score=(record,s)=>Number(metric(record,s)?.score??recordPlayer(record,s)?.score)||0;
  const dateText=record=>{const d=new Date(dateValue(record));return dateValue(record)?window.cueDate(d,"md"):window.cueT("p3.6b344146");};
  const stateFor=id=>{const key=String(id);if(!playerState.has(key))playerState.set(key,{discipline:"9ball",tab:"results",scroll:{results:0,matches:0,analysis:0}});return playerState.get(key);};
  const active={playerId:"",player:null,state:null,records:[]};

  const syncLegacyState=()=>{const legacy=window.CueScoreBuild6PlayerDetail?.state;if(!legacy)return;legacy.playerId=active.playerId;legacy.player=active.player;legacy.discipline=active.state.discipline;legacy.level="hub";};
  const profile=player=>`<section class="hub-profile-v2"><span class="hub-avatar-v2">${avatar(player)}</span><span><strong title="${esc(player.name)}">${esc(player.name)}</strong>${player.isPrimary===true?'<b>' + window.cueT("p3.af7f8f12") + '</b>':""}</span></section>`;
  const selector=state=>`<div class="hub-discipline-v2" role="tablist" aria-label="${window.cueT("p3.839449dc")}">${defs.map(item=>`<button type="button" role="tab" data-hub-discipline="${item.id}" aria-label="${item.label}" aria-selected="${item.id===state.discipline}" class="${item.id===state.discipline?"is-selected":""}"><img src="${item.asset}" alt="" aria-hidden="true"></button>`).join("")}</div>`;
  const tabs=state=>`<div class="hub-tabs-v2" role="tablist" aria-label="${window.cueT("p3.6144e404")}">${[["results",window.cueT("p3.b65af422")],["matches",window.cueT("p3.3573405f")],["analysis",window.cueT("p3.9c00c951")]].map(([key,label])=>`<button type="button" role="tab" data-hub-tab="${key}" aria-selected="${state.tab===key}" class="${state.tab===key?"is-selected":""}">${label}</button>`).join("")}</div>`;
  const empty=text=>`<section class="hub-card-v2 hub-empty-v2">${text}</section>`;
  const bestLabel=(key,disciplineId)=>key==="leastWinningInnings"&&disciplineId==="jpa9"?window.cueT("p3.2c53b0db"):bestLabels[key]||key;
  const displayedBestsFor=(records,player,disciplineId)=>api.bests(records,player,disciplineId,helpers).slice(0,3);
  const matchRow=(record,player)=>{const s=side(record,player),o=opponent(record,s),isWin=won(record,s),cardClass=window.CueScoreMatchCardC?.classes?.("recent")||"match-card-c-v37 match-card-c-recent-v37";return `<button type="button" class="hub-match-row-v2 ${cardClass}" data-hub-match="${esc(record.id)}"><small class="match-card-c-date-v37">${dateText(record)}</small><span class="match-card-c-avatar-v37">${avatar(o)}</span><strong class="match-card-c-opponent-v37">${esc(o.name||window.cueT("p3.b448aa33"))}</strong><span class="match-card-c-result-v37 ${isWin?"is-win":"is-loss"}">${isWin?window.cueT("p3.2c8bd192"):window.cueT("p3.0e371a7b")}</span><span class="match-card-c-score-v37">${score(record,s)}<i>−</i>${score(record,s===1?2:1)}</span><b aria-hidden="true">›</b></button>`;};

  function resultsView(records,player,state){
    const all=api.aggregate(records,player,helpers),bests=displayedBestsFor(records,player,state.discipline);
    const bestContent=window.CueScoreEntitlement?.isPro?.()
      ? (bests.length?`<section class="hub-bests-v2">${bests.map(best=>`<button type="button" data-hub-match="${esc(best.record.id)}"><strong>${fmt(best.key,best.value)}</strong><span>${bestLabel(best.key,state.discipline)}</span><small>${window.cueT("p3.f3717e0d",{p:dateText(best.record)})}</small></button>`).join("")}</section>`:empty(window.cueT("p3.70add6e1")))
      : `<button type="button" class="cue-pro-locked-card-v1" data-pro-personal-best><span><strong>${window.cueT("p3.d134cd45")}</strong><small>${window.cueT("p3.a06f3aa0")}</small></span><span class="cue-pro-badge-v1">🔒 Pro</span></button>`;
    return `<section class="hub-summary-v2"><article><span>${window.cueT("p3.7437a3a0")}</span><strong>${all.games}</strong></article><article><span>${window.cueT("p3.5408a70d")}</span><strong>${all.wins}</strong></article><article><span>${window.cueT("p3.dfc2567e")}</span><strong>${all.losses}</strong></article><article><span>${window.cueT("p3.bab1876f")}</span><strong>${fmt("winRate",all.winRate)}</strong></article></section>
      ${bestContent}`;
  }

  function matchesView(records,player,state){
    const recent=records.slice(0,3);
    return `<h2 class="hub-heading-v2">${window.cueT("p3.499d9c85")}</h2>${recent.length?`<section class="hub-match-list-v2">${recent.map(record=>matchRow(record,player)).join("")}</section>`:empty(window.cueT("p3.98769795"))}
      <h2 class="hub-heading-v2">${window.cueT("p3.3a25b687")}</h2><section class="hub-links-v2"><button type="button" data-hub-all-matches><span><strong>${window.cueT("p3.7e415f2b")}</strong><small>${window.cueT("p3.172c9590",{label:def(state.discipline).label})}</small></span><b>›</b></button><button type="button" data-hub-opponents><span><strong>${window.cueT("p3.0214e271")}</strong><small>${window.cueT("p3.73f3ded2")}</small></span><b>›</b></button></section>`;
  }

  function points(current,previous,state){
    if(previous.games<1)return{strength:window.cueT("p3.6e4e6503"),challenge:window.cueT("p3.c75087a3")};
    const changes=(metricKeys[state.discipline]||[]).map(key=>{const now=current[key],before=previous[key];if(!Number.isFinite(now)||!Number.isFinite(before))return null;return{key,score:now-before};}).filter(Boolean);
    if(!changes.length)return{strength:window.cueT("p3.0416920e"),challenge:window.cueT("p3.c75087a3")};
    const best=[...changes].sort((a,b)=>b.score-a.score)[0],worst=[...changes].sort((a,b)=>a.score-b.score)[0];
    return{strength:best.score>0?window.cueT(`p3.9d4a24be`,{p:labels[best.key]}):window.cueT(`p3.c101bd31`,{p:labels[best.key]}),challenge:worst.score<0?window.cueT(`p3.e1495236`,{p:labels[worst.key]}):window.cueT("p3.8697157f")};
  }

  function analysisView(records,player,state){
    if(!window.CueScoreEntitlement?.isPro?.())return `<button type="button" class="cue-pro-locked-card-v1" data-hub-tab="analysis"><span><strong>${window.cueT("p3.9c00c951")}</strong><small>${window.cueT("p3.bc5bde5a")}</small></span><span class="cue-pro-badge-v1">🔒 Pro</span></button>`;
    const currentRecords=records.slice(0,10),previousRecords=records.slice(10,20),current=api.aggregate(currentRecords,player,helpers),previous=api.aggregate(previousRecords,player,helpers),keys=metricKeys[state.discipline]||[],advice=points(current,previous,state),bests=displayedBestsFor(records,player,state.discipline);
    const statusCode=current.games<3?"accumulating":previous.games<3?"stable":current.winRate>previous.winRate?"improving":current.winRate<previous.winRate?"attention":"stable",status={accumulating:window.cueT("p3.4888b9a0"),stable:window.cueT("p3.a5c2a649"),improving:window.cueT("p3.6f24b9c6"),attention:window.cueT("p3.df94c8f6")}[statusCode];
    return `<section class="hub-card-v2 hub-now-v2"><div><h2>${window.cueT("p3.e91a2ca3")}</h2><b>${status}</b></div><strong>${current.games?window.cueT(`p3.921f213e`,{games:current.games,wins:current.wins,losses:current.losses,round:Math.round(current.winRate),count:current.games}):window.cueT("p3.e63fcd05")}</strong><small>${window.cueT("p3.9db4f96e")}</small></section>
      <h2 class="hub-heading-v2">${window.cueT("p3.c81f42f6")}</h2><section class="hub-metrics-v2">${keys.map(key=>`<article><strong>${fmt(key,current[key])}</strong><span>${labels[key]}</span></article>`).join("")||"<span>" + window.cueT("p3.e63fcd05") + "</span>"}</section>
      <section class="hub-links-v2"><button type="button" data-hub-trends><span><strong>${window.cueT("p3.ad2c6057")}</strong><small>${window.cueT("p3.29fc9aba")}</small></span><b>›</b></button></section>
      <section class="hub-card-v2 hub-points-v2"><h2>${window.cueT("p3.c159d19f")}</h2><div><strong>${window.cueT("p3.1cd6f4c3")}</strong><span>${advice.strength}</span></div><div><strong>${window.cueT("p3.fd2bbedb")}</strong><span>${advice.challenge}</span></div></section>
      <h2 class="hub-heading-v2">${window.cueT("p3.d134cd45")}</h2>${bests.length?`<section class="hub-bests-v2">${bests.map(best=>`<button type="button" data-hub-match="${esc(best.record.id)}"><strong>${fmt(best.key,best.value)}</strong><span>${bestLabel(best.key,state.discipline)}</span><small>${window.cueT("p3.f3717e0d",{p:dateText(best.record)})}</small></button>`).join("")}</section>`:empty(window.cueT("p3.70add6e1"))}`;
  }

  function render(playerId,options={}){
    const player=players().find(item=>String(item.id)===String(playerId));if(!player)return;
    if(active.playerId&&active.state){const panel=body.querySelector(".hub-content-v2");active.state.scroll[active.state.tab]=panel?.scrollTop||body.scrollTop||0;}
    active.playerId=String(playerId);active.player=player;active.state=stateFor(playerId);
    if(options.discipline)active.state.discipline=options.discipline;if(options.tab)active.state.tab=options.tab;
    active.records=recordsFor(player).filter(record=>discipline(record)===active.state.discipline);syncLegacyState();
    if(title)title.textContent=window.cueT("p3.3a30a11d");
    const management=document.body.dataset.cuePlayerContext==="management"&&typeof playerStatsReturnToManagementV147!=="undefined"&&playerStatsReturnToManagementV147===true;
    if(action)action.textContent=management?window.cueT("p3.d107b864"):"";
    const content=active.state.tab==="matches"?matchesView(active.records,player,active.state):active.state.tab==="analysis"?analysisView(active.records,player,active.state):resultsView(active.records,player,active.state);
    body.innerHTML=`<div class="player-hub-v2">${profile(player)}${selector(active.state)}${tabs(active.state)}<div class="hub-content-v2" data-hub-content>${content}</div></div>`;
    requestAnimationFrame(()=>{const panel=body.querySelector(".hub-content-v2");if(panel)panel.scrollTop=active.state.scroll[active.state.tab]||0;});
    window.CueScorePro?.decorate?.();
  }

  const snapshot=()=>{
    if(!active.playerId||!active.state)return null;
    const panel=body.querySelector(".hub-content-v2");
    active.state.scroll[active.state.tab]=panel?.scrollTop||body.scrollTop||0;
    return {playerId:active.playerId,discipline:active.state.discipline,tab:active.state.tab,scrollTop:active.state.scroll[active.state.tab]||0};
  };
  const restore=saved=>{
    if(!saved?.playerId)return false;
    const state=stateFor(saved.playerId);
    state.discipline=saved.discipline||state.discipline;
    state.tab=saved.tab||state.tab;
    state.scroll[state.tab]=Number(saved.scrollTop)||0;
    const library=document.getElementById("playerLibraryOverlay"),overlay=document.getElementById("playerStatsOverlay");
    library?.classList.add("hidden");library?.setAttribute("aria-hidden","true");window.CueScoreBuild18PlayerSelection?.refreshSoon?.();
    overlay?.classList.remove("hidden");overlay?.setAttribute("aria-hidden","false");
    render(saved.playerId,{discipline:state.discipline,tab:state.tab});
    return true;
  };
  window.CueScorePlayerHubV2=Object.freeze({snapshot,restore});

  const previous=window.renderFormalPlayerDetailV1;
  window.renderFormalPlayerDetailV1=function(playerId){previous?.(playerId);render(playerId);};
  body.addEventListener("click",event=>{
    const disciplineButton=event.target.closest("[data-hub-discipline]");if(disciplineButton){render(active.playerId,{discipline:disciplineButton.dataset.hubDiscipline});return;}
    const tab=event.target.closest("[data-hub-tab]");if(tab){render(active.playerId,{tab:tab.dataset.hubTab});return;}
    const match=event.target.closest("[data-hub-match]");if(match){window.openMatchDetailV1?.(match.dataset.hubMatch);return;}
    if(event.target.closest("[data-hub-all-matches]")){event.preventDefault();event.stopImmediatePropagation();(window.CueScorePlayerJourneyV2?.openHistory||window.openPlayerMatchHistoryV2)?.(active.playerId,active.state.discipline);return;}
    if(event.target.closest("[data-hub-opponents]")){event.preventDefault();event.stopImmediatePropagation();(window.CueScorePlayerJourneyV2?.openRivals||window.openPlayerOpponentRecordsV2)?.(active.playerId,active.state.discipline);return;}
    if(event.target.closest("[data-hub-trends]")){syncLegacyState();window.CueScoreUiRevisionV12?.openTrends?.();return;}
    if(event.target.closest("[data-hub-full-analysis]")){window.openPlayerAnalysisForPlayerV5?.(active.playerId,active.state.discipline);return;}
  },true);

  const reconcilePlayerRoot=()=>{
    const browse=document.body.dataset.cuePlayerContext==="browse",overlay=document.getElementById("playerLibraryOverlay");
    if(!browse||!overlay||overlay.classList.contains("hidden"))return;
    const add=document.getElementById("playerLibraryAddBtn"),register=document.getElementById("playerLibraryRegisterBtnV2");
    add?.style.setProperty("display","grid","important");if(register)register.hidden=true;
  };
  let playerReconcileQueued=false;
  const schedulePlayerReconcile=()=>{
    if(playerReconcileQueued)return;
    playerReconcileQueued=true;
    requestAnimationFrame(()=>{playerReconcileQueued=false;reconcilePlayerRoot()});
  };
  new MutationObserver(schedulePlayerReconcile).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class","style","data-cue-player-context"]});
  const home=document.getElementById("cueHomeV1"),resume=document.getElementById("cueResumeCardV1");
  if(home&&resume&&!home.querySelector("[data-home-new-match-v2]")){
    const newMatch=document.createElement("button");newMatch.type="button";newMatch.className="home-new-match-v2";newMatch.dataset.homeNewMatchV2="true";newMatch.innerHTML=`<span aria-hidden="true">＋</span><strong>${window.cueT("home.newMatch")}</strong><b aria-hidden="true">›</b>`;
    resume.insertAdjacentElement("afterend",newMatch);
    const switcher=document.getElementById("cueDisciplineSwitcherV1"),setup=document.querySelector(".cue-new-match-integrated-v2"),back=document.getElementById("cueMatchSetupBackV3");
    if(switcher&&setup&&back)back.insertAdjacentElement("afterend",switcher);
    back?.remove();
    newMatch.addEventListener("click",()=>{
      const selected=switcher?.querySelector("[data-discipline].is-selected")||switcher?.querySelector("[data-discipline]");
      if(selected)selected.click();else window.openCueMatchSetupV3?.();
    });
    const markSelectorEvent=event=>{const button=event.target.closest?.("[data-discipline]");if(button)window.CueScoreSelectorTraceV1?.mark(`event:${event.type}`,{disciplineId:button.dataset.discipline,isTrusted:event.isTrusted,pointerType:event.pointerType||"",cancelable:event.cancelable,defaultPrevented:event.defaultPrevented});};
    ["touchstart","touchend","pointerdown","pointerup","click"].forEach(type=>switcher?.addEventListener(type,markSelectorEvent,{capture:true,passive:type!=="click"}));
    switcher?.addEventListener("click",event=>{
      const button=event.target.closest("[data-discipline]");if(!button)return;
      const started=performance.now();
      requestAnimationFrame(()=>{
        const container=button.parentElement,buttonRect=button.getBoundingClientRect(),containerRect=container?.getBoundingClientRect();
        if(containerRect&&(buttonRect.left<containerRect.left||buttonRect.right>containerRect.right))button.scrollIntoView({behavior:"auto",block:"nearest",inline:"nearest"});
        window.CueScoreSelectorTraceV1?.mark("scroll-adjust:complete",{disciplineId:button.dataset.discipline,duration:performance.now()-started});
      });
    },true);
  }

  window.CueScoreNavigationPhase2To6=Object.freeze({render,stateFor,active,tabCount:()=>body.querySelectorAll("[data-hub-tab]").length,disciplineCount:()=>body.querySelectorAll("[data-hub-discipline]").length});
})();
