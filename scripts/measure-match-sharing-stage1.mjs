import fs from "node:fs";
import zlib from "node:zlib";
import {createRequire} from "node:module";
import {nodeCodec,stage1Fixtures,theoreticalQrVersion} from "../tests/helpers/match-sharing-stage1-fixtures.mjs";

const require=createRequire(import.meta.url);
const adapters=require("../match-sharing-adapters-v1.js");
const format=require("../match-sharing-format-v1.js");
const rows=[];

for(const fixture of stage1Fixtures()){
  const logical=adapters.buildSharedMatchV1(fixture.source,{sharedMatchId:fixture.sharedMatchId});
  const compact=adapters.compactSharedMatchV1(logical);
  const logicalBytes=Buffer.byteLength(format.stableStringify(logical));
  const compactJson=format.stableStringify(compact);
  const compactBytes=Buffer.byteLength(compactJson);
  const deflateBytes=zlib.deflateRawSync(Buffer.from(compactJson),{level:9}).length;
  const payload=await format.encodeSharedMatchV1(logical,nodeCodec);
  const base45Chars=payload.length-format.PREFIX.length;
  const qrVersion=theoreticalQrVersion(payload.length);
  rows.push({
    case:`${fixture.label} ${fixture.lengthClass}`,gameType:logical.gameType,lengthClass:fixture.lengthClass,
    fixtureId:fixture.fixtureId,eventCount:logical.events.length,logicalBytes,compactBytes,deflateBytes,
    base45Chars,finalChars:payload.length,qrEcc:"M",qrVersion,modules:qrVersion==null?null:17+4*qrVersion,
  });
}

const result={
  generatedAt:new Date().toISOString(),
  source:"demo-data.js / CueScore Sample Data v3.1, adapted through production field names",
  selection:"Per discipline, sort fixtures by analysis.events.length; Short=min, Medium=lower median index 9, Long=max.",
  transport:"CSM1: + Base45(CSM1 binary header + envelope version + deflate-raw id + uncompressed length + SHA-256(compressed) + raw-DEFLATE(compact JSON))",
  qrEstimate:"ISO/IEC 18004 alphanumeric capacity table, ECC-M; theoretical only (QR generation is Stage 4)",
  rows,
  summary:{
    cases:rows.length,
    maxLogicalBytes:Math.max(...rows.map(row=>row.logicalBytes)),
    maxCompactBytes:Math.max(...rows.map(row=>row.compactBytes)),
    maxDeflateBytes:Math.max(...rows.map(row=>row.deflateBytes)),
    maxBase45Chars:Math.max(...rows.map(row=>row.base45Chars)),
    maxFinalChars:Math.max(...rows.map(row=>row.finalChars)),
    qrVersionRange:[Math.min(...rows.map(row=>row.qrVersion)),Math.max(...rows.map(row=>row.qrVersion))],
  },
};

const target=new URL("../docs/implementation/CueScore_Match_Sharing_v1_Stage1_Capacity_Evidence_2026-09-28.json",import.meta.url);
fs.writeFileSync(target,`${JSON.stringify(result,null,2)}\n`);
console.log(JSON.stringify(result.summary));
