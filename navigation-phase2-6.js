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
  const labels={winRate:"勝率",shotRate:"シュート率",breakInRate:"ブレイクイン率",masuwariRate:"マス割り率",foulRate:"ファール率",average:"アベレージ",highRun:"ハイラン"};
  const metricKeys={"9ball":["shotRate","breakInRate","masuwariRate","foulRate"],"10ball":["shotRate","breakInRate","masuwariRate","foulRate"],rotation:["shotRate","breakInRate","highRun","foulRate"],jpa9:["average","breakInRate","highRun","foulRate"],straightPool:["average","highRun","foulRate"],threeCushion:["average","highRun"]};
  const bestLabels={shotRate:"最高シュート率",breakInRate:"最高ブレイクイン率",masuwariRate:"最高マス割り率",masuwariCount:"1試合最多マス割り",highRun:"最大ハイラン",score:"1試合最高得点",average:"最高アベレージ",leastWinningInnings:"最少イニング勝利"};
  const percent=new Set(["winRate","shotRate","breakInRate","masuwariRate","foulRate"]),playerState=new Map();
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
  const fmt=(key,value)=>value==null?"—":key==="foulRate"?`${Number(value).toFixed(2)}%`:percent.has(key)?`${Number(value).toFixed(1)}%`:key==="average"?Number(value).toFixed(3).replace(/0+$/,"").replace(/\.$/,""):String(Math.round(Number(value)*100)/100);
  const avatar=player=>typeof playerAvatarHtmlV2==="function"?playerAvatarHtmlV2(player,"player-avatar-v2"):"";
  const opponent=(record,s)=>recordPlayer(record,s===1?2:1);
  const score=(record,s)=>Number(metric(record,s)?.score??recordPlayer(record,s)?.score)||0;
  const dateText=record=>{const d=new Date(dateValue(record));return dateValue(record)?`${d.getMonth()+1}/${d.getDate()}`:"日付なし";};
  const stateFor=id=>{const key=String(id);if(!playerState.has(key))playerState.set(key,{discipline:"9ball",tab:"results",scroll:{results:0,matches:0,analysis:0}});return playerState.get(key);};
  const active={playerId:"",player:null,state:null,records:[]};

  const syncLegacyState=()=>{const legacy=window.CueScoreBuild6PlayerDetail?.state;if(!legacy)return;legacy.playerId=active.playerId;legacy.player=active.player;legacy.discipline=active.state.discipline;legacy.level="hub";};
  const profile=player=>`<section class="hub-profile-v2"><span class="hub-avatar-v2">${avatar(player)}</span><span><strong title="${esc(player.name)}">${esc(player.name)}</strong>${player.isPrimary===true?'<b>メインプレーヤー</b>':""}</span></section>`;
  const selector=state=>`<div class="hub-discipline-v2" role="tablist" aria-label="競技">${defs.map(item=>`<button type="button" role="tab" data-hub-discipline="${item.id}" aria-selected="${item.id===state.discipline}" class="${item.id===state.discipline?"is-selected":""}"><img src="${item.asset}" alt=""><span>${item.label}</span></button>`).join("")}</div>`;
  const tabs=state=>`<div class="hub-tabs-v2" role="tablist" aria-label="プレーヤーハブ">${[["results","成績"],["matches","試合"],["analysis","分析"]].map(([key,label])=>`<button type="button" role="tab" data-hub-tab="${key}" aria-selected="${state.tab===key}" class="${state.tab===key?"is-selected":""}">${label}</button>`).join("")}</div>`;
  const empty=text=>`<section class="hub-card-v2 hub-empty-v2">${text}</section>`;
  const matchRow=(record,player)=>{const s=side(record,player),o=opponent(record,s),isWin=won(record,s);return `<button type="button" class="hub-match-row-v2" data-hub-match="${esc(record.id)}"><span><small>${dateText(record)}　${esc(o.name||"対戦相手")}</small><strong>${isWin?"勝ち":"負け"}　${score(record,s)} − ${score(record,s===1?2:1)}</strong></span><b aria-hidden="true">›</b></button>`;};

  function resultsView(records,player,state){
    const all=api.aggregate(records,player,helpers),bests=api.bests(records,player,state.discipline,helpers).filter(best=>!(["rotation","straightPool","jpa9"].includes(state.discipline)&&best.key==="score")).slice(0,4);
    return `<section class="hub-summary-v2"><article><span>試合数</span><strong>${all.games}</strong></article><article><span>勝</span><strong>${all.wins}</strong></article><article><span>敗</span><strong>${all.losses}</strong></article><article><span>勝率</span><strong>${fmt("winRate",all.winRate)}</strong></article></section>
      <h2 class="hub-heading-v2">自己ベスト</h2>${bests.length?`<section class="hub-bests-v2">${bests.map(best=>`<button type="button" data-hub-match="${esc(best.record.id)}"><strong>${fmt(best.key,best.value)}</strong><span>${bestLabels[best.key]||best.key}</span><small>${dateText(best.record)}　試合を見る ›</small></button>`).join("")}</section>`:empty("この競技の自己ベストはまだありません。")} `;
  }

  function matchesView(records,player,state){
    const recent=records.slice(0,3);
    return `<h2 class="hub-heading-v2">最近の試合</h2>${recent.length?`<section class="hub-match-list-v2">${recent.map(record=>matchRow(record,player)).join("")}</section>`:empty("この競技の試合はまだありません。")}
      <h2 class="hub-heading-v2">試合を探す</h2><section class="hub-links-v2"><button type="button" data-hub-all-matches><span><strong>すべての試合</strong><small>${def(state.discipline).label}の試合履歴</small></span><b>›</b></button><button type="button" data-hub-opponents><span><strong>対戦相手別</strong><small>相手ごとの成績と試合</small></span><b>›</b></button></section>`;
  }

  function points(current,previous,state){
    if(previous.games<1)return{strength:"比較できる過去データを蓄積中です",challenge:"試合記録を続けましょう"};
    const changes=(metricKeys[state.discipline]||[]).map(key=>{const now=current[key],before=previous[key];if(!Number.isFinite(now)||!Number.isFinite(before))return null;const score=(key==="foulRate"?-1:1)*(now-before);return{key,score};}).filter(Boolean);
    if(!changes.length)return{strength:"比較できる指標を蓄積中です",challenge:"試合記録を続けましょう"};
    const best=[...changes].sort((a,b)=>b.score-a.score)[0],worst=[...changes].sort((a,b)=>a.score-b.score)[0];
    return{strength:best.score>0?`${labels[best.key]}が前期間より改善しています`:`${labels[best.key]}は前期間と同水準です`,challenge:worst.score<0?`${labels[worst.key]}を前期間の水準へ戻しましょう`:"現在の安定した内容を継続しましょう"};
  }

  function analysisView(records,player,state){
    const currentRecords=records.slice(0,10),previousRecords=records.slice(10,20),current=api.aggregate(currentRecords,player,helpers),previous=api.aggregate(previousRecords,player,helpers),keys=metricKeys[state.discipline]||[],advice=points(current,previous,state);
    const status=current.games<3?"データ蓄積中":previous.games<3?"安定":current.winRate>previous.winRate?"改善傾向":current.winRate<previous.winRate?"要調整":"安定";
    return `<section class="hub-card-v2 hub-now-v2"><div><h2>今の状態</h2><b>${status}</b></div><strong>${current.games?`直近${current.games}試合　${current.wins}勝${current.losses}敗　勝率${Math.round(current.winRate)}%`:"データなし"}</strong><small>条件を満たす保存済み試合だけを使用しています</small></section>
      <h2 class="hub-heading-v2">主要指標</h2><section class="hub-metrics-v2">${keys.map(key=>`<article><strong>${fmt(key,current[key])}</strong><span>${labels[key]}</span></article>`).join("")||"<span>データなし</span>"}</section>
      <section class="hub-card-v2 hub-points-v2"><h2>今回のポイント</h2><div><strong>強み</strong><span>${advice.strength}</span></div><div><strong>次の課題</strong><span>${advice.challenge}</span></div></section>
      <section class="hub-links-v2"><button type="button" data-hub-trends><span><strong>推移</strong><small>主要指標をグラフで見る</small></span><b>›</b></button><button type="button" data-hub-full-analysis><span><strong>詳しい分析</strong><small>直近summaryと既存分析を見る</small></span><b>›</b></button><button type="button" data-hub-opponents><span><strong>対戦相手分析</strong><small>相手ごとの成績と試合</small></span><b>›</b></button></section>`;
  }

  function render(playerId,options={}){
    const player=players().find(item=>String(item.id)===String(playerId));if(!player)return;
    if(active.playerId&&active.state){const panel=body.querySelector(".hub-content-v2");active.state.scroll[active.state.tab]=panel?.scrollTop||body.scrollTop||0;}
    active.playerId=String(playerId);active.player=player;active.state=stateFor(playerId);
    if(options.discipline)active.state.discipline=options.discipline;if(options.tab)active.state.tab=options.tab;
    active.records=recordsFor(player).filter(record=>discipline(record)===active.state.discipline);syncLegacyState();
    if(title)title.textContent="プレーヤー情報";
    const management=document.body.dataset.cuePlayerContext==="management"&&typeof playerStatsReturnToManagementV147!=="undefined"&&playerStatsReturnToManagementV147===true;
    if(action)action.textContent=management?"編集":"";
    const content=active.state.tab==="matches"?matchesView(active.records,player,active.state):active.state.tab==="analysis"?analysisView(active.records,player,active.state):resultsView(active.records,player,active.state);
    body.innerHTML=`<div class="player-hub-v2">${profile(player)}${selector(active.state)}${tabs(active.state)}<div class="hub-content-v2" data-hub-content>${content}</div></div>`;
    requestAnimationFrame(()=>{const panel=body.querySelector(".hub-content-v2");if(panel)panel.scrollTop=active.state.scroll[active.state.tab]||0;});
  }

  const previous=window.renderFormalPlayerDetailV1;
  window.renderFormalPlayerDetailV1=function(playerId){previous?.(playerId);render(playerId);};
  body.addEventListener("click",event=>{
    const disciplineButton=event.target.closest("[data-hub-discipline]");if(disciplineButton){render(active.playerId,{discipline:disciplineButton.dataset.hubDiscipline});return;}
    const tab=event.target.closest("[data-hub-tab]");if(tab){render(active.playerId,{tab:tab.dataset.hubTab});return;}
    const match=event.target.closest("[data-hub-match]");if(match){window.openMatchDetailV1?.(match.dataset.hubMatch);return;}
    if(event.target.closest("[data-hub-all-matches]")){window.openPlayerMatchHistoryV2?.(active.playerId,active.state.discipline);return;}
    if(event.target.closest("[data-hub-opponents]")){window.openPlayerOpponentRecordsV2?.(active.playerId,active.state.discipline);return;}
    if(event.target.closest("[data-hub-trends]")){syncLegacyState();window.CueScoreUiRevisionV12?.openTrends?.();return;}
    if(event.target.closest("[data-hub-full-analysis]")){window.openPlayerAnalysisForPlayerV5?.(active.playerId,active.state.discipline);return;}
  },true);

  const settingsRoot=document.querySelector(".settings-formal-main-v1");
  if(settingsRoot&&!settingsRoot.querySelector("[data-settings-player-management-v2]")){
    const heading=settingsRoot.querySelector(".settings-formal-section-title-v1");
    const section=document.createElement("section");section.className="settings-data-card-v1 settings-player-management-v2";section.dataset.settingsPlayerManagementV2="true";
    section.innerHTML='<button class="settings-data-row-v1" type="button" data-open-player-management-v2><span class="settings-data-icon-v1 hub-person-icon-v2" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="12" cy="9" r="4"></circle><path d="M4.5 23c.7-4.8 3.1-7.2 7.5-7.2 2.4 0 4.2.7 5.5 2.2"></path><circle cx="23" cy="22" r="4.2"></circle><path d="M23 15.5v2M23 26.5v2M16.5 22h2M27.5 22h2M18.4 17.4l1.4 1.4M26.2 25.2l1.4 1.4M27.6 17.4l-1.4 1.4M19.8 25.2l-1.4 1.4"></path></svg></span><span class="settings-data-copy-v1"><strong>プレーヤー管理</strong><span>登録・編集・メイン設定・削除</span></span><span></span><span class="settings-data-chevron-v1" aria-hidden="true">›</span></button>';
    const label=document.createElement("h1");label.className="settings-formal-section-title-v1";label.textContent="プレーヤー";
    settingsRoot.insertBefore(section,heading);settingsRoot.insertBefore(label,section);
    section.addEventListener("click",()=>{document.body.dataset.cuePlayerContext="management";document.getElementById("settingsBackBtn")?.click();document.getElementById("playerManagementBtn")?.click();});
  }

  const reconcilePlayerRoot=()=>{
    const browse=document.body.dataset.cuePlayerContext==="browse",overlay=document.getElementById("playerLibraryOverlay");
    if(!browse||!overlay||overlay.classList.contains("hidden"))return;
    const add=document.getElementById("playerLibraryAddBtn"),register=document.getElementById("playerLibraryRegisterBtnV2"),rootTitle=document.getElementById("playerLibraryTitle");
    add?.style.setProperty("display","none","important");if(register)register.hidden=true;if(rootTitle)rootTitle.textContent="プレーヤー";
    const emptyState=overlay.querySelector(".player-library-empty");
    if(emptyState&&emptyState.textContent.includes("右上の＋"))emptyState.textContent="登録プレーヤーはまだいません。設定の「プレーヤー管理」から登録できます。";
  };
  new MutationObserver(()=>requestAnimationFrame(reconcilePlayerRoot)).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class","style","data-cue-player-context"]});

  const home=document.getElementById("cueHomeV1"),resume=document.getElementById("cueResumeCardV1");
  if(home&&resume&&!home.querySelector("[data-home-new-match-v2]")){
    const newMatch=document.createElement("button");newMatch.type="button";newMatch.className="home-new-match-v2";newMatch.dataset.homeNewMatchV2="true";newMatch.innerHTML='<span aria-hidden="true">＋</span><strong>新しい試合</strong><b aria-hidden="true">›</b>';
    const disciplineTitle=document.createElement("div");disciplineTitle.className="home-discipline-title-v3";disciplineTitle.innerHTML='<button type="button" data-home-discipline-back-v3 aria-label="ホームへ戻る">‹</button><strong>種目を選択</strong><span></span>';
    resume.insertAdjacentElement("afterend",newMatch);
    newMatch.insertAdjacentElement("afterend",disciplineTitle);
    const closeDiscipline=()=>home.classList.remove("match-discipline-active-v3");
    newMatch.addEventListener("click",()=>{home.classList.add("match-discipline-active-v3");home.querySelector("[data-discipline]")?.focus();});
    disciplineTitle.addEventListener("click",event=>{if(event.target.closest("[data-home-discipline-back-v3]"))closeDiscipline();});
    document.getElementById("cueDisciplineSwitcherV1")?.addEventListener("click",event=>{if(event.target.closest("[data-discipline]"))closeDiscipline();},true);
    document.getElementById("cueMatchSetupBackV3")?.addEventListener("click",closeDiscipline);
  }

  window.CueScoreNavigationPhase2To6=Object.freeze({render,stateFor,active,tabCount:()=>body.querySelectorAll("[data-hub-tab]").length,disciplineCount:()=>body.querySelectorAll("[data-hub-discipline]").length});
})();
