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
  const labels={winRate:"勝率",shotRate:"シュート率",breakInRate:"ブレイクイン率",masuwariRate:"マス割り率",highRun:"ハイラン",average:"アベレージ",avgFouls:"平均ファール",score:"1試合最高得点",masuwariCount:"1試合最多マス割り",leastWinningInnings:"最少イニング勝利"};
  const metricKeys={"9ball":["shotRate","breakInRate","masuwariRate","avgFouls"],"10ball":["shotRate","breakInRate","masuwariRate","avgFouls"],rotation:["shotRate","breakInRate","highRun","avgFouls"],jpa9:["average","breakInRate","highRun","avgFouls"],straightPool:["average","highRun","avgFouls"],threeCushion:["average","highRun"]};
  const bestLabels={shotRate:"最高シュート率",breakInRate:"最高ブレイクイン率",masuwariRate:"最高マス割り率",masuwariCount:"1試合最多マス割り",highRun:"最大ハイラン",score:"1試合最高得点",average:"最高アベレージ",leastWinningInnings:"最少イニング勝利"};
  const percent=new Set(["winRate","shotRate","breakInRate","masuwariRate"]);
  const discipline=record=>window.CueScoreAnalysisV2Context?.discipline?.(record)||"rotation";
  const players=()=>typeof readPlayerLibrary==="function"?readPlayerLibrary():[];
  const recordsFor=player=>(typeof recordsForRegisteredPlayer==="function"?recordsForRegisteredPlayer(player):[]).filter(record=>side(record,player)).sort((a,b)=>dateValue(b)-dateValue(a));
  const side=(record,player)=>typeof playerSideInRecord==="function"?Number(playerSideInRecord(record,player))||0:0;
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
  const chart=(values,key)=>window.CueScoreBuild4Analytics?.chart?.(values,key)||'<div class="pd6-empty">データなし</div>';
  const recordMetric=(record,player,key,active)=>window.CueScoreBuild4Analytics?.recordMetric?.(record,player,key,active,helpers)??null;
  let activeByPlayer=new Map();

  function renderIntegrated(playerId){
    const player=players().find(item=>String(item.id)===String(playerId));if(!player)return;
    const selected=body.querySelector("[data-player-detail-discipline].is-selected")?.dataset.playerDetailDiscipline;
    const active=selected||activeByPlayer.get(String(playerId))||"9ball";activeByPlayer.set(String(playerId),active);
    const allRecords=recordsFor(player),records=allRecords.filter(record=>discipline(record)===active),recent=records.slice(0,10),previous=records.slice(10,20);
    const all=api.aggregate(records,player,helpers),now=api.aggregate(recent,player,helpers),before=api.aggregate(previous,player,helpers),keys=metricKeys[active]||[],bests=api.bests(records,player,active,helpers);
    const status=now.games<3?"データ蓄積中":before.games<3?"安定":now.winRate>before.winRate?"改善傾向":now.winRate<before.winRate?"要調整":"安定";
    const trendKeys=["winRate",...keys],trendRecords=records.slice(0,10).reverse();
    const recentRows=records.slice(0,8).map((record,index)=>{const s=side(record,player),opp=opponent(record,s);return `<button type="button" class="pd6-match ${index>=2?"pd6-more-match":""}" data-pd6-match="${esc(record.id)}" ${index>=2?"hidden":""}><span><strong>${won(record,s)?"勝ち":"負け"}　${score(record,s)} - ${score(record,s===1?2:1)}</strong><small>${dateText(record)}・vs ${esc(opp.name||"対戦相手")}</small></span><b>›</b></button>`;}).join("");
    const bestCards=bests.map((best,index)=>`<button type="button" class="pd6-best ${index>=3?"pd6-more-best":""}" data-pd6-match="${esc(best.record.id)}" ${index>=3?"hidden":""}><strong>${fmt(best.key,best.value)}</strong><span>${active==="jpa9"&&best.key==="score"?"1試合最多得点":bestLabels[best.key]}</span><small>${dateText(best.record)}　試合を見る ›</small></button>`).join("");
    document.getElementById("playerStatsRace").textContent="編集";
    body.innerHTML=`<div class="player-detail-shell-v1 pd6-shell">
      <section class="pd6-profile"><span class="pd6-avatar">${avatar(player)}${player.favorite===true?'<i>★</i>':""}</span><span><strong title="${esc(player.name)}">${esc(player.name)}</strong>${player.isPrimary===true?'<b>メインプレーヤー</b>':""}${player.memo?`<small>${esc(player.memo)}</small>`:""}</span></section>
      <section class="pd6-overall"><span><small>通算</small><strong>${allRecords.length}試合</strong></span><span><small>勝敗</small><strong>${allRecords.filter(r=>won(r,side(r,player))).length}勝 ${allRecords.filter(r=>!won(r,side(r,player))).length}敗</strong></span><span><small>勝率</small><strong>${allRecords.length?Math.round(allRecords.filter(r=>won(r,side(r,player))).length/allRecords.length*100)+"%":"—"}</strong></span></section>
      <div class="player-detail-disciplines-v1 pd6-disciplines" role="tablist" aria-label="ゲーム種目">${defs.map(d=>`<button type="button" role="tab" class="player-detail-discipline-v1 ${d.id===active?"is-selected":""}" data-player-detail-discipline="${d.id}" aria-selected="${d.id===active}"><img class="disc-ball" src="${d.asset}" alt=""><span>${d.label}</span></button>`).join("")}</div>
      <section class="pd6-now"><div><h2>今の状態</h2><b>${status}</b></div><strong>${now.games?`直近${now.games}試合　${now.wins}勝${now.losses}敗　勝率${Math.round(now.winRate)}%`:"データなし"}</strong></section>
      <h2 class="pd6-title">主要指標</h2><section class="pd6-metrics">${keys.map(key=>`<article><strong>${fmt(key,now[key])}</strong><span>${labels[key]}</span></article>`).join("")||'<div class="pd6-empty">データなし</div>'}</section>
      <section class="pd6-recent"><div><h2>最近の調子</h2><span>${recent.length?recent.slice(0,5).map(r=>`<i class="${won(r,side(r,player))?"win":"loss"}">${won(r,side(r,player))?"W":"L"}</i>`).join(""):"データなし"}</span></div><button type="button" data-pd6-trend-toggle aria-expanded="false">推移を見る</button><div class="pd6-trend" data-pd6-trend hidden><select data-pd6-trend-key aria-label="推移の指標">${trendKeys.map(key=>`<option value="${key}">${labels[key]}</option>`).join("")}</select><div data-pd6-chart>${chart(trendRecords.map(r=>recordMetric(r,player,"winRate",active)),"winRate")}</div></div></section>
      <h2 class="pd6-title">自己ベスト</h2>${bestCards?`<section class="pd6-bests">${bestCards}</section>${bests.length>3?'<button type="button" class="pd6-toggle" data-pd6-best-toggle>すべて見る</button>':""}`:'<section class="pd6-empty-card">データなし</section>'}
      <h2 class="pd6-title">最近の試合</h2>${recentRows?`<section class="pd6-matches">${recentRows}</section>${records.length>2?'<button type="button" class="pd6-toggle" data-pd6-match-toggle>すべて見る</button>':""}`:'<section class="pd6-empty-card">データなし</section>'}
      <section class="pd6-links"><button type="button" data-open-opponents-v2="${esc(player.id)}"><span><strong>対戦相手別の成績</strong><small>相手ごとの勝敗・勝率</small></span><b>›</b></button><button type="button" data-open-player-history-v2="${esc(player.id)}"><span><strong>試合一覧</strong><small>全試合から詳細・試合分析へ</small></span><b>›</b></button></section>
      <button type="button" class="player-detail-delete-v1" data-player-detail-delete="${esc(player.id)}">プレーヤーを削除</button><p class="player-detail-delete-note-v1">削除しても、過去の試合履歴は残ります。</p>
    </div>`;
    body._pd6={player,active,records:trendRecords};
  }
  const previous=window.renderFormalPlayerDetailV1;
  window.renderFormalPlayerDetailV1=function(playerId){previous?.(playerId);renderIntegrated(playerId);};
  body.addEventListener("click",event=>{
    const disciplineButton=event.target.closest("[data-player-detail-discipline]");if(disciplineButton)activeByPlayer.set(String(window.__cueScoreActivePlayerStatsIdV159||""),disciplineButton.dataset.playerDetailDiscipline);
    const match=event.target.closest("[data-pd6-match]");if(match){window.openMatchDetailV1?.(match.dataset.pd6Match);return;}
    const trendToggle=event.target.closest("[data-pd6-trend-toggle]");if(trendToggle){const panel=body.querySelector("[data-pd6-trend]"),open=panel?.hidden;if(panel)panel.hidden=!open;trendToggle.setAttribute("aria-expanded",String(open));trendToggle.textContent=open?"推移を閉じる":"推移を見る";return;}
    const toggle=(selector,button,openText,closeText)=>{const nodes=[...body.querySelectorAll(selector)],open=nodes.some(node=>node.hidden);nodes.forEach(node=>node.hidden=!open);button.textContent=open?closeText:openText;};
    const bestToggle=event.target.closest("[data-pd6-best-toggle]");if(bestToggle){toggle(".pd6-more-best",bestToggle,"すべて見る","閉じる");return;}
    const matchToggle=event.target.closest("[data-pd6-match-toggle]");if(matchToggle){toggle(".pd6-more-match",matchToggle,"すべて見る","閉じる");}
  },true);
  body.addEventListener("change",event=>{const select=event.target.closest("[data-pd6-trend-key]");if(!select)return;const state=body._pd6,key=select.value,values=state.records.map(r=>recordMetric(r,state.player,key,state.active));body.querySelector("[data-pd6-chart]").innerHTML=chart(values,key);});
  window.CueScoreBuild6PlayerDetail={render:renderIntegrated};
})();
