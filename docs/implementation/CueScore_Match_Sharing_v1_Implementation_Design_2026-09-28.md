# CueScore Apps — Match Sharing v1 Implementation Design

**Date:** 2026-09-28

**Gate:** APPROVED Implementation Design / Stage 1 approved implementation baseline

**Baseline:** `551aed938f3dbf450473fd7d9031d9131bba28e7` (`origin/main`, fresh fetch verified)

**Product implementation:** Stage 1 pure Format / Adapters / Validation APPROVED; Stages 2+ NOT STARTED

**Status:** DESIGN GATE COMPLETE — STAGE 1 IMPLEMENTED / TESTED / PRODUCT OWNER APPROVED

## 1. Conclusion

Match Sharing v1は、現行の保存schemaを全面変更せず、次の分離構成で安全に実装できる。

1. 独立したFormat／adapter／validation module
2. 完了Matchへのoptional `sharedMatchId`のlazy persistence
3. 現行Restore safety helperを基礎にしたPlayer＋Matchの原子的Import
4. AVFoundationを使うCueScore専用QR-only native scanner bridge
5. Base45／DEFLATE／SHA-256と、alphanumeric modeを明示できるQR generator
6. 採用済みUIを管理する一時的なReceiver state machine

現時点のsource上に実装不能なBLOCKERはない。Product Ownerは、Freeで既に20件以上あり、取り込む試合日時が古くeligible 20件外になるCase Cについて、保存成功直後だけ通常Match Detailを一度表示できるOption Aを採用した。これはexact local Match IDに限定したin-memory one-shot accessとして実装し、History、集計、Pro entitlementまたは永続accessを変更しない。

あわせて、Free Historyには全競技合計の`過去の試合 ○件`案内を、現行History末尾のPro CTA位置へ表示する。件数はraw localStorage長ではなく、`readMatchRecords()`が受理した全normal saved recordsと`CueScoreRecordAccess.getEligibleRecords()`の差から算出する。競技・期間・検索filterより前のglobal access policyを説明するため、filter切替では変動させない。

fresh source auditでは、History、通常Match Detail、Player aggregateはeligible collectionを使う一方、`getFilteredRecordsV53()`と現行Analytics rendererはfull saved collectionを読む実装差が確認された。Official 98/102のFree contractと一致しないため、Match Sharing実装で追認・拡大せず、実装開始前の既存access-policy整合化項目として明示する。

## 2. Authority and baseline

### Read SSOT

- `docs/official/101_CueScore_Match_Sharing_v1_Decision.md`
- `docs/official/102_CueScore_Match_Sharing_v1_Spec.md`
- Official Design Decision Log v2.4 / Decisions 028–029
- `docs/CURRENT_STATE.md`
- `docs/implementation/CueScore_Match_Sharing_v1_UI_Prototype_PO_Acceptance_2026-09-27.md`
- Decision 12（Later登録の履歴。維持）
- 現行production source、native iOS source、tests

### Repository state at investigation start

- Branch: `codex/race-picker-bottom-navigation`
- Local HEAD: `551aed938f3dbf450473fd7d9031d9131bba28e7`
- `origin/main`: `551aed938f3dbf450473fd7d9031d9131bba28e7`
- Fresh fetch: PASS
- Working tree before this report: CLEAN
- Marketing Version / Build in source: `1.1 (79)`

This document does not alter Official 101 / 102.

## 3. Production source map

| Area | Source / symbol | Current responsibility | Match Sharing change |
|---|---|---|---|
| Match model | `index.html`; `ROTATION_RECORD_SCHEMA_VERSION`, `normalizeMatchRecordV680` | Completed record schema v4; normalizes legacy defaults while preserving unknown fields with spread | Add optional `sharedMatchId`; no required-field migration |
| Match save | `index.html`; `saveCurrentMatchRecord`, `persistCompletedMatchRecordsV162` | Builds six-discipline record, verified local save, releases in-progress snapshot before completion save | No ID at normal completion; share service lazily adds it |
| Match read/write | `index.html`; `readMatchRecords`, `persistMatchRecordsOnlyV161`, `writeMatchRecords` | Reads full stored collection, normalizes, verifies writes, refreshes derived views | Reuse full collection for duplicate scan and lazy ID save |
| History | `index.html`; `readMatchRecords`, `renderMatchRecords`, `filteredMatchRecordsV31`, `openRecords` | `readMatchRecords` accepts array entries with object + `id` + `players`; access policy selects global newest 20 before discipline/date/search filters; count shows currently filtered visible records; current hidden notice is `20件まで表示しています` + existing Pro CTA | Add Receiver header action; hide sharing entry in Demo; replace/extend current hidden notice with global hidden count without changing access order |
| Match Detail | `index.html`; `openMatchDetailV1`, `openHistoricalRecord`; `ui-revision-v12.js` origin restore | Normal detail and result/detail navigation | Add Sender header action; add import-success transient open path without result-mode styling |
| Player model | `index.html`; `readPlayerLibrary`, `writePlayerLibrary`, `makePlayerId`, `primaryPlayerV1` | Local players, UUID/fallback IDs, primary marker, verified persistence | Reuse normalization and ID generation; import drafts stay memory-only until final transaction |
| Player create/edit | `index.html`; `savePlayerEditor`, `setExclusivePrimaryPlayerV1` | 20-char limit, required name, case-insensitive duplicate-name rejection, confirmation, avatar/memo/primary | Extract pure validation/draft builder; do not call immediate writer during Import flow |
| Player Picker | `index.html`; `openPlayerLibrary`, `renderPlayerLibrary`, `selectRegisteredPlayer` | Existing local Player selection; rejects same selected ID in both match sides | Reuse picker presentation; adapter callback returns selection to sharing state |
| Demo separation | `demo-data.js`; `CueScoreDemoData.isDemo`, `resolveKey`, `resolveSettingKey` | Redirects normal keys to isolated Demo keys | UI hide plus service-level hard rejection before any read/write |
| Free / Pro | `record-access-v1.js`; `FREE_LIMIT`, `getEligibleRecords`, `isEligible`, `hasHiddenRecords`; installed by `monetization-v1.js` | Free newest 20 view/access policy; storage remains unfiltered | Sharing itself ungated; duplicate uses full records; imported Match follows policy |
| Statistics | `index.html`; `getFilteredRecordsV53`, `recordsForRegisteredPlayer` and consumers | Player aggregate starts from eligible records, but `getFilteredRecordsV53` currently defaults to the full `readMatchRecords()` collection | Imported adapter must reproduce facts/metrics; before Match Sharing implementation, align the existing full-collection reader with Official 98/102 instead of adding a sharing exception |
| Analytics | `analytics-build4-metrics.js`, `analysis-build4.js`, `index.html`; `filteredBase`, `previousRecords` | Formal Analytics consumes `getFilteredRecordsV53()` and `allRaw()`; current source can therefore include Free-hidden records even though the entry itself is Pro-gated | Preserve active events and derived summary/report required for parity; record the current contract mismatch and verify eligible/full behavior explicitly before implementation |
| Backup | `index.html`; `makeBackupPayload`, `BACKUP_SCHEMA_VERSION = 2` | Serializes full Match records and Players | Optional field automatically exports; add UUID validation |
| Replace Restore | `validateBackup`, `migrateBackupToCanonicalV170`, `CueScoreRestoreSafetyV160.performTransaction` | Validates schema 1/2, canonicalizes, verified multi-key write and rollback | Accept absent legacy ID; preserve valid optional ID; reject malformed ID |
| Merge Restore | Settings Suite `recordKey`, `mergeUnique`, `mergeBackup` | Deduplicates records primarily by local ID | Prefer valid `sharedMatchId`, then local ID/legacy signature |
| Transaction safety | `captureLocalStorageSnapshotV160`, `writeAndVerifyRestoreEntriesV160`, `restoreLocalStorageSnapshotV160`, `performLocalRestoreTransactionV160` | Snapshot, verified writes, rollback, QuotaExceeded messaging | Reuse with Player and Match keys; add semantic read-back and rollback-after-readback-failure wrapper |
| localStorage | `rotationScoreboard.players.v1`, `rotationScoreboard.matchRecords.v1` | Normal data SSOT; Demo keys are resolved separately | No new collection; one optional Match field only |
| Native container | `ios/App/App/AppDelegate.swift`, `SceneDelegate.swift`, `CueScoreBridgeViewController.swift` | UIScene lifecycle and Capacitor bridge; custom StoreKit plugin registration | Register a dedicated scanner bridge only after implementation approval |
| Camera permission | `ios/App/App/Info.plist` | Current text covers Player profile photo only | Later broaden text to photo + Match QR scan |
| Dependencies | `package.json`; Capacitor 8.0.2, Filesystem 8.0.0, Share 8.0.1 | No scanner, QR, Base45, or compression package | No dependency was added in this gate |
| Native dependency lock | `ios/App/App.xcodeproj/.../Package.resolved` | `capacitor-swift-pm 8.0.2`, `ion-ios-filesystem 1.1.2` | Future changes must keep exact lock and identity evidence |
| Native web bundle | `scripts/build-native-web.mjs`, `sw.js` | Explicit allow-list copy to `native-web`; app shell caching | Add future sharing modules/vendor files to both lists and identity tests |
| Toast | `index.html`; `showToast` | Lightweight timed visual toast, currently no live-region semantics | Reuse visual; add `role=status`, `aria-live=polite` for import success/error announcement |
| Navigation | `navigation-shell-phase1.js`, `ui-revision-v12.js` | Root tabs, origin snapshots, detail return/scroll restoration | Add isolated sharing overlay/state controller; preserve origin and focus |
| Accessibility | existing `aria-live`, modal roles, keyboard tab behavior, `prefers-reduced-motion` CSS | Partial accessibility foundation | Sharing screens need explicit focus management, labels, announcement, reduced motion |

