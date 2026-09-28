(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.CueScoreMatchSharingValidationV1=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const FORMAT="cuescore.match-share";
  const FORMAT_VERSION=1;
  const GAME_TYPES=Object.freeze(["rotation","nineBall","tenBall","jpa9Ball","straightPool","threeCushion"]);
  const GAME_TYPE_SET=new Set(GAME_TYPES);
  const RESULTS=new Set(["win","draw"]);
  const UUID_V4=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const LIMITS=Object.freeze({
    maxEncodedChars:5000,
    maxEnvelopeBytes:3330,
    maxCompressedBytes:3288,
    maxInflatedBytes:256*1024,
    maxTextChars:256*1024,
    maxObjectDepth:20,
    maxObjectNodes:50000,
    maxArrayItems:20000,
    maxEvents:10000,
    maxPlayerNameChars:100,
  });
  const FORBIDDEN_KEYS=new Set([
    "memo","reflection","playerreflections","avatar","photo","registeredplayerid",
    "category","season","pro","ispro","iap","entitlement","deviceid","deviceidentifier",
    "backup","journal","undocount","demomode","demometadata",
  ]);

  class MatchSharingError extends Error{
    constructor(code,message=code,details){super(message);this.name="MatchSharingError";this.code=code;if(details!==undefined)this.details=details;}
  }
  const fail=(code,message,details)=>{throw new MatchSharingError(code,message||code,details)};
  const isObject=value=>Boolean(value)&&typeof value==="object"&&!Array.isArray(value);
  const finite=value=>typeof value==="number"&&Number.isFinite(value);
  const side=value=>value?.[1]??value?.["1"];

  function assertBoundedStructure(value,limits=LIMITS){
    let nodes=0,arrayItems=0;
    const visit=(item,depth)=>{
      nodes+=1;
      if(nodes>limits.maxObjectNodes)fail("OVERSIZE","Object node limit exceeded");
      if(depth>limits.maxObjectDepth)fail("OVERSIZE","Object depth limit exceeded");
      if(typeof item==="string"&&item.length>limits.maxTextChars)fail("OVERSIZE","String limit exceeded");
      if(Array.isArray(item)){
        arrayItems+=item.length;
        if(arrayItems>limits.maxArrayItems)fail("OVERSIZE","Array item limit exceeded");
        item.forEach(child=>visit(child,depth+1));
      }else if(isObject(item)){
        Object.values(item).forEach(child=>visit(child,depth+1));
      }
    };
    visit(value,0);
    return value;
  }

  function assertPrivacySafe(value){
    const visit=item=>{
      if(Array.isArray(item)){item.forEach(visit);return;}
      if(!isObject(item))return;
      for(const [key,child] of Object.entries(item)){
        if(FORBIDDEN_KEYS.has(String(key).toLocaleLowerCase("en-US")))fail("PRIVACY_FIELD",`Forbidden field: ${key}`);
        visit(child);
      }
    };
    visit(value);
    return value;
  }

  function validatePlayer(player,label){
    if(!isObject(player))fail(`MISSING_PLAYER_${label}`,`Missing Player ${label}`);
    const name=String(player.name||"").trim();
    if(!name)fail(`MISSING_PLAYER_${label}`,`Missing Player ${label}`);
    if(name.length>LIMITS.maxPlayerNameChars)fail("INVALID_PLAYER",`Player ${label} name is too long`);
    const numeric=["goal","skillLevel","score","safety","fouls","breaks","maxRun","completedTurns","average","share","misses","pocketCount","shotRate"];
    for(const key of numeric){
      const value=player[key];
      if(value!=null&&(!finite(value)||value<0))fail("INVALID_PLAYER",`Invalid Player ${label} ${key}`);
    }
  }

  function validateEventArray(events,label){
    if(!Array.isArray(events)||events.length>LIMITS.maxEvents)fail("INVALID_SCHEMA",`Invalid ${label}`);
    events.forEach(event=>{
      if(!isObject(event)||!String(event.type||"").trim())fail("INVALID_SCHEMA",`Invalid ${label} event`);
      if(event.player!=null&&![1,2].includes(Number(event.player)))fail("INVALID_SCHEMA",`Invalid ${label} player`);
    });
  }

  function validateDiscipline(value){
    const data=value.discipline;
    if(!isObject(data))fail("MISSING_GAME_DATA",`Missing ${value.gameType} data`);
    if(value.gameType==="rotation")return;
    if(value.gameType==="nineBall"){
      if(!isObject(data.settings)||!isObject(data.consecutiveFouls))fail("MISSING_GAME_DATA","Missing 9-Ball data");
      return;
    }
    if(value.gameType==="tenBall"){
      if(!isObject(data.settings)||!isObject(data.consecutiveFouls)||!Array.isArray(data.spotEvents))fail("MISSING_GAME_DATA","Missing 10-Ball data");
      return;
    }
    if(value.gameType==="jpa9Ball"){
      if(!isObject(data.skillLevels)||!isObject(data.targetPoints)||!Array.isArray(data.deadBalls)||!Array.isArray(data.deadBallEvents))fail("MISSING_GAME_DATA","Missing JPA 9-Ball data");
      return;
    }
    if(value.gameType==="straightPool"){
      if(!isObject(data.settings)||!isObject(data.consecutiveFouls)||!Array.isArray(data.spotEvents)||!Array.isArray(data.rerackEvents)||!Array.isArray(data.openingBreakEvents))fail("MISSING_GAME_DATA","Missing 14-1 data");
      return;
    }
    if(value.gameType==="threeCushion"){
      if(!isObject(data.settings)||!isObject(data.targetPoints)||!isObject(data.completedTurns)||!isObject(data.highRun)||!isObject(data.averages)||!Array.isArray(data.innings))fail("MISSING_GAME_DATA","Missing 3C data");
    }
  }

  function validateSharedMatchV1(value){
    assertBoundedStructure(value);
    assertPrivacySafe(value);
    if(!isObject(value)||value.format!==FORMAT)fail("INVALID_SCHEMA","Invalid logical format");
    if(value.formatVersion!==FORMAT_VERSION)fail("UNSUPPORTED_VERSION","Unsupported format version");
    if(!UUID_V4.test(String(value.sharedMatchId||"")))fail("INVALID_UUID","Invalid sharedMatchId");
    if(!GAME_TYPE_SET.has(value.gameType))fail("UNSUPPORTED_GAME_TYPE","Unsupported game type");
    const started=Date.parse(value.startedAt),ended=Date.parse(value.endedAt);
    if(!Number.isFinite(started)||!Number.isFinite(ended)||ended<started)fail("INVALID_SCHEMA","Invalid match dates");
    if(![0,1,2].includes(Number(value.winner))||!RESULTS.has(value.result))fail("INVALID_RESULT","Invalid result");
    if(value.result==="draw"&&Number(value.winner)!==0)fail("INVALID_RESULT","Draw winner must be 0");
    if(value.result==="win"&&![1,2].includes(Number(value.winner)))fail("INVALID_RESULT","Win requires a winner");
    validatePlayer(side(value.players),"A");
    validatePlayer(value.players?.[2]??value.players?.["2"],"B");
    if(!isObject(value.match)||!finite(value.match.inning)||value.match.inning<0||!finite(value.match.rack)||value.match.rack<0)fail("INVALID_SCHEMA","Invalid match condition");
    if(!Array.isArray(value.match.rackResults))fail("INVALID_SCHEMA","Invalid rack results");
    validateEventArray(value.events,"events");
    if(value.analysisEvents!=null)validateEventArray(value.analysisEvents,"analysisEvents");
    if(!["common","analysis"].includes(value.eventMode))fail("INVALID_SCHEMA","Invalid event mode");
    if(!isObject(value.progress)||!Array.isArray(value.progress.p1)||!Array.isArray(value.progress.p2))fail("INVALID_SCHEMA","Invalid progress");
    if(value.analysisSummary!=null&&!isObject(value.analysisSummary))fail("INVALID_SCHEMA","Invalid analysis summary");
    if(!["detail","simple"].includes(value.recordingMode))fail("INVALID_SCHEMA","Invalid recording mode");
    validateDiscipline(value);
    return value;
  }

  function isExportEligible(record,{demoMode=false}={}){
    if(demoMode)return false;
    if(!isObject(record)||!record.id||!record.players)return false;
    if(!record.endedAt||!RESULTS.has(record.result))return false;
    return [0,1,2].includes(Number(record.winner));
  }

  function assertExportEligible(record,options){
    if(options?.demoMode)fail("DEMO_EXPORT_REJECTED","Demo matches cannot be shared");
    if(!isExportEligible(record,options))fail("INELIGIBLE_MATCH","Only completed matches can be shared");
    return record;
  }

  function findDuplicateSharedMatchId(records,sharedMatchId){
    if(!UUID_V4.test(String(sharedMatchId||"")))fail("INVALID_UUID","Invalid sharedMatchId");
    return (Array.isArray(records)?records:[]).find(record=>String(record?.sharedMatchId||"").toLowerCase()===String(sharedMatchId).toLowerCase())||null;
  }

  return Object.freeze({
    FORMAT,FORMAT_VERSION,GAME_TYPES,UUID_V4,LIMITS,FORBIDDEN_KEYS,MatchSharingError,
    assertBoundedStructure,assertPrivacySafe,validateSharedMatchV1,isExportEligible,assertExportEligible,
    findDuplicateSharedMatchId,
  });
});
