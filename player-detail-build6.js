(() => {
  "use strict";
  const body=document.getElementById("playerStatsBody"),api=window.CueScoreBuild4Metrics;
  if(!body||!api||typeof window.renderFormalPlayerDetailV1!=="function")return;
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const defs=[
    {id:"9ball",label:"9-Ball",asset:"assets/icons/games/game-9ball.svg"},{id:"10ball",label:"10-Ball",asset:"assets/icons/games/game-10ball.svg"},
    {id:"rotation",label:"Rotation",asset:"assets/icons/games/game-rotation.svg"},{id:"straightPool",label:"14-1",asset:"assets/icons/games/game-14-1.svg"},
    {id:"jpa9",label:"JPA 9-Ball",asset:"assets/icons/games/game-jpa-9ball.svg"},{id:"threeCushion",label:"3 Cushion",asset:"assets/icons/games/game-3cushion.svg"}
  ];
  const labels={winRate:window.cueT("p3.bab1876f"),shotRate:window.cueT("p3.274e5e0c"),breakInRate:window.cueT("p3.535112ba"),masuwariRate:window.cueT("p3.991f3795"),highRun:window.cueT("p3.761345d1"),average:window.cueT("p3.d247b2e7")};
  const metricKeys={"9ball":["shotRate","breakInRate","masuwariRate"],"10ball":["shotRate","breakInRate","masuwariRate"],rotation:["shotRate","breakInRate","highRun"],jpa9:["average","breakInRate","highRun"],straightPool:["average","highRun"],threeCushion:["average","highRun"]};
  const bestLabels={shotRate:window.cueT("p3.0cb79ad2"),breakInRate:window.cueT("p3.efe3b953"),masuwariRate:window.cueT("p3.f2a866da"),masuwariCount:window.cueT("p3.c4fa5775"),breakPocketCount:window.cueT("p3.e3861823"),breakScore:window.cueT("p3.fd906f8d"),highRun:window.cueT("p3.1badb93c"),score:window.cueT("p3.176c82bc"),average:window.cueT("p3.f92ff052"),leastWinningInnings:window.cueT("p3.97184347")};
  const bestLabel=(key,disciplineId)=>key==="leastWinningInnings"&&disciplineId==="jpa9"?window.cueT("p3.2c53b0db"):bestLabels[key]||key;
  const percent=new Set(["winRate","shotRate","breakInRate","masuwariRate"]);
  const discipline=record=>window.CueScoreAnalysisV2Context?.discipline?.(record)||"rotation";
  const players=()=>typeof readPlayerLibrary==="function"?readPlayerLibrary():[];
  const side=(record,player)=>typeof playerSideInRecord==="function"?Number(playerSideInRecord(record,player))||0:0;
  const recordsFor=player=>(typeof recordsForRegisteredPlayer==="function"?recordsForRegisteredPlayer(player):[]).filter(record=>side(record,player)).sort((a,b)=>dateValue(b)-dateValue(a));
  const recordPlayer=(record,s)=>record?.players?.[s]||{};
  const metric=(record,s)=>typeof savedPlayerMetricsV113==="function"?savedPlayerMetricsV113(record,s)||{}:{};
  const completedTurns=(record,s)=>window.CueScoreAnalysisV2Context?.completedTurns?.(record,s)??window.inningsCountNumberV1?.(record,s);
  const won=(record,s)=>Number(record?.winner||record?.winnerSide||record?.result?.winnerSide||0)===Number(s);
  const dateValue=record=>new Date(record?.endedAt||record?.playedAt||record?.startedAt||0).getTime()||0;
  const dateText=record=>{const d=new Date(dateValue(record));return dateValue(record)?window.cueDate(d,"ymd"):window.cueT("p3.6b344146");};
  const helpers={side,won,metric,recordPlayer,completedTurns,discipline,masuwariCounts:record=>window.rackGameMasuwariCountsV1?.(record)||{1:0,2:0}};
  const fmt=(key,value)=>value==null?"—":percent.has(key)?`${Number(value).toFixed(1)}%`:key==="average"?Number(value).toFixed(3).replace(/0+$/," ").trim().replace(/\.$/,""):String(Math.round(value*100)/100);
  const avatar=player=>typeof playerAvatarHtmlV2==="function"?playerAvatarHtmlV2(player,"player-avatar-v2"):"";
  const opponent=(record,s)=>recordPlayer(record,s===1?2:1);
  const score=(record,s)=>Number(metric(record,s)?.score??recordPlayer(record,s)?.score)||0;
  const state={playerId:null,level:"info",discipline:"9ball",player:null,infoSnapshot:null};
  const backPerf=window.CueScoreBackPerfV11=window.CueScoreBackPerfV11||{records:[],begin(route,source="tap"){const item={route,source,received:performance.now()};this.records.push(item);if(this.records.length>40)this.records.shift();return item;},stage(item,key){if(item)item[key]=performance.now();},usable(item){requestAnimationFrame(()=>requestAnimationFrame(()=>{if(item)item.visuallyUsable=performance.now();}));}};
  const def=id=>defs.find(item=>item.id===id)||defs[0];

  function header(title,action=window.cueT("p3.d107b864"),icon=""){
    const node=document.getElementById("playerStatsTitle");if(node){node.classList.toggle("pd8-title-with-icon",Boolean(icon));node.innerHTML=icon?`<img src="${icon}" alt=""><span>${esc(title)}</span>`:esc(title);}
    const race=document.getElementById("playerStatsRace");if(race)race.textContent=action;
  }
  function profile(player,compact=false){return `<section class="pd7-profile ${compact?"is-compact":""}"><span class="pd7-avatar">${avatar(player)}${player.favorite===true?'<i>★</i>':""}</span><span><strong title="${esc(player.name)}">${esc(player.name)}</strong>${player.isPrimary===true?'<b>' + window.cueT("p3.af7f8f12") + '</b>':""}${!compact&&player.memo?`<small>${esc(player.memo)}</small>`:""}</span></section>`;}
  function renderInfo(player){
    state.level="info";header(window.cueT("p3.3a30a11d"));
    const allRecords=recordsFor(player);
    const rows=defs.map(item=>{const records=allRecords.filter(record=>discipline(record)===item.id),wins=records.filter(record=>won(record,side(record,player))).length,losses=records.length-wins;return `<button type="button" class="pd7-discipline-row" data-pd7-discipline="${item.id}"><img src="${item.asset}" alt=""><span><strong>${item.label}</strong><small>${window.cueT("p3.96f48bd5",{length:records.length,p:records.length?window.cueT(`p3.f3a01e79`,{wins:wins,losses:losses}):window.cueT("p3.b597d966"),count:records.length})}</small></span><span><small>${window.cueT("p3.bab1876f")}</small><strong>${records.length?`${(wins/records.length*100).toFixed(1)}%`:"—"}</strong></span><b>›</b></button>`;}).join("");
    body.innerHTML=`<div class="player-detail-shell-v1 pd7-shell">${profile(player)}<h2 class="pd7-title">${window.cueT("p3.29020eb6")}</h2><section class="pd7-discipline-list">${rows}</section></div>`;state.infoSnapshot={html:body.innerHTML,scrollTop:0};
  }
  function restoreInfo(){const item=backPerf.begin("discipline-detail-to-player-info",document.getElementById("playerStatsBackBtn")?.dataset.cueBackSource||"tap");backPerf.stage(item,"handlerStart");state.level="info";header(window.cueT("p3.3a30a11d"));if(state.infoSnapshot){body.innerHTML=state.infoSnapshot.html;body.scrollTop=state.infoSnapshot.scrollTop||0;}else renderInfo(state.player);backPerf.stage(item,"domComplete");backPerf.usable(item);}
  function renderDetail(player,active){
    state.level="detail";state.discipline=active;header(window.cueT(`p3.371c0084`,{label:def(active).label}),"",def(active).asset);
    const records=recordsFor(player).filter(record=>discipline(record)===active);
    const all=api.aggregate(records,player,helpers),keys=metricKeys[active]||[],displayedBests=api.bests(records,player,active,helpers).slice(0,3);
    const bestCards=displayedBests.map(best=>`<button type="button" class="pd7-best" data-pd7-best-key="${esc(best.key)}" data-pd7-match="${esc(best.record.id)}"><strong>${fmt(best.key,best.value)}</strong><span>${bestLabel(best.key,active)}</span><small>${window.cueT("p3.f3717e0d",{p:dateText(best.record)})}</small></button>`).join("");
    const summary=records.length?window.cueT(`p3.7e3945dc`,{games:all.games,wins:all.wins,losses:all.losses,count:all.games}):window.cueT("p3.661b9eb3");
    body.innerHTML=`<div class="player-detail-shell-v1 pd7-shell"><section class="pd7-detail-summary">${profile(player,true)}<span><small>${window.cueT("p3.19aaa4aa",{label:def(active).label})}</small><strong>${summary}</strong></span></section>
      <article class="pd7-win-rate"><span><small>${window.cueT("p3.bab1876f")}</small><strong>${fmt("winRate",all.winRate)}</strong></span></article>
      <h2 class="pd7-title">${window.cueT("p3.c81f42f6")}</h2><section class="pd7-metrics count-${keys.length}">${keys.map(key=>`<article class="pd7-metric"><strong>${fmt(key,all[key])}</strong><span>${labels[key]}</span></article>`).join("")||'<div class="pd7-empty">' + window.cueT("p3.e63fcd05") + '</div>'}</section>
      <h2 class="pd7-title">${window.cueT("p3.d134cd45")}</h2>${bestCards?`<section class="pd7-bests count-${Math.min(displayedBests.length,3)}">${bestCards}</section>`:'<section class="pd7-empty-card">' + window.cueT("p3.e63fcd05") + '</section>'}
      <section class="pd7-links"><button type="button" data-pd7-rivals><span><strong>${window.cueT("p3.683549f7")}</strong><small>${window.cueT("p3.773df3a0",{label:def(active).label})}</small></span><b>›</b></button><button type="button" data-pd7-history><span><strong>${window.cueT("p3.ecef9277",{label:def(active).label})}</strong><small>${window.cueT("p3.dcc7940f")}</small></span><b>›</b></button></section>
      </div>`;
  }
  function render(playerId,level="info",active=state.discipline){const player=players().find(item=>String(item.id)===String(playerId));if(!player)return;state.playerId=String(playerId);state.player=player;level==="detail"?renderDetail(player,active):renderInfo(player);window.CueScorePro?.decorate?.();}
  const previous=window.renderFormalPlayerDetailV1;
  window.renderFormalPlayerDetailV1=function(playerId){previous?.(playerId);render(playerId,"info");};
  body.addEventListener("click",event=>{
    const info=event.target.closest("[data-pd7-info]");if(info){render(state.playerId,"info");return;}
    const disciplineButton=event.target.closest("[data-pd7-discipline]");if(disciplineButton){render(state.playerId,"detail",disciplineButton.dataset.pd7Discipline);return;}
    const match=event.target.closest("[data-pd7-match]");if(match){window.openMatchDetailV1?.(match.dataset.pd7Match);return;}
    const rivals=event.target.closest("[data-pd7-rivals]");if(rivals){window.openPlayerOpponentRecordsV2?.(state.playerId,state.discipline);return;}
    const history=event.target.closest("[data-pd7-history]");if(history){window.openPlayerMatchHistoryV2?.(state.playerId,state.discipline);return;}
  },true);
  document.getElementById("playerStatsBackBtn")?.addEventListener("pointerdown",event=>event.currentTarget.classList.add("cue-back-feedback-v11"),{passive:true});
  document.getElementById("playerStatsBackBtn")?.addEventListener("click",event=>{event.currentTarget.classList.remove("cue-back-feedback-v11");if(state.level==="detail"){event.preventDefault();event.stopImmediatePropagation();restoreInfo();return;}if(playerStatsReturnToManagementV147){const item=backPerf.begin("player-info-to-player-list",event.currentTarget.dataset.cueBackSource||"tap");backPerf.stage(item,"handlerStart");event.preventDefault();event.stopImmediatePropagation();const stats=document.getElementById("playerStatsOverlay"),library=document.getElementById("playerLibraryOverlay");stats?.classList.add("hidden");stats?.setAttribute("aria-hidden","true");library?.classList.remove("hidden");library?.setAttribute("aria-hidden","false");playerStatsReturnToManagementV147=false;backPerf.stage(item,"domComplete");backPerf.usable(item);}},true);
  const historyRoot=document.getElementById("playerMatchHistoryV2");
  const openHistoryBase=window.openPlayerMatchHistoryV2;
  window.openPlayerMatchHistoryV2=(playerId,disciplineId="")=>{
    openHistoryBase?.(playerId);
    if(!historyRoot)return;
    historyRoot.dataset.pd8PlayerId=String(playerId);
    historyRoot.dataset.pd8Discipline=String(disciplineId||"");
    historyRoot.classList.toggle("pd8-discipline-fixed",Boolean(disciplineId));
    if(disciplineId)requestAnimationFrame(()=>historyRoot.querySelector(`[data-history-filter="${disciplineId}"]`)?.click());
  };
  document.addEventListener("click",event=>{
    const back=event.target.closest("#playerMatchHistoryV2 [data-journey-back]");
    if(!back||!historyRoot?.dataset.pd8Discipline||historyRoot.dataset.pd8Opponent)return;
    const item=backPerf.begin("discipline-history-to-discipline-detail",back.dataset.cueBackSource||"tap");backPerf.stage(item,"handlerStart");
    event.preventDefault();event.stopImmediatePropagation();
    historyRoot.classList.add("hidden");
    document.getElementById("playerStatsOverlay")?.classList.remove("hidden");
    document.getElementById("playerStatsOverlay")?.setAttribute("aria-hidden","false");
    backPerf.stage(item,"domComplete");backPerf.usable(item);
  },true);
  // P2 Phase D: the former history-row compaction observer wrapped a history row and its analysis button. No production code creates analysis-button
  // elements any more (only selectors / removers exist), so the wrap could never run and the observer was removed.
  let returnFromEditor=false;
  document.getElementById("playerStatsRace")?.addEventListener("click",event=>{if(!state.playerId||document.getElementById("playerStatsOverlay")?.classList.contains("hidden"))return;event.preventDefault();event.stopImmediatePropagation();returnFromEditor=true;document.getElementById("playerStatsOverlay")?.classList.add("hidden");const library=document.getElementById("playerLibraryOverlay");library?.classList.remove("hidden");library?.setAttribute("aria-hidden","false");openPlayerEditor(state.playerId);},true);
  document.getElementById("playerLibraryBackBtn")?.addEventListener("click",event=>{if(!returnFromEditor||document.getElementById("playerEditor")?.classList.contains("hidden"))return;const item=backPerf.begin("player-editor-to-player-info",event.currentTarget.dataset.cueBackSource||"tap");backPerf.stage(item,"handlerStart");event.preventDefault();event.stopImmediatePropagation();returnFromEditor=false;const library=document.getElementById("playerLibraryOverlay"),stats=document.getElementById("playerStatsOverlay");library?.classList.add("hidden");library?.setAttribute("aria-hidden","true");stats?.classList.remove("hidden");stats?.setAttribute("aria-hidden","false");backPerf.stage(item,"domComplete");backPerf.usable(item);requestAnimationFrame(()=>showPlayerLibraryMain());},true);
  window.CueScoreBuild6PlayerDetail={render,renderInfo,renderDetail,state};
})();
