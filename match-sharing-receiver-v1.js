(function(root,factory){
  let validation=root?.CueScoreMatchSharingValidationV1;
  let format=root?.CueScoreMatchSharingFormatV1;
  let persistence=root?.CueScoreMatchSharingPersistenceV1;
  let sender=root?.CueScoreMatchSharingSenderV1;
  if(typeof module==="object"&&module.exports){
    validation=require("./match-sharing-validation-v1.js");
    format=require("./match-sharing-format-v1.js");
    persistence=require("./match-sharing-persistence-v1.js");
    sender=require("./match-sharing-sender-v1.js");
  }
  const api=factory(validation,format,persistence,sender);
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.CueScoreMatchSharingReceiverV1=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(validation,format,persistence,sender){
  "use strict";
  if(!validation||!format||!persistence||!sender)throw new Error("Match Sharing receiver dependencies are required");

  class MatchSharingReceiverError extends Error{
    constructor(code,message,options={}){super(message,options);this.name="MatchSharingReceiverError";this.code=code;}
  }
  const fail=(code,message,cause)=>{throw new MatchSharingReceiverError(code,message,cause?{cause}:{});};
  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

  function createMemoryState(){
    let current=null;
    return Object.freeze({
      setValid(logical){
        current=Object.freeze({status:"VALID_MATCH_SHARING_QR",sharedMatchId:logical.sharedMatchId,logicalMatch:clone(logical)});
        return current;
      },
      get(){return current?clone(current):null;},
      clear(){current=null;},
    });
  }

  function productError(error){
    const code=String(error?.code||"");
    if(code==="NON_CUESCORE")return Object.freeze({code,message:"CueScoreの試合共有コードではありません。",retryable:true});
    if(code==="UNSUPPORTED_VERSION")return Object.freeze({code,message:"この試合データを読み込むにはCueScoreの更新が必要です。",retryable:true});
    if(code==="DUPLICATE")return Object.freeze({code,message:"この試合はすでに取り込まれています。",retryable:true});
    if(code==="DEMO_RECEIVER_REJECTED")return Object.freeze({code,message:"デモでは試合を受け取れません。",retryable:false});
    return Object.freeze({code:code||"INVALID",message:"この試合データを読み込めませんでした。",retryable:true});
  }

  function receiverActionState(state={}){
    const permission=String(state?.permission||"");
    const needsSettings=permission==="denied"||permission==="restricted";
    return Object.freeze({
      showSettings:needsSettings,
      showRetry:!needsSettings&&state?.screen!=="success"&&state?.screen!=="unavailable",
      retryLabel:state?.code==="DUPLICATE"?"他の試合を読み取る":"もう一度読み取る",
    });
  }

  async function decodeScannedPayload({payload,records=[],findDuplicate=null,demoMode=false,codec=sender.runtimeCodec}={}){
    if(demoMode)fail("DEMO_RECEIVER_REJECTED","Demo cannot start the Match Sharing receiver");
    if(typeof payload!=="string"||payload.length>validation.LIMITS.maxEncodedChars){
      fail("OVERSIZE","Encoded payload limit exceeded");
    }
    let logical;
    try{
      logical=await format.decodeSharedMatchV1(payload,codec);
      validation.validateSharedMatchV1(logical);
    }catch(error){
      if(error?.code)throw error;
      fail("INVALID","Unable to decode Match Sharing payload",error);
    }
    const duplicate=typeof findDuplicate==="function"
      ?findDuplicate(logical.sharedMatchId)
      :persistence.findDuplicateSharedMatchId(records,logical.sharedMatchId);
    if(duplicate){
      fail("DUPLICATE","The shared Match already exists");
    }
    return Object.freeze({status:"VALID_MATCH_SHARING_QR",sharedMatchId:logical.sharedMatchId,logicalMatch:clone(logical)});
  }

  function createScannerController({bridge,memory=createMemoryState(),readRecords=()=>[],findDuplicate=null,isDemo=()=>false,onState=()=>{}}={}){
    let listeners=[],active=false,lastRect=null;
    let diagnostic={phase:"idle",permission:"unknown",nativeStart:null,errorCode:null};
    const setDiagnostic=patch=>{diagnostic={...diagnostic,...patch};return diagnostic;};
    const emit=value=>{onState(value);return value;};
    const removeListeners=async()=>{const pending=listeners;listeners=[];await Promise.all(pending.map(handle=>Promise.resolve(handle?.remove?.()).catch(()=>{})));};
    const stopNative=async()=>{try{await bridge?.stopScan?.();}catch(_){}active=false;};
    const handleResult=async event=>{
      if(!active||typeof event?.value!=="string")return;
      active=false;
      await stopNative();
      try{
        const result=await decodeScannedPayload({payload:event.value,records:readRecords(),findDuplicate,demoMode:isDemo()});
        memory.setValid(result.logicalMatch);
        emit({screen:"success",status:result.status});
      }catch(error){
        memory.clear();
        emit({screen:"error",...productError(error)});
      }
    };
    const installListeners=async()=>{
      if(listeners.length||!bridge?.addListener)return;
      setDiagnostic({phase:"installing-listeners"});
      listeners.push(await bridge.addListener("scanResult",handleResult));
      listeners.push(await bridge.addListener("scannerError",event=>{
        active=false;memory.clear();setDiagnostic({phase:"native-error",errorCode:event?.code||"SCANNER_ERROR"});emit({screen:"error",code:event?.code||"SCANNER_ERROR",message:"カメラでQRコードを読み取れませんでした。",retryable:true});
      }));
    };
    const startAuthorized=async rect=>{
      lastRect=rect||lastRect;
      try{
        await installListeners();
        setDiagnostic({phase:"start-requested",permission:"authorized",nativeStart:null,errorCode:null});
        const nativeStart=await bridge.startScan({previewRect:lastRect});
        if(nativeStart?.active!==true)throw new MatchSharingReceiverError("SESSION_NOT_RUNNING","Camera capture did not start");
        active=true;
        setDiagnostic({phase:"running",nativeStart:clone(nativeStart),errorCode:null});
        emit({screen:"scanner",permission:"authorized"});
        return nativeStart;
      }catch(error){
        active=false;
        setDiagnostic({phase:"start-failed",errorCode:error?.code||"UNAVAILABLE"});
        return emit({screen:"unavailable",permission:"unavailable",message:"この端末ではカメラを使用できません。",code:error?.code||"UNAVAILABLE"});
      }
    };
    const enter=async rect=>{
      if(isDemo())fail("DEMO_RECEIVER_REJECTED","Demo cannot start the Match Sharing receiver");
      memory.clear();lastRect=rect;
      if(!bridge) return emit({screen:"unavailable",permission:"unavailable",message:"この端末ではカメラを使用できません。"});
      let result,status;
      try{
        setDiagnostic({phase:"authorization-check",permission:"unknown",errorCode:null});
        result=await bridge.authorizationStatus();
        status=String(result?.status||"unavailable");
        setDiagnostic({phase:"authorization-result",permission:status});
        if(status==="notDetermined"){
          setDiagnostic({phase:"permission-requested"});
          result=await bridge.requestPermission();status=String(result?.status||"denied");
          setDiagnostic({phase:"permission-result",permission:status});
        }
      }catch(error){
        setDiagnostic({phase:"bridge-failed",permission:"unknown",errorCode:error?.code||"BRIDGE_UNAVAILABLE"});
        return emit({screen:"unavailable",permission:"unavailable",message:"この端末ではカメラを使用できません。",code:error?.code||"BRIDGE_UNAVAILABLE"});
      }
      if(status==="authorized")return startAuthorized(rect);
      if(status==="denied")return emit({screen:"permission",permission:"denied",message:"QRコードを読み取るには、設定でカメラを許可してください。"});
      if(status==="restricted")return emit({screen:"permission",permission:"restricted",message:"この端末ではカメラの使用が制限されています。"});
      return emit({screen:"unavailable",permission:"unavailable",message:"この端末ではカメラを使用できません。"});
    };
    const retry=async rect=>{
      const nextRect=rect||lastRect;
      memory.clear();
      await stopNative();
      await removeListeners();
      setDiagnostic({phase:"retry-reenter",nativeStart:null,errorCode:null});
      return enter(nextRect);
    };
    const back=async()=>{await stopNative();await removeListeners();memory.clear();setDiagnostic({phase:"closed",nativeStart:null,errorCode:null});emit({screen:"closed"});};
    const openSettings=async()=>bridge?.openSettings?.();
    return Object.freeze({enter,retry,back,openSettings,memory,isActive:()=>active,diagnostic:()=>clone(diagnostic)});
  }

  function bindReceiverEntry(button,start,{signal}={}){
    if(!button?.addEventListener||typeof start!=="function")fail("INVALID_RECEIVER_ENTRY","Receiver entry binding is invalid");
    const listener=()=>Promise.resolve().then(start);
    button.addEventListener("click",listener,signal?{signal}:undefined);
    return listener;
  }

  return Object.freeze({MatchSharingReceiverError,createMemoryState,decodeScannedPayload,productError,receiverActionState,createScannerController,bindReceiverEntry});
});