### Native/privacy observations

- Deployment target is iOS 15 (`ios/App/CapApp-SPM/Package.swift`).
- Existing `NSCameraUsageDescription` is `プレーヤーのプロフィール写真を撮影するためにカメラを使用します。`
- App-owned `PrivacyInfo.xcprivacy` was not found. Capacitor/Cordova build products carry framework manifests; camera access itself is disclosed by `NSCameraUsageDescription`. A final Archive privacy-manifest audit remains required.
- Existing custom bridge registers only `CueScoreStoreKitPlugin`.

## 4. Production Format and adapters

### Module boundary

Do not copy the feasibility prototype into `index.html`. Create testable modules with no DOM or localStorage dependency:

- `match-sharing-format-v1.js`: logical contract, compact representation, Base45/envelope
- `match-sharing-adapters-v1.js`: product record ⇄ logical v1 mapping
- `match-sharing-validation-v1.js`: bounds, UUID, game-specific schema, privacy deny-list
- `match-sharing-transaction-v1.js`: storage-facing orchestration injected with storage/readers
- `match-sharing-ui-v1.js` and `.css`: adopted UI/state only

The root HTML may expose only narrow product adapters (read record, open detail, open Player picker, show toast) until the monolith is further extracted.

### Canonical game identifiers

Production values are:

- `rotation`
- `nineBall`
- `tenBall`
- `straightPool`
- `jpa9Ball`
- `threeCushion`

The feasibility fixtures use `jpa9` as a discipline identifier in places. Production must not copy that ambiguity. The logical format should use one explicit enum and map `jpa9Ball` ↔ compact code; the UI-only discipline label remains `jpa9` where current renderers expect it.

### Common field mapping

| Product record field | Export | Import |
|---|---|---|
| `id` | OMIT | Generate a new receiver-local UUID |
| `sharedMatchId` | Preserve; create and persist before first QR if absent | Preserve unchanged after UUID v4 validation |
| `gameType` | Transform to compact enum | Transform to exact production value |
| `recordSchemaVersion` | Not trusted as transport schema | Set current local schema version |
| `createdByAppVersion` | OMIT | Set current receiver app version |
| `playedAt`, `startedAt`, `endedAt` | Preserve normalized ISO timestamps | Preserve validated values |
| `winner`, `result`, `inning`, `rack` | Preserve | Preserve after cross-field validation |
| `breakRule`, `initialBreaker`, `rackResults` | Preserve when applicable | Rebuild exact product fields |
| `players[1/2].name` | Preserve display name | Preserve display name, then bind receiver local ID |
| `players[1/2].registeredPlayerId` | OMIT | Replace with explicit receiver mapping |
| Player metrics (`goal`, `skillLevel`, `score`, `safety`, `fouls`, `breaks`, `maxRun`, `completedTurns`, `average`, `share`, `misses`, `pocketCount`, `shotRate`) | Preserve | Preserve and validate numeric bounds/consistency |
| `eventLog.events` | Preserve active common events in compact form | Rehydrate active event array |
| `eventLog.journal`, `undoCount` | OMIT | Empty journal / zero audit; completed imported Match is not undoable gameplay |
| `analysis.events`, `analysis.summary`, `analysis.report` | Preserve required analytics facts and recording mode | Rehydrate; recompute report where existing pure helper is authoritative, then parity-test |
| `progress` | Preserve | Rehydrate and validate final points against scores |
| `rulesEngine.ruleId`, needed rule snapshot | Preserve only rule facts needed to interpret historical result | Rebuild supported safe subset; reject unsupported rule/game combinations |
| `consistencyAudit` | OMIT as source-local audit | Recompute receiver-local audit after adapter validation |
| `category`, `season` | OMIT | Empty receiver-local values |
| `reflection`, `playerReflections`, memo/tags | OMIT | Empty/default local values |
| avatar/photo, entitlement, device, Demo metadata | OMIT | Use receiver-local Player/avatar only |

