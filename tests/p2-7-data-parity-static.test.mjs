import "./helpers/ja-fs.mjs";
/* P2-7: Data / QR / Backup / Identity parity guard (static part). The runtime part is tests/browser/p2-7-parity.mjs (baseline a841cbc vs current, ja / en / zh-Hans:
 * storage, Backup bytes, CSV, Analytics, Identity, orders, Free/Pro + IAP id, snapshot, Backup->Restore round trip, all identical). These pins make the same promise at
 * `node --test` level: the code that carries stored data, the QR/Match-Sharing pipeline and the Backup/CSV producers is byte-identical to the pre-P2 baseline (a841cbc),
 * the three modules that changed only read Domain constants whose values equal the former literals, and the 16 goldens are unchanged. */
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { read, extractFunction, sha256, domain } from "./helpers/p2-source.mjs";

const BASELINE_MODULES = {
 "match-sharing-adapters-v1.js": "f10ac88ee5ba7317b75b4ba5f11d654bb2547503c6b15df783e7be0cb8170ea5",
 "match-sharing-format-v1.js": "9026e21ff1d72932eb4f95d5fd93125d5e576762f6481fb3cff90e51741369f3",
 "match-sharing-receiver-v1.js": "d6345bc520499e5d458eddae15fbf63757175f2b520c0f1dfed0fc7b0fa3eb40",
 "match-sharing-sender-v1.js": "55068b12a89ac580cbf5950e9540df8a028938c34e83cea2f3fee634f8a3077c",
 "match-sharing-transaction-v1.js": "4f1e114ac53aed95bc9f74a36fbf246f9639101873712a57925c323b8d2980b7",
 "match-sharing-validation-v1.js": "4399a8a63818ce2a687a78dc5fb2c157e2f239f71f2f44f36463cc75cace1aee",
 "analytics-build4-metrics.js": "b18de4a8eeb02fa253650560de3086fbf561041914db158cb5b438fba7e27a78",
 "demo-data.js": "978bf625b841f3a483805e9ce8a11a644b8beaf1f196de6225b892f20ce906e6"
};
const BASELINE_FUNCTIONS = {
 "exportCsv": "ee3f1ee2a9af20342694f8d9d9537ee1c72c15f160be7b27d93dfa3b57caa66a",
 "exportBackup": "e7bef2cba4deb5fb7477c66d3b28faaa912875de27b8ab0118e97a0eaab5c8bb",
 "makeBackupPayload": "f30e004102cc621aea86ba86c6a6d54b126173c913157410cb02f75a62fccc48",
 "dateStamp": "19dc9ecd379b6739dde18bbd6b2617ec14ec94e13fc274c2b12f1a48ef123c22",
 "formatCsvDateParts": "3284e0b716270eba03cfe9e3ec7aef14cbb5c52a64260ca1d786ca1e64d8ee3c",
 "readPlayerLibrary": "e083bff2f3e86222c22a2eefa9529fd21685d8071f04474e16b0823ab91faae8",
 "writePlayerLibrary": "e73e8315eb5b2d2ec78fe6e0eb4b16f91495fccb01a3866ad810f6cdc873ce3c"
};
const GOLDENS = {
 "analytics-coach.json": "3769baac1894a26e128300216e75a0db7313e712f6b54ab5eeb49aac0f0c99f9",
 "analytics-final-rc-evaluate.json": "921ad11229955fa1c648184cfe359f857cecdf45af1b9ddba1c9df88f345d707",
 "analytics-growth-status.json": "dcbef4d2ae0d4cb916993e9dd596c4cb1ab287d524233a7991deae69bbf32798",
 "analytics-trend-matrix.json": "e36c2fdc2134cd185240bf8600a96e672c1948cf4e890e69eb8801efde93f094",
 "backup-payload.json": "e60c8299694b01fc9986db7fcc9a8d54ff47adc0abb52041537f4c7b2b8c22dc",
 "category-init.json": "f962ca3e641d866b44908861d3fadd2a6af74a39b4dfc0c038f575d85df271e3",
 "csv-headers.json": "09ca65a7aa6e1f821c9ad9b550e6424078bc4ce2e6e372a6c759601f07080211",
 "dates-Asia_Tokyo.json": "0a23e3e3ef5dbe9eeb01fa1fe0f595541da9e6daa1f5d4d17ea0ecb25766637f",
 "dates-UTC.json": "56617211567e1d8e79abd8a692f5029868e58de0c99c79443ed632c3501b1ab0",
 "dates-intl-Asia_Tokyo.json": "30ddaf64c6d75af8e64760e353b393edb3c269cdc804a1a6d94747611f69f870",
 "dates-intl-UTC.json": "917a2f11c2f0d2214da3c1324b399e11a9e93a715a649593b6b28327cadbb11e",
 "identity-matrix.json": "bdb9b4c1e1969540436158f81bdb0089af2825391f3e5255058db7422052c45b",
 "qr-break-labels.json": "414cc9b5e2f045ea0cb1cef46bec9408cf85ca960b9006231b83d77f8230b51b",
 "qr-golden.json": "ef86d8b61ea21dbede0a70dcbb8d1f35e314e4f25b64a6df0765bdab3756a04f",
 "sort-ascii-keys.json": "e63a13bae2767184ed9c799fd31ed14dad0fca5a6ad71dd293f844a3ca359fe2",
 "sort-ja-names.json": "240f17892007718a2673a76feea50c146b431af7e224fe6294e3ad9284524158"
};

