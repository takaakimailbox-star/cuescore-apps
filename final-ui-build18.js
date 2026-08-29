(() => {
  "use strict";
  const setup=document.querySelector(".cue-new-match-integrated-v2");
  const start=document.getElementById("startGameBtn");
  if(!setup||!start)return;

  const validPlayers=()=>readPlayerLibrary().filter(player=>player?.id&&String(player.name||"").trim());
  const selected=slot=>validPlayers().find(player=>String(player.id)===String(selectedRegisteredPlayer?.[slot]||""));
  const display=(slot,text)=>{const node=document.getElementById(`p${slot}NameDisplayV1`),input=document.getElementById(`p${slot}Name`);if(node)node.textContent=text;if(input)input.value=selected(slot)?.name||"";};
  let guide=setup.querySelector(".match-player-guide-v18");
  if(!guide){guide=document.createElement("section");guide.className="match-player-guide-v18";guide.setAttribute("aria-live","polite");setup.querySelector(".new-match-player-grid-v1")?.after(guide);}

  function refresh(){
    const players=validPlayers(),ids=new Set(players.map(player=>String(player.id)));
    [1,2].forEach(slot=>{if(!ids.has(String(selectedRegisteredPlayer?.[slot]||"")))selectedRegisteredPlayer[slot]=null;});
    if(players.length&& !selected(1))initializePrimaryMatchSetupV1({force:true});
    if(players.length===0){display(1,"プレーヤーを追加");display(2,"対戦相手を追加");guide.innerHTML='<strong>プレーヤーが登録されていません</strong><span>試合を始めるには2人のプレーヤーを登録してください。</span><button type="button" data-add-match-player-v18="1">プレーヤーを追加</button>';}
    else if(players.length===1){display(1,selected(1)?.name||players[0].name);display(2,"対戦相手を追加");guide.innerHTML='<strong>対戦相手を追加</strong><span>試合を始めるにはもう1人のプレーヤーを登録してください。</span><button type="button" data-add-match-player-v18="2">プレーヤーを追加</button>';}
    else{display(1,selected(1)?.name||"プレーヤーを選択");display(2,selected(2)?.name||"対戦相手を選択");guide.innerHTML="";}
    guide.hidden=players.length>=2;
    start.disabled=players.length<2||!selected(1)||!selected(2)||String(selectedRegisteredPlayer[1])===String(selectedRegisteredPlayer[2]);
    start.setAttribute("aria-disabled",start.disabled?"true":"false");
  }
  guide.addEventListener("click",event=>{const button=event.target.closest("[data-add-match-player-v18]");if(button)openPlayerLibrary(Number(button.dataset.addMatchPlayerV18)||1);});
  start.addEventListener("click",event=>{refresh();if(start.disabled){event.preventDefault();event.stopImmediatePropagation();const target=validPlayers().length?2:1;openPlayerLibrary(target);}},true);
  document.getElementById("playerLibraryOverlay")&&new MutationObserver(()=>requestAnimationFrame(refresh)).observe(document.getElementById("playerLibraryOverlay"),{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
  setup.addEventListener("click",()=>setTimeout(refresh,0));
  window.CueScoreBuild18PlayerSelection={refresh,validPlayers,selected};
  refresh();
})();
