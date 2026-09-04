(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.CueScoreRecordPolicyFactory=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const FREE_LIMIT=20;
  const time=record=>{const value=new Date(record?.endedAt||record?.playedAt||record?.startedAt||record?.createdAt||0).getTime();return Number.isFinite(value)?value:0};
  const stableNewest=(a,b)=>time(b)-time(a)||String(b?.id||b?.matchId||"").localeCompare(String(a?.id||a?.matchId||""),"ja",{numeric:true});
  function createRecordPolicy(isPro){
    const pro=typeof isPro==="function"?isPro:()=>false;
    return Object.freeze({FREE_LIMIT,stableNewest,
      getEligibleRecords(records,override){const source=Array.isArray(records)?records:[];return (override?.isPro??pro())?source.slice():source.slice().sort(stableNewest).slice(0,FREE_LIMIT)},
      isEligible(recordId,records,override){return this.getEligibleRecords(records,override).some(record=>String(record?.id||record?.matchId||"")===String(recordId||""))},
      hasHiddenRecords:records=>!pro()&&Array.isArray(records)&&records.length>FREE_LIMIT
    });
  }
  return Object.freeze({FREE_LIMIT,stableNewest,createRecordPolicy});
});