### Six-discipline mapping

| Discipline | Must Preserve | Must Transform | Must Omit |
|---|---|---|---|
| Rotation | common score/goal, inning/rack, active scoring/foul/switch events, metrics, progress, rule facts | local IDs; exact `rotation` enum; receiver Player binding | local category/season/reflections, journal, sender IDs/avatar |
| 9-Ball | `nineBall.settings`, `consecutiveFouls`, `ballInHandFor`, `initialBreaker`, `rackResults`, common rack results, break/rack-end/spot events and run-out facts | exact `nineBall`; local IDs; rebuild receiver rule snapshot | local-only/private fields and undo journal |
| 10-Ball | 9-Ball facts plus `tenBall.spotEvents` and 10-Ball settings | exact `tenBall`; local IDs; ensure 10-ball winning/spot facts stay distinct | same privacy/local fields |
| JPA 9-Ball | `jpa9.skillLevels`, `targetPoints`, `deadBalls`, `deadBallEvents`, score/inning, break/foul/dead active events and metrics | logical JPA code ↔ production `jpa9Ball`; receiver Player IDs | journal and all private/local metadata |
| 14-1 | `straightPool.settings`, `consecutiveFouls`, `openingBreaker`, `rackCycle`, `spotEvents`, `rerackEvents`, `openingBreakEvents`, penalty/scoring events and progress | exact `straightPool`; local IDs | private/local fields and journal |
| 3C | `threeCushion.settings`, `ruleVariant`, `drawAt25`, `draw`, `targetPoints`, `currentInning`, `completedTurns`, `highRun`, `averages`, `innings`, carom events/progress | exact `threeCushion`; local IDs | private/local fields and journal |

Rotation currently has no saved discipline-specific `rotation` object. The adapter must not invent one; its facts come from common fields/events/metrics.

### Validation order

1. string prefix `CSM1:`
2. Base45 character count and character set ceiling
3. Base45 decode with byte ceiling
4. fixed envelope magic/compression/version fields
5. declared uncompressed length ceiling
6. SHA-256 digest verification
7. bounded raw-DEFLATE inflate
8. UTF-8 / compact JSON parse
9. logical `formatVersion === 1`
10. UUID v4 `sharedMatchId`
11. supported exact game enum
12. players, result, timestamps and numeric bounds
13. game-specific required fields and cross-field parity
14. Must-Omit contamination rejection in developer tests
15. duplicate scan over full normal saved collection

Recommended retained prototype ceilings, subject to implementation tests: Base45 ≤ 5,000 characters and declared uncompressed body ≤ 256 KiB. Decoder must reject before large allocation wherever possible.

## 5. `sharedMatchId` persistence design

### Safety of an optional field

`normalizeMatchRecordV680` spreads the original record before applying defaults. JSON serialization, `readMatchRecords`, History, Detail, Analytics, delete, and Backup therefore preserve and ignore an unknown optional field safely. Legacy records without it remain valid.

No completed-Match schema migration is required solely to make `sharedMatchId` optional. Do not increment every legacy record or bulk-rewrite storage.

### Options considered

| Timing | Benefit | Problem | Decision |
|---|---|---|---|
| Match completion | Every new Match immediately has ID | Changes all Match writes although most may never be shared; does not solve legacy alone | Not recommended |
| Encode-time ephemeral | No storage write | Same Match can get a new ID each share, defeating duplicate protection | Reject |
| First share, lazy and persisted | Works for all legacy/new completed Matches; stable on repeat share; minimal writes | One verified write before QR display | **Recommended** |

### Exact behavior

1. Demo hard guard.
2. Read full normal record collection and find the displayed completed record by local `id`.
3. If a valid UUID v4 exists, reuse it.
4. Otherwise generate `crypto.randomUUID()`, clone only that record and full array, write through verified full-collection persistence.
5. Read back and verify local ID → exact shared ID.
6. Only after verification build/show QR.
7. On failure, do not display a payload and keep the original record if rollback is required.

Undo and in-progress snapshots are unaffected because sharing is only available from completed Match Detail.

## 6. Duplicate protection

- Search `readMatchRecords()` before applying `CueScoreRecordAccess`.
- Compare only normalized valid `sharedMatchId` values.
- Do not use History’s visible 20, current filters, dates, names, score, or sender local ID.
- Restored records participate because Backup preserves the field.
- Deleted records do not block a later import because the identity no longer exists locally; this matches current deletion semantics and should be tested explicitly.
- Demo records never participate: import/export rejects before resolving Demo keys.
- Repeat the duplicate check immediately before transaction write to guard against a state change between preview and confirmation.

## 7. Import transaction and rollback

### Preparation phase — no writes

1. Decode and fully validate payload.
2. Duplicate scan over full normal records.
3. Validate Self/Opponent selections are present and distinct.
4. Resolve existing receiver Players.
5. For each requested new Player, validate the same 20-character/name/duplicate rules and construct an in-memory draft with a new local ID and default local avatar/memo.
6. Build a receiver-local Match with a new local Match ID, mapped `registeredPlayerId`s, preserved `sharedMatchId`, empty local-only fields, and rebuilt audit.
7. Build complete next Player and Match arrays in memory.

The existing Player editor must not call `writePlayerLibrary` during this flow. Extract pure helpers from `savePlayerEditor` so the editor can return a confirmed draft to the pending sharing state.

### Commit phase

- Snapshot exact raw values for `rotationScoreboard.players.v1` and `rotationScoreboard.matchRecords.v1` using the normal keys after confirming Demo is off.
- Call the existing Restore safety transaction with both complete arrays. Recommended write order: Players, then Match records. No render/refresh is invoked between writes.
- Perform semantic read-back:
  - every planned new Player ID/name exists once;
  - imported local Match ID exists once;
  - `sharedMatchId` matches once;
  - both mapped local Player IDs are exact and distinct;
  - essential score/game/time fields match the adapter output.
- If semantic verification fails after the helper returned, restore the captured snapshot with `restoreSnapshot`, verify `matchesSnapshot`, and report rollback status.
- Refresh derived views and mark cloud state dirty only after verified commit. A cloud-dirty marker failure does not undo an already verified local import, matching existing completed-save/Restore precedent.

### Failure guarantees

