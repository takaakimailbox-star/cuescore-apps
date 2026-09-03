(() => {
  "use strict";
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const matchCardCClassV37=context=>`match-card-c-v37 match-card-c-${String(context||"default")}-v37`;
  window.CueScoreMatchCardC=Object.freeze({classes:matchCardCClassV37});
  const defs=[
    {id:"9ball",label:"9-Ball"},{id:"10ball",label:"10-Ball"},{id:"rotation",label:"Rotation"},
    {id:"straightPool",label:"14-1"},{id:"jpa9",label:"JPA 9-Ball"},{id:"threeCushion",label:"3 Cushion"}
  ];
  const def=id=>defs.find(item=>item.id===id)||defs[0];
  const detail=()=>window.CueScoreBuild6PlayerDetail;
  const side=(record,player)=>typeof window.playerSideInRecord==="function"?Number(window.playerSideInRecord(record,player))||0:0;
  const won=(record,s)=>Number(record?.winner||record?.winnerSide||record?.result?.winnerSide||0)===Number(s);
  const metric=(record,s)=>typeof window.savedPlayerMetricsV113==="function"?window.savedPlayerMetricsV113(record,s)||{}:{};
  const recordPlayer=(record,s)=>record?.players?.[s]||{};
  const discipline=record=>window.CueScoreAnalysisV2Context?.discipline?.(record)||"rotation";
  const helpers={side,won,metric,recordPlayer,completedTurns:(record,s)=>window.CueScoreAnalysisV2Context?.completedTurns?.(record,s)??window.inningsCountNumberV1?.(record,s),discipline,masuwariCounts:record=>window.rackGameMasuwariCountsV1?.(record)||{1:0,2:0}};

  function reviseDetail(){
    const body=document.getElementById("playerStatsBody");if(!body||!body.querySelector(".pd7-shell"))return;
    body.querySelectorAll("[data-pd7-metric-trend]").forEach(node=>{node.removeAttribute("data-pd7-metric-trend");node.setAttribute("data-pd12-static","");node.removeAttribute("aria-label");});
    body.querySelector("[data-pd7-trend-modal]")?.remove();
    body.querySelector(".pd12-graph-entry")?.remove();
    const active=detail()?.state?.discipline;
    if(["rotation","straightPool","jpa9"].includes(active))body.querySelectorAll(".pd7-best").forEach(card=>{if(card.textContent.includes("1試合最高得点")||card.textContent.includes("1試合最多得点"))card.remove();});
  }
  new MutationObserver(reviseDetail).observe(document.getElementById("playerStatsBody"),{subtree:true,childList:true});

  const time=record=>new Date(record?.endedAt||record?.playedAt||record?.startedAt||0).getTime()||0;
  const stable=(a,b)=>String(a??"").localeCompare(String(b??""),"ja",{numeric:true});
  function revisePlayerList(){
    const root=document.getElementById("playerLibraryOverlay"),list=document.getElementById("playerLibraryList");if(!root?.classList.contains("player-management-formal-v1")||!list)return;
    const players=typeof window.readPlayerLibrary==="function"?window.readPlayerLibrary():[];
    const latest=new Map(players.map(player=>[String(player.id),Math.max(0,...(window.recordsForRegisteredPlayer?.(player)||[]).map(time))]));
    const order=[...players].sort((a,b)=>Number(b.isPrimary===true)-Number(a.isPrimary===true)||(latest.get(String(b.id))||0)-(latest.get(String(a.id))||0)||stable(a.id,b.id));
    const current=[...list.querySelectorAll("[data-stats-player]")],wanted=order.map(player=>String(player.id)).filter(id=>current.some(row=>String(row.dataset.statsPlayer)===id));
    if(current.map(row=>String(row.dataset.statsPlayer)).join("|")===wanted.join("|"))return;
    const rows=new Map(current.map(row=>[String(row.dataset.statsPlayer),row]));wanted.forEach(id=>list.appendChild(rows.get(id)));
  }
  new MutationObserver(revisePlayerList).observe(document.getElementById("playerLibraryList"),{childList:true});

  function reviseRivals(){
    const root=document.getElementById("playerOpponentRecordsV2");if(!root||root.classList.contains("hidden"))return;
    root.querySelectorAll(".journey-summary-v2,.journey-segment-v2").forEach(node=>node.remove());
    const select=root.querySelector(".journey-discipline-v2 select");if(select){const fixed=document.createElement("span");fixed.className="pd12-fixed-discipline";fixed.textContent=select.selectedOptions[0]?.textContent||def(detail()?.state?.discipline).label;select.replaceWith(fixed);}
    const context=root.querySelector(".journey-player-v2");if(context){context.classList.add("pd13-rival-context","page-rival-context-v1");context.classList.remove("player-journey-card-v2");context.setAttribute("aria-label",`${context.querySelector("strong")?.textContent||"Player"}、${context.querySelector(".pd12-fixed-discipline")?.textContent||"競技"}の対戦相手別成績`);}
    const player=detail()?.state?.player,active=detail()?.state?.discipline;if(!player||!active)return;
    const latest=new Map();(window.recordsForRegisteredPlayer?.(player)||[]).filter(record=>discipline(record)===active).forEach(record=>{const s=side(record,player),raw=recordPlayer(record,s===1?2:1),key=String(raw.registeredPlayerId||raw.name||"");latest.set(key,Math.max(latest.get(key)||0,time(record)));});
    const list=root.querySelector(".journey-list-v2");if(list){const current=[...list.querySelectorAll("[data-rival-opponent]")],ordered=[...current].sort((a,b)=>(latest.get(b.dataset.rivalOpponent)||0)-(latest.get(a.dataset.rivalOpponent)||0)||stable(a.dataset.rivalOpponent,b.dataset.rivalOpponent));if(current.some((row,index)=>row!==ordered[index]))ordered.forEach(row=>list.appendChild(row));}
  }
  const rivals=document.getElementById("playerOpponentRecordsV2");if(rivals)new MutationObserver(()=>requestAnimationFrame(reviseRivals)).observe(rivals,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
  const openRivalsBase=window.openPlayerOpponentRecordsV2;
  window.openPlayerOpponentRecordsV2=(...args)=>{openRivalsBase?.(...args);reviseRivals();};

  function reviseHistory(){
    const root=document.getElementById("playerMatchHistoryV2");if(!root||root.classList.contains("hidden"))return;
    const opponentFixed=Boolean(root.dataset.pd8Opponent),disciplineFixed=Boolean(root.dataset.pd8Discipline)&&!opponentFixed,opponent=root.querySelector(".journey-history-opponent-v11");
    if(opponentFixed)opponent?.remove();
    if(disciplineFixed){const active=root.dataset.pd8Discipline,title=root.querySelector(".player-journey-header-v2 h1"),label=`${def(active).label}の全試合`;root.querySelector(".player-history-disciplines-v4")?.remove();if(title){if(title.textContent!==label)title.textContent=label;if(title.getAttribute("aria-label")!==label)title.setAttribute("aria-label",label);}}
    root.querySelector("[data-history-period]")?.remove();
    root.querySelectorAll("[data-player-analysis-record-id]").forEach(node=>node.remove());
    root.querySelectorAll("[data-player-record-id]").forEach(row=>{
      row.classList.remove("match-card-c-opponent-v37","match-card-c-all-matches-v37","match-card-c-player-history-v37");
      row.classList.add(...matchCardCClassV37(opponentFixed?"opponent":disciplineFixed?"all-matches":"player-history").split(" "));
      row.classList.toggle("pd13-opponent-match",opponentFixed);row.classList.toggle("pd13-fixed-discipline-match",disciplineFixed);row.classList.toggle("pd13-player-match",!opponentFixed&&!disciplineFixed);
      const date=row.querySelector(".journey-match-date-v3");
      if((opponentFixed||disciplineFixed)&&date){const match=date.textContent.match(/\d{4}\/(\d{2})\/(\d{2})(（.）)\s+(\d{2}:\d{2})/);if(match)date.textContent=`${Number(match[1])}/${Number(match[2])}${match[3]} ${match[4]}`;}
      if(opponentFixed){row.querySelector(".journey-match-vs-v3")?.remove();row.querySelector(".journey-match-opponent-avatar-v3")?.remove();row.querySelector(".journey-match-opponent-v3>strong")?.remove();}
      if(disciplineFixed)row.querySelector(".journey-match-vs-v3")?.remove();
      if(!row.dataset.pd13DetailLabel){const detailSuffix="、試合詳細を開く",currentLabel=row.getAttribute("aria-label")||"試合";row.setAttribute("aria-label",`${currentLabel}${detailSuffix}`);row.dataset.pd13DetailLabel="true";}const open=row.querySelector(".journey-match-open-v3");if(open){if(open.textContent!=="›")open.textContent="›";open.setAttribute("aria-hidden","true");}
    });
  }
  const history=document.getElementById("playerMatchHistoryV2");if(history)new MutationObserver(()=>requestAnimationFrame(reviseHistory)).observe(history,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
  const openHistoryBase=window.openPlayerMatchHistoryV2;
  window.openPlayerMatchHistoryV2=(...args)=>{openHistoryBase?.(...args);reviseHistory();};
  document.addEventListener("click",event=>{if(event.target.closest("#playerOpponentRecordsV2 [data-rival-opponent]"))reviseHistory();});

  let matchDetailReturn=null;
  const rememberMatchDetailOrigin=event=>{const row=event.target.closest?.("#playerMatchHistoryV2 [data-player-record-id]");if(row)matchDetailReturn={opponentKey:history?.dataset.pd8Opponent||""};};
  document.addEventListener("click",rememberMatchDetailOrigin,true);
  document.addEventListener("keydown",event=>{if(["Enter"," "].includes(event.key))rememberMatchDetailOrigin(event);},true);
  const closeMatchDetailBase=window.closeFormalMatchDetailV2;
  window.closeFormalMatchDetailV2=()=>{const origin=matchDetailReturn;closeMatchDetailBase?.();if(origin){history?.classList.remove("hidden");history?.setAttribute("aria-hidden","false");matchDetailReturn=null;}};

  // Build 34: one exact opening-context snapshot for every Match Detail entry.
  // Earlier layers remembered only Player History rows, leaving direct Player Hub
  // and Personal Best entries with no deterministic return owner on iOS.
  let exactMatchDetailOrigin=null;
  const visible=node=>Boolean(node&&!node.classList.contains("hidden")&&node.getAttribute("aria-hidden")!=="true");
  const captureExactOrigin=target=>{
    const playerStats=document.getElementById("playerStatsOverlay"),records=document.querySelector(".records-screen:not(.hidden),#recordsScreen:not(.hidden)"),historyRoot=document.getElementById("playerMatchHistoryV2");
    const playerHub=window.CueScorePlayerHubV2?.snapshot?.()||null;
    let kind="";
    if(target?.closest?.("#playerMatchHistoryV2 [data-player-record-id]"))kind=historyRoot?.dataset.pd8Opponent?"opponent-history":"player-history";
    else if(target?.closest?.("#recordsList [data-record-id],.records-list [data-record-id]"))kind="global-history";
    else if(target?.closest?.("#playerStatsBody [data-pd7-match],#playerStatsBody .hub-bests-v2 [data-hub-match]"))kind="personal-best";
    else if(target?.closest?.("#playerStatsBody [data-hub-match]"))kind="player-recent";
    else if(visible(historyRoot))kind=historyRoot?.dataset.pd8Opponent?"opponent-history":"player-history";
    else if(visible(playerStats))kind="player-detail";
    else if(records)kind="global-history";
    if(!kind)return null;
    const scroll=kind.includes("history")?(kind==="global-history"?records?.querySelector(".records-list"):historyRoot?.querySelector(".player-journey-scroll-v2")):document.getElementById("playerStatsBody");
    return {kind,scrollTop:scroll?.scrollTop||0,historyFilter:historyRoot?.querySelector("[data-history-filter].is-selected")?.dataset.historyFilter||"",playerId:historyRoot?.dataset.pd8PlayerId||playerHub?.playerId||detail()?.state?.playerId||"",discipline:historyRoot?.dataset.pd8Discipline||playerHub?.discipline||detail()?.state?.discipline||"",playerHub};
  };
  document.addEventListener("click",event=>{const trigger=event.target.closest?.("[data-player-record-id],[data-record-id],[data-pd7-match],[data-hub-match]");if(trigger)exactMatchDetailOrigin=captureExactOrigin(trigger);},true);
  document.addEventListener("keydown",event=>{if(!["Enter"," "].includes(event.key))return;const trigger=event.target.closest?.("[data-player-record-id],[data-record-id],[data-pd7-match],[data-hub-match]");if(trigger)exactMatchDetailOrigin=captureExactOrigin(trigger);},true);
  const openMatchDetailExactBase=window.openMatchDetailV1;
  if(typeof openMatchDetailExactBase==="function")window.openMatchDetailV1=(recordId,options={})=>{if(options?.source!=="result"&&!exactMatchDetailOrigin)exactMatchDetailOrigin=captureExactOrigin(null);return openMatchDetailExactBase(recordId,options);};
  const closeMatchDetailExactBase=window.closeFormalMatchDetailV2;
  window.closeFormalMatchDetailV2=()=>{
    const origin=exactMatchDetailOrigin;closeMatchDetailExactBase?.();exactMatchDetailOrigin=null;if(!origin)return;
    const playerStats=document.getElementById("playerStatsOverlay"),historyRoot=document.getElementById("playerMatchHistoryV2");
    if(["player-history","opponent-history"].includes(origin.kind)){historyRoot?.classList.remove("hidden");historyRoot?.setAttribute("aria-hidden","false");playerStats?.classList.add("hidden");const scroll=historyRoot?.querySelector(".player-journey-scroll-v2");if(scroll)requestAnimationFrame(()=>scroll.scrollTop=origin.scrollTop);}
    else if(origin.kind!=="global-history"){if(!window.CueScorePlayerHubV2?.restore?.(origin.playerHub)){playerStats?.classList.remove("hidden");playerStats?.setAttribute("aria-hidden","false");const scroll=document.getElementById("playerStatsBody");if(scroll)requestAnimationFrame(()=>scroll.scrollTop=origin.scrollTop);}}
    else {const scroll=document.querySelector(".records-screen:not(.hidden) .records-list,#recordsScreen:not(.hidden) .records-list");if(scroll)requestAnimationFrame(()=>scroll.scrollTop=origin.scrollTop);}
  };

  window.CueScoreUiRevisionV12={reviseDetail,reviseRivals,reviseHistory,revisePlayerList,captureExactOrigin};
})();
