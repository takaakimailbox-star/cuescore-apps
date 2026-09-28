# CueScore Apps — Match Sharing v1 Stage 2 Persistence / Backup / Access Evidence

**Date:** 2026-09-28
**Baseline:** `651f352f1ad67f381291254f14dda97c268edacb`
**Gate:** `STAGE 2 APPROVED — COMMIT / PUSH AUTHORIZED`
**Commit / push:** Authorized by the Product Owner approval Gate; final SHA is reported after fresh read-back

## 1. Conclusion

Stage 2の限定scopeで、既存Free 20件contract不一致を再現・修正し、optional `sharedMatchId`のlazy persistence、全通常保存recordを対象にしたduplicate lookup、Backup schema v2互換、Replace／Merge Restore identity保持を実装した。Product Owner / ChatGPT ReviewはPASSし、Stage 2を承認した。Stage 3 Import transaction、Player mapping、QR／Camera／UIには進んでいない。

## 2. Free mismatch reproduction and root cause

27件fixtureで修正前focused testを実行し、`0 PASS / 1 FAIL`で既存不一致を再現した。`CueScoreRecordAccess`はFreeへglobal newest 20件を返す一方、基本Statisticsの`rawRecords()`は`readMatchRecords()`の全保存recordを直接返していた。History、通常Match Detail、Player aggregateは既に共通policyを使用していた。

修正はStatisticsのvalid record collectionへ`CueScoreRecordAccess.getEligibleRecords()`を適用する1経路だけとした。global newest 20を確定してからdiscipline等のfilterを適用する。Proは同じpolicyから全保存recordを受け取る。Pro-only Analyticsの独立したprevious-period full-record経路は変更していない。Free History UI、hidden count案内、Match Sharing専用paywallは実装していない。

## 3. `sharedMatchId` persistence

- optional UUID v4。legacy欠損は正常で、bulk migration／record schema version変更なし。
- 完了・確定済み通常Matchを初回共有するときだけ`crypto.randomUUID()`で生成し、既存full-collection verified writerへ保存する。
- valid existing IDは再利用し、2回目以降の共有で書き換えない。
- Demo、未完了Match、malformed existing IDはwrite前に拒否する。
- persistenceまたはsemantic read-back失敗時は元collectionへrollbackし、検証結果をerrorへ保持する。
- APIはStage 3以降から呼び出すためのstorage boundaryだけで、共有UIは未実装。

## 4. Duplicate lookup

全通常保存recordを検索し、Free表示20件、History filter、日時、名前、scoreに依存しない。valid UUID v4を持つ完了recordだけを対象とし、pending／invalid／Demo／削除済みrecordを除外する。Restoreされたrecordも同じlookupへ参加する。

## 5. Backup / Restore

- Backup format／schemaは`cuescore-apps-backup` Version 2を維持。
- raw Match serializationによりvalid `sharedMatchId`を保持し、Backup時に新規生成しない。
- schema 1／2の旧Backupでfield欠損を正常扱いする。
- present IDはUUID v4必須。同一Backup内のduplicate shared IDとmalformed IDをwrite前に拒否する。
- Replace Restoreは現行canonical spreadとverified transactionを維持し、optional IDをそのまま保持する。
- Merge Restoreはvalid `sharedMatchId`を第一identity、local Match IDをfallbackとする。different local ID／same shared IDは追加しない。same local ID／different shared IDは安全なconflictとしてwrite前に拒否する。different local IDs／shared IDなしは別recordとして保持する。
- QuotaExceeded、snapshot、verified write、rollback messageのDecision 025 contractは変更していない。

## 6. Verification

| Check | Result |
|---|---:|
| 修正前Free mismatch reproduction | `0 PASS / 1 FAIL`（EXPECTED FAIL） |
| Stage 2 dedicated | `15 PASS / 0 FAIL / 0 SKIPPED` |
| Stage 1 + Stage 2 + Match／Analytics／Demo／Backup／Restore／Undo／delete focused | `129 PASS / 0 FAIL / 0 SKIPPED` |
| Stage 1 focused | `14 PASS / 0 FAIL / 0 SKIPPED` |
| Stage 1 capacity | `18/18 fit`, ECC-M Version `19–30`, final `884–1852 chars` |
| Full Node regression | `488 PASS / 0 FAIL / 0 SKIPPED` |
| native-web generation / iOS public copy parity | PASS |
| `git diff --check` | PASS |

## 7. Boundaries and not verified

- Stage 3 Import transaction／Player mapping：NOT STARTED
- Sender QR／Receiver Scanner／Camera／Info.plist／UI：NOT STARTED
- Free History hidden-record notice：NOT STARTED
- physical iPhone／iPad：NOT VERIFIED（Stage 2にはUIまたは配布なし）
- Version／Build／Archive／Upload／TestFlight／App Store Connect：変更・実施なし
- dependency追加：0
- Official 101／102変更：0
- commit／push：本Approval Gateで実施し、fresh read-backする

## 8. Review gate

Stage 2 PASS条件を満たし、Product Owner / ChatGPT Reviewで承認された。本Approval Gateで1つのreviewable commitとしてGitHub `main`へ正本化し、Stage 3へ進まない。

`STAGE 2 APPROVED / STAGE 3 NOT STARTED`
