(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.CueScoreBuild4Metrics=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const BREAK_DISCIPLINES=new Set(["9ball","10ball","rotation","jpa9"]);
  const MASUWARI_DISCIPLINES=new Set(["9ball","10ball"]);
  const value=(event,key)=>event?.data?.[key]??event?.[key];
  const eventType=event=>String(event?.sourceType||event?.type||"").normalize("NFKC").toLowerCase();
  const eventPlayer=event=>Number(value(event,"breakPlayer")??value(event,"player")??value(event,"fromPlayer"));
  const rackOf=event=>Math.max(1,Number(event?.rackNumber??value(event,"rack"))||1);
  const commonEvents=record=>Array.isArray(record?.eventLog?.events)?record.eventLog.events:[];
  const legacyEvents=record=>Array.isArray(record?.analysis?.events)?record.analysis.events:[];
  const detailedEvents=record=>commonEvents(record).length?commonEvents(record):legacyEvents(record);
  const finite=value=>Number.isFinite(Number(value));
  const positive=value=>finite(value)&&Number(value)>0;
  const percent=(numerator,denominator)=>denominator>0?numerator/denominator*100:null;

  function isBreakEventEligible(event){
    if(eventType(event)!=="break_result")return false;
    if(![1,2].includes(eventPlayer(event)))return false;
    const balls=value(event,"pocketedBalls");
    const count=value(event,"pocketCount");
    const hasPocketEvidence=Array.isArray(balls)||finite(count);
    const hasDecisionEvidence=["scratch","breakFoul","illegalBreak","preBreakFoul","breakFailed","foul"]
      .some(key=>typeof value(event,key)==="boolean")||String(value(event,"schemaVersion")||"").startsWith("break-");
    return hasPocketEvidence&&hasDecisionEvidence;
  }

  function breakInForRecord(record,side,discipline){
    if(!BREAK_DISCIPLINES.has(discipline))return{eligible:false,numerator:0,denominator:0,rate:null};
    const events=detailedEvents(record).filter(event=>eventType(event)==="break_result"&&eventPlayer(event)===Number(side));
    const eligible=events.filter(isBreakEventEligible);
    // A single-record best must not be calculated from only the surviving
    // detailed events of a partially recorded match.
    if(!eligible.length||eligible.length!==events.length)return{eligible:false,numerator:0,denominator:0,rate:null};
    const numerator=eligible.filter(event=>{
      const balls=value(event,"pocketedBalls");
      const pocketCount=Array.isArray(balls)?balls.length:Number(value(event,"pocketCount"))||0;
      return pocketCount>0&&!["foul","scratch","breakFoul","illegalBreak","preBreakFoul","breakFailed"]
        .some(key=>Boolean(value(event,key)));
    }).length;
    return{eligible:true,numerator,denominator:eligible.length,rate:percent(numerator,eligible.length)};
  }

  function masuwariForRecord(record,side,discipline,officialCounter){
    if(!MASUWARI_DISCIPLINES.has(discipline))return{eligible:false,numerator:0,denominator:0,rate:null};
    const events=commonEvents(record);
    if(!events.length)return{eligible:false,numerator:0,denominator:0,rate:null};
    const completedRacks=[...new Set(events.filter(event=>eventType(event)==="rack_end").map(rackOf))];
    if(!completedRacks.length)return{eligible:false,numerator:0,denominator:0,rate:null};
    const breakEvents=events.filter(event=>eventType(event)==="break_result");
    const breakRacks=[...new Set(breakEvents.map(rackOf))];
    // Record-level eligibility: the completed-rack ledger and break ledger must
    // describe the same racks, and every rack must have one classifiable break.
    // This prevents a surviving successful rack in a partial record from being
    // promoted to a misleading 1/1 (100%) lifetime, trend, or personal best.
    const hasCompleteRackLedger=completedRacks.length===breakRacks.length&&
      completedRacks.every(rack=>breakRacks.includes(rack)&&breakEvents.filter(event=>rackOf(event)===rack).length===1&&isBreakEventEligible(breakEvents.find(event=>rackOf(event)===rack)));
    if(!hasCompleteRackLedger)return{eligible:false,numerator:0,denominator:0,rate:null};
    // The adopted denominator is every classifiable completed rack broken by
    // this player. A miss, foul, failed break, or later player transfer remains
    // a break opportunity; only incomplete/unclassifiable records are excluded.
    const denominator=completedRacks.filter(rack=>{
      const breakEvent=breakEvents.find(event=>rackOf(event)===rack);
      return eventPlayer(breakEvent)===Number(side);
    }).length;
    if(!denominator)return{eligible:false,numerator:0,denominator:0,rate:null};
    const counts=typeof officialCounter==="function"?officialCounter(record):null;
    const numerator=Math.max(0,Number(counts?.[Number(side)])||0);
    if(numerator>denominator)return{eligible:false,numerator:0,denominator:0,rate:null};
    return{eligible:true,numerator,denominator,rate:percent(numerator,denominator)};
  }

  function shotRateForRecord(metric){
    const pockets=Number(metric?.pocketCount),misses=Number(metric?.misses);
    if(Number.isFinite(pockets)&&Number.isFinite(misses)&&pockets+misses>0){
      return{eligible:true,numerator:pockets,denominator:pockets+misses,rate:percent(pockets,pockets+misses)};
    }
    return{eligible:false,numerator:0,denominator:0,rate:null};
  }

  function averageForRecord(metric,player,completedTurns){
    const score=Number(metric?.score??player?.score),turns=Number(completedTurns);
    if(Number.isFinite(score)&&turns>0)return{eligible:true,numerator:score,denominator:turns,value:score/turns};
    return{eligible:false,numerator:0,denominator:0,value:null};
  }

  function aggregate(items,player,helpers){
    let wins=0,fouls=0,pockets=0,shots=0,totalScore=0,totalTurns=0,breakIn=0,breaks=0,masuwari=0,breakRacks=0,highRun=0;
    items.forEach(record=>{
      const side=helpers.side(record,player);
      if(!side)return;
      if(helpers.won(record,side))wins+=1;
      const metric=helpers.metric(record,side)||{};
      const shot=shotRateForRecord(metric);
      if(shot.eligible){pockets+=shot.numerator;shots+=shot.denominator;}
      fouls+=Math.max(0,Number(metric.fouls)||0);
      highRun=Math.max(highRun,Math.max(0,Number(metric.maxRun)||0));
      const turns=helpers.completedTurns(record,side);
      const average=averageForRecord(metric,helpers.recordPlayer(record,side),turns);
      if(average.eligible){totalScore+=average.numerator;totalTurns+=average.denominator;}
      const discipline=helpers.discipline(record);
      const breakMetric=breakInForRecord(record,side,discipline);
      if(breakMetric.eligible){breakIn+=breakMetric.numerator;breaks+=breakMetric.denominator;}
      const masuwariMetric=masuwariForRecord(record,side,discipline,helpers.masuwariCounts);
      if(masuwariMetric.eligible){masuwari+=masuwariMetric.numerator;breakRacks+=masuwariMetric.denominator;}
    });
    const games=items.length;
    return{
      games,wins,losses:Math.max(0,games-wins),winRate:games?wins/games*100:null,
      shotRate:percent(pockets,shots),breakInRate:percent(breakIn,breaks),masuwariRate:percent(masuwari,breakRacks),
      highRun,average:totalTurns?totalScore/totalTurns:null,avgFouls:games?fouls/games:null,
      eligible:{shots,breaks,breakRacks,averageTurns:totalTurns}
    };
  }

  const dateValue=record=>{
    const time=new Date(record?.endedAt||record?.playedAt||record?.startedAt||0).getTime();
    return Number.isFinite(time)?time:0;
  };
  function chooseBest(candidates,direction="desc"){
    return candidates.filter(item=>item&&positive(item.value)&&item.record?.id).sort((a,b)=>{
      const metricOrder=direction==="asc"?a.value-b.value:b.value-a.value;
      if(metricOrder)return metricOrder;
      const dateOrder=dateValue(b.record)-dateValue(a.record);
      if(dateOrder)return dateOrder;
      return String(a.record.id).localeCompare(String(b.record.id));
    })[0]||null;
  }

  function bests(items,player,discipline,helpers){
    const rows=items.map(record=>{
      const side=helpers.side(record,player);
      if(!side||!record?.id)return null;
      const metric=helpers.metric(record,side)||{},recordPlayer=helpers.recordPlayer(record,side)||{};
      const shot=shotRateForRecord(metric),breakIn=breakInForRecord(record,side,discipline);
      const masuwari=masuwariForRecord(record,side,discipline,helpers.masuwariCounts);
      const average=averageForRecord(metric,recordPlayer,helpers.completedTurns(record,side));
      return{record,side,won:helpers.won(record,side),score:Number(metric.score??recordPlayer.score),highRun:Number(metric.maxRun),shot,breakIn,masuwari,average};
    }).filter(Boolean);
    const candidate=(key,getter,direction="desc")=>{
      const winner=chooseBest(rows.map(row=>({record:row.record,value:getter(row)})),direction);
      return winner?{key,value:winner.value,record:winner.record}:null;
    };
    const map={
      highRun:candidate("highRun",row=>row.highRun),score:candidate("score",row=>row.score),
      shotRate:candidate("shotRate",row=>row.shot.eligible?row.shot.rate:null),
      breakInRate:candidate("breakInRate",row=>row.breakIn.eligible?row.breakIn.rate:null),
      masuwariRate:candidate("masuwariRate",row=>row.masuwari.eligible?row.masuwari.rate:null),
      masuwariCount:candidate("masuwariCount",row=>row.masuwari.eligible?row.masuwari.numerator:null),
      average:candidate("average",row=>row.average.eligible?row.average.value:null),
      leastWinningInnings:candidate("leastWinningInnings",row=>row.won&&row.average.eligible?row.average.denominator:null,"asc")
    };
    const keys={
      "9ball":["shotRate","breakInRate","masuwariRate","masuwariCount"],
      "10ball":["shotRate","breakInRate","masuwariRate","masuwariCount"],
      rotation:["highRun","score","shotRate","breakInRate"],
      jpa9:["highRun","score","average","breakInRate"],
      straightPool:["highRun","score","average"],
      threeCushion:["highRun","average","leastWinningInnings"]
    }[discipline]||[];
    return keys.map(key=>map[key]).filter(Boolean);
  }

  return{BREAK_DISCIPLINES,MASUWARI_DISCIPLINES,eventType,eventPlayer,rackOf,detailedEvents,isBreakEventEligible,breakInForRecord,masuwariForRecord,shotRateForRecord,averageForRecord,aggregate,chooseBest,bests};
});