test("[P2-7] Match-Sharing / QR pipeline, build4 metrics and demo data are byte-identical to the pre-P2 baseline a841cbc", () => {
  for (const [file, hash] of Object.entries(BASELINE_MODULES)) assert.equal(sha256(read(file)), hash, file);
});
test("[P2-7] Backup / CSV / date-stamp producers and the player library reader / writer are source-identical to a841cbc", () => {
  const html = read("index.html");
  for (const [name, hash] of Object.entries(BASELINE_FUNCTIONS)) assert.equal(sha256(extractFunction(html, name)), hash, name);
  assert.ok(html.includes('const BACKUP_FORMAT = "cuescore-apps-backup";') && html.includes("const BACKUP_SCHEMA_VERSION = 2;"));
});
test("[P2-7] the three modules touched by P2-1 only take locale / normalization values from Domain constants, and those values equal the former literals", () => {
  assert.equal(domain.IDENTITY_LOCALE, "ja"); assert.equal(domain.SORT_LOCALE, "ja"); assert.equal(domain.IDENTITY_NORMALIZATION_FORM, "NFKC");
  assert.ok(read("match-sharing-persistence-v1.js").includes('.normalize(domain.IDENTITY_NORMALIZATION_FORM).trim().replace(/\\s+/g," ").toLocaleLowerCase(domain.IDENTITY_LOCALE)'));
  assert.ok(read("match-sharing-player-drafts-v1.js").includes("toLocaleLowerCase(domain.IDENTITY_LOCALE)"));
  assert.ok(read("record-access-v1.js").includes("localeCompare(String(a?.id||a?.matchId||\"\"),domain.SORT_LOCALE,{numeric:true})") || read("record-access-v1.js").includes("domain.SORT_LOCALE,{numeric:true}"));
  const require = createRequire(import.meta.url);
  assert.equal(require("../match-sharing-persistence-v1.js") !== undefined, true);
});
test("[P2-7] the 16 P2-0 goldens are unchanged since the P2-0 baseline", () => {
  for (const [file, hash] of Object.entries(GOLDENS)) assert.equal(sha256(read("tests/fixtures/p2/golden/" + file)), hash, file);
  assert.equal(Object.keys(GOLDENS).length, 16);
});
test("[P2-7] stored-value contracts: IAP product id, Free record limit, resultLabel canonical constants, S-B flag", () => {
  assert.ok(read("monetization-v1.js").includes('const PRO_PRODUCT_ID="com.takaakimailboxstar.cuescoreapps.pro";'));
  assert.ok(read("record-access-v1.js").includes("const FREE_LIMIT=20;"));
  assert.equal(domain.RESULT_LABELS.SCRATCH, "スクラッチ"); assert.equal(domain.RESULT_LABELS.NO_SCORE, "無得点"); assert.equal(domain.RESULT_LABELS.SKIPPED, "記録なし");
  assert.ok(read("index.html").includes("const LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false;"));
});
