(function(root,factory){
  const validation=typeof module==="object"&&module.exports?require("./match-sharing-validation-v1.js"):root.CueScoreMatchSharingValidationV1;
  const adapters=typeof module==="object"&&module.exports?require("./match-sharing-adapters-v1.js"):root.CueScoreMatchSharingAdaptersV1;
  const api=factory(validation,adapters);
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.CueScoreMatchSharingFormatV1=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(validation,adapters){
  "use strict";
  if(!validation||!adapters)throw new Error("CueScore Match Sharing dependencies are required");

  const PREFIX="CSM1:";
  const MAGIC=Object.freeze([0x43,0x53,0x4d,0x31]);
  const ENVELOPE_VERSION=1;
  const COMPRESSION_DEFLATE_RAW=1;
  const HEADER_BYTES=10;
  const DIGEST_BYTES=32;
  const BASE45_ALPHABET="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
  const BASE45_INDEX=Object.freeze(Object.fromEntries([...BASE45_ALPHABET].map((character,index)=>[character,index])));

  const bytes=value=>value instanceof Uint8Array?value:new Uint8Array(value||[]);
  const concat=(...values)=>{
    const arrays=values.map(bytes),result=new Uint8Array(arrays.reduce((sum,item)=>sum+item.length,0));
    let offset=0;for(const item of arrays){result.set(item,offset);offset+=item.length;}return result;
  };
  const writeU32=(target,offset,value)=>{
    target[offset]=(value>>>24)&255;target[offset+1]=(value>>>16)&255;target[offset+2]=(value>>>8)&255;target[offset+3]=value&255;
  };
  const readU32=(source,offset)=>((source[offset]*0x1000000)+((source[offset+1]<<16)|(source[offset+2]<<8)|source[offset+3]))>>>0;
  const equalBytes=(left,right)=>{
    if(left.length!==right.length)return false;let difference=0;for(let index=0;index<left.length;index+=1)difference|=left[index]^right[index];return difference===0;
  };

  function base45Encode(value){
    const input=bytes(value);let output="";
    for(let index=0;index<input.length;index+=2){
      if(index+1<input.length){
        let current=input[index]*256+input[index+1];
        const first=current%45;current=Math.floor(current/45);const second=current%45;const third=Math.floor(current/45);
        output+=BASE45_ALPHABET[first]+BASE45_ALPHABET[second]+BASE45_ALPHABET[third];
      }else{
        output+=BASE45_ALPHABET[input[index]%45]+BASE45_ALPHABET[Math.floor(input[index]/45)];
      }
    }
    return output;
  }

  function base45Decode(text){
    if(typeof text!=="string"||text.length%3===1)throw new validation.MatchSharingError("MALFORMED_BASE45","Malformed Base45");
    const output=[];
    for(let index=0;index<text.length;){
      const remaining=text.length-index,count=remaining>=3?3:2;
      const first=BASE45_INDEX[text[index]],second=BASE45_INDEX[text[index+1]];
      if(first===undefined||second===undefined)throw new validation.MatchSharingError("MALFORMED_BASE45","Malformed Base45");
      if(count===3){
        const third=BASE45_INDEX[text[index+2]];
        if(third===undefined)throw new validation.MatchSharingError("MALFORMED_BASE45","Malformed Base45");
        const current=first+second*45+third*45*45;
        if(current>65535)throw new validation.MatchSharingError("MALFORMED_BASE45","Base45 overflow");
        output.push(Math.floor(current/256),current%256);
      }else{
        const current=first+second*45;
        if(current>255)throw new validation.MatchSharingError("MALFORMED_BASE45","Base45 overflow");
        output.push(current);
      }
      index+=count;
    }
    return new Uint8Array(output);
  }

  function canonicalize(value){
    if(Array.isArray(value))return value.map(canonicalize);
    if(value&&typeof value==="object")return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonicalize(value[key])]));
    return value;
  }
  const stableStringify=value=>JSON.stringify(canonicalize(value));

  async function defaultDigest(value){
    const subtle=globalThis.crypto?.subtle;
    if(!subtle)throw new validation.MatchSharingError("CRYPTO_UNAVAILABLE","SHA-256 is unavailable");
    return new Uint8Array(await subtle.digest("SHA-256",bytes(value)));
  }

  function assertCodec(codec){
    if(!codec?.compression||codec.compression.bounded!==true||typeof codec.compression.deflateRaw!=="function"||typeof codec.compression.inflateRaw!=="function"){
      throw new validation.MatchSharingError("CODEC_UNAVAILABLE","A bounded raw-DEFLATE adapter is required");
    }
    return {compression:codec.compression,digest:typeof codec.digest==="function"?codec.digest:defaultDigest};
  }

  async function encodeSharedMatchV1(logical,codec){
    validation.validateSharedMatchV1(logical);
    const runtime=assertCodec(codec);
    const compact=adapters.compactSharedMatchV1(logical);
    validation.assertBoundedStructure(compact);
    const plain=new TextEncoder().encode(stableStringify(compact));
    if(plain.length>validation.LIMITS.maxInflatedBytes)throw new validation.MatchSharingError("OVERSIZE","Inflated payload limit exceeded");
    let compressed;
    try{compressed=bytes(await runtime.compression.deflateRaw(plain,{level:9,maxOutputLength:validation.LIMITS.maxCompressedBytes}));}
    catch(error){throw new validation.MatchSharingError("DEFLATE_FAILURE","Unable to compress payload",{cause:String(error?.message||error)});}
    if(!compressed.length||compressed.length>validation.LIMITS.maxCompressedBytes)throw new validation.MatchSharingError("OVERSIZE","Compressed payload limit exceeded");
    const digest=bytes(await runtime.digest(compressed));
    if(digest.length!==DIGEST_BYTES)throw new validation.MatchSharingError("CRYPTO_FAILURE","Invalid SHA-256 digest length");
    const header=new Uint8Array(HEADER_BYTES);header.set(MAGIC,0);header[4]=ENVELOPE_VERSION;header[5]=COMPRESSION_DEFLATE_RAW;writeU32(header,6,plain.length);
    const envelope=concat(header,digest,compressed);
    if(envelope.length>validation.LIMITS.maxEnvelopeBytes)throw new validation.MatchSharingError("OVERSIZE","Envelope limit exceeded");
    const payload=PREFIX+base45Encode(envelope);
    if(payload.length>validation.LIMITS.maxEncodedChars)throw new validation.MatchSharingError("OVERSIZE","Encoded payload limit exceeded");
    return payload;
  }

  async function decodeSharedMatchV1(payload,codec){
    if(typeof payload!=="string"||!payload.startsWith(PREFIX))throw new validation.MatchSharingError("NON_CUESCORE","Not a CueScore Match Sharing payload");
    if(payload.length>validation.LIMITS.maxEncodedChars)throw new validation.MatchSharingError("OVERSIZE","Encoded payload limit exceeded");
    const runtime=assertCodec(codec);
    const encoded=payload.slice(PREFIX.length);
    let envelope;
    try{envelope=base45Decode(encoded);}catch(error){if(error instanceof validation.MatchSharingError)throw error;throw new validation.MatchSharingError("MALFORMED_BASE45","Malformed Base45");}
    if(envelope.length>validation.LIMITS.maxEnvelopeBytes)throw new validation.MatchSharingError("OVERSIZE","Envelope limit exceeded");
    if(envelope.length<HEADER_BYTES+DIGEST_BYTES+1)throw new validation.MatchSharingError("TRUNCATED","Truncated payload");
    if(!MAGIC.every((value,index)=>envelope[index]===value))throw new validation.MatchSharingError("NON_CUESCORE","Invalid envelope magic");
    if(envelope[4]!==ENVELOPE_VERSION)throw new validation.MatchSharingError("UNSUPPORTED_VERSION","Unsupported envelope version");
    if(envelope[5]!==COMPRESSION_DEFLATE_RAW)throw new validation.MatchSharingError("UNSUPPORTED_VERSION","Unsupported compression");
    const expectedLength=readU32(envelope,6);
    if(expectedLength<2||expectedLength>validation.LIMITS.maxInflatedBytes)throw new validation.MatchSharingError("OVERSIZE","Inflated payload limit exceeded");
    const expectedDigest=envelope.slice(HEADER_BYTES,HEADER_BYTES+DIGEST_BYTES);
    const compressed=envelope.slice(HEADER_BYTES+DIGEST_BYTES);
    if(!compressed.length||compressed.length>validation.LIMITS.maxCompressedBytes)throw new validation.MatchSharingError("OVERSIZE","Compressed payload limit exceeded");
    const actualDigest=bytes(await runtime.digest(compressed));
    if(!equalBytes(expectedDigest,actualDigest))throw new validation.MatchSharingError("DIGEST_MISMATCH","Payload digest mismatch");
    let plain;
    try{plain=bytes(await runtime.compression.inflateRaw(compressed,{expectedLength,maxOutputLength:validation.LIMITS.maxInflatedBytes}));}
    catch(error){throw new validation.MatchSharingError("INFLATE_FAILURE","Unable to inflate payload",{cause:String(error?.message||error)});}
    if(plain.length!==expectedLength)throw new validation.MatchSharingError("TRUNCATED","Inflated length mismatch");
    let text;
    try{text=new TextDecoder("utf-8",{fatal:true}).decode(plain);}catch(_){throw new validation.MatchSharingError("INVALID_SCHEMA","Invalid UTF-8");}
    if(text.length>validation.LIMITS.maxTextChars)throw new validation.MatchSharingError("OVERSIZE","Text limit exceeded");
    let compact;
    try{compact=JSON.parse(text);}catch(_){throw new validation.MatchSharingError("INVALID_SCHEMA","Invalid compact JSON");}
    validation.assertBoundedStructure(compact);
    return adapters.expandSharedMatchV1(compact);
  }

  return Object.freeze({
    PREFIX,MAGIC,ENVELOPE_VERSION,COMPRESSION_DEFLATE_RAW,HEADER_BYTES,DIGEST_BYTES,BASE45_ALPHABET,
    base45Encode,base45Decode,canonicalize,stableStringify,encodeSharedMatchV1,decodeSharedMatchV1,
  });
});
