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
    if(players.length===0){display(1,window.cueT("p3.3552b640"));display(2,window.cueT("p3.89901bee"));guide.innerHTML='<strong>' + window.cueT("p3.4bb2d4b6") + '</strong><span>' + window.cueT("p3.9b32b9b0") + '</span><button type="button" data-add-match-player-v18="1">' + window.cueT("p3.3552b640") + '</button>';}
    else if(players.length===1){display(1,selected(1)?.name||players[0].name);display(2,window.cueT("p3.89901bee"));guide.innerHTML='<strong>' + window.cueT("p3.89901bee") + '</strong><span>' + window.cueT("p3.c15cc9e2") + '</span><button type="button" data-add-match-player-v18="2">' + window.cueT("p3.3552b640") + '</button>';}
    else{display(1,selected(1)?.name||window.cueT("p3.b3005c8a"));display(2,selected(2)?.name||window.cueT("p3.39bd0fa6"));guide.innerHTML="";}
    guide.hidden=players.length>=2;
    start.disabled=players.length<2||!selected(1)||!selected(2)||String(selectedRegisteredPlayer[1])===String(selectedRegisteredPlayer[2]);
    start.setAttribute("aria-disabled",start.disabled?"true":"false");
  }
  guide.addEventListener("click",event=>{const button=event.target.closest("[data-add-match-player-v18]");if(button)openPlayerLibrary(Number(button.dataset.addMatchPlayerV18)||1);});
  start.addEventListener("click",event=>{refresh();if(start.disabled){event.preventDefault();event.stopImmediatePropagation();const target=validPlayers().length?2:1;openPlayerLibrary(target);}},true);
  // P2 OBS-03: the player library changes the inputs of refresh() (library + selection) only through user interaction inside the overlay or through
  // navigation hiding it. Those are explicit triggers now (formerly a DOM observer on the overlay subtree).
  const refreshSoon=()=>requestAnimationFrame(refresh);
  const libraryOverlay=document.getElementById("playerLibraryOverlay");
  if(libraryOverlay)["click","input","change"].forEach(type=>libraryOverlay.addEventListener(type,refreshSoon));
  // The overlay subtree is rewritten (class / children) only by these production functions; each one now asks for a refresh when it returns.
  ["openPlayerLibrary","closePlayerLibrary","showPlayerLibraryMain","openPlayerEditor","renderPlayerLibrary","savePlayerEditor","deletePlayerByIdV1"].forEach(name=>{
    const original=window[name];
    if(typeof original!=="function")return;
    window[name]=function(...args){const result=original.apply(this,args);refreshSoon();return result;};
  });
  setup.addEventListener("click",()=>setTimeout(refresh,0));
  window.CueScoreBuild18PlayerSelection={refresh,refreshSoon,validPlayers,selected};
  refresh();
})();