| Failure point | Required result |
|---|---|
| Validation / duplicate / mapping | No write attempted |
| First or second localStorage write | Existing helper restores both raw values |
| QuotaExceeded | Both collections unchanged or rollback verified; reuse existing user-safe messaging |
| Semantic read-back mismatch | Explicit outer rollback; no imported Player/Match remains |
| Rollback verification failure | Critical stop message; no success navigation |

This design covers existing/existing, new/existing, existing/new, and new/new mapping in one transaction.

## 8. Backup / Restore compatibility

### Current evidence

- Backup format: `cuescore-apps-backup`
- Accepted legacy format: `rotation-scoreboard-backup`
- Current backup schema: 2; schema 1 and 2 accepted
- `matchRecords` are serialized as record objects without a restrictive projection.
- Restore canonicalization spreads each record through `normalizeMatchRecordV680`, preserving unknown optional fields.
- Replace Restore uses multi-key verified transaction and rollback.
- Merge Restore currently keys by local Match ID, then a legacy content signature.

### Recommended compatible change

- Keep Backup schema version 2 because `sharedMatchId` is optional additive data and old backups without it are normal.
- Export automatically includes it through the existing raw Match serialization.
- `validateBackup`:
  - absent/null: accepted;
  - present: must be UUID v4;
  - duplicate non-empty shared IDs inside one backup: reject as invalid.
- `migrateBackupToCanonicalV170`: preserve the optional field unchanged after validation.
- Replace Restore: no special migration; restored ID enables future duplicate protection.
- Merge Restore `recordKey`: use `shared:${sharedMatchId}` first when valid, otherwise existing local-ID/legacy fallback.
- Before merge write, also ensure an incoming shared ID is not already represented under a different local ID.
- Old backups remain readable and restored legacy records remain shareable through lazy ID assignment.

No old Match should be assigned a new shared ID merely because a backup is restored.

## 9. Free 20-record boundary

The source confirms `FREE_LIMIT = 20` is access/view policy, not storage capacity. Writes always operate on full unfiltered records. Match Sharing v1 remains available to Free and Pro with no sharing-specific lock, badge, paywall, or entitlement gate.

| Case | Stored result | History/basic eligible result | Import-success behavior |
|---|---|---|---|
| A: 19 → import = 20 | Save succeeds | All 20 eligible, normal placement by date | Normal Detail and toast |
| B: 20 → newer import = 21 | Save succeeds | New import enters newest 20; previous oldest becomes hidden | Normal Detail and toast |
| C: 20+ → older import outside newest 20 | Save succeeds | Import is stored but absent from Free History/basic eligible collection | **Option A ADOPTED:** success直後だけ通常Detailを一度表示し、その後は通常Free policyへ戻る |

### 9.1 Source evidence and count inputs

- `record-access-v1.js`: `FREE_LIMIT = 20`; `getEligibleRecords()` stable-sorts the supplied collection newest-first and returns the first 20 for Free; `hasHiddenRecords()` currently compares supplied array length with 20.
- `index.html` `readMatchRecords()`: active normal/Demo storage keyを読み、arrayであることを確認した後、object + `id` + `players`を持つentryだけを受理し、`normalizeMatchRecordV680()`を適用する。破損JSONはrecovery copyを作り空配列として扱う。
- `index.html` `renderMatchRecords()`: `readMatchRecords()` → `getEligibleRecords()` → `filteredMatchRecordsV31()`の順。discipline、period、category、season、searchは最新20件を選んだ後に適用する。
- `recordsCount`は現在filter後に見えている件数（例：`20試合`）で、保存総数ではない。
- 現行hidden noticeはHistory list末尾の`.cue-history-limit-v1`で、`20件まで表示しています`と`🔒 Proですべての履歴を見る`を表示する。
- 削除済みrecordはstorage collectionに存在しないためhidden countへ含めない。raw array内でも`readMatchRecords()`が受理しないentryは数えない。

推奨算出は次のとおりとする。

```text
allNormalRecords = readMatchRecords()
freeVisibleRecords = CueScoreRecordAccess.getEligibleRecords(allNormalRecords, { isPro: false })
hiddenPastCount = max(0, allNormalRecords.length - freeVisibleRecords.length)
```

実装時は、entitlementが確定した通常renderでは現行policy instanceの結果を使い、Proではnoticeを表示しない。上式のoverrideはpure unit testの説明用であり、製品rendererへ別policyを複製しない。hidden count APIを`CueScoreRecordAccess`へ追加する場合も、同じ入力集合とstable sortを一つのSSOTから返す。

### 9.2 Adopted Free History information design

Primary placementは、visible Match cardsの後、現行`.cue-history-limit-v1`が置かれているHistory scroll content末尾とする。Receiver header action、discipline tabs、`recordsCount`、各Match card、Bottom Navigationを押しのけない。現行noticeを次の内容へ置換／拡張し、新しい課金画面は作らない。

```text
過去の試合 7件
Freeでは最新20試合を表示しています。
Proでは過去の試合もすべて確認できます。
[ 🔒 Proですべての履歴を見る ]
```

- `7件`は全競技のglobal hidden countであり、表示中filterの件数ではない。
- `recordsCount`は従来どおり現在filterで見えている件数を示す。二つの役割を混ぜて`全27件`等へ変更しない。
- hidden countが0（19件・20件・Pro）ならnoticeを表示しない。
- `1件削除すれば見られます`等の削除回避案内は表示しない。
- Import直後にmodal paywall、forced upgrade、blocking Pro screenを出さない。

Alternativeは`recordsCount`直下へのcompact noticeだが、件数行とdiscipline filterの文脈でfilter対象のhidden件数に見えやすく、Receiver header action周辺の情報密度も増すため不採用を推奨する。

現在`renderMatchRecords()`はfilter結果0件でearly returnし、hidden noticeを生成しない。実装時はempty state/card HTMLとglobal notice HTMLを分離し、discipline/search結果が0件でもhidden recordsがあれば同じ末尾noticeを表示する。ただし「まだ対戦履歴はありません」は全eligible collectionが0の場合だけとする。

### 9.3 Filter behavior

**Primary: A — 全競技合計として固定。**

access policyが全保存記録からglobal newest 20を選んだ後にfilterするため、filter中競技だけの正確な「制限で隠れた件数」は現在のfilter結果からは導出できない。global fixed countは`保存済み27件のうち最新20件をFreeで表示し、過去7件が保持されている`という実際の契約を一貫して説明する。

- discipline、month、recent10、category、season、searchを切り替えても`過去の試合 7件`は変えない。
- `recordsCount`とfilter summaryだけが現在filterのvisible countへ追随する。
- notice本文に`全競技`を常時追加する必要はないが、VoiceOver labelは`全競技で過去の試合7件があります`として誤解を防ぐ。

