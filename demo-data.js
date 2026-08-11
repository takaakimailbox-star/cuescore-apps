/* CueScore Sample Data v3.1 — deterministic production-like RC verification data. */
(() => {
  "use strict";

  // 120 records (20 per discipline) is the iPhone-safe production snapshot.
  // Larger 500/1,000-record datasets remain available only through benchmark().
  const VERSION="3.1",PREFIX="cuescore-demo",PLAYER_COUNT=10,TOTAL_MATCHES=120,MAX_MATCHES=1000;
  const KEYS=Object.freeze({
    mode:`${PREFIX}.mode.v1`,players:`${PREFIX}.players.v1`,records:`${PREFIX}.matchRecords.v1`,
    categories:`${PREFIX}.matchCategories.v1`,seasons:`${PREFIX}.matchSeasons.v1`,metadata:`${PREFIX}.metadata.v1`
  });
  const NORMAL_TO_DEMO_KEY=Object.freeze({
    "rotationScoreboard.players.v1":KEYS.players,"rotationScoreboard.matchRecords.v1":KEYS.records,
    "rotationScoreboard.matchCategories.v1":KEYS.categories,"rotationScoreboard.matchSeasons.v1":KEYS.seasons
  });

  // This is the only registered sample-player roster. Match generation always
  // resolves both sides from these stable Player IDs.
  const playerDefinitions=[
    {name:"はると",memo:"ローテーションが得意",avatarId:"male_01",base:.78,favorites:["rotation","straightPool"]},
    {name:"みさき",memo:"9ボールが好き",avatarId:"female_01",base:.70,favorites:["9ball","10ball"]},
    {name:"かいと",memo:"セーフティ強化中",avatarId:"male_02",base:.62,favorites:["9ball","jpa9"]},
    {name:"ひな",memo:"楽しくプレー♪",avatarId:"female_02",base:.55,favorites:["jpa9","threeCushion"]},
    {name:"たくみ",memo:"ブレイク練習中",avatarId:"male_03",base:.67,favorites:["10ball","rotation"]},
    {name:"あおい",memo:"コツコツ練習中",avatarId:"female_03",base:.49,favorites:["straightPool","9ball"]},
    {name:"なおき",memo:"ハイラン更新中",avatarId:"male_04",base:.74,favorites:["straightPool","threeCushion"]},
    {name:"さくら",memo:"試合を楽しむ！",avatarId:"female_04",base:.58,favorites:["rotation","jpa9"]},
    {name:"しょう",memo:"14-1挑戦中",avatarId:"male_05",base:.65,favorites:["straightPool","10ball"]},
    {name:"ゆな",memo:"3C練習中",avatarId:"female_05",base:.52,favorites:["threeCushion","9ball"]}
  ];
  const disciplineDefinitions=[
    {gameType:"nineBall",disciplineId:"9ball",count:220},
    {gameType:"rotation",disciplineId:"rotation",count:190},
    {gameType:"tenBall",disciplineId:"10ball",count:175},
    {gameType:"jpa9",disciplineId:"jpa9",count:160},
    {gameType:"straightPool",disciplineId:"straightPool",count:140},
    {gameType:"threeCushion",disciplineId:"threeCushion",count:115}
  ];
  const monthWeights=[42,55,38,71,49,64,82,45,76,53,69,88,57,73,65,73];
  const buildPlayers=()=>playerDefinitions.map((definition,index)=>({
    id:`demo-player-${String(index+1).padStart(2,"0")}`,name:definition.name,memo:definition.memo,
    avatar:{type:"preset",id:definition.avatarId},...(index===0?{isPrimary:true}:{})
  }));
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const hash=value=>{let result=2166136261;for(const character of String(value)){result^=character.charCodeAt(0);result=Math.imul(result,16777619);}return result>>>0;};
  const randomFor=seed=>{let value=hash(seed)||1;return()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};};
  const choose=(random,values)=>values[Math.floor(random()*values.length)%values.length];
  const splitTotal=(total,count,random)=>{
    if(count<=0)return[];const weights=Array.from({length:count},()=>.35+random()*1.3),sum=weights.reduce((a,b)=>a+b,0);
    const values=weights.map(weight=>Math.floor(total*weight/sum));let rest=total-values.reduce((a,b)=>a+b,0);
    while(rest>0){values[Math.floor(random()*values.length)]++;rest--;}return values;
  };
  const strength=(playerIndex,disciplineId,monthIndex)=>{
    const definition=playerDefinitions[playerIndex],favorite=definition.favorites.includes(disciplineId)?.09:0;
    const formWave=Math.sin((monthIndex+playerIndex*1.7)*.82)*.075;
    return clamp(definition.base+favorite+formWave,.32,.91);
  };
  const goalFor=(disciplineId,seed,side=1)=>{
    if(disciplineId==="rotation")return 120;
    if(disciplineId==="straightPool")return seed%3===0?75:50;
    if(disciplineId==="jpa9")return [14,19,25,31,38][(seed+side)%5];
    if(disciplineId==="threeCushion")return [15,20,25,30][(seed+side)%4];
    return 5+(seed%3);
  };
  const makeSchedule=()=>{
    const first=Date.parse("2025-04-01T10:00:00+09:00"),monthSlots=[];
    monthWeights.forEach((weight,monthIndex)=>{for(let slot=0;slot<weight;slot++)monthSlots.push(monthIndex);});
    const items=[];let globalIndex=0;
    disciplineDefinitions.forEach((discipline,disciplineIndex)=>{
      for(let localIndex=0;localIndex<discipline.count;localIndex++,globalIndex++){
        const random=randomFor(`schedule:${discipline.disciplineId}:${localIndex}`);
        const monthIndex=monthSlots[(globalIndex*37+disciplineIndex*53)%monthSlots.length];
        const date=new Date(first);date.setMonth(date.getMonth()+monthIndex);date.setDate(1+Math.floor(random()*27));date.setHours(9+Math.floor(random()*14),Math.floor(random()*60),0,0);
        // Half the schedule follows recurring-rival edges, the rest rotates broadly.
        const recurring=localIndex%4<2,p1=(localIndex*3+disciplineIndex*2)%10;
        let p2=recurring?(p1+1+(disciplineIndex%3))%10:(p1+2+Math.floor(random()*7))%10;
        if(p2===p1)p2=(p2+1)%10;
        items.push({discipline,disciplineIndex,localIndex,index:globalIndex,monthIndex,date,p1,p2});
      }
    });
    return items.sort((a,b)=>a.date-b.date).map((item,index)=>({...item,index}));
  };

  function eventBuilders(recordId,discipline,startedAt){
    const analysis=[];let sequence=0;
    const at=offset=>new Date(startedAt.getTime()+offset*60000).toISOString();
    const push=(type,player,inning,rack,details={})=>{
      sequence++;analysis.push({sequence,type,rack,inning,player,...details});
    };
    return {analysis,push,lastAt:()=>at(sequence*2+5)};
  }

  function rackMatch(item,players,random){
    const {discipline,index,monthIndex}=item,goal1=goalFor(discipline.disciplineId,index,1),goal2=goalFor(discipline.disciplineId,index,2);
    const s1=strength(item.p1,discipline.disciplineId,monthIndex),s2=strength(item.p2,discipline.disciplineId,monthIndex);
    const upset=random()<.16,advantage=s1-s2+(random()-.5)*.42,winningSide=upset?(advantage>=0?2:1):(advantage>=0?1:2);
    const winnerGoal=winningSide===1?goal1:goal2,loserGoal=winningSide===1?goal2:goal1;
    const boundary=index%97===0,close=index%4===0,loserScore=boundary?0:close?Math.max(0,Math.min(loserGoal-1,winnerGoal-1)):Math.floor(random()*Math.max(1,loserGoal-1));
    const finalScores=winningSide===1?{1:winnerGoal,2:loserScore}:{1:loserScore,2:winnerGoal};
    const totalRacks=finalScores[1]+finalScores[2],rackWinners=[];
    for(let side=1;side<=2;side++)for(let count=0;count<finalScores[side];count++)rackWinners.push(side);
    for(let position=rackWinners.length-1;position>0;position--){const swap=Math.floor(random()*(position+1));[rackWinners[position],rackWinners[swap]]=[rackWinners[swap],rackWinners[position]];}
    if(rackWinners.at(-1)!==winningSide){const swap=rackWinners.indexOf(winningSide);[rackWinners[swap],rackWinners[rackWinners.length-1]]=[rackWinners.at(-1),winningSide];}
    const events=eventBuilders(`sample-match-${index+1}`,discipline,item.date),rackResults=[];
    const metrics={1:{pockets:0,misses:0,fouls:0,safety:0,breaks:0,maxRun:0,turns:0},2:{pockets:0,misses:0,fouls:0,safety:0,breaks:0,maxRun:0,turns:0}};
    let inning=0;
    rackWinners.forEach((rackWinner,rackOffset)=>{
      const rack=rackOffset+1,breaker=(rack+index)%2?1:2,other=breaker===1?2:1,breakerStrength=breaker===1?s1:s2;
      const roll=random(),scratch=roll<.08,breakFoul=roll>=.08&&roll<.14,dry=roll>=.14&&roll<.36;
      const breakCount=dry?0:1+(random()<.18?1:0),breakBalls=Array.from({length:breakCount},(_,ballIndex)=>1+((index+rack*3+ballIndex)%((discipline.disciplineId==="10ball")?10:9)));
      inning++;metrics[breaker].breaks++;
      events.push("break_result",breaker,inning,rack,{breakPlayer:breaker,resultLabel:scratch?"スクラッチ":breakFoul?"ブレイクファール":dry?"無得点":`${breakCount}球イン`,pocketCount:breakCount,pocketedBalls:breakBalls,legalBreak:!scratch&&!breakFoul,scratch,breakFoul,illegalBreak:false,preBreakFoul:false,breakFailed:false});
      if(scratch||breakFoul){metrics[breaker].fouls++;events.push("foul",breaker,inning,rack,{foulType:scratch?"break_scratch":"break_foul",phase:"opening",source:"break_prompt"});}
      const runOut=!scratch&&!breakFoul&&!dry&&rackWinner===breaker&&random()<(.08+breakerStrength*.18);
      if(runOut){
        const target=discipline.disciplineId==="10ball"?10:9,run=2+Math.floor(random()*4);metrics[breaker].pockets+=breakCount+run;metrics[breaker].maxRun=Math.max(metrics[breaker].maxRun,breakCount+run);metrics[breaker].turns++;
        events.push("ball_pocketed",breaker,inning,rack,{ball:target,points:run,pocketCount:run});
      }else{
        const first=(!scratch&&!breakFoul&&!dry)?breaker:other,second=first===1?2:1;
        const firstRun=Math.floor(random()*4),secondRun=1+Math.floor(random()*4);
        metrics[first].pockets+=firstRun;metrics[first].misses++;metrics[first].turns++;metrics[first].maxRun=Math.max(metrics[first].maxRun,firstRun);
        if(firstRun)events.push("ball_pocketed",first,inning,rack,{ball:1+((index+rack)%8),points:firstRun,pocketCount:firstRun});
        const safetyAttempt=random()<.24,safetySuccess=safetyAttempt&&random()<.62;
        if(safetyAttempt){metrics[first].safety++;events.push("safety",first,inning,rack,{phase:"middle"});events.push("player_switch",first,inning,rack,{fromPlayer:first,toPlayer:second,reason:"safety"});}
        else if(!firstRun)events.push("player_switch",first,inning,rack,{fromPlayer:first,toPlayer:second,reason:"miss"});
        metrics[second].turns++;
        if(safetyAttempt&&safetySuccess){metrics[second].misses++;events.push("player_switch",second,inning,rack,{fromPlayer:second,toPlayer:first,reason:"miss"});}
        else{metrics[second].pockets+=secondRun;metrics[second].maxRun=Math.max(metrics[second].maxRun,secondRun);events.push("ball_pocketed",second,inning,rack,{ball:discipline.disciplineId==="10ball"?10:9,points:secondRun,pocketCount:secondRun});}
        if(safetyAttempt)events.push("safety_result",first,inning,rack,{opponent:second,outcome:safetySuccess?"success":"failed",causedBy:safetySuccess?"opponent_no_valid_pocket":"opponent_valid_pocket"});
      }
      events.push("rack_end",rackWinner,inning,rack,{winner:rackWinner,loser:rackWinner===1?2:1,rackEndReason:runOut?"break_run_out":"winning_ball"});
      rackResults.push({rack,winner:rackWinner,breaker,breakRunOut:runOut});
    });
    return finishRecord(item,players,events,metrics,finalScores,{1:goal1,2:goal2},winningSide,{rackResults,inning,rack:totalRacks});
  }

  function pointsMatch(item,players,random){
    const {discipline,index,monthIndex}=item,goal1=goalFor(discipline.disciplineId,index,1),goal2=goalFor(discipline.disciplineId,index,2);
    const s1=strength(item.p1,discipline.disciplineId,monthIndex),s2=strength(item.p2,discipline.disciplineId,monthIndex),upset=random()<.17;
    const advantage=s1-s2+(random()-.5)*.36,winningSide=upset?(advantage>=0?2:1):(advantage>=0?1:2),close=index%4===0,boundary=index%113===0;
    const winnerGoal=winningSide===1?goal1:goal2,loserGoal=winningSide===1?goal2:goal1;
    const loserScore=boundary?0:close?Math.max(0,Math.min(loserGoal-1,winnerGoal-1-Math.floor(random()*3))):Math.min(loserGoal-1,Math.floor(loserGoal*(.28+random()*.5)));
    const scores=winningSide===1?{1:winnerGoal,2:loserScore}:{1:loserScore,2:winnerGoal};
    const long=index%127===0,short=index%89===0;
    const turnCount=long?34:short?4:8+Math.floor(random()*11),runs={1:splitTotal(scores[1],Math.ceil(turnCount/2),random),2:splitTotal(scores[2],Math.floor(turnCount/2),random)};
    const events=eventBuilders(`sample-match-${index+1}`,discipline,item.date),metrics={1:{pockets:0,misses:0,fouls:0,safety:0,breaks:0,maxRun:0,turns:0},2:{pockets:0,misses:0,fouls:0,safety:0,breaks:0,maxRun:0,turns:0}};
    let p1Index=0,p2Index=0,pendingSafety=null;
    for(let turn=1;turn<=turnCount;turn++){
      const side=turn%2?1:2,other=side===1?2:1,points=side===1?(runs[1][p1Index++]||0):(runs[2][p2Index++]||0),rack=Math.max(1,Math.ceil(turn/2));
      metrics[side].turns++;metrics[side].pockets+=points;metrics[side].maxRun=Math.max(metrics[side].maxRun,points);
      if((discipline.disciplineId==="rotation"||discipline.disciplineId==="jpa9")&&turn%4===1){
        const roll=random(),scratch=roll<.07,breakFoul=roll>=.07&&roll<.13,dry=roll>=.13&&roll<.34,count=dry?0:1+(random()<.14?1:0);
        metrics[side].breaks++;events.push("break_result",side,turn,rack,{breakPlayer:side,resultLabel:scratch?"スクラッチ":breakFoul?"ブレイクファール":dry?"無得点":`${count}球イン`,pocketCount:count,pocketedBalls:Array.from({length:count},(_,i)=>1+((index+turn+i)%9)),legalBreak:!scratch&&!breakFoul,scratch,breakFoul,illegalBreak:false,preBreakFoul:false,breakFailed:false});
        if(scratch||breakFoul){metrics[side].fouls++;events.push("foul",side,turn,rack,{foulType:scratch?"break_scratch":"break_foul",phase:"opening",source:"break_prompt"});}
      }
      if(points>0)events.push(discipline.disciplineId==="threeCushion"?"carom_point":"ball_pocketed",side,turn,rack,{ball:1+((index+turn)%15),points,pocketCount:points});
      else metrics[side].misses++;
      const foul=random()<.12;
      if(foul){metrics[side].fouls++;events.push("foul",side,turn,rack,{foulType:"cue_ball",phase:turn<4?"opening":turn>turnCount-3?"late":"middle"});events.push("foul_result",side,turn,rack,{outcome:random()<.55?"opponent_scored":"no_score"});}
      if(pendingSafety&&pendingSafety.opponent===side){const validPocket=points>0&&!foul;events.push("safety_result",pendingSafety.player,turn,rack,{opponent:side,outcome:validPocket?"failed":"success",causedBy:validPocket?"opponent_valid_pocket":foul?"opponent_foul":"opponent_no_valid_pocket"});pendingSafety=null;}
      if(discipline.disciplineId!=="threeCushion"&&random()<.18){metrics[side].safety++;events.push("safety",side,turn,rack,{phase:"middle"});pendingSafety={player:side,opponent:other};}
      if(!points||turn%4===0)events.push("player_switch",side,turn,rack,{fromPlayer:side,toPlayer:other,reason:points?"turn_end":"miss"});
    }
    if(pendingSafety)events.push("safety_result",pendingSafety.player,turnCount,Math.max(1,Math.ceil(turnCount/2)),{opponent:pendingSafety.opponent,outcome:"success",causedBy:"match_end_no_valid_pocket"});
    return finishRecord(item,players,events,metrics,scores,{1:goal1,2:goal2},winningSide,{rackResults:[],inning:turnCount,rack:Math.max(1,Math.ceil(turnCount/2))});
  }

  function finishRecord(item,players,events,metrics,scores,goals,winner,extra){
    const progress={p1:[0],p2:[0]};let p1=0,p2=0;
    events.analysis.forEach(event=>{if(!["ball_pocketed","carom_point"].includes(event.type))return;const points=Math.max(0,Number(event.points)||Number(event.pocketCount)||0);if(event.player===1)p1+=points;else p2+=points;progress.p1.push(p1);progress.p2.push(p2);});
    progress.p1.push(scores[1]);progress.p2.push(scores[2]);
    const playerData=side=>{const playerIndex=side===1?item.p1:item.p2,m=metrics[side],attempts=m.pockets+m.misses,jpaTargets=[14,19,25,31,38,46,55,65,75],jpaSkill=item.discipline.disciplineId==="jpa9"?jpaTargets.indexOf(Number(goals[side]))+1:null;return {name:players[playerIndex].name,registeredPlayerId:players[playerIndex].id,goal:goals[side],skillLevel:jpaSkill||null,score:scores[side],safety:m.safety,fouls:m.fouls,breaks:m.breaks,maxRun:m.maxRun,completedTurns:m.turns,average:m.turns?Number((scores[side]/m.turns).toFixed(3)):0,share:Math.round(scores[side]/Math.max(1,scores[1]+scores[2])*100),misses:m.misses,pocketCount:m.pockets,shotRate:attempts?Math.round(m.pockets/attempts*100):0};};
    const playersData={1:playerData(1),2:playerData(2)},endedAt=new Date(events.lastAt()),disciplineId=item.discipline.disciplineId;
    const playerSummary=side=>{const own=events.analysis.filter(event=>event.player===side),safety=own.filter(event=>event.type==="safety_result"),fouls=own.filter(event=>event.type==="foul");return {safety:{total:safety.length,success:safety.filter(event=>event.outcome==="success").length,failed:safety.filter(event=>event.outcome==="failed").length,successRate:safety.length?Math.round(safety.filter(event=>event.outcome==="success").length/safety.length*100):null},foul:{total:fouls.length,opening:fouls.filter(event=>event.phase==="opening").length,middle:fouls.filter(event=>event.phase==="middle").length,late:fouls.filter(event=>event.phase==="late").length,punished:0,noScore:0,punishedRate:null}};};
    const close=Math.abs(scores[1]-scores[2])<=Math.max(2,Math.round(Math.max(goals[1],goals[2])*.1));
    return {id:`sample-match-${String(item.index+1).padStart(4,"0")}`,gameType:item.discipline.gameType,disciplineId,recordSchemaVersion:4,createdByAppVersion:"CueScore Sample Data v3.1",playedAt:endedAt.toISOString(),startedAt:item.date.toISOString(),endedAt:endedAt.toISOString(),winner,result:"win",inning:extra.inning,rack:extra.rack,initialBreaker:item.index%2+1,rackResults:extra.rackResults,
      jpa9:disciplineId==="jpa9"?{skillLevels:{1:playersData[1].skillLevel,2:playersData[2].skillLevel},targetPoints:{1:goals[1],2:goals[2]},deadBalls:[],deadBallEvents:[]}:null,
      nineBall:disciplineId==="9ball"?{initialBreaker:item.index%2+1,rackResults:extra.rackResults}:null,tenBall:disciplineId==="10ball"?{initialBreaker:item.index%2+1,rackResults:extra.rackResults,spotEvents:[]}:null,
      straightPool:disciplineId==="straightPool"?{rackCycle:extra.rack,spotEvents:[],rerackEvents:[],openingBreakEvents:[]}:null,
      threeCushion:disciplineId==="threeCushion"?{targetPoints:{1:goals[1],2:goals[2]},currentInning:extra.inning,completedTurns:{1:playersData[1].completedTurns,2:playersData[2].completedTurns},highRun:{1:playersData[1].maxRun,2:playersData[2].maxRun},averages:{1:playersData[1].average,2:playersData[2].average},innings:[]}:null,
      category:item.index%19===0?"大会":item.index%13===0?"リーグ":"Free",season:item.date<new Date("2026-04-01T00:00:00+09:00")?"2025-26 シーズン":"2026 シーズン",memo:"",matchMemo:close?"接戦の振り返り":"",tags:close?["接戦"]:[],
      rulesEngine:{schemaVersion:2,gameplayEventVersion:"7.2.0",ruleId:item.discipline.gameType},eventLog:{schemaVersion:"7.2.0",undoModel:"snapshot_rebuild_with_event_invalidation_v7.2",events:[],journal:[],undoCount:item.index%41===0?1:0},
      analysis:{schemaVersion:2,events:events.analysis,summary:{schemaVersion:2,eventCount:events.analysis.length,players:{1:playerSummary(1),2:playerSummary(2)}},report:{recordingMode:"detail"}},progress,players:playersData};
  }

  function buildMatches(limit=TOTAL_MATCHES){
    const players=buildPlayers(),all=makeSchedule(),requested=clamp(Number(limit)||TOTAL_MATCHES,0,MAX_MATCHES);
    const schedule=requested===TOTAL_MATCHES
      ? disciplineDefinitions.flatMap(definition=>{
          const candidates=all.filter(item=>item.discipline.disciplineId===definition.disciplineId);
          return Array.from({length:20},(_,position)=>candidates[Math.floor(position*candidates.length/20)]);
        }).sort((a,b)=>a.date-b.date)
      : requested>=all.length?all:Array.from({length:requested},(_,position)=>all[Math.floor(position*all.length/requested)]);
    return schedule.map(item=>{const random=randomFor(`match:${item.discipline.disciplineId}:${item.localIndex}`);return ["9ball","10ball"].includes(item.discipline.disciplineId)?rackMatch(item,players,random):pointsMatch(item,players,random);});
  }
  const data=(limit=TOTAL_MATCHES)=>({players:buildPlayers(),records:buildMatches(limit),categories:[{id:"category_free",name:"Free",locked:true},{id:"category_tournament",name:"大会",locked:false},{id:"category_league",name:"リーグ",locked:false}],seasons:[{id:"sample-season-2025-26",name:"2025-26 シーズン"},{id:"sample-season-2026",name:"2026 シーズン"}]});
  const storageOrDefault=storage=>storage||globalThis.localStorage,writeJson=(storage,key,value)=>storage.setItem(key,JSON.stringify(value));
  const readJson=(storage,key,fallback)=>{try{return JSON.parse(storage.getItem(key)||"null")??fallback;}catch(_){return fallback;}};
  const sampleDataKeys=[KEYS.players,KEYS.records,KEYS.categories,KEYS.seasons,KEYS.metadata];
  function sampleReady(storage){
    const metadata=readJson(storage,KEYS.metadata,{});
    return metadata?.version===VERSION
      && Number(metadata?.playerCount)===PLAYER_COUNT
      && Number(metadata?.matchCount)===TOTAL_MATCHES
      && sampleDataKeys.slice(0,4).every(key=>storage.getItem(key)!==null);
  }
  function writeSnapshot(storage,snapshot){
    const previous=new Map(sampleDataKeys.map(key=>[key,storage.getItem(key)]));
    try{
      writeJson(storage,KEYS.players,snapshot.players);
      writeJson(storage,KEYS.records,snapshot.records);
      writeJson(storage,KEYS.categories,snapshot.categories);
      writeJson(storage,KEYS.seasons,snapshot.seasons);
      writeJson(storage,KEYS.metadata,{version:VERSION,playerCount:snapshot.players.length,matchCount:snapshot.records.length});
    }catch(error){
      for(const [key,value] of previous){
        try{if(value===null)storage.removeItem(key);else storage.setItem(key,value);}catch(_){}
      }
      throw error;
    }
    return snapshot;
  }
  const api=Object.freeze({version:VERSION,prefix:PREFIX,keys:KEYS,
    isDemo(storage){return storageOrDefault(storage).getItem(KEYS.mode)==="demo";},
    isReady(storage){return sampleReady(storageOrDefault(storage));},
    resolveKey(normalKey,storage){return this.isDemo(storage)?(NORMAL_TO_DEMO_KEY[normalKey]||normalKey):normalKey;},
    resolveSettingKey(normalKey,storage){return this.isDemo(storage)?`${PREFIX}.settings.${normalKey}`:normalKey;},
    create(storage){const target=storageOrDefault(storage),snapshot=data();return writeSnapshot(target,snapshot);},
    ensure(storage){const target=storageOrDefault(storage);return sampleReady(target)?true:this.create(target);},
    upgrade(storage){const target=storageOrDefault(storage),metadata=readJson(target,KEYS.metadata,{});if(metadata?.version===VERSION)return {players:readJson(target,KEYS.players,buildPlayers()),records:readJson(target,KEYS.records,buildMatches())};return this.create(target);},
    setMode(mode,storage){const target=storageOrDefault(storage),next=mode==="demo"?"demo":"normal";target.setItem(KEYS.mode,next);if(target.getItem(KEYS.mode)!==next)throw new Error("Data mode could not be saved");return next;},
    enter(storage){const target=storageOrDefault(storage);this.ensure(target);this.setMode("demo",target);return true;},
    leave(storage){this.setMode("normal",storage);return true;},
    remove(storage){const target=storageOrDefault(storage),names=[];for(let index=0;index<Number(target.length||0);index++){const key=target.key(index);if(key?.startsWith(`${PREFIX}.`))names.push(key);}[...new Set([...names,...Object.values(KEYS)])].forEach(key=>target.removeItem(key));target.setItem(KEYS.mode,"normal");},
    snapshot:data,benchmark(limit){return data(limit)}
  });
  globalThis.CueScoreDemoData=api;if(api.isDemo())api.upgrade();
})();
