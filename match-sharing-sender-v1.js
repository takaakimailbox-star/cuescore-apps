(function(root,factory){
  let validation=root?.CueScoreMatchSharingValidationV1;
  let adapters=root?.CueScoreMatchSharingAdaptersV1;
  let format=root?.CueScoreMatchSharingFormatV1;
  let persistence=root?.CueScoreMatchSharingPersistenceV1;
  let compression=root?.fflate;
  let qr=root?.qrcodegen;
  if(typeof module==="object"&&module.exports){
    validation=require("./match-sharing-validation-v1.js");
    adapters=require("./match-sharing-adapters-v1.js");
    format=require("./match-sharing-format-v1.js");
    persistence=require("./match-sharing-persistence-v1.js");
    compression=require("./vendor/fflate-0.8.3.js");
    qr=require("./vendor/qrcodegen-1.8.0.js");
  }
  const api=factory(validation,adapters,format,persistence,compression,qr);
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.CueScoreMatchSharingSenderV1=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(validation,adapters,format,persistence,fflate,qrcodegen){
  "use strict";
  if(!validation||!adapters||!format||!persistence||!fflate||!qrcodegen)throw new Error("Match Sharing sender dependencies are required");

  const ECC="M";
  const QUIET_ZONE_MODULES=4;
  const DISPLAY_SIZE_PT=292;
  const MAX_QR_VERSION=30;
  const ALPHANUMERIC=/^[0-9A-Z $%*+\-./:]+$/;

  class MatchSharingSenderError extends Error{
    constructor(code,message,options={}){super(message,options);this.name="MatchSharingSenderError";this.code=code;}
  }
  const fail=(code,message,cause)=>{throw new MatchSharingSenderError(code,message,cause?{cause}:{});};
  const localId=record=>String(record?.id??record?.matchId??"").trim();
  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

  function assertSenderEligible(record,{demoMode=false}={}){
    if(demoMode)fail("DEMO_EXPORT_REJECTED","Demo matches cannot be shared");
    const status=String(record?.status??record?.state??"").toLowerCase();
    if(record?.interrupted===true||record?.completed===false||record?.finalized===false||["active","in-progress","in_progress","interrupted","unfinished","pending"].includes(status)){
      fail("INELIGIBLE_MATCH","Only completed matches can be shared");
    }
    if(!persistence.isCompletedMatch(record))fail("INELIGIBLE_MATCH","Only completed matches can be shared");
    validation.assertExportEligible(record,{demoMode:false});
    return true;
  }

  const runtimeCodec=Object.freeze({
    compression:Object.freeze({
      bounded:true,
      async deflateRaw(input,{level=9,maxOutputLength=validation.LIMITS.maxCompressedBytes}={}){
        const output=fflate.deflateSync(input,{level});
        if(!output.length||output.length>maxOutputLength)fail("OVERSIZE","Compressed payload limit exceeded");
        return output;
      },
      async inflateRaw(input,{expectedLength,maxOutputLength=validation.LIMITS.maxInflatedBytes}={}){
        if(!Number.isInteger(expectedLength)||expectedLength<1||expectedLength>maxOutputLength)fail("OVERSIZE","Inflated payload limit exceeded");
        const output=fflate.inflateSync(input,{out:new Uint8Array(expectedLength)});
        if(output.length!==expectedLength||output.length>maxOutputLength)fail("INFLATE_FAILURE","Inflated payload length mismatch");
        return output;
      },
    }),
  });

  function createQr(payload){
    if(typeof payload!=="string"||!payload.startsWith(format.PREFIX)||!ALPHANUMERIC.test(payload))fail("INVALID_QR_PAYLOAD","QR payload must be CSM1 alphanumeric text");
    try{
      const segment=qrcodegen.QrSegment.makeAlphanumeric(payload);
      const value=qrcodegen.QrCode.encodeSegments([segment],qrcodegen.QrCode.Ecc.MEDIUM,1,MAX_QR_VERSION,-1,false);
      return Object.freeze({payload,version:value.version,size:value.size,ecc:ECC,quietZone:QUIET_ZONE_MODULES,matrix:value});
    }catch(error){
      if(/too long/i.test(String(error?.message||error)))fail("OVERSIZE","Match sharing payload does not fit the supported Single QR",error);
      fail("QR_GENERATION_FAILED","Unable to generate Match Sharing QR",error);
    }
  }

  function qrPathData(qrValue){
    const matrix=qrValue?.matrix;
    if(!matrix||typeof matrix.getModule!=="function")fail("INVALID_QR","QR matrix is unavailable");
    const quiet=Number(qrValue.quietZone??QUIET_ZONE_MODULES),parts=[];
    for(let y=0;y<matrix.size;y+=1)for(let x=0;x<matrix.size;x+=1){
      if(matrix.getModule(x,y))parts.push(`M${x+quiet} ${y+quiet}h1v1h-1z`);
    }
    return parts.join("");
  }

  function renderQrSvg(qrValue,{className="match-sharing-qr-svg-v1",label="この試合を共有するQRコード"}={}){
    const total=qrValue.size+qrValue.quietZone*2;
    const safeLabel=String(label).replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
    return `<svg class="${className}" role="img" aria-label="${safeLabel}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect width="${total}" height="${total}" fill="#fff"/><path d="${qrPathData(qrValue)}" fill="#000"/></svg>`;
  }

  async function prepareShare({matchId,demoMode=false,readRecord,prepareSharedMatchId,persistSharedMatchId,codec=runtimeCodec}={}){
    if(demoMode)fail("DEMO_EXPORT_REJECTED","Demo matches cannot be shared");
    if(typeof readRecord!=="function"||typeof prepareSharedMatchId!=="function"||typeof persistSharedMatchId!=="function")fail("INVALID_SENDER_ADAPTER","Sender adapter is incomplete");
    const wanted=String(matchId||"");
    const before=clone(readRecord(wanted));
    if(!before||localId(before)!==wanted)fail("MATCH_NOT_FOUND","Match was not found");
    assertSenderEligible(before);
    const sharedMatchId=prepareSharedMatchId(wanted);
    if(!persistence.isUuidV4(sharedMatchId))fail("INVALID_UUID","Shared Match identity is invalid");
    const logical=adapters.buildSharedMatchV1(before,{sharedMatchId,demoMode:false});
    let payload;
    try{payload=await format.encodeSharedMatchV1(logical,codec);}catch(error){if(error?.code)throw error;fail("EXPORT_FAILED","Match Sharing payload could not be created",error);}
    const qrValue=createQr(payload);
    persistSharedMatchId(wanted,sharedMatchId);
    const stored=clone(readRecord(wanted));
    if(!stored||localId(stored)!==wanted||stored.sharedMatchId!==sharedMatchId)fail("PERSISTENCE_READBACK_FAILED","Shared Match identity could not be verified");
    assertSenderEligible(stored);
    return Object.freeze({record:stored,logical,payload,qr:qrValue,svg:renderQrSvg(qrValue),displaySizePt:DISPLAY_SIZE_PT});
  }

  function bindShareAction(button,options,{signal}={}){
    if(!button?.addEventListener)fail("INVALID_SENDER_ADAPTER","Share action is unavailable");
    const listener=async()=>{
      if(button.disabled)return;
      button.disabled=true;button.setAttribute?.("aria-busy","true");
      try{
        const prepared=await prepareShare(options);
        await options?.onSuccess?.(prepared);
      }catch(error){
        await options?.onError?.(error);
        button.disabled=false;button.removeAttribute?.("aria-busy");
      }
    };
    button.addEventListener("click",listener,signal?{signal}:undefined);
    return listener;
  }

  return Object.freeze({
    ECC,QUIET_ZONE_MODULES,DISPLAY_SIZE_PT,MAX_QR_VERSION,ALPHANUMERIC,MatchSharingSenderError,
    assertSenderEligible,runtimeCodec,createQr,qrPathData,renderQrSvg,prepareShare,bindShareAction,
  });
});