Option B（filter中競技だけのhidden count）は、全保存集合に対して同じfilterを別途適用してからeligible集合との差を取れば計算可能だが、現行のglobal-first policyを「競技ごとに20件」のように誤認させる。採用しない。

### 9.4 Existing Pro CTA and entitlement transition

CTAは現行`data-pro-history-limit`と`CueScorePro.open("historyLimit")`を再利用する。表示文言は現行の`🔒 Proですべての履歴を見る`を維持し、Pro画面の既存`履歴無制限`説明、購入、Restore、StoreKit価格表示へ接続する。Match Sharing専用購入flowは作らない。

verified Pro entitlementになると現行subscriberが`renderMatchRecords()`を再実行し、`getEligibleRecords()`が全保存recordsを返す。したがって保存済み過去Matchはmigrationなしで通常Historyへ現れ、`.cue-history-limit-v1`は除去される。非消耗型IAPなのでユーザー操作としての任意downgrade flowは設計しない。StoreKitがrefund/revocation等によりverified entitlementを返さなくなった場合は、既存runtime policyがFree表示へ戻るだけで、Match Sharing固有stateは持たない。

### Why current code cannot directly satisfy Case C

`openMatchDetailV1` searches only `getEligibleRecords` for normal detail. Its existing `source === "result"` bypass searches all records but also switches to result-mode UI and suppresses normal History behavior. Reusing it would violate the adopted normal Match Detail result.

### Recommended minimum design for Case C

Add a non-persistent one-shot capability tied to the exact imported local Match ID. Do not accept a public/generic `source: "import-success"` string as sufficient authority because any caller could turn it into a Free bypass.

- final transactionとsemantic read-back成功後に限り、controller closure内へ`transientImportedDetailId`としてexact local Match IDを保持する。
- `openImportedMatchDetailOnce(importedId)`のようなnarrow internal adapterが、tokenとrequested IDの一致を確認してからtokenを**先にconsume**し、full saved collectionからその1件だけをlookupする。
- lookup成功時は既存`openMatchDetailV1`のnormal renderer pathを使い、`resultMode = false`、通常History origin semantics、receiver local Player/avatarで表示する。
- Match Detail表示後に`✓ 試合を取り込みました`toastを出す。toastとtransient accessをPro CTAへ結び付けない。
- lookup/render失敗でもtokenは復活させず、通常Historyへ安全に戻す。再試行用の永続flagを作らない。
- Back、別画面、flow resetでcontroller tokenをclearする。reload/app relaunchではin-memory state消失により自然に失効する。
- History、`getEligibleRecords`、Statistics、Analytics、Player Detail、URL、localStorage、Backupへtokenを渡さない。
- normal `openMatchDetailV1(recordId)`のeligible gateは変更しない。既存`source === "result"`も再利用しない。

Back後に同じ古いImportを再表示できないことは、`成功直後だけ一度`という採用済みcontractと一致する。History noticeによりrecordが失われたのではなく過去分として保存されていることを説明できる。

### 9.5 Statistics / Analytics / Player aggregate audit

fresh source auditの結果は一様ではない。

| Consumer | Actual source | Free-hidden old Import |
|---|---|---|
| History | `renderMatchRecords()` → `getEligibleRecords()` | 除外 |
| Normal Match Detail | `openMatchDetailV1()` → `getEligibleRecords()` | 除外。success直後のexact one-shotだけ例外 |
| Player Detail / Player journey aggregate | `recordsForRegisteredPlayer()` → `getEligibleRecords()` | 除外 |
| Statistics filter engine | `getFilteredRecordsV53()` → default `rawRecords()` → full `readMatchRecords()` | **現行sourceでは含まれ得る** |
| Formal Analytics current/previous | `filteredBase()` → `getFilteredRecordsV53()`、`previousRecords()` → `allRaw()` | **現行sourceではfull saved collectionを参照**（entry自体はPro gate） |

Official 98/102はFreeのHistory、基本統計、通常Match Detail等を同じeligible collectionとする。従って、`getFilteredRecordsV53()`のfull-collection defaultは既存sourceとOfficial contractの不一致である。Match Sharing Case Cの特例として正当化せず、Stage B開始前にaccess-policy focused testで再現し、`getFilteredRecordsV53()`のinputをeligible collectionへ統一する既存contract修正を別差分としてレビューする。Product sourceはこのDesign Addendumでは変更しない。

Detailed Analyticsは現行`CueScoreFeatureAccess`でPro gatedだが、集計sourceの境界自体は明示的に保つ。Free-hidden old ImportをMatch Sharingだけの理由でStatistics／Analytics／Player aggregateへ追加する処理は作らない。

## 10. Camera / Scanner design

### Current configuration

- Capacitor 8.0.2, iOS 15 minimum.
- No camera/scanner dependency.
- Existing photo capture is browser/file-input based; there is no reusable scanner service.
- Existing custom Capacitor bridge pattern is proven by `CueScoreStoreKitPlugin`.

### Options

| Option | Dependency / UI | Permission and offline | Maintenance / risk |
|---|---|---|---|
| Official `@capacitor/barcode-scanner` | Adds official plugin and Outsystems barcode libraries; its scan UI/options are plugin-owned | Camera usage description required; offline scan | Maintained for Capacitor 8 and offers accessibility labels; lower initial code, but transitive native surface and adopted CueScore scanner fidelity require validation |
| Custom AVFoundation QR-only bridge | No third-party scanner dependency; exact adopted screen and lifecycle | Native `authorizationStatus` / `requestAccess`; fully offline | More CueScore-owned Swift/tests, but small bounded QR-only scope and stable Apple API |
| Web `getUserMedia` + JS decoder | Adds decoder and transparent WebView/camera lifecycle complexity | Permission mediated through WKWebView; offline possible | Highest lifecycle/performance variance; weakest fit for current native app |

### Primary recommendation

Use a dedicated CueScore native AVFoundation QR-only plugin/controller:

- `AVCaptureSession` + rear camera + `AVCaptureMetadataOutput` filtered to `.qr` only;
- `AVCaptureVideoPreviewLayer` under a native view matching the adopted scanner screen;
- emit the first accepted string once, stop session immediately, return to Web flow for validation;
- handle `.notDetermined`, `.authorized`, `.denied`, `.restricted` explicitly;
- denied/restricted returns a typed state so Web UI shows Settings recovery, not a prompt loop;
- stop on Back, background, interruption and deinit; restart only when foreground/authorized and still on scanner;
- no photo-library permission and no image retention.

Apple documents metadata type filtering and camera authorization for this use. The official Capacitor plugin remains the fallback if a Stage D spike shows native screen ownership or accessibility cost is higher than expected. The deprecated archived community scanner must not be adopted.

Sources checked on 2026-09-28:

