(function(root,factory){
  const validation=typeof module==="object"&&module.exports?require("./match-sharing-validation-v1.js"):root.CueScoreMatchSharingValidationV1;
  const api=factory(validation);
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.CueScoreMatchSharingAdaptersV1=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(validation){
  "use strict";
  if(!validation)throw new Error("CueScore Match Sharing validation module is required");

  const PLAYER_FIELDS=Object.freeze([
    "name","goal","skillLevel","score","safety","fouls","breaks","maxRun",
    "completedTurns","average","share","misses","pocketCount","shotRate",
  ]);
  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
  const numberOr=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
  const side=(value,index)=>value?.[index]??value?.[String(index)];
  const EVENT_SPECS=Object.freeze({
    break_result:Object.freeze([1,Object.freeze(["breakPlayer","resultLabel","pocketCount","pocketedBalls","legalBreak","scratch","breakFoul","illegalBreak","preBreakFoul","breakFailed"])]),
    player_switch:Object.freeze([2,Object.freeze(["fromPlayer","toPlayer","reason"])]),
    safety:Object.freeze([3,Object.freeze(["phase"])]),
    ball_pocketed:Object.freeze([4,Object.freeze(["ball","points","pocketCount"])]),
    foul:Object.freeze([5,Object.freeze(["foulType","phase","source"])]),
    foul_result:Object.freeze([6,Object.freeze(["outcome"])]),
    safety_result:Object.freeze([7,Object.freeze(["opponent","outcome","causedBy"])]),
    rack_end:Object.freeze([8,Object.freeze(["winner","loser","rackEndReason"])]),
    carom_point:Object.freeze([9,Object.freeze(["ball","points","pocketCount"])]),
  });
  const EVENT_CODES=Object.freeze(Object.fromEntries(Object.entries(EVENT_SPECS).map(([type,[code]])=>[code,type])));

  // Match Sharing is an independent transport contract. Build each event from
  // its explicit v1 fields instead of cloning the local journal object, which
  // may also contain Category, Season, undo metadata, or future local fields.
  function sharedEvent(event){
    const type=String(event?.type||"");
    const spec=EVENT_SPECS[type];
    if(!spec)return null;
    const value={
      sequence:numberOr(event.sequence),type,
      rack:numberOr(event.rack),inning:numberOr(event.inning),
      player:event?.player==null?null:numberOr(event.player),
    };
    for(const key of spec[1])if(event?.[key]!==undefined)value[key]=clone(event[key]);
    return value;
  }
  const sharedEvents=events=>(Array.isArray(events)?events:[]).map(sharedEvent).filter(Boolean);

  function sharedAnalysisSummary(summary){
    if(!summary||typeof summary!=="object"||Array.isArray(summary))return null;
    const metrics=(source,keys)=>Object.fromEntries(keys.filter(key=>Object.hasOwn(source||{},key)).map(key=>[
      key,source[key]==null?null:numberOr(source[key])
    ]));
    const player=value=>({
      safety:metrics(value?.safety,["total","success","failed","successRate"]),
      foul:metrics(value?.foul,["total","opening","middle","late","punished","noScore","punishedRate"]),
    });
    return {
      schemaVersion:numberOr(summary.schemaVersion,2),eventCount:numberOr(summary.eventCount),
      players:{1:player(side(summary.players,1)),2:player(side(summary.players,2))},
    };
  }

  const sharedProgress=progress=>({
    p1:(Array.isArray(progress?.p1)?progress.p1:[]).map(value=>numberOr(value)),
    p2:(Array.isArray(progress?.p2)?progress.p2:[]).map(value=>numberOr(value)),
  });

  function sharedPlayer(player={}){
    return {
      name:String(player.name||"").trim(),
      goal:player.goal==null?null:numberOr(player.goal),
      skillLevel:player.skillLevel==null?null:numberOr(player.skillLevel),
      score:numberOr(player.score),
      safety:numberOr(player.safety),
      fouls:numberOr(player.fouls),
      breaks:numberOr(player.breaks),
      maxRun:numberOr(player.maxRun),
      completedTurns:numberOr(player.completedTurns),
      average:numberOr(player.average),
      share:numberOr(player.share),
      misses:numberOr(player.misses),
      pocketCount:numberOr(player.pocketCount),
      shotRate:numberOr(player.shotRate),
    };
  }

  function rackData(record,key){
    const source=record[key]||{};
    return {
      settings:clone(source.settings||{}),
      consecutiveFouls:clone(source.consecutiveFouls||{1:0,2:0}),
      ballInHandFor:source.ballInHandFor??null,
      initialBreaker:numberOr(source.initialBreaker??record.initialBreaker,1),
      ...(key==="tenBall"?{spotEvents:clone(source.spotEvents||[])}:{}),
    };
  }

  function disciplineData(record,gameType){
    if(gameType==="rotation")return {};
    if(gameType==="nineBall"||gameType==="tenBall")return rackData(record,gameType);
    if(gameType==="jpa9Ball"){
      const source=record.jpa9||{};
      return {
        skillLevels:clone(source.skillLevels||{1:numberOr(side(record.players,1)?.skillLevel),2:numberOr(side(record.players,2)?.skillLevel)}),
        targetPoints:clone(source.targetPoints||{1:numberOr(side(record.players,1)?.goal),2:numberOr(side(record.players,2)?.goal)}),
        deadBalls:clone(source.deadBalls||[]),
        deadBallEvents:clone(source.deadBallEvents||[]),
      };
    }
    if(gameType==="straightPool"){
      const source=record.straightPool||{};
      return {
        settings:clone(source.settings||{}),
        consecutiveFouls:clone(source.consecutiveFouls||{1:0,2:0}),
        openingBreaker:source.openingBreaker??null,
        rackCycle:numberOr(source.rackCycle??record.rack,1),
        spotEvents:clone(source.spotEvents||[]),
        rerackEvents:clone(source.rerackEvents||[]),
        openingBreakEvents:clone(source.openingBreakEvents||[]),
      };
    }
    if(gameType==="threeCushion"){
      const source=record.threeCushion||{};
      return {
        settings:clone(source.settings||{variant:source.ruleVariant||"threeCushion",drawAt25:source.drawAt25!==false}),
        ruleVariant:String(source.ruleVariant||source.settings?.variant||"threeCushion"),
        drawAt25:source.drawAt25!==false,
        draw:Boolean(source.draw??Number(record.winner)===0),
        targetPoints:clone(source.targetPoints||{1:numberOr(side(record.players,1)?.goal),2:numberOr(side(record.players,2)?.goal)}),
        currentInning:numberOr(source.currentInning??record.inning,1),
        completedTurns:clone(source.completedTurns||{1:numberOr(side(record.players,1)?.completedTurns),2:numberOr(side(record.players,2)?.completedTurns)}),
        highRun:clone(source.highRun||{1:numberOr(side(record.players,1)?.maxRun),2:numberOr(side(record.players,2)?.maxRun)}),
        averages:clone(source.averages||{1:numberOr(side(record.players,1)?.average),2:numberOr(side(record.players,2)?.average)}),
        innings:clone(source.innings||[]),
      };
    }
    return {};
  }

  function normalizeProductionGameType(gameType){
    const value=String(gameType||"");
    if(value==="jpa9")return "jpa9Ball";
    return value;
  }

  function buildSharedMatchV1(record,{sharedMatchId,demoMode=false}={}){
    validation.assertExportEligible(record,{demoMode});
    const gameType=normalizeProductionGameType(record.gameType);
    const commonEvents=Array.isArray(record.eventLog?.events)?record.eventLog.events:[];
    const analysisEvents=Array.isArray(record.analysis?.events)?record.analysis.events:[];
    const eventMode=commonEvents.length?"common":"analysis";
    const value={
      format:validation.FORMAT,
      formatVersion:validation.FORMAT_VERSION,
      sharedMatchId:String(sharedMatchId||record.sharedMatchId||""),
      gameType,
      startedAt:String(record.startedAt||record.playedAt||record.endedAt||""),
      endedAt:String(record.endedAt||record.playedAt||""),
      winner:Number(record.winner),
      result:String(record.result||""),
      match:{
        inning:numberOr(record.inning),
        rack:numberOr(record.rack),
        breakRule:record.breakRule??null,
        initialBreaker:record.initialBreaker==null?null:numberOr(record.initialBreaker),
        rackResults:clone(record.rackResults||[]),
        ruleId:String(record.rulesEngine?.ruleId||gameType),
      },
      players:{1:sharedPlayer(side(record.players,1)),2:sharedPlayer(side(record.players,2))},
      discipline:disciplineData(record,gameType),
      eventMode,
      events:sharedEvents(eventMode==="common"?commonEvents:analysisEvents),
      analysisEvents:eventMode==="common"?sharedEvents(analysisEvents):null,
      analysisSummary:sharedAnalysisSummary(record.analysis?.summary),
      recordingMode:String(record.analysis?.report?.recordingMode||(analysisEvents.length?"detail":"simple")),
      progress:sharedProgress(record.progress||{p1:[0,numberOr(side(record.players,1)?.score)],p2:[0,numberOr(side(record.players,2)?.score)]}),
    };
    return validation.validateSharedMatchV1(value);
  }

  function sharedPlayerToArray(player){return PLAYER_FIELDS.map(key=>player[key]??null);}
  function sharedPlayerFromArray(value){
    if(!Array.isArray(value)||value.length!==PLAYER_FIELDS.length)throw new validation.MatchSharingError("INVALID_SCHEMA","Invalid compact player");
    return Object.fromEntries(PLAYER_FIELDS.map((key,index)=>[key,value[index]]));
  }

  function compactEvent(event){
    const {sequence,type,rack,inning,player,...details}=event||{};
    const spec=EVENT_SPECS[type];
    if(!spec)return [sequence??0,String(type||""),rack??0,inning??0,player??0,details];
    if(Object.keys(details).some(key=>!spec[1].includes(key)))return [sequence??0,String(type||""),rack??0,inning??0,player??0,details];
    return [sequence??0,spec[0],rack??0,inning??0,player??0,spec[1].map(key=>details[key]??null)];
  }
  function expandEvent(value){
    if(!Array.isArray(value)||value.length!==6)throw new validation.MatchSharingError("INVALID_SCHEMA","Invalid compact event");
    const type=typeof value[1]==="number"?EVENT_CODES[value[1]]:value[1];
    if(!type)throw new validation.MatchSharingError("INVALID_SCHEMA","Unknown compact event type");
    const spec=EVENT_SPECS[type];
    const details=spec&&Array.isArray(value[5])
      ?Object.fromEntries(spec[1].map((key,index)=>[key,value[5]?.[index]]).filter(([,item])=>item!==null&&item!==undefined))
      :(value[5]||{});
    return {sequence:value[0],type,rack:value[2],inning:value[3],player:value[4],...details};
  }

  const COMPACT_FIELD_MAP=Object.freeze({
    m:"magic",v:"formatVersion",i:"sharedMatchId",g:"gameType",s:"startedAtEpochMs",e:"endedAtEpochMs",
    w:"winner",r:"result",c:"matchCondition",p:"players",d:"discipline",em:"eventMode",ev:"events",
    ae:"analysisEvents",as:"analysisSummary",rm:"recordingMode",pg:"progress",
  });
  const GAME_CODES=Object.freeze({rotation:0,nineBall:1,tenBall:2,jpa9Ball:3,straightPool:4,threeCushion:5});
  const CODE_GAMES=Object.freeze(Object.fromEntries(Object.entries(GAME_CODES).map(([key,value])=>[value,key])));

  function compactSharedMatchV1(value){
    validation.validateSharedMatchV1(value);
    return {
      m:"CSM",v:value.formatVersion,i:value.sharedMatchId,g:GAME_CODES[value.gameType],
      s:Date.parse(value.startedAt),e:Date.parse(value.endedAt),w:value.winner,r:value.result==="draw"?0:1,
      c:[value.match.inning,value.match.rack,value.match.breakRule,value.match.initialBreaker,value.match.rackResults,value.match.ruleId],
      p:[sharedPlayerToArray(value.players[1]),sharedPlayerToArray(value.players[2])],
      d:value.discipline,em:value.eventMode==="common"?1:0,ev:value.events.map(compactEvent),
      ae:value.analysisEvents?.map(compactEvent)??null,as:value.analysisSummary,rm:value.recordingMode==="detail"?1:0,pg:value.progress,
    };
  }

  function expandSharedMatchV1(value){
    if(!value||value.m!=="CSM"||!Array.isArray(value.c)||!Array.isArray(value.p))throw new validation.MatchSharingError("INVALID_SCHEMA","Invalid compact match");
    const gameType=CODE_GAMES[value.g];
    if(!Number.isFinite(value.s)||!Number.isFinite(value.e))throw new validation.MatchSharingError("INVALID_SCHEMA","Invalid compact dates");
    const startedAt=new Date(value.s),endedAt=new Date(value.e);
    if(!Number.isFinite(startedAt.getTime())||!Number.isFinite(endedAt.getTime()))throw new validation.MatchSharingError("INVALID_SCHEMA","Invalid compact dates");
    const logical={
      format:validation.FORMAT,formatVersion:value.v,sharedMatchId:value.i,gameType,
      startedAt:startedAt.toISOString(),endedAt:endedAt.toISOString(),winner:value.w,result:value.r===0?"draw":"win",
      match:{inning:value.c[0],rack:value.c[1],breakRule:value.c[2],initialBreaker:value.c[3],rackResults:value.c[4],ruleId:value.c[5]},
      players:{1:sharedPlayerFromArray(value.p[0]),2:sharedPlayerFromArray(value.p[1])},
      discipline:value.d,eventMode:value.em===1?"common":"analysis",events:(value.ev||[]).map(expandEvent),
      analysisEvents:value.ae?.map(expandEvent)??null,analysisSummary:value.as??null,
      recordingMode:value.rm===1?"detail":"simple",progress:value.pg,
    };
    return validation.validateSharedMatchV1(logical);
  }

  return Object.freeze({
    PLAYER_FIELDS,EVENT_SPECS,EVENT_CODES,COMPACT_FIELD_MAP,GAME_CODES,CODE_GAMES,normalizeProductionGameType,
    buildSharedMatchV1,compactSharedMatchV1,expandSharedMatchV1,
  });
});
