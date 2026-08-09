/* CueScore Official Demo Data v2.0 — deterministic, high-density, and isolated. */
(() => {
  "use strict";

  const VERSION = "2.0";
  const PREFIX = "cuescore-demo";
  const KEYS = Object.freeze({
    mode:`${PREFIX}.mode.v1`, players:`${PREFIX}.players.v1`, records:`${PREFIX}.matchRecords.v1`,
    categories:`${PREFIX}.matchCategories.v1`, seasons:`${PREFIX}.matchSeasons.v1`, metadata:`${PREFIX}.metadata.v1`
  });
  const NORMAL_TO_DEMO_KEY = Object.freeze({
    "rotationScoreboard.players.v1":KEYS.players,
    "rotationScoreboard.matchRecords.v1":KEYS.records,
    "rotationScoreboard.matchCategories.v1":KEYS.categories,
    "rotationScoreboard.matchSeasons.v1":KEYS.seasons
  });

  const playerDefinitions = [
    ["はると","ローテーションが得意","male_01"],["みさき","9ボールが好き","female_01"],
    ["かいと","セーフティ強化中","male_02"],["ひな","楽しくプレー♪","female_02"],
    ["たくみ","ブレイク練習中","male_03"],["あおい","コツコツ練習中","female_03"],
    ["なおき","ハイラン更新中","male_04"],["さくら","試合を楽しむ！","female_04"],
    ["しょう","14-1挑戦中","male_05"],["ゆな","3C練習中","female_05"]
  ];
  const disciplines = [
    {gameType:"nineBall",disciplineId:"9ball",goal:i=>5+i%3},
    {gameType:"tenBall",disciplineId:"10ball",goal:i=>5+i%3},
    {gameType:"rotation",disciplineId:"rotation",goal:()=>120},
    {gameType:"straightPool",disciplineId:"straightPool",goal:i=>i%2?75:50},
    {gameType:"jpa9",disciplineId:"jpa9",goal:i=>14+(i%3)*3},
    {gameType:"threeCushion",disciplineId:"threeCushion",goal:i=>15+(i%2)*5}
  ];
  const buildPlayers = () => playerDefinitions.map(([name,memo,avatarId],index)=>({
    id:`demo-player-${String(index+1).padStart(2,"0")}`,name,memo,avatar:{type:"preset",id:avatarId},...(index===0?{isPrimary:true}:{})
  }));
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const splitTotal=(total,count,seed)=>{
    const weights=Array.from({length:count},(_,i)=>1+((seed+i*7)%5));
    const sum=weights.reduce((a,b)=>a+b,0),values=weights.map(w=>Math.floor(total*w/sum));
    let rest=total-values.reduce((a,b)=>a+b,0);for(let i=0;rest>0;i=(i+1)%count,rest--)values[i]++;
    return values;
  };
  const roundRobinRounds=()=>{
    let ring=Array.from({length:10},(_,i)=>i);const rounds=[];
    for(let round=0;round<9;round++){
      rounds.push(Array.from({length:5},(_,i)=>[ring[i],ring[9-i]]));
      ring=[ring[0],ring[9],...ring.slice(1,9)];
    }
    return rounds;
  };

  function detailedTimeline(seed,discipline,p1Score,p2Score,startedAt){
    const turnCount=6+(seed%3),p1Runs=splitTotal(p1Score,Math.ceil(turnCount/2),seed+3),p2Runs=splitTotal(p2Score,Math.floor(turnCount/2),seed+9);
    const scores={1:0,2:0},progress=[{p1:0,p2:0}],events=[];let p1i=0,p2i=0,sequence=0;
    const push=(type,player,inning,extra={})=>events.push({sequence:++sequence,type,rack:Math.max(1,Math.ceil(inning/2)),inning,player,...extra});
    for(let inning=1;inning<=turnCount;inning++){
      const player=inning%2?1:2,points=player===1?p1Runs[p1i++]:p2Runs[p2i++],rack=Math.max(1,Math.ceil(inning/2));
      if(inning===1||(["9ball","10ball","jpa9"].includes(discipline.disciplineId)&&inning%2===1)) push("break_result",player,inning,{rack,resultLabel:(seed+inning)%6===0?"無得点":"1個",pocketedBalls:(seed+inning)%6===0?[]:[1+((seed+inning)%Math.min(10,discipline.disciplineId==="10ball"?10:9))]});
      if(points>0){scores[player]+=points;push("ball_pocketed",player,inning,{rack,ball:1+((seed+inning*3)%15),points,pocketCount:Math.max(1,Math.min(5,Math.ceil(points/Math.max(1,discipline.goal(seed)/10))))});}
      if((seed+inning)%5===0){push("safety",player,inning,{rack,phase:inning<=3?"opening":inning>=turnCount-2?"late":"middle"});push("safety_result",player,inning,{rack,outcome:(seed+inning)%3?"success":"failed"});}
      if((seed+inning)%9===0){push("foul",player,inning,{rack,phase:inning<=3?"opening":inning>=turnCount-2?"late":"middle",foulType:"cue_ball"});push("foul_result",player,inning,{rack,outcome:(seed+inning)%2?"opponent_scored":"no_score"});}
      push("player_switch",player,inning,{rack,fromPlayer:player,toPlayer:player===1?2:1,reason:points?"turn_end":"miss"});
      progress.push({p1:scores[1],p2:scores[2]});
    }
    const playerSummary=player=>{const own=events.filter(e=>e.player===player),safety=own.filter(e=>e.type==="safety_result"),foul=own.filter(e=>e.type==="foul");return {safety:{total:safety.length,success:safety.filter(e=>e.outcome==="success").length,failed:safety.filter(e=>e.outcome==="failed").length,successRate:safety.length?Math.round(safety.filter(e=>e.outcome==="success").length/safety.length*100):null},foul:{total:foul.length,opening:foul.filter(e=>e.phase==="opening").length,middle:foul.filter(e=>e.phase==="middle").length,late:foul.filter(e=>e.phase==="late").length,punished:0,noScore:0,punishedRate:null}};};
    return {events,progress,turnCount,summary:{schemaVersion:2,eventCount:events.length,players:{1:playerSummary(1),2:playerSummary(2)}}};
  }

  function buildMatches(){
    const players=buildPlayers(),pairings=[];
    disciplines.forEach((discipline,disciplineIndex)=>{
      for(let pair=0;pair<5;pair++)for(let repeat=0;repeat<20;repeat++)pairings.push({discipline,disciplineIndex,p1:pair*2,p2:pair*2+1,repeat,rival:true});
      const rounds=roundRobinRounds();
      for(let extra=0;extra<10;extra++)rounds[extra%rounds.length].forEach(([p1,p2])=>pairings.push({discipline,disciplineIndex,p1,p2,repeat:extra,rival:false}));
    });
    const first=Date.parse("2025-08-09T09:00:00+09:00"),last=Date.parse("2026-08-08T21:00:00+09:00"),span=last-first;
    return pairings.map((item,index)=>{
      const seed=index+item.disciplineIndex*101,swap=(seed%4===0),p1Index=swap?item.p2:item.p1,p2Index=swap?item.p1:item.p2;
      const winner=seed%5===0?2:1,goal=item.discipline.goal(seed),close=seed%3===0;
      const loserScore=item.discipline.disciplineId==="rotation"?(close?112-seed%8:60+seed%43):item.discipline.disciplineId==="straightPool"?(close?goal-3-seed%4:Math.max(12,goal-17-seed%13)):item.discipline.disciplineId==="jpa9"?(close?goal-2:Math.max(3,goal-7-seed%5)):item.discipline.disciplineId==="threeCushion"?(close?goal-1:Math.max(5,goal-7-seed%5)):(close?goal-1:1+seed%Math.max(2,goal-1));
      const p1Score=winner===1?goal:loserScore,p2Score=winner===2?goal:loserScore;
      const startedAt=new Date(first+Math.round(span*index/(pairings.length-1)));startedAt.setMinutes((startedAt.getMinutes()+seed*7)%60);
      const endedAt=new Date(startedAt.getTime()+(38+seed%10*6)*60000),timeline=detailedTimeline(seed,item.discipline,p1Score,p2Score,startedAt);
      const playerData=(playerIndex,score,otherScore,side)=>{const ownEvents=timeline.events.filter(e=>e.player===side),pockets=ownEvents.filter(e=>e.type==="ball_pocketed").reduce((sum,e)=>sum+(Number(e.pocketCount)||1),0),misses=ownEvents.filter(e=>e.type==="player_switch"&&e.reason==="miss").length,safeties=ownEvents.filter(e=>e.type==="safety").length,fouls=ownEvents.filter(e=>e.type==="foul").length,turns=ownEvents.filter(e=>e.type==="player_switch").length;return {name:players[playerIndex].name,registeredPlayerId:players[playerIndex].id,goal,score,safety:safeties,fouls,breaks:ownEvents.filter(e=>e.type==="break_result").length,maxRun:Math.max(1,...ownEvents.filter(e=>e.type==="ball_pocketed").map(e=>Number(e.points)||0)),completedTurns:turns,innings:turns,average:Number((score/Math.max(1,turns)).toFixed(2)),share:Math.round(score/Math.max(1,score+otherScore)*100),misses,pocketCount:pockets,shotRate:Math.round(pockets/Math.max(1,pockets+misses)*100)};};
      const p1=playerData(p1Index,p1Score,p2Score,1),p2=playerData(p2Index,p2Score,p1Score,2),rackResults=["9ball","10ball"].includes(item.discipline.disciplineId)?Array.from({length:p1Score+p2Score},(_,rack)=>({rack:rack+1,winner:rack<p1Score?1:2,breaker:rack%2+1})):[];
      const threeInnings=item.discipline.disciplineId==="threeCushion"?timeline.progress.slice(1).map((point,turn)=>({inning:turn+1,p1:point.p1-(timeline.progress[turn]?.p1||0)||null,p2:point.p2-(timeline.progress[turn]?.p2||0)||null,p1Total:point.p1,p2Total:point.p2})):[];
      return {id:`demo-match-${String(index+1).padStart(4,"0")}`,gameType:item.discipline.gameType,disciplineId:item.discipline.disciplineId,recordSchemaVersion:4,createdByAppVersion:"CueScore Official Demo Data v2.0",playedAt:endedAt.toISOString(),startedAt:startedAt.toISOString(),endedAt:endedAt.toISOString(),winner,result:"win",inning:timeline.turnCount,rack:rackResults.length||1,initialBreaker:seed%2+1,rackResults,threeCushion:item.discipline.disciplineId==="threeCushion"?{targetPoints:{1:goal,2:goal},currentInning:timeline.turnCount,completedTurns:{1:p1.completedTurns,2:p2.completedTurns},highRun:{1:p1.maxRun,2:p2.maxRun},averages:{1:p1.average,2:p2.average},innings:threeInnings}:null,category:seed%12===0?"大会":seed%17===0?"リーグ":"Free",season:startedAt.getFullYear()===2025?"2025-26 シーズン":"2026 シーズン",memo:"",matchMemo:close?"接戦の振り返り":"",tags:close?["接戦"]:[],analysis:{schemaVersion:2,events:timeline.events,summary:timeline.summary,report:{recordingMode:"detail"}},progress:{p1:timeline.progress.map(x=>x.p1),p2:timeline.progress.map(x=>x.p2)},players:{1:p1,2:p2}};
    });
  }

  const data=()=>({players:buildPlayers(),records:buildMatches(),categories:[{id:"category_free",name:"Free",locked:true},{id:"category_tournament",name:"大会",locked:false},{id:"category_league",name:"リーグ",locked:false}],seasons:[{id:"demo-season-2025-26",name:"2025-26 シーズン"},{id:"demo-season-2026",name:"2026 シーズン"}]});
  const storageOrDefault=storage=>storage||globalThis.localStorage;
  const writeJson=(storage,key,value)=>storage.setItem(key,JSON.stringify(value));
  const readJson=(storage,key,fallback)=>{try{return JSON.parse(storage.getItem(key)||"null")??fallback;}catch(_){return fallback;}};
  const api=Object.freeze({version:VERSION,prefix:PREFIX,keys:KEYS,
    isDemo(storage){return storageOrDefault(storage).getItem(KEYS.mode)==="demo";},
    resolveKey(normalKey,storage){return this.isDemo(storage)?(NORMAL_TO_DEMO_KEY[normalKey]||normalKey):normalKey;},
    resolveSettingKey(normalKey,storage){return this.isDemo(storage)?`${PREFIX}.settings.${normalKey}`:normalKey;},
    create(storage){const target=storageOrDefault(storage),snapshot=data();writeJson(target,KEYS.players,snapshot.players);writeJson(target,KEYS.records,snapshot.records);writeJson(target,KEYS.categories,snapshot.categories);writeJson(target,KEYS.seasons,snapshot.seasons);writeJson(target,KEYS.metadata,{version:VERSION,playerCount:snapshot.players.length,matchCount:snapshot.records.length});return snapshot;},
    upgrade(storage){const target=storageOrDefault(storage),metadata=readJson(target,KEYS.metadata,{});if(metadata?.version===VERSION)return {players:readJson(target,KEYS.players,buildPlayers()),records:readJson(target,KEYS.records,buildMatches())};return this.create(target);},
    setMode(mode,storage){storageOrDefault(storage).setItem(KEYS.mode,mode==="demo"?"demo":"normal");},
    remove(storage){const target=storageOrDefault(storage),names=[];for(let index=0;index<Number(target.length||0);index++){const key=target.key(index);if(key?.startsWith(`${PREFIX}.`))names.push(key);}[...new Set([...names,...Object.values(KEYS)])].forEach(key=>target.removeItem(key));target.setItem(KEYS.mode,"normal");},
    snapshot:data
  });
  globalThis.CueScoreDemoData=api;if(api.isDemo())api.upgrade();
})();