- Apple `AVCaptureMetadataOutput.metadataObjectTypes`: https://developer.apple.com/documentation/avfoundation/avcapturemetadataoutput/metadataobjecttypes
- Apple camera authorization: https://developer.apple.com/documentation/avfoundation/avcapturedevice/authorizationstatus(for:)
- Apple AVCam preview/lifecycle example: https://developer.apple.com/documentation/avfoundation/avcam-building-a-camera-app
- Official Capacitor scanner: https://github.com/ionic-team/capacitor-barcode-scanner
- Official Capacitor plugin list: https://github.com/ionic-team/capacitor-plugins

### Future `NSCameraUsageDescription` proposal

`プレーヤーのプロフィール写真の撮影と、試合共有QRコードの読み取りにカメラを使用します。`

This accurately covers both current photo capture and the future scan. Do not change it until scanner implementation is approved.

## 11. QR generation, compression, Base45 and integrity

### QR generation

Primary recommendation: use the MIT-licensed Nayuki QR Code Generator TypeScript/JavaScript implementation as a pinned, reviewed vendor module, not Core Image.

Reasons:

- `CSM1:` + Base45 is entirely QR alphanumeric-compatible and must be encoded explicitly in alphanumeric mode for the measured Version 19–30 density.
- The library supports explicit alphanumeric segments, ECC Medium, version bounds, mask selection, and disabling automatic ECC boosting.
- Render to `<canvas>` or SVG with integer module scaling, 4-module quiet zone, pure `#000/#fff`, no logo/rounding; CSS visual box targets adopted 292pt.
- Core Image `CIQRCodeGenerator` exposes ECC M but takes byte `Data`; byte-mode density can exceed the physical-feasibility versions for the 1,991-character heavy case. It is therefore not the safest parity choice without separate proof.
- `node-qrcode` is another maintained browser-capable candidate but is a larger/bundler-oriented dependency than needed for this static native-web build.

Reference: https://github.com/nayuki/QR-Code-generator

The exact pinned commit/license and generated module SHA-256 must be recorded at implementation. Add the module to `scripts/build-native-web.mjs`, `sw.js`, and native-web identity tests. No library was added now.

### Compression

Primary recommendation: pin `fflate` and use its raw DEFLATE APIs in a small adapter. It is approximately 8 KiB for core functionality, supports DEFLATE/GZIP/zlib and browser builds, and avoids relying on `CompressionStream("deflate-raw")` across the app’s iOS 15 floor.

Reference: https://github.com/101arrowz/fflate

Implementation safeguards:

- fixed compression mode byte in envelope;
- reject declared output length above ceiling before inflate;
- provide an exactly-sized output buffer if the chosen API supports it, then verify produced length;
- reject trailing/malformed stream and length mismatch;
- run heavy-case timing/memory tests on minimum supported and current iPhone/iPad simulators and physical iPhone.

`CompressionStream` may be feature-detected in diagnostics, but should not produce a second production encoding path in v1.

### Base45

Use a small local audited RFC 9285-compatible implementation with:

- exact alphabet validation;
- no Unicode normalization of payload text;
- odd/even group bounds;
- byte overflow rejection;
- known official vectors, property round-trip and malformed-input tests.

This avoids adding a second tiny dependency whose behavior still requires audit.

### Integrity

Use `crypto.subtle.digest("SHA-256", compressedBytes)` and store 32 digest bytes in the fixed envelope, as the prototype did. WebCrypto SHA-256 is established in secure contexts; native Capacitor pages must be explicitly tested. This detects corruption only and does not authenticate the sender.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest

## 12. New Player creation reuse

### Existing contract to preserve

- name required and limited to 20 characters;
- case-insensitive duplicate-name rejection;
- new local ID from `crypto.randomUUID()` with existing fallback;
- default local avatar and empty memo;
- existing primary Player is not silently replaced;
- user confirmation before creation;
- cancel does not write;
- local avatar is receiver-owned and may be shown in mapping.

### Recommended integration

Extract shared pure functions from the current editor:

- `validatePlayerDraft(name, existingPlayers, editingId?)`
- `createLocalPlayerDraft({name, avatar?, isPrimary?}, now, idFactory)`
- `normalizePlayerDraft`

The Match Sharing new-Player sheet uses the existing full-screen Player editor visual/validation but runs in a `deferredCommit` mode. It returns the confirmed draft to the receiver state machine without `writePlayerLibrary`. Final transaction persists it.

- Prefill the shared display name.
- Self and Opponent both support this path.
- Default `isPrimary = false`; do not alter the current main Player during import unless a separate future PO decision explicitly permits it.
- On duplicate name, return to mapping with the existing error and encourage selecting the existing Player.
- The existing picker must filter/disable the Self-mapped Player during Opponent selection.

## 13. Navigation and pending state

Use one in-memory `MatchSharingFlowStateV1` owned by a controller, not localStorage:

```text
idle
senderPreparing → senderQR
receiverScanning → receiverValidating → receiverPreview
→ selfMapping → opponentMapping → finalConfirmation
→ committing → successDetail
```

State fields:

- sender origin record ID and detail origin snapshot
- decoded immutable logical payload
- selected source side
- Self mapping (`existingId` or confirmed pending Player draft)
- Opponent mapping (`existingId` or confirmed pending Player draft)
- imported local Match ID only after commit
- camera permission/session state

Back behavior:

- Sender QR → same Match Detail and prior scroll/focus.
- Scanner → History and restore header-action focus.
- Preview → Scanner; decoded payload can be discarded to require rescan.
- Self → Preview, preserving side.
- Opponent → Self, preserving confirmed drafts/selections.
- Final → Opponent.
- Success Detail → normal History origin semantics.

Cancel before commit clears the entire state and writes nothing. Backgrounding stops scanner. Mapping/final screens may retain memory state during a short background/foreground cycle, but process termination/reload cancels the flow; do not persist sensitive payload or pending Player drafts. After return to foreground, camera restarts only if scanner remains active and permission is authorized.

## 14. Error handling

| Condition | Detection boundary | UI direction / persistence |
|---|---|---|
| Duplicate | full normal records before mapping and before write | `この試合はすでに取り込まれています。`; no write |
| Non-CueScore QR | no `CSM1:` | `CueScoreの試合共有コードではありません。`; remain scanner |
| Corrupted / bad digest / malformed | decoder/validator | `この試合データを読み込めませんでした。`; no write |
| Unknown format version | envelope/logical version | update-required message; no guessed migration |
| Invalid game type | logical validation | corrupted/unsupported message; no write |
| Missing Player | logical validation | corrupted message; no mapping |
| Invalid result / inconsistent score | game adapter validation | corrupted message; no write |
| Oversized payload | before Base45 decode / before inflate | corrupted message; no large allocation/write |
| Camera denied/restricted | native typed state | inline Settings recovery with `UIApplication.openSettingsURLString`; no loop |
| Camera unavailable/interrupted | native scanner | recoverable message/Retry; keep no decoded state |
| Mapping conflict | UI + final validation | Self Player disabled in Opponent picker; `次へ` disabled |
| Transaction / read-back failure | transaction wrapper | rollback, existing Restore-style message; never navigate to Detail |
| QuotaExceeded | existing helper classifier | explicit unchanged/restored message; no partial data |

