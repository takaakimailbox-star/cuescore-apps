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
  const labels={winRate:"勝率",shotRate:"シュート率",breakInRate:"ブレイクイン率",masuwariRate:"マス割り率",highRun:"ハイラン",average:"アベレージ",avgFouls:"平均ファール"};
  const metricKeys={"9ball":["shotRate","breakInRate","masuwariRate","avgFouls"],"10ball":["shotRate","breakInRate","masuwariRate","avgFouls"],rotation:["shotRate","breakInRate","highRun","avgFouls"],jpa9:["average","breakInRate","highRun","avgFouls"],straightPool:["average","highRun","avgFouls"],threeCushion:["average","highRun"]};
  const bestLabels={shotRate:"最高シュート率",breakInRate:"最高ブレイクイン率",masuwariRate:"最高マス割り率",masuwariCount:"1試合最多マス割り",highRun:"最大ハイラン",score:"1試合最高得点",average:"最高アベレージ",leastWinningInnings:"最少イニング勝利"};
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
  const dateText=record=>{const d=new Date(dateValue(record));return dateValue(record)?`${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`:"日付なし";};
  const helpers={side,won,metric,recordPlayer,completedTurns,discipline,masuwariCounts:record=>window.rackGameMasuwariCountsV1?.(record)||{1:0,2:0}};
  const fmt=(key,value)=>value==null?"—":percent.has(key)?`${Math.round(value)}%`:key==="avgFouls"?Number(value).toFixed(1):key==="average"?Number(value).toFixed(3).replace(/0+$/," ").trim().replace(/\.$/,""):String(Math.round(value*100)/100);
  const avatar=player=>typeof playerAvatarHtmlV2==="function"?playerAvatarHtmlV2(player,"player-avatar-v2"):"";
  const opponent=(record,s)=>recordPlayer(record,s===1?2:1);
  const score=(record,s)=>Number(metric(record,s)?.score??recordPlayer(record,s)?.score)||0;
  const chart=(values,key)=>window.CueScoreBuild4Analytics?.chart?.(values,key)||'<div class="pd7-empty">データなし</div>';
  const recordMetric=(record,player,key,active)=>window.CueScoreBuild4Analytics?.recordMetric?.(record,player,key,active,helpers)??null;
  const state={playerId:null,level:"info",discipline:"9ball",trendRecords:[],player:null};
  const def=id=>defs.find(item=>item.id===id)||defs[0];

  function header(title,action="編集",icon=""){
    const node=document.getElementById("playerStatsTitle");if(node){node.classList.toggle("pd8-title-with-icon",Boolean(icon));node.innerHTML=icon?`<img src="${icon}" alt=""><span>${esc(title)}</span>`:esc(title);}
    const race=document.getElementById("playerStatsRace");if(race)race.textContent=action;
  }
  function profile(player,compact=false){return `<section class="pd7-profile ${compact?"is-compact":""}"><span class="pd7-avatar">${avatar(player)}${player.favorite===true?'<i>★</i>':""}</span><span><strong title="${esc(player.name)}">${esc(player.name)}</strong>${player.isPrimary===true?'<b>メインプレーヤー</b>':""}${!compact&&player.memo?`<small>${esc(player.memo)}</small>`:""}</span></section>`;}
  function renderInfo(player){
    state.level="info";header("プレーヤー情報");
    const allRecords=recordsFor(player);
    const rows=defs.map(item=>{const records=allRecords.filter(record=>discipline(record)===item.id),wins=records.filter(record=>won(record,side(record,player))).length,losses=records.length-wins;return `<button type="button" class="pd7-discipline-row" data-pd7-discipline="${item.id}"><img src="${item.asset}" alt=""><span><strong>${item.label}</strong><small>${records.length}試合　${records.length?`${wins}勝${losses}敗`:"勝敗 —"}</small></span><span><small>勝率</small><strong>${records.length?`${Math.round(wins/records.length*100)}%`:"—"}</strong></span><b>›</b></button>`;}).join("");
    body.innerHTML=`<div class="player-detail-shell-v1 pd7-shell">${profile(player)}<h2 class="pd7-title">競技別通算</h2><section class="pd7-discipline-list">${rows}</section></div>`;
  }
  function renderDetail(player,active){
    state.level="detail";state.discipline=active;header(`${def(active).label} 詳細`,"",def(active).asset);
    const records=recordsFor(player).filter(record=>discipline(record)===active);
    const all=api.aggregate(records,player,helpers),keys=metricKeys[active]||[],bests=api.bests(records,player,active,helpers);
    const trendKeys=["winRate",...keys],trendRecords=records.slice(0,10).reverse();state.trendRecords=trendRecords;
    const bestCards=bests.slice(0,3).map(best=>`<button type="button" class="pd7-best" data-pd7-match="${esc(best.record.id)}"><strong>${fmt(best.key,best.value)}</strong><span>${active==="jpa9"&&best.key==="score"?"1試合最多得点":bestLabels[best.key]}</span><small>${dateText(best.record)}　試合を見る ›</small></button>`).join("");
    const summary=records.length?`${all.games}試合　${all.wins}勝${all.losses}敗　勝率${Math.round(all.winRate)}%`:"0試合　勝率 —";
    body.innerHTML=`<div class="player-detail-shell-v1 pd7-shell"><section class="pd7-detail-summary">${profile(player,true)}<span><small>${def(active).label} 通算</small><strong>${summary}</strong></span></section>
      <h2 class="pd7-title">主要指標</h2><section class="pd7-metrics count-${keys.length}">${keys.map(key=>`<article><strong>${fmt(key,all[key])}</strong><span>${labels[key]}</span></article>`).join("")||'<div class="pd7-empty">データなし</div>'}</section>
      <section class="pd7-trend-card"><button type="button" data-pd7-trend-toggle aria-expanded="false"><span><strong>推移</strong><small>指標の変化を見る</small></span><b>⌄</b></button><div class="pd7-trend" data-pd7-trend hidden><select data-pd7-trend-key aria-label="推移の指標">${trendKeys.map(key=>`<option value="${key}">${labels[key]}</option>`).join("")}</select><div data-pd7-chart>${chart(trendRecords.map(r=>recordMetric(r,player,"winRate",active)),"winRate")}</div></div></section>
      <h2 class="pd7-title">自己ベスト</h2>${bestCards?`<section class="pd7-bests count-${Math.min(bests.length,3)}">${bestCards}</section>`:'<section class="pd7-empty-card">データなし</section>'}
      <section class="pd7-links"><button type="button" data-pd7-rivals><span><strong>対戦相手別の成績</strong><small>${def(active).label}の相手別勝敗・勝率</small></span><b>›</b></button><button type="button" data-pd7-history><span><strong>${def(active).label}の全試合</strong><small>Match Detail・試合別分析へ</small></span><b>›</b></button></section></div>`;
  }
  function render(playerId,level="info",active=state.discipline){const player=players().find(item=>String(item.id)===String(playerId));if(!player)return;state.playerId=String(playerId);state.player=player;level==="detail"?renderDetail(player,active):renderInfo(player);}
  const previous=window.renderFormalPlayerDetailV1;
  window.renderFormalPlayerDetailV1=function(playerId){previous?.(playerId);render(playerId,"info");};
  body.addEventListener("click",event=>{
    const info=event.target.closest("[data-pd7-info]");if(info){render(state.playerId,"info");return;}
    const disciplineButton=event.target.closest("[data-pd7-discipline]");if(disciplineButton){render(state.playerId,"detail",disciplineButton.dataset.pd7Discipline);return;}
    const match=event.target.closest("[data-pd7-match]");if(match){window.openMatchDetailV1?.(match.dataset.pd7Match);return;}
    const rivals=event.target.closest("[data-pd7-rivals]");if(rivals){window.openPlayerOpponentRecordsV2?.(state.playerId,state.discipline);return;}
    const history=event.target.closest("[data-pd7-history]");if(history){window.openPlayerMatchHistoryV2?.(state.playerId,state.discipline);return;}
    const trendToggle=event.target.closest("[data-pd7-trend-toggle]");if(trendToggle){const panel=body.querySelector("[data-pd7-trend]"),open=Boolean(panel?.hidden);if(panel)panel.hidden=!open;trendToggle.setAttribute("aria-expanded",String(open));return;}
  },true);
  body.addEventListener("change",event=>{const select=event.target.closest("[data-pd7-trend-key]");if(!select)return;const key=select.value,values=state.trendRecords.map(record=>recordMetric(record,state.player,key,state.discipline));body.querySelector("[data-pd7-chart]").innerHTML=chart(values,key);});
  document.getElementById("playerStatsBackBtn")?.addEventListener("click",event=>{if(state.level!=="detail")return;event.preventDefault();event.stopImmediatePropagation();render(state.playerId,"info");},true);
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
    if(!back||!historyRoot?.dataset.pd8Discipline)return;
    event.preventDefault();event.stopImmediatePropagation();
    historyRoot.classList.add("hidden");
    render(historyRoot.dataset.pd8PlayerId,"detail",historyRoot.dataset.pd8Discipline);
    document.getElementById("playerStatsOverlay")?.classList.remove("hidden");
  },true);
  const compactHistory=()=>{
    historyRoot?.querySelectorAll(".journey-match-v3").forEach(row=>{
      if(row.closest(".pd8-history-match"))return;
      const analysis=row.nextElementSibling?.matches("[data-player-analysis-record-id]")?row.nextElementSibling:null;
      if(!analysis)return;
      const wrapper=document.createElement("div");wrapper.className="pd8-history-match";
      row.replaceWith(wrapper);wrapper.append(row,analysis);
      const detail=row.querySelector(".journey-match-open-v3");if(detail)detail.textContent="詳細";
      analysis.textContent="分析";
    });
  };
  if(historyRoot)new MutationObserver(compactHistory).observe(historyRoot,{subtree:true,childList:true});
  window.CueScoreBuild6PlayerDetail={render,renderInfo,renderDetail,state};
})();
