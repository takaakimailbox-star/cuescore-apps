import crypto from "node:crypto";
import fs from "node:fs";
import vm from "node:vm";
import zlib from "node:zlib";

const GAME_ORDER=["nineBall","tenBall","rotation","jpa9","straightPool","threeCushion"];
export const GAME_LABELS=Object.freeze({
  nineBall:"9-Ball",tenBall:"10-Ball",rotation:"Rotation",jpa9:"JPA 9-Ball",
  straightPool:"14-1",threeCushion:"3C",
});

function demoRecords(){
  const source=fs.readFileSync(new URL("../../demo-data.js",import.meta.url),"utf8");
  const storage={
    data:new Map(),
    getItem(key){return this.data.has(key)?this.data.get(key):null;},
    setItem(key,value){this.data.set(key,String(value));},
    removeItem(key){this.data.delete(key);},
    get length(){return this.data.size;},
    key(index){return [...this.data.keys()][index]??null;},
  };
  const context={localStorage:storage,console};context.globalThis=context;
  vm.createContext(context);vm.runInContext(source,context,{filename:"demo-data.js"});
  return JSON.parse(JSON.stringify(context.CueScoreDemoData.snapshot().records));
}

export function fixtureUuid(id){
  return `00000000-0000-4000-8000-${crypto.createHash("sha256").update(id).digest("hex").slice(0,12)}`;
}

function toProductionRecord(record){
  const value=structuredClone(record);
  if(value.gameType==="jpa9")value.gameType="jpa9Ball";
  value.category="Private category";
  value.season="Private season";
  value.reflection="Private reflection";
  value.playerReflections={1:"Private A",2:"Private B"};
  value.deviceIdentifier="sender-device";
  value.pro=true;
  value.entitlement="pro";
  value.players[1].registeredPlayerId="sender-player-a";
  value.players[1].avatar="data:image/png;base64,private-a";
  value.players[1].memo="Private memo A";
  value.players[2].registeredPlayerId="sender-player-b";
  value.players[2].photo="data:image/png;base64,private-b";
  value.players[2].memo="Private memo B";
  return value;
}

export function stage1Fixtures(){
  const records=demoRecords(),fixtures=[];
  for(const gameType of GAME_ORDER){
    const candidates=records.filter(record=>record.gameType===gameType)
      .sort((left,right)=>(left.analysis?.events?.length??0)-(right.analysis?.events?.length??0));
    const picks=[
      ["Short",candidates[0]],
      ["Medium",candidates[Math.floor((candidates.length-1)/2)]],
      ["Long",candidates[candidates.length-1]],
    ];
    for(const [lengthClass,source] of picks){
      fixtures.push({
        gameType,lengthClass,label:GAME_LABELS[gameType],fixtureId:source.id,
        source:toProductionRecord(source),sharedMatchId:fixtureUuid(source.id),
      });
    }
  }
  return fixtures;
}

export const nodeCodec=Object.freeze({
  compression:Object.freeze({
    bounded:true,
    async deflateRaw(input,{level=9}={}){return new Uint8Array(zlib.deflateRawSync(input,{level}));},
    async inflateRaw(input,{maxOutputLength}){return new Uint8Array(zlib.inflateRawSync(input,{maxOutputLength}));},
  }),
  async digest(input){return new Uint8Array(crypto.createHash("sha256").update(input).digest());},
});

const ALPHANUMERIC_M_CAPACITY=Object.freeze([
  20,38,61,90,122,154,178,221,262,311,366,419,483,528,600,656,734,816,909,970,
  1035,1134,1248,1326,1451,1542,1637,1732,1839,1994,2113,2238,2369,2506,2632,2780,
  2894,3054,3220,3391,
]);

export function theoreticalQrVersion(characterCount){
  const index=ALPHANUMERIC_M_CAPACITY.findIndex(capacity=>characterCount<=capacity);
  return index<0?null:index+1;
}