Use inline screen state or modal for recoverable scanner/mapping errors; use the existing toast pattern for lightweight confirmation. The success toast needs `role="status"` / `aria-live="polite"`; current `showToast` is visual only.

## 15. Accessibility and layout plan

- Every sharing screen uses a real heading and deterministic first focus.
- On open, focus header/heading; on Back, restore the invoking header action.
- QR image: accessibility label describing the selected match and instruction; do not expose payload text.
- Sender buttons: visible `共有`, accessibility label `試合を共有`.
- Receiver: visible `受け取る`, label `試合を受け取る`.
- Scanner guide is not color-only; instruction text and VoiceOver announcement explain positioning. Native cancel/Settings controls have explicit Japanese labels.
- Side/mapping selection uses border/check plus `aria-pressed`/selected text; never color alone.
- Disabled `次へ` retains explanatory label/state.
- Success/error uses polite/assertive live regions as appropriate and does not depend on animation.
- Respect `prefers-reduced-motion`; toast may appear/disappear without slide animation.
- Minimum tap target 44×44pt.
- Test 390×844 and the narrowest currently supported iPhone width; long names use two-line/ellipsis according to adopted prototype without hiding side identity.
- Dynamic Type audit at default, XL, accessibility sizes; allow vertical scroll on mapping/confirmation rather than clipping fixed controls.
- VoiceOver order: Back → title → match summary → choices → primary action.
- Scanner needs real-device VoiceOver testing because camera preview and native bridge cannot be validated by DOM-only tests.
- Free History notice uses semantic text plus a real button. The heading/count must be announced as `全競技で過去の試合7件があります`（countは動的） and the CTA keeps the explicit label `Proですべての履歴を見る`; do not rely on the lock icon or color.
- Global hidden count does not change with filters, so it must not be an `aria-live` region. `recordsCount` and existing filter summary retain their own visible-filter meaning.
- The notice and CTA must wrap without horizontal clipping at 390×844 and the narrowest supported width. CTA tap target is at least 44×44pt; Dynamic Type may increase card height and History remains vertically scrollable above Bottom Navigation.
- Focus returns from the Pro surface to the invoking History CTA through the existing `returnFocus` path. On verified purchase, History rerender must preserve the current discipline/scroll behavior already handled by the Pro origin snapshot.

## 16. Demo separation

Implement two independent boundaries:

1. UI boundary: do not render/enable Sender or Receiver header actions while `CueScoreDemoData.isDemo()` is true.
2. Service boundary: `prepareExport`, `startImport`, and final transaction each reject Demo before calling `activeCueScoreDataKeyV1`, scanner decode, or storage writers.

Tests must seed both normal and Demo keys, attempt direct service calls, and prove normal and Demo raw values remain unchanged. Demo fixture records may remain test inputs outside the product Demo mode.

The Free History notice is not a Match Sharing entry. Current Demo uses the same `readMatchRecords()`/`CueScoreRecordAccess` path against isolated Demo keys and contains 120 records, so the existing Free hidden-limit notice already appears when the entitlement is Free. Preserve that contract: Demo may show `過去の試合 100件` computed from the accepted Demo collection, while Sender/Receiver sharing actions remain hidden and service calls remain rejected. Pro entitlement shows all Demo records and removes the notice through the same policy; no Demo-specific count override is added.

## 17. Test architecture

### Unit

- Base45 official vectors, malformed/overflow/Unicode cases.
- Envelope encode/decode, SHA-256, truncation, length mismatch, bomb ceilings.
- Format v1 schema and privacy deny-list.
- Six export/import adapters with Short/Medium/Long fixtures and production `jpa9Ball` mapping.
- UUID v4 creation/validation and lazy persistence reuse.
- Duplicate scan including Free-hidden and restored records.
- Player mapping existing/new/mixed/new-new, same-ID rejection, duplicate names.
- Transaction: every write/read-back failure point, quota, rollback verification.
- Free History accepted collection/count: 19→0 hidden, 20→0, 21→1, 27→7; invalid entries excluded; deleted entries absent; Pro→0 notice.
- Global hidden count stays fixed across discipline, month/recent10, category, season and search filters while `recordsCount` follows the visible filtered set.
- Free Cases A/B/C and exact-ID one-shot token: consume-before-open, wrong ID denied, second open denied, Back/navigation/flow reset/reload/app-relaunch reconstruction denied.
- Case A 19→20, Case B 20→newer 21st, Case C 20+→older Import; full saved collection, eligible collection and success route asserted separately.
- Existing Pro CTA dispatches `historyLimit`; verified purchase rerender exposes all saved past records without migration; Restore success follows the same path.
- Statistics access-policy contract: `getFilteredRecordsV53`, Player Detail and Analytics fixtures explicitly assert exclusion/inclusion of Free-hidden records according to Official 98/102.
- Backup schema 1/2, absent/present/malformed/duplicate shared IDs, replace/merge.
- Demo UI/service guards plus Free 120-record hidden notice behavior; normal and Demo counts/storage remain isolated.

### Integration

- Product record → compact → deflate → Base45 → decode → receiver record for all 18 prior cases.
- QR module/version/ecc assertions; exact ECC-M and no boost.
- Six-discipline parity for History, normal Detail, Player Detail, Statistics and Analytics.
- Existing/existing, new/existing, existing/new, new/new Player paths.
- Import → Backup → delete/replace/merge Restore → duplicate rejection.
- Imported Match re-share keeps the same `sharedMatchId` while issuing a new QR with the same logical identity.
- History empty-filter state still renders the global hidden notice; genuinely empty accepted collection does not.
- Purchase/Restore from the existing History CTA preserves History origin, selected discipline and scroll, then shows all saved past records.

### Native/UI

- Camera authorization: notDetermined/authorized/denied/restricted.
- Back/background/foreground/interruption and scanner single-result behavior.
- Sender/Receiver header actions, all adopted screens, focus return, disabled/enabled states.
- Free History notice at 19/20/21/27, all filters, long count text, 390×844/narrow width, Dynamic Type, VoiceOver order/labels and 44pt CTA.
- Import success old record: normal Detail + toast once, Back to History notice, no forced paywall, no second access after Back/reload/relaunch.
- Duplicate/non-CueScore/corrupted/unknown/oversized/quota errors.
- 390×844 plus narrow width, Dynamic Type, VoiceOver, Reduce Motion.
- Product Owner physical iPhone scan of minimum/middle/heaviest final production payload; do not infer from prototype-only results.

