(function(root,factory){
  let validation=root?.CueScoreMatchSharingValidationV1;
  let adapters=root?.CueScoreMatchSharingAdaptersV1;
  let persistence=root?.CueScoreMatchSharingPersistenceV1;
  let players=root?.CueScoreMatchSharingPlayerDraftsV1;
  if(typeof module==="object"&&module.exports){
    validation=require("./match-sharing-validation-v1.js");
    adapters=require("./match-sharing-adapters-v1.js");
    persistence=require("./match-sharing-persistence-v1.js");
    players=require("./match-sharing-player-drafts-v1.js");
  }
  const api=factory(validation,adapters,persistence,players);
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.CueScoreMatchSharingTransactionV1=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(validation,adapters,persistence,playerDrafts){
  "use strict";
  if(!validation||!adapters||!persistence||!playerDrafts)throw new Error("Match Sharing Stage 3 dependencies are required");

  class MatchSharingImportError extends Error{
    constructor(code,message,options={}){super(message,options);this.name="MatchSharingImportError";this.code=code;}
  }

  const fail=(code,message,details)=>{const error=new MatchSharingImportError(code,message);if(details!==undefined)error.details=details;throw error;};
  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
  const side=(value,index)=>value?.[index]??value?.[String(index)];
  const idOf=value=>String(value?.id??"").trim();
  const isObject=value=>Boolean(value)&&typeof value==="object"&&!Array.isArray(value);
  const canonical=value=>Array.isArray(value)
    ?value.map(canonical)
    :isObject(value)?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
  const semanticallyEqual=(left,right)=>JSON.stringify(canonical(left))===JSON.stringify(canonical(right));

  function validateMappingPlan(mappingPlan,logicalMatch){
    if(!isObject(mappingPlan))fail("MISSING_MAPPING","Receiver mapping is required");
    if(Object.hasOwn(mappingPlan,"selectedSide")||Object.hasOwn(mappingPlan,"self")||Object.hasOwn(mappingPlan,"opponent")){
      fail("LEGACY_MAPPING_PLAN","Self/opponent mapping is not supported");
    }
    const bySide=isObject(mappingPlan.bySide)?mappingPlan.bySide:null;
    const entries=[side(bySide,1),side(bySide,2)];
    if(entries.some(entry=>!isObject(entry)||!["existing","new"].includes(entry.kind))){
      fail("MISSING_MAPPING","Player 1 and Player 2 mappings are required");
    }
    if(entries[0].kind==="existing"&&entries[1].kind==="existing"&&String(entries[0].playerId)===String(entries[1].playerId)){
      fail("SAME_LOCAL_PLAYER","Player 1 and Player 2 must use different local Players");
    }
    if(entries[0].kind==="new"&&entries[1].kind==="new"){
      const firstKey=String(entries[0].pendingKey||"");
      const secondKey=String(entries[1].pendingKey||"");
      if(entries[0].draft===entries[1].draft||(firstKey&&firstKey===secondKey)){
        fail("SAME_PENDING_PLAYER","Player 1 and Player 2 cannot use the same pending Player");
      }
    }
    validation.validateSharedMatchV1(logicalMatch);
    return {bySide:{1:entries[0],2:entries[1]}};
  }

  function requireExistingPlayer(entry,currentPlayers,label){
    const wanted=String(entry.playerId||"");
    const player=(Array.isArray(currentPlayers)?currentPlayers:[]).find(item=>idOf(item)===wanted);
    if(!player||!playerDrafts.isValidLocalPlayer(player))fail("INVALID_LOCAL_PLAYER",`${label} local Player is missing or invalid`);
    return clone(player);
  }

  function resolveMappings(logicalMatch,mappingPlan,currentPlayers,{now,idFactory}={}){
    const validated=validateMappingPlan(mappingPlan,logicalMatch);
    const existing=clone(Array.isArray(currentPlayers)?currentPlayers:[]);
    const created=[];
    const resolve=(entry,label)=>{
      if(entry.kind==="existing")return requireExistingPlayer(entry,existing,label);
      const draft=playerDrafts.createLocalPlayerDraft(entry.draft,{existingPlayers:[...existing,...created],now,idFactory});
      created.push(draft);
      return clone(draft);
    };
    const bySide={
      1:resolve(validated.bySide[1],"Player 1"),
      2:resolve(validated.bySide[2],"Player 2"),
    };
    if(idOf(bySide[1])===idOf(bySide[2]))fail("SAME_LOCAL_PLAYER","Player 1 and Player 2 must use different local Players");
    return {bySide,created};
  }

  function buildReceiverLocalMatch(logicalMatch,mapping,{localMatchId,appVersion="1.0",recordSchemaVersion=4,eventSchemaVersion=5,analysisSchemaVersion=2,checkedAt}={}){
    const logical=clone(validation.validateSharedMatchV1(logicalMatch));
    const id=String(localMatchId||"").trim();
    if(!id)fail("INVALID_LOCAL_MATCH_ID","Receiver-local Match ID is required");
    const playerFor=number=>{
      const local=mapping.bySide[number];
      if(!playerDrafts.isValidLocalPlayer(local))fail("INVALID_LOCAL_PLAYER",`Mapped Player ${number} is invalid`);
      return {...clone(side(logical.players,number)),name:local.name,registeredPlayerId:local.id};
    };
    const commonEvents=logical.eventMode==="common"?clone(logical.events):[];
    const analysisEvents=logical.eventMode==="common"?clone(logical.analysisEvents||[]):clone(logical.events);
    const p1=playerFor(1),p2=playerFor(2);
    const progress=clone(logical.progress);
    const record={
      id,
      sharedMatchId:logical.sharedMatchId,
      gameType:logical.gameType,
      recordSchemaVersion:Number(recordSchemaVersion)||4,
      createdByAppVersion:String(appVersion||"1.0"),
      playedAt:logical.endedAt,
      startedAt:logical.startedAt,
      endedAt:logical.endedAt,
      winner:Number(logical.winner),
      result:logical.result,
      inning:Number(logical.match.inning),
      rack:Number(logical.match.rack),
      breakRule:logical.match.breakRule??null,
      initialBreaker:logical.match.initialBreaker??null,
      rackResults:clone(logical.match.rackResults),
      category:"",
      season:"",
      playerReflections:{},
      reflection:null,
      rulesEngine:{schemaVersion:2,gameplayEventVersion:"7.2.0",ruleId:String(logical.match.ruleId||logical.gameType)},
      eventLog:{schemaVersion:Number(eventSchemaVersion)||5,undoModel:"snapshot_rebuild_with_event_invalidation_v7.2",events:commonEvents,journal:[],undoCount:0},
      analysis:{schemaVersion:Number(analysisSchemaVersion)||2,events:analysisEvents,summary:clone(logical.analysisSummary),report:{recordingMode:logical.recordingMode}},
      progress,
      consistencyAudit:{
        schemaVersion:1,source:"active_common_event_log",checkedAt:String(checkedAt||logical.endedAt),
        scoreMatchesProgress:Number(progress.p1.at(-1)||0)===Number(p1.score||0)&&Number(progress.p2.at(-1)||0)===Number(p2.score||0),
        activeEventCount:commonEvents.length,
      },
      players:{1:p1,2:p2},
    };
    const data=clone(logical.discipline);
    if(logical.gameType==="nineBall")record.nineBall=data;
    if(logical.gameType==="tenBall")record.tenBall=data;
    if(logical.gameType==="jpa9Ball")record.jpa9=data;
    if(logical.gameType==="straightPool")record.straightPool=data;
    if(logical.gameType==="threeCushion")record.threeCushion=data;
    return record;
  }

  function expectedLogicalForMapping(logical,mapping){
    const expected=clone(logical);
    expected.players[1].name=mapping.bySide[1].name;
    expected.players[2].name=mapping.bySide[2].name;
    return expected;
  }

  function verifyReadBack({logicalMatch,mapping,localMatchId,createdPlayerIds,players:storedPlayers,matches:storedMatches}){
    const matchList=Array.isArray(storedMatches)?storedMatches:[];
    const playerList=Array.isArray(storedPlayers)?storedPlayers:[];
    const imported=matchList.filter(record=>idOf(record)===String(localMatchId));
    if(imported.length!==1)fail("READBACK_MISMATCH","Imported Match was not read back exactly once");
    const sharedMatches=matchList.filter(record=>String(record?.sharedMatchId||"").toLowerCase()===String(logicalMatch.sharedMatchId).toLowerCase());
    if(sharedMatches.length!==1||idOf(sharedMatches[0])!==String(localMatchId))fail("READBACK_MISMATCH","sharedMatchId read-back is not unique");
    for(const playerId of createdPlayerIds){
      if(playerList.filter(player=>idOf(player)===String(playerId)).length!==1)fail("READBACK_MISMATCH","Created Player was not read back exactly once");
    }
    const record=imported[0];
    if(idOf(side(record.players,1)?.registeredPlayerId?{id:side(record.players,1).registeredPlayerId}:null)!==idOf(mapping.bySide[1])||
       idOf(side(record.players,2)?.registeredPlayerId?{id:side(record.players,2).registeredPlayerId}:null)!==idOf(mapping.bySide[2])){
      fail("READBACK_MISMATCH","Receiver-local Player mapping did not match");
    }
    const rebuilt=adapters.buildSharedMatchV1(record,{sharedMatchId:logicalMatch.sharedMatchId});
    if(!semanticallyEqual(rebuilt,expectedLogicalForMapping(logicalMatch,mapping))){
      fail("READBACK_MISMATCH","Imported Match semantic facts did not match");
    }
    return record;
  }

  function createOneShotImportedDetailAccess(){
    let exactId=null;
    return Object.freeze({
      grant(id){exactId=String(id||"")||null;return exactId;},
      consume(id,lookup){
        const wanted=String(id||"");
        if(!exactId||wanted!==exactId)return null;
        exactId=null;
        return typeof lookup==="function"?(lookup(wanted)||null):wanted;
      },
      clear(){exactId=null;},
      has(id){return Boolean(exactId&&String(id||"")===exactId);},
    });
  }

  function importSharedMatch({
    logicalMatch,mappingPlan,demoMode=false,readPlayers,readMatches,transaction,
    playerIdFactory,matchIdFactory,now=Date.now(),appVersion="1.0",recordSchemaVersion=4,
    eventSchemaVersion=5,analysisSchemaVersion=2,
  }={}){
    if(demoMode)fail("DEMO_IMPORT_REJECTED","Demo matches cannot be imported");
    if(typeof readPlayers!=="function"||typeof readMatches!=="function")fail("INVALID_STORAGE_ADAPTER","Storage readers are required");
    if(!transaction||typeof transaction.perform!=="function"||typeof transaction.restore!=="function"||typeof transaction.matchesSnapshot!=="function"){
      fail("INVALID_STORAGE_ADAPTER","Transaction adapter is incomplete");
    }
    const logical=clone(validation.validateSharedMatchV1(logicalMatch));
    validateMappingPlan(mappingPlan,logical);
    const initialMatches=readMatches();
    if(persistence.findDuplicateSharedMatchId(initialMatches,logical.sharedMatchId))fail("DUPLICATE_SHARED_MATCH_ID","This Match has already been imported");

    const finalPlayers=readPlayers();
    const finalMatches=readMatches();
    if(persistence.findDuplicateSharedMatchId(finalMatches,logical.sharedMatchId))fail("DUPLICATE_SHARED_MATCH_ID","This Match has already been imported");
    const mapping=resolveMappings(logical,mappingPlan,finalPlayers,{now,idFactory:playerIdFactory});
    const localMatchId=String((typeof matchIdFactory==="function"?matchIdFactory():globalThis.crypto?.randomUUID?.())||"").trim();
    if(!localMatchId)fail("INVALID_LOCAL_MATCH_ID","Match ID generation failed");
    if(localMatchId.toLowerCase()===String(logical.sharedMatchId).toLowerCase())fail("LOCAL_MATCH_ID_COLLISION","Local Match ID must be separate from sharedMatchId");
    if(finalMatches.some(record=>idOf(record)===localMatchId))fail("LOCAL_MATCH_ID_COLLISION","Generated Match ID already exists");
    const imported=buildReceiverLocalMatch(logical,mapping,{localMatchId,appVersion,recordSchemaVersion,eventSchemaVersion,analysisSchemaVersion,checkedAt:new Date(Number(now)).toISOString()});
    const nextPlayers=[...clone(finalPlayers),...clone(mapping.created)];
    const nextMatches=[...clone(finalMatches),imported];
    persistence.validateSharedMatchIds(nextMatches);

    let transactionResult;
    try{
      transactionResult=transaction.perform(nextPlayers,nextMatches);
    }catch(error){
      if(error?.restoreRollbackVerified===false)throw new MatchSharingImportError("ROLLBACK_VERIFICATION_FAILED","Import rollback could not be verified",{cause:error});
      const code=/quota/i.test(String(error?.name||"")+String(error?.message||"")+String(error?.cause?.name||""))?"QUOTA_EXCEEDED":"TRANSACTION_WRITE_FAILED";
      throw new MatchSharingImportError(code,"Import transaction failed",{cause:error});
    }

    try{
      verifyReadBack({logicalMatch:logical,mapping,localMatchId,createdPlayerIds:mapping.created.map(idOf),players:readPlayers(),matches:readMatches()});
    }catch(error){
      let restored=false;
      try{restored=transaction.restore(transactionResult?.snapshot)&&transaction.matchesSnapshot(transactionResult?.snapshot);}catch(_){restored=false;}
      if(!restored)throw new MatchSharingImportError("ROLLBACK_VERIFICATION_FAILED","Import rollback could not be verified",{cause:error});
      throw new MatchSharingImportError("READBACK_MISMATCH","Import read-back failed and was rolled back",{cause:error});
    }

    return Object.freeze({
      success:true,
      importedLocalMatchId:localMatchId,
      sharedMatchId:logical.sharedMatchId,
      createdPlayerIds:Object.freeze(mapping.created.map(idOf)),
    });
  }

  return Object.freeze({
    MatchSharingImportError,validateMappingPlan,resolveMappings,buildReceiverLocalMatch,verifyReadBack,
    createOneShotImportedDetailAccess,importSharedMatch,
  });
});
