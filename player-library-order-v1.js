(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.CueScorePlayerLibraryOrderV1=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const recordTime=record=>{
    if(record?.inProgress===true||record?.status==="in-progress"||record?.completed===false)return 0;
    const value=record?.endedAt||record?.playedAt||record?.startedAt||0;
    const time=new Date(value).getTime();
    return Number.isFinite(time)?time:0;
  };

  function latestCompletedMatchTime(records){
    return Math.max(0,...(Array.isArray(records)?records:[]).map(recordTime));
  }

  function orderPlayers(players,recordsForPlayer){
    const registry=Array.isArray(players)?players:[];
    const records=typeof recordsForPlayer==="function"?recordsForPlayer:()=>[];
    return registry.map((player,registrationIndex)=>({
      player,
      registrationIndex,
      latestCompletedMatchTime:latestCompletedMatchTime(records(player))
    })).sort((a,b)=>{
      const mainOrder=Number(b.player?.isPrimary===true)-Number(a.player?.isPrimary===true);
      if(mainOrder)return mainOrder;
      const latestOrder=b.latestCompletedMatchTime-a.latestCompletedMatchTime;
      if(latestOrder)return latestOrder;
      return a.registrationIndex-b.registrationIndex;
    }).map(entry=>entry.player);
  }

  return Object.freeze({recordTime,latestCompletedMatchTime,orderPlayers});
});