### Regression

- all Node tests;
- six scoring flows and completed records;
- Undo/in-progress recovery unchanged;
- History count/filter semantics, Detail/Player/Statistics/Analytics, existing Pro CTA and purchase/Restore rerender;
- Backup/Replace/Merge/Quota rollback;
- Free/Pro policy and StoreKit startup;
- Demo isolation;
- Release Simulator Build and iPhone/iPad launch.

## 18. Implementation stages

### Stage A — Pure Format, adapter, validation

- Status: **COMPLETE / PRODUCT OWNER APPROVED** on 2026-09-28.
- Scope: modules only; exact compact contract; 18 fixtures; privacy tests.
- Actual files: three pure core modules, tests/fixture helper, capacity measurement script and Evidence. The app build copy list remains unchanged because Stage 1 is not product-wired.
- PASS: 18/18 round-trip, production parity and deterministic re-encode; privacy contamination 0/18; required Negative 14/14; ECC-M theoretical fit 18/18 at Version 19–30; no DOM/storage/network.
- STOP completed: Product Owner / ChatGPT approved the actual compact contract and measured QR versions. Stage B remains a separate Gate.

### Stage B — Optional identity and Backup/Restore

- Scope: first reproduce and resolve the existing Official 98/102 access-policy mismatch; then lazy `sharedMatchId`, validation, full-collection duplicate lookup, Backup/Restore merge key.
- Expected files: focused access-policy tests, storage helpers in extracted module, minimal `index.html` adapter, backup focused tests.
- PASS: History, basic Statistics, Player aggregates and normal Detail use the intended eligible collection; Pro uses all; legacy records/backups unchanged; new backups preserve ID; restore duplicate and rollback tests pass.
- STOP: access-policy/storage/compatibility review before Import UI.

### Stage C — Import transaction and Player drafts

- Scope: deferred Player creation, mapping rules, atomic two-collection transaction, semantic read-back, adopted Case C exact-ID transient Detail capability.
- Expected files: transaction module, pure Player draft helpers, tests; no scanner yet.
- PASS: all four mapping combinations, injected failures/quota, zero partial state, Free A/B/C, one successful old-Import Detail open only, token cleared on every exit/reload boundary.
- STOP: transaction and one-shot access Evidence. Case C Option A is already adopted and is not reopened as a PO question.

### Stage D — Sender UI and QR

- Scope: Detail action, sender state, pinned QR generator and fflate/Base45/SHA; adopted QR display.
- Expected files: UI module/CSS/vendor modules, `index.html` hooks, build/SW allow lists, Info/documentation only as approved.
- PASS: ECC-M, 4-module quiet zone, 292pt audit, repeated share same ID, Demo rejected, physical scan gate.
- STOP: Product Owner sender physical test.

### Stage E — Native Scanner and receiver UI

- Scope: native QR-only bridge, permission text, scanner, adopted receiver screens/state, Free History global hidden-count notice and existing Pro CTA integration.
- Expected files: Swift plugin/controller, bridge registration, `Info.plist`, Xcode source references, UI modules/CSS/tests.
- PASS: four permission states, lifecycle, 390×844/Dynamic Type/VoiceOver, no pre-confirmation writes, 19/20/21/27/Pro/filter/Demo History states and no forced import paywall.
- STOP: Product Owner receiver UI and real-camera gate.

### Stage F — Full integration and release-candidate verification

- Scope: end-to-end six disciplines, success navigation/toast, Backup/Restore, all regression.
- PASS: focused suites, full Node, native UI, Release Simulator Build, iPhone/iPad launch, final physical scan/import/duplicate/rollback.
- STOP: Implementation Acceptance. Build/archive/TestFlight remain separate gates.

No stage automatically authorizes the next stage.

## 19. Product Owner decision status

New decision required for Stage 1: **0**. Stage 1 was approved on 2026-09-28. Starting Stage B requires a separate instruction and is not authorized by this document.

- Free Case C = Option A is Product Owner ADOPTED and must not be re-asked.
- Free History Primary placement, global fixed filter behavior, current Pro CTA reuse and exact-ID transient capability follow directly from the adopted access policy and verified source order.
- Existing Statistics/Analytics source-contract mismatch is an implementation-quality gate, not a new product-design choice. It must be corrected to the existing Official 98/102 contract before Match Sharing implementation depends on it.

## 20. Known issue / FAIL / BLOCKED / NOT VERIFIED

### Known existing issue — deferred to Stage B

- `getFilteredRecordsV53()` and current Analytics readers can consume the full saved collection instead of the Official 98/102 eligible collection.
- Stage 1 did not change or work around this existing Statistics / Analytics contract discrepancy.
- Stage B must reproduce, align and test it before Case C is declared compliant across History/basic Statistics/Detail.

### FAIL

- Stage 1: 0.

### BLOCKED

- Stage 1: 0.
- Stage B is not started because it remains a separate Product Owner Gate, not because Stage 1 has a technical blocker.

### NOT VERIFIED

- final encoded Stage 1 payload physical iPhone scan（capacityは18/18 theoretical fit、Version 19–30まで確認済み）;
- pinned QR/compression module versions and archive identity;
- AVFoundation scanner implementation, real camera and permission states;
- production localStorage transaction/rollback;
- production exact-ID transient token lifecycle and navigation cleanup;
- Free History notice visual behavior at 390×844, narrow width, Dynamic Type and VoiceOver;
- verified StoreKit purchase/Restore rerender with the revised notice;
- post-fix Statistics/Analytics/Player aggregate eligible-collection parity;
- Backup/Restore implementation with shared IDs;
- Dynamic Type/VoiceOver/focus on final product UI;
- final iPhone/iPad physical scan/import;
- Build/Archive/TestFlight/App Store behavior.

## 21. Product source and Git status

- Stage 1 product core changes: 3 new pure modules
- Dependency changes: 0
- `Info.plist` changes: 0
- Match/storage schema changes: 0
- Backup/Restore changes: 0
- Version/Build changes: 0
- Build/Archive/Upload/TestFlight/App Store Connect: not performed
- Stage 1 approval authorizes one reviewed commit and push; final SHA is recorded by the approval-gate completion report.
- Stages 2+ product source changes: 0

## 22. STOP

**MATCH SHARING v1 STAGE 1 APPROVED / STAGE 2 NOT STARTED**

Stage 2 must not start until a separate Product Owner instruction is issued.
