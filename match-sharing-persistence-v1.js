(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.CueScoreMatchSharingPersistenceV1=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const UUID_V4=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const RESULTS=new Set(["win","loss","draw"]);

  class MatchSharingPersistenceError extends Error{
    constructor(code,message,options={}){
      super(message,options);
      this.name="MatchSharingPersistenceError";
      this.code=code;
    }
  }

  const fail=(code,message)=>{throw new MatchSharingPersistenceError(code,message)};
  const localId=record=>String(record?.id??record?.matchId??"").trim();
  const sharedId=record=>record?.sharedMatchId;
  const isUuidV4=value=>typeof value==="string"&&UUID_V4.test(value);
  const clone=value=>JSON.parse(JSON.stringify(value));

  function assertOptionalSharedMatchId(record){
    const value=sharedId(record);
    if(value==null)return null;
    if(!isUuidV4(value))fail("MALFORMED_SHARED_MATCH_ID","sharedMatchId must be UUID v4 when present");
    return value;
  }

  function validateSharedMatchIds(records,{rejectDuplicates=true}={}){
    const seen=new Set();
    for(const record of Array.isArray(records)?records:[]){
      const value=assertOptionalSharedMatchId(record);
      if(!value)continue;
      const key=value.toLowerCase();
      if(rejectDuplicates&&seen.has(key))fail("DUPLICATE_SHARED_MATCH_ID","sharedMatchId is duplicated");
      seen.add(key);
    }
    return true;
  }

  function isCompletedMatch(record){
    return Boolean(record&&typeof record==="object"&&!Array.isArray(record)&&localId(record)&&record.players&&record.endedAt&&RESULTS.has(record.result)&&[0,1,2].includes(Number(record.winner)));
  }

  function findDuplicateSharedMatchId(records,value,{excludeLocalId=""}={}){
    if(!isUuidV4(value))fail("INVALID_UUID","Invalid sharedMatchId");
    const wanted=value.toLowerCase(),excluded=String(excludeLocalId||"");
    return (Array.isArray(records)?records:[]).find(record=>{
      if(!isCompletedMatch(record)||localId(record)===excluded)return false;
      const candidate=sharedId(record);
      return isUuidV4(candidate)&&candidate.toLowerCase()===wanted;
    })||null;
  }

  function ensureSharedMatchId({matchId,readRecords,replaceRecords,uuidFactory,demoMode=false}={}){
    if(demoMode)fail("DEMO_EXPORT_REJECTED","Demo matches cannot be shared");
    if(typeof readRecords!=="function"||typeof replaceRecords!=="function")fail("INVALID_STORAGE_ADAPTER","Storage adapter is incomplete");
    const original=readRecords();
    if(!Array.isArray(original))fail("INVALID_STORAGE_DATA","Match storage must be an array");
    const wanted=String(matchId||"");
    const index=original.findIndex(record=>localId(record)===wanted);
    if(index<0)fail("MATCH_NOT_FOUND","Match was not found");
    const target=original[index];
    if(!isCompletedMatch(target))fail("INELIGIBLE_MATCH","Only completed matches can be shared");
    const existing=assertOptionalSharedMatchId(target);
    if(existing)return existing;
    const generated=String((typeof uuidFactory==="function"?uuidFactory():globalThis.crypto?.randomUUID?.())||"");
    if(!isUuidV4(generated))fail("INVALID_UUID_GENERATOR","UUID factory must return UUID v4");
    const next=original.map((record,recordIndex)=>recordIndex===index?{...record,sharedMatchId:generated}:record);
    try{
      replaceRecords(next);
      const stored=readRecords();
      const readBack=Array.isArray(stored)?stored.find(record=>localId(record)===wanted):null;
      if(readBack?.sharedMatchId!==generated)fail("PERSISTENCE_READBACK_FAILED","sharedMatchId read-back did not match");
      return generated;
    }catch(error){
      let rollbackVerified=Boolean(error?.restoreRollbackVerified||error?.sharedMatchRollbackVerified);
      if(!rollbackVerified){
        try{
          replaceRecords(clone(original));
          rollbackVerified=JSON.stringify(readRecords())===JSON.stringify(original);
        }catch(_){ rollbackVerified=false; }
      }
      error.sharedMatchRollbackVerified=rollbackVerified;
      throw error;
    }
  }

  const normalizeText=value=>String(value??"").normalize("NFKC").trim().replace(/\s+/g," ").toLocaleLowerCase("ja");
  function legacyRecordKey(record){
    const p1=record?.players?.[1]||record?.players?.["1"]||{},p2=record?.players?.[2]||record?.players?.["2"]||{};
    return ["legacy",record?.startedAt||record?.playedAt||record?.endedAt||"",normalizeText(p1.name),normalizeText(p2.name),Number(p1.score||0),Number(p2.score||0)].join("|");
  }

  function mergeMatchRecords(current,incoming){
    const base=Array.isArray(current)?current:[],additions=Array.isArray(incoming)?incoming:[];
    validateSharedMatchIds(base);
    validateSharedMatchIds(additions);
    const result=base.slice(),byLocal=new Map(),byShared=new Map();
    for(const record of base){
      const id=localId(record),shared=assertOptionalSharedMatchId(record);
      if(id)byLocal.set(id,record);
      if(shared)byShared.set(shared.toLowerCase(),record);
    }
    let added=0;
    for(const record of additions){
      const id=localId(record),shared=assertOptionalSharedMatchId(record);
      const localExisting=id?byLocal.get(id):null;
      if(localExisting){
        const localShared=assertOptionalSharedMatchId(localExisting);
        if(shared&&localShared&&shared.toLowerCase()!==localShared.toLowerCase())fail("LOCAL_SHARED_ID_CONFLICT","The same local Match ID has different sharedMatchId values");
        continue;
      }
      if(shared&&byShared.has(shared.toLowerCase()))continue;
      if(!id){
        const key=legacyRecordKey(record);
        if(result.some(item=>!localId(item)&&legacyRecordKey(item)===key))continue;
      }
      result.push(record);added+=1;
      if(id)byLocal.set(id,record);
      if(shared)byShared.set(shared.toLowerCase(),record);
    }
    return {value:result,added};
  }

  return Object.freeze({
    UUID_V4,MatchSharingPersistenceError,isUuidV4,assertOptionalSharedMatchId,
    validateSharedMatchIds,isCompletedMatch,findDuplicateSharedMatchId,
    ensureSharedMatchId,legacyRecordKey,mergeMatchRecords
  });
});
