# CueScore Apps — Match Sharing v1 Stage 3 Import Transaction / Player Mapping Evidence

**Date:** 2026-09-28

**Baseline:** `0057e2bd5449bdb4e70a805c2b7cc2a61091bfb9`

**Gate:** `STAGE 3 — PRODUCT OWNER / CHATGPT APPROVED — COMMIT / PUSH AUTHORIZED`

## 1. Conclusion

Stage 3の限定scopeで、receiver mapping plan、deferred new Player draft、6競技receiver-local Match再構成、Player／Match 2 collection all-or-nothing transaction、duplicate TOCTOU再確認、semantic read-back、rollback、Free Case C exact-ID one-shot access coreをproduction serviceとして実装した。UI、QR、Camera、Info.plist、Free History UI、Version／Buildには進んでいない。

## 2. Architecture

- `match-sharing-player-drafts-v1.js`：現行Player Editorと同じ必須名、20文字、case-insensitive同名拒否、local ID、default avatar、非primary既定値をpure helper化。Import確定前は保存しない。
- `match-sharing-transaction-v1.js`：validated logical Match＋完全なmapping planからreceiver-local Player／Match next stateを構築し、注入された既存Restore safety transactionで原子的に保存する。
- `index.html`：通常storage reader、normal Player／Match key、`performLocalRestoreTransactionV160`、rollback helperだけをnarrow adapterとして接続。Stage 3 APIをUIからは未使用。

localStorage操作を画面へ漏らさず、Stage 5 UIは後続Gateで`cueScoreImportSharedMatchV1`を呼べる。

## 3. Mapping plan and new Player

- `selectedSide`は1または2を明示必須。
- Self／Opponentはそれぞれ`existing` local IDまたはconfirmed `new` draftを必須とする。
- 名前一致だけの自動mappingなし。同一local ID、同一pending key／draft、missing／deleted／invalid Playerをwrite前に拒否する。
- pending Playerはname必須、20文字、同名拒否、receiver-owned avatar/default、memo最大100、new local ID、`isPrimary`なし。既存main Playerを変更せず、main不在でもMatch Sharing固有の自動main assignmentを行わない。
- existing／existing、new／existing、existing／new、new／newを同一transaction contractで処理する。

## 4. Receiver-local Match reconstruction

- 新しいreceiver-local Match IDを生成し、source local Match IDと`sharedMatchId`を使用しない。同じ`sharedMatchId`は維持する。
- source side 1／2を維持し、選択されたreceiver-local Player IDとlocal Player名をbindingする。
- 6競技のcommon facts、discipline fields、events、analysis summary、progressをStage 1 logical formatから復元する。
- Category／Seasonは空、reflectionはnull、playerReflectionsは空、Undo journalは空、undoCountは0。sender ID、avatar、memo、Pro／IAP、device、Demo metadataは復元しない。
- receiver-local recordをStage 1 adapterでlogicalへ再構築し、mapping後のexpected logical factsと完全semantic parityをread-back時に検証する。

## 5. Duplicate and transaction safety

- full normal Match collectionでImport開始時とfinal write直前に`sharedMatchId`を再確認する。
- Free表示20件外、Restore済みrecordもduplicate対象。duplicate時はpending Playerを生成・保存しない。
- final state全体でduplicate shared IDを再検証し、new local Match IDの既存ID／shared ID衝突も拒否する。
- exact raw Player／Match snapshot、Players→Matchesのverified write、semantic read-backを既存Restore safety contractで実行する。
- Player write、Match write、QuotaExceeded、raw verification、semantic read-back失敗は両collectionをrollbackする。rollback verification失敗は`ROLLBACK_VERIFICATION_FAILED`としてcritical分類し、successを返さない。

## 6. Read-back and success result

成功前に、new Match 1件、shared ID 1件、created Player各1件、receiver Player ID、6競技semantic factsを確認する。service resultは`success`、`importedLocalMatchId`、`sharedMatchId`、`createdPlayerIds`だけを返す。

## 7. Free Case C

Free storageは無制限のまま、Case A（19→20）、Case B（20＋newer Import）、Case C（20＋older Import）を実Importで確認した。Case Cはexact imported local Match IDだけをin-memory tokenへgrantし、consume-before-lookup、一度だけ、wrong ID拒否、clear／reload相当のcontroller再生成で失効する。localStorage、Backup、History、Statistics、Analyticsへtokenを保存・伝播しない。UI接続はStage 5。

## 8. Demo and privacy

- Demo import serviceはstorage key解決／reader／writerより前に拒否する。Player／Match write 0、normal／Demo storage変化0。
- 18 fixtureのreceiver recordでsender local Player ID、sender avatar/photo、memo/reflection、Category/Season値、Pro/IAP、device、Demo metadata contamination 0。

## 9. Backup interaction

Stage 2 Backup implementationは変更していない。Import後recordのvalid `sharedMatchId`がBackup相当serialization、Merge Restore、Restore後full-record duplicate lookupで維持されるintegration testをPASSした。Backup schemaはVersion 2のまま。

## 10. Verification

| Check | Result |
|---|---:|
| Stage 3 dedicated | `24 PASS / 0 FAIL / 0 SKIPPED` |
| Stage 1 + Stage 2 + Stage 3 focused | `53 PASS / 0 FAIL / 0 SKIPPED` |
| 6競技 × Short / Medium / Long reconstruction | `18/18 PASS` |
| Four Player combinations | `4/4 PASS` |
| Privacy contamination | `0/18` |
| Free Case A / B / C | `3/3 PASS` |
| Full Node regression | `512 PASS / 0 FAIL / 0 SKIPPED` |
| native-web generation / iOS public copy parity | PASS |
| `git diff --check` | PASS |

この環境では`npm`がPATHに存在しないため、既存と同じNode test runnerを直接使用した。製品FAILではない。最終Approval Gateの実行commandは、Stage 3が`node --test tests/match-sharing-stage3.test.mjs`、Stage 1+2+3が`node --test tests/match-sharing-stage1.test.mjs tests/match-sharing-stage2.test.mjs tests/match-sharing-stage3.test.mjs`、全Nodeが`node --test --test-reporter=tap tests/*.test.mjs`。native assetsは`node scripts/build-native-web.mjs`と`node_modules/.bin/cap copy ios`で再生成し、5つのMatch Sharing moduleをsource／`native-web`／iOS public間でbyte parity確認した。

## 11. Boundaries and not verified

- Stage 4 Sender QR／QR generation UI：NOT STARTED
- Stage 5 Scanner／Camera／Info.plist／Receiver UI／Free History UI：NOT STARTED
- production UI navigation and success Detail/toast：NOT VERIFIED
- physical iPhone／iPad：NOT VERIFIED
- Build／Archive／Upload／TestFlight／App Store Connect：変更・実施なし
- dependency追加：0
- Official 101／102変更：0
- Version／Build変更：0（`1.1 (79)`維持）
- commit／push：本Approval Gateで実施し、最終SHAをfresh read-backで確認する

## 12. Review gate

Stage 3の実装、test、EvidenceはProduct Owner / ChatGPT Reviewで`APPROVED`となった。本GateではStage 3差分の最終監査、再test、commit、push、fresh read-backだけを実施し、Stage 4へ進まずSTOPする。

`MATCH SHARING v1 STAGE 3 APPROVED / STAGE 4 NOT STARTED`
