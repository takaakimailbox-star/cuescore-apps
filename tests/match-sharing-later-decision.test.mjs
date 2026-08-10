import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const decision=fs.readFileSync(new URL("../docs/official/12_CueScore_Later_Match_Sharing_Decision.md",import.meta.url),"utf8");
const current=fs.readFileSync(new URL("../docs/CURRENT_STATE.md",import.meta.url),"utf8");
const appStoreIndex=fs.readFileSync(new URL("../docs/official/app-store-v1.0/README.md",import.meta.url),"utf8");

test("Match Sharing is formally recorded as Later and excluded from v1.0",()=>{
  assert.match(decision,/Status: Adopted — Later \/ Deferred/);
  assert.match(decision,/v1\.0: Deferred \/ 非搭載/);
  assert.match(decision,/試合共有に関するUI・保存形式・転送処理は追加しない/);
  assert.match(decision,/自動クラウド同期とは別機能/);
  assert.match(decision,/Product Ownerによる改めての採用判断/);
  assert.match(current,/試合共有（Match Sharing）[\s\S]*?v1\.0非搭載、v1\.1以降候補/);
  assert.match(appStoreIndex,/CSV、自動クラウド同期、試合共有（Match Sharing）/);
});
