(function(root,factory){
  let validation=root?.CueScoreMatchSharingValidationV1;
  let drafts=root?.CueScoreMatchSharingPlayerDraftsV1;
  if(typeof module==="object"&&module.exports){
    validation=require("./match-sharing-validation-v1.js");
    drafts=require("./match-sharing-player-drafts-v1.js");
  }
  const api=factory(validation,drafts);
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.CueScoreMatchSharingUiV1=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(validation,drafts){
  "use strict";
  if(!validation||!drafts)throw new Error("Match Sharing UI dependencies are required");
  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
  const side=(logical,index)=>logical?.players?.[index]??logical?.players?.[String(index)]??{};
  const idOf=value=>String(value?.playerId??value?.id??"");
  const cleanMapping=value=>value?.kind==="existing"
    ?{kind:"existing",playerId:String(value.playerId||"")}
    :value?.kind==="new"?{kind:"new",pendingKey:String(value.pendingKey||""),draft:clone(value.draft)}:null;

  function hiddenPastCount(records,eligible,isPro=false){
    if(isPro)return 0;
    return Math.max(0,(Array.isArray(records)?records.length:0)-(Array.isArray(eligible)?eligible.length:0));
  }
  function sameLocalPlayer(first,second){
    return first?.kind==="existing"&&second?.kind==="existing"&&idOf(first)===idOf(second);
  }
  function mappingReady(value){
    return value?.kind==="existing"&&Boolean(String(value.playerId||""))||value?.kind==="new"&&Boolean(String(value.draft?.name||"").trim());
  }
  function createReceiverFlow({readPlayers=()=>[],importMatch=()=>{throw new Error("Import adapter is required")},onChange=()=>{}}={}){
    let state={step:"idle",logicalMatch:null,sharedMatchId:null,bySide:{1:null,2:null},error:null,result:null};
    const publish=()=>{const value=clone(state);onChange(value);return value};
    const requireLogical=()=>validation.validateSharedMatchV1(state.logicalMatch);
    const setLogicalMatch=logical=>{const valid=clone(validation.validateSharedMatchV1(logical));state={step:"mapping",logicalMatch:valid,sharedMatchId:valid.sharedMatchId,bySide:{1:null,2:null},error:null,result:null};return publish()};
    const selectMapping=(sideNumber,value)=>{
      requireLogical();const number=Number(sideNumber);if(![1,2].includes(number))throw new Error("Player side must be 1 or 2");
      const next=cleanMapping(value),other=number===1?2:1;
      if(!next)throw new Error("A local Player mapping is required");
      if(sameLocalPlayer(next,state.bySide[other]))throw new Error("Player 1 and Player 2 must use different local Players");
      if(next.kind==="new"&&state.bySide[other]?.kind==="new"&&String(next.pendingKey||"")&&String(next.pendingKey)===String(state.bySide[other].pendingKey||""))throw new Error("Player 1 and Player 2 must use different pending Players");
      state.bySide[number]=next;state.error=null;return publish();
    };
    const next=()=>{if(state.step==="mapping"){if(!mappingReady(state.bySide[1])||!mappingReady(state.bySide[2])||sameLocalPlayer(state.bySide[1],state.bySide[2]))throw new Error("Player 1 and Player 2 mappings are required");state.step="confirm"}
      return publish()};
    const back=()=>{if(state.step==="confirm")state.step="mapping";else if(state.step==="mapping")state.step="scanner";state.error=null;return publish()};
    const mappingPlan=()=>({bySide:{1:clone(state.bySide[1]),2:clone(state.bySide[2])}});
    const commit=()=>{requireLogical();if(state.step!=="confirm")throw new Error("Import confirmation is required");state.step="importing";publish();try{const result=importMatch(clone(state.logicalMatch),mappingPlan());state.result=clone(result);state.step="complete";state.error=null;return publish()}catch(error){state.step="confirm";state.error={code:String(error?.code||"IMPORT_FAILED"),message:String(error?.message||"Import failed")};publish();throw error}};
    const reset=()=>{state={step:"idle",logicalMatch:null,sharedMatchId:null,bySide:{1:null,2:null},error:null,result:null};return publish()};
    const players=()=>clone(readPlayers());
    return Object.freeze({setLogicalMatch,selectMapping,next,back,commit,reset,get:()=>clone(state),players,mappingPlan});
  }
  return Object.freeze({hiddenPastCount,sameLocalPlayer,mappingReady,createReceiverFlow});
});
