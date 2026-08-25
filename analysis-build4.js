(() => {
  "use strict";
  const root=document.querySelector(".analysis-v2"),api=window.CueScoreBuild4Metrics;
  if(!root||!api)return;
  const view=root.querySelector('[data-analysis-view="player"]');
  if(!view)return;
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const labels={
    "9ball":"9-Ball","10ball":"10-Ball",rotation:"Rotation",jpa9:"JPA 9-Ball",straightPool:"14-1",threeCushion:"3 Cushion",
    winRate:"勝率",shotRate:"シュート率",breakInRate:"ブレイクイン率",masuwariRate:"マス割り率",highRun:"ハイラン",average:"アベレージ",foulRate:"ファール率",
    score:"1試合最高得点",masuwariCount:"1試合最多マス割り",leastWinningInnings:"最少イニング勝利"
  };
  const percentKeys=new Set(["winRate","shotRate","breakInRate","masuwariRate","foulRate"]);
  const metricsByDiscipline={
    "9ball":["shotRate","breakInRate","masuwariRate","foulRate"],
    "10ball":["shotRate","breakInRate","masuwariRate","foulRate"],
    rotation:["shotRate","breakInRate","highRun","foulRate"],
    jpa9:["average","breakInRate","highRun","foulRate"],
    straightPool:["average","highRun","foulRate"],threeCushion:["average","highRun"]
  };
  const bestLabels={shotRate:"最高シュート率",breakInRate:"最高ブレイクイン率",masuwariRate:"最高マス割り率",masuwariCount:"1試合最多マス割り",highRun:"最大ハイラン",score:"1試合最高得点",average:"最高アベレージ",leastWinningInnings:"最少イニング勝利"};
  const ctx=()=>window.CueScoreAnalysisV2Context;
  const helpers=()=>({
    side:(record,player)=>{const data1=record?.players?.[1]||{},data2=record?.players?.[2]||{},id=String(player?.id||"");if(id&&String(data1.registeredPlayerId||"")===id)return 1;if(id&&String(data2.registeredPlayerId||"")===id)return 2;return String(data1.name||"")===String(player?.name||"")?1:String(data2.name||"")===String(player?.name||"")?2:0;},
    won:(record,side)=>Number(record?.winner||record?.winnerSide||record?.result?.winnerSide||0)===Number(side),
    metric:(record,side)=>ctx().metric(record,side)||{},recordPlayer:(record,side)=>ctx().recordPlayer(record,side)||{},
    completedTurns:(record,side)=>ctx().completedTurns(record,side),discipline:record=>ctx().discipline(record),
    masuwariCounts:record=>window.rackGameMasuwariCountsV1?.(record)||{1:0,2:0}
  });
  const fmt=(key,value)=>value==null?"—":key==="foulRate"?`${Number(value).toFixed(2)}%`:percentKeys.has(key)?`${Number(value).toFixed(1)}%`:key==="average"?Number(value).toFixed(3).replace(/0+$/,"").replace(/\.$/,""):String(Math.round(value*100)/100);
  const metricDefs=discipline=>(metricsByDiscipline[discipline]||[]).map(key=>({key,label:labels[key],higher:key!=="foulRate"}));
  const recordDate=record=>{const d=new Date(record?.endedAt||record?.playedAt||record?.startedAt||0);return Number.isNaN(d.getTime())?"日付なし":`${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`;};
  function recordMetric(record,player,key,discipline,h){
    const side=h.side(record,player);if(!side)return null;
    if(key==="winRate")return h.won(record,side)?100:0;
    const metric=h.metric(record,side),aggregate=api.aggregate([record],player,h);
    if(key==="highRun")return Number(metric.maxRun)||0;
    return aggregate[key];
  }
  function chart(values,key,records=[]){
    const valid=values.filter(value=>Number.isFinite(value));
    if(!valid.length)return'<div class="analysis-b4-empty">データなし</div>';
    const w=340,h=184,left=38,right=10,top=12,bottom=34,max=percentKeys.has(key)?100:Math.max(1,...valid),min=percentKeys.has(key)?0:Math.min(0,...valid),range=Math.max(1,max-min),step=values.length>1?(w-left-right)/(values.length-1):0;
    const point=(value,index)=>`${left+index*step},${h-bottom-((value-min)/range)*(h-top-bottom)}`;
    const dates=records.map(record=>{const d=new Date(record?.endedAt||record?.playedAt||record?.startedAt||0);return Number.isNaN(d.getTime())?"試合":`${d.getMonth()+1}/${d.getDate()}`;}),totals=dates.reduce((map,date)=>(map[date]=(map[date]||0)+1,map),{}),seen={};
    const xLabels=dates.map(date=>{seen[date]=(seen[date]||0)+1;return totals[date]>1?`${date}·${seen[date]}`:date;});
    const ticks=percentKeys.has(key)?[100,75,50,25,0]:[max,(max+min)/2,min];
    const valueText=value=>key==="foulRate"?`${Number(value).toFixed(2)}%`:percentKeys.has(key)?`${Number(value).toFixed(1)}%`:String(Math.round(Number(value)*100)/100);
    let paths=[],current=[];values.forEach((value,index)=>{if(Number.isFinite(value))current.push(point(value,index));else if(current.length){paths.push(current);current=[];}});if(current.length)paths.push(current);
    return`<div class="analysis-b4-chart-wrap"><svg class="analysis-b4-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(labels[key])}の推移">${ticks.map(tick=>{const y=h-bottom-((tick-min)/range)*(h-top-bottom);return `<line x1="${left}" y1="${y}" x2="${w-right}" y2="${y}" stroke="#e4e4e0"/><text class="analysis-b4-y-label" x="${left-6}" y="${y+3}" text-anchor="end">${percentKeys.has(key)?`${Math.round(tick)}%`:Math.round(tick*100)/100}</text>`;}).join("")}${paths.map(points=>`<polyline points="${points.join(" ")}" fill="none" stroke="#171717" stroke-width="2.5"/>`).join("")}${values.map((value,index)=>Number.isFinite(value)?`<circle data-b4-point tabindex="0" role="button" aria-label="${esc(xLabels[index]||`試合${index+1}`)} ${valueText(value)}" data-b4-date="${esc(xLabels[index]||`試合${index+1}`)}" data-b4-value="${valueText(value)}" cx="${left+index*step}" cy="${h-bottom-((value-min)/range)*(h-top-bottom)}" r="5" fill="#171717"/>`:"").join("")}${values.map((value,index)=>Number.isFinite(value)?`<text class="analysis-b4-x-label" x="${left+index*step}" y="${h-9}" text-anchor="middle">${esc(xLabels[index]||String(index+1))}</text>`:"").join("")}</svg><output class="analysis-b4-point-callout" data-b4-point-callout hidden></output></div>`;
  }
  function pointText(current,previous,defs){
    if(previous.games<1)return{strength:"比較できません",challenge:"比較できません"};
    const changes=defs.map(def=>{const now=current[def.key],before=previous[def.key];if(!Number.isFinite(now)||!Number.isFinite(before))return null;const raw=now-before;return{...def,raw,score:def.higher?raw:-raw};}).filter(Boolean);
    if(!changes.length)return{strength:"比較できません",challenge:"比較できません"};
    const strongest=[...changes].sort((a,b)=>b.score-a.score)[0],weakest=[...changes].sort((a,b)=>a.score-b.score)[0];
    const strength=strongest.score>0?`${strongest.label}が前期間より改善しています`:`${strongest.label}は前期間と同水準です`;
    const challenge=weakest.score<0?`${weakest.label}を前期間の水準へ戻しましょう`:`現在の安定した内容を継続しましょう`;
    return{strength,challenge};
  }
  function render(){
    const context=ctx();if(!context||view.hidden||(view.dataset.build4Rendered==="true"&&view.querySelector(".analysis-b4-context")))return;
    const player=context.selectedPlayer(),discipline=context.selectedDiscipline();if(!player)return;
    const h=helpers(),records=context.recordsFor(player).filter(record=>context.discipline(record)===discipline),currentRecords=records.slice(0,10),previousRecords=records.slice(10,20),current=api.aggregate(currentRecords,player,h),previous=api.aggregate(previousRecords,player,h),defs=metricDefs(discipline),bests=api.bests(records,player,discipline,h),points=pointText(current,previous,defs);
    const status=current.games<3?"データ蓄積中":previous.games<3?"安定":current.winRate>previous.winRate?"改善傾向":current.winRate<previous.winRate?"要調整":"安定";
    const summary=current.games?`直近${current.games}試合　${current.wins}勝${current.losses}敗　勝率${Math.round(current.winRate)}%`:"データなし";
    const playerName=esc(player.name||"Player"),playerId=esc(player.id||"");
    const disciplineOptions=[...document.querySelectorAll('[data-analysis-discipline] option')].map(option=>`<option value="${esc(option.value)}" ${option.value===discipline?"selected":""}>${esc(option.textContent)}</option>`).join("");
    const trendKeys=["winRate",...defs.map(def=>def.key)],trendRecords=records.slice(0,10).reverse();
    view.innerHTML=`
      <section class="analysis-v2-card analysis-b4-context"><div><strong title="${playerName}">${playerName}</strong><span>プレーヤー分析</span></div><div><select class="analysis-v2-select" data-analysis-discipline aria-label="競技">${disciplineOptions}</select></div></section>
      <section class="analysis-v2-card analysis-b4-now"><div class="analysis-b4-heading"><h2>今の状態</h2><span>${status}</span></div><strong>${summary}</strong><small>条件を満たす保存済み試合だけを指標へ使用しています</small></section>
      <h2 class="analysis-v2-section-title">主要指標</h2><section class="analysis-b4-metrics">${defs.map(def=>`<article><strong>${fmt(def.key,current[def.key])}</strong><span>${def.label}</span></article>`).join("")}</section>
      <section class="analysis-v2-card analysis-b4-trend"><div class="analysis-b4-heading"><h2>推移</h2><span>直近${trendRecords.length}試合</span></div><label class="analysis-b4-trend-picker"><span>表示指標</span><select data-b4-trend-select aria-label="推移の表示指標">${trendKeys.map(key=>`<option value="${key}">${labels[key]}</option>`).join("")}</select></label><div data-b4-chart>${chart(trendRecords.map(record=>recordMetric(record,player,"winRate",discipline,h)),"winRate",trendRecords)}</div></section>
      <section class="analysis-v2-card analysis-b4-points"><h2>今回のポイント</h2><div><strong>強み</strong><span>${points.strength}</span></div><div><strong>次の課題</strong><span>${points.challenge}</span></div></section>
      <h2 class="analysis-v2-section-title">自己ベスト</h2>${bests.length?`<section class="analysis-b4-bests">${bests.map(best=>`<button type="button" data-b4-match-id="${esc(best.record.id)}"><strong>${fmt(best.key,best.value)}</strong><span>${best.key==="score"&&discipline==="jpa9"?"1試合最多得点":bestLabels[best.key]}</span><small>${esc(labels[discipline])}・${recordDate(best.record)}</small><i>試合を見る ›</i></button>`).join("")}</section>`:'<section class="analysis-v2-card analysis-b4-empty">データなし</section>'}
      <h2 class="analysis-v2-section-title">詳細分析</h2><section class="analysis-b4-links"><button type="button" data-b4-rival="${playerId}"><span>対戦相手分析を見る</span><b>›</b></button></section>`;
    view.dataset.build4Rendered="true";
    view._build4={player,discipline,records:trendRecords,helpers:h};
  }
  root.addEventListener("click",event=>{
    const point=event.target.closest("[data-b4-point]");if(point){const output=point.closest(".analysis-b4-chart-wrap")?.querySelector("[data-b4-point-callout]");if(output){output.textContent=`${point.dataset.b4Date}　${point.dataset.b4Value}`;output.hidden=false;}return;}
    const trend=event.target.closest("[data-b4-trend]");if(trend){const state=view._build4,key=trend.dataset.b4Trend;view.querySelectorAll("[data-b4-trend]").forEach(button=>button.classList.toggle("is-active",button===trend));const values=state.records.map(record=>recordMetric(record,state.player,key,state.discipline,state.helpers));view.querySelector("[data-b4-chart]").innerHTML=chart(values,key,state.records);return;}
    const best=event.target.closest("[data-b4-match-id]");if(best){window.openMatchDetailV1?.(best.dataset.b4MatchId);return;}
    const rival=event.target.closest("[data-b4-rival]");if(rival){window.openRivalAnalysisForPlayerV832?.(rival.dataset.b4Rival);return;}
  });
  root.addEventListener("change",event=>{const picker=event.target.closest("[data-b4-trend-select]");if(!picker)return;const state=view._build4,key=picker.value;const values=state.records.map(record=>recordMetric(record,state.player,key,state.discipline,state.helpers));view.querySelector("[data-b4-chart]").innerHTML=chart(values,key,state.records);});
  new MutationObserver(()=>queueMicrotask(render)).observe(view,{childList:true});
  queueMicrotask(render);
  window.CueScoreBuild4Analytics={render,chart,recordMetric};
})();
