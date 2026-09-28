(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.CueScoreMatchSharingPlayerDraftsV1=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const PLAYER_NAME_MAX_LENGTH=20;
  const DEFAULT_AVATAR=Object.freeze({type:"default",id:"default_silhouette"});

  class MatchSharingPlayerError extends Error{
    constructor(code,message){super(message);this.name="MatchSharingPlayerError";this.code=code;}
  }

  const fail=(code,message)=>{throw new MatchSharingPlayerError(code,message)};
  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
  const nameKey=value=>String(value??"").trim().toLocaleLowerCase("ja");

  function isValidLocalPlayer(player){
    const name=String(player?.name??"").trim();
    return Boolean(
      player&&typeof player==="object"&&!Array.isArray(player)&&
      String(player.id??"").trim()&&name&&Array.from(name).length<=PLAYER_NAME_MAX_LENGTH
    );
  }

  function normalizeAvatar(avatar){
    if(avatar?.type==="photo"&&typeof avatar.dataUrl==="string"&&/^data:image\/(jpeg|png|webp);base64,/.test(avatar.dataUrl)){
      return {type:"photo",dataUrl:avatar.dataUrl};
    }
    if(avatar?.type==="preset"&&String(avatar.id||"").trim())return {type:"preset",id:String(avatar.id)};
    return {...DEFAULT_AVATAR};
  }

  function validatePlayerDraft(input,existingPlayers=[],editingId=null){
    const rawName=String(input?.name??"").trim();
    if(!rawName)fail("PLAYER_NAME_REQUIRED","Player name is required");
    if(Array.from(rawName).length>PLAYER_NAME_MAX_LENGTH)fail("PLAYER_NAME_TOO_LONG","Player name must be 20 characters or fewer");
    const duplicate=(Array.isArray(existingPlayers)?existingPlayers:[]).find(player=>
      String(player?.id??"")!==String(editingId??"")&&nameKey(player?.name)===nameKey(rawName)
    );
    if(duplicate)fail("DUPLICATE_PLAYER_NAME","A Player with the same name already exists");
    return Object.freeze({
      name:rawName,
      memo:String(input?.memo??"").trim().slice(0,100),
      avatar:normalizeAvatar(input?.avatar),
      isPrimary:false,
    });
  }

  function createLocalPlayerDraft(input,{existingPlayers=[],now=Date.now(),idFactory}={}){
    const normalized=validatePlayerDraft(input,existingPlayers);
    const id=String((typeof idFactory==="function"?idFactory():globalThis.crypto?.randomUUID?.())||"").trim();
    if(!id)fail("INVALID_PLAYER_ID","Player ID generation failed");
    if((Array.isArray(existingPlayers)?existingPlayers:[]).some(player=>String(player?.id??"")===id)){
      fail("PLAYER_ID_COLLISION","Generated Player ID already exists");
    }
    return {
      id,
      name:normalized.name,
      memo:normalized.memo,
      avatar:clone(normalized.avatar),
      createdAt:Number(now),
      updatedAt:Number(now),
      lastUsed:null,
    };
  }

  return Object.freeze({
    PLAYER_NAME_MAX_LENGTH,DEFAULT_AVATAR,MatchSharingPlayerError,nameKey,isValidLocalPlayer,
    normalizeAvatar,validatePlayerDraft,createLocalPlayerDraft,
  });
});
