# CueScore Apps — Match Sharing Format v1 Specification

**Status:** Adopted / Design and Technical Feasibility Complete / Formal Specification Complete / Primary UI Prototype Product Owner PASS / Implementation NOT STARTED

**Specification date:** 2026-09-27

**Authority:** Product Owner adopted specification
**Governing decision:** `101_CueScore_Match_Sharing_v1_Decision.md`

## 1. Purpose and scope

本Specificationは、完了・確定済みの1試合を別のCueScoreへ1回受け渡すMatch Sharing v1の情報設計、transport、validation、Player mapping、Import、privacy、互換性、acceptance criteriaを定義する。

Match Sharing v1は同期、共同編集、クラウドアカウント、複数試合Backup、Demo共有を提供しない。

## 2. User flow

### 2.1 Sender flow

送信側は試合詳細ページから表示中の完了試合を選ぶ。

`試合詳細 → 試合を共有 → Single QR表示`

進行中、中断中、未確定、Demoの試合はexport対象にしてはならない。

送信入口は試合詳細header右上の`QR glyph + 共有`とする。visible labelは`共有`、accessibility labelは`試合を共有`相当とする。QR表示画面headerは`試合を共有`とし、競技、日時、Player A / B、score / result、Race / target等の主要条件、短い読取説明、Single QRを表示する。

### 2.2 Receiver flow

受信側は試合履歴一覧ページから開始する。

`試合履歴一覧 → 試合を受け取る → QR読み取り → payload検証 → 試合内容確認 → 自分side選択 → 自分Player mapping → 相手Player mapping → 最終確認 → 試合を取り込む → 保存 → 通常の試合詳細`

保存は最終確認後にだけ実行する。validation失敗、mapping未完了、ユーザーcancelでは保存しない。

受信入口は試合履歴一覧header右上の`QR glyph + 受け取る`とする。visible labelは`受け取る`、accessibility labelは`試合を受け取る`相当とする。件数行右側には置かない。

Camera permissionは、未要求時にiOS標準dialogを経てScannerへ進み、許可済みは直接Scannerへ進む。拒否済みは再要求ループを行わず説明とSettings recoveryを提供する。CueScore独自の事前permission tutorial画面を通常Flowへ追加しない。Scanner headerは`試合を受け取る`とする。

## 3. Transport

### 3.1 Primary transport

- 表示形式：標準白黒Single QR
- Error correction：ECC-M
- Prefix：`CSM1:`
- Text encoding：Base45
- Compression：deflate
- Input：CueScore Match Sharing Format v1のcompact representation

logo、色変更、角丸等は読取性能を損なう可能性があるため、Primary QRの必須仕様に含めない。

Product Owner採用Prototypeは約292×292ptでquiet zoneを維持し、physical iPhoneで`PASS — 普通に読めた`を確認した。292ptは採用UI基準だが、未試験の全端末・全表示条件の読取性能を保証しない。

### 3.2 Secondary and later transports

- 共有ファイル / iOS共有シート：fallback候補
- 直接P2P：Later
- 複数QR：通常経路に使用しない

追加transportは同じ論理Formatを再利用し、QR固有表現と内部Match recordから分離する。

## 4. Logical Match Sharing Format v1

Formatは現在のlocal Match recordのJSON複製ではなく、共有に必要な試合事実だけを表す独立contractとする。

### 4.1 Required common data

- `formatVersion = 1`
- UUID v4 `sharedMatchId`
- game type
- started / ended date-time
- winner / result
- match condition
- Player A / Player Bの共有可能な表示情報
- scores、racks、innings
- breaks、fouls、scratches、safeties
- History、Match Detail、Player Detail、Statistics、Analyticsの再構成に必要なeventとsummary
- required game-specific data

### 4.2 Required game-specific preservation

- Rotation：score、rack / inning、得点event、競技固有状態
- 9-Ball：rack results、break、run-out判定に必要な情報
- 10-Ball：9-Ballとの差異、10-Ball固有rack / break情報
- JPA 9-Ball：SL、Race、score、Dead Ballを含む現行参照情報
- Straight Pool / 14-1：score、inning、通常減点と3-foul等の必要情報
- Three Cushion / 3C：score、inning、carom point等の必要情報

正確なadapter field mappingはImplementation Designで現行sourceとtestをSSOTとして固定する。競技固有情報を共通fieldへ推測変換してはならない。

### 4.3 Must transform

- source local Match IDは転送しない。Import時に新しいlocal Match IDを生成する。
- source local Player IDは転送しない。受信側の明示mapping結果へ変換する。
- `sharedMatchId`は変換せず維持する。

### 4.4 Must omit

- memo、reflection、playerReflections
- Player photo、avatar
- source local Player ID
- Category、Season
- Pro、IAP、entitlement
- device identifier
- Backup全体
- 他Match
- Demo管理情報
- 共有不要なUndo audit journal

Import先のlocal-only既定値をreceiverが設定することと、その値をpayloadへ含めることを混同しない。

## 5. Identity and duplicate rules

### 5.1 Shared identity

`sharedMatchId`はUUID v4でなければならない。export、encode、decode、Import後を通じて同一値を維持する。

### 5.2 Local identity

Importはreceiver側で新しいlocal Match IDを生成する。local Match IDと`sharedMatchId`は同一値または同一namespaceである必要はない。

### 5.3 Duplicate rejection

保存前に既存通常試合の`sharedMatchId`を検索する。一致がある場合、Player作成またはMatch保存を行わず拒否する。

ユーザー向け第一候補：`この試合はすでに取り込まれています。`

## 6. Player mapping

1. receiverはPlayer A / Player Bのどちらが自分かを選択する。
2. 選択sideをreceiverのlocal Playerへ明示mappingする。
3. 相手sideは既存local Playerを明示選択するか、Importフロー内で新規作成する。
4. 新規作成時は共有Player名を初期値として使用できる。
5. 名前一致だけで自動的に同一人物と判定しない。
6. mapping完了前にMatchを保存しない。
7. Self側にも`新しいプレーヤーとして追加`を提供し、ユーザーが明示選択した場合だけ作成Flowへ進む。共有名から自動作成しない。
8. 通常候補はreceiver-local avatar、Player名、必要時の`メイン`表示に限定し、メモ全文、最終使用日、内部local IDを常時表示しない。
9. Opponent Mapping headerは`対戦相手を選択`とする。同名local Playerが1人ならQuick候補にできるが自動選択しない。同名が複数ならQuick候補で決めつけず既存Player Pickerで確認する。
10. Selfで選択済みPlayerはOpponent候補で`自分として選択済み`としてdisabledにし、同一local PlayerをSelfとOpponentへmappingしてはならない。
11. `ほかのプレーヤーを選ぶ`は既存Player Pickerを再利用し、Match Sharing専用Pickerを新設しない。

## 7. Decode validation and integrity

保存処理より前に、次の順序で安全境界を成立させる。

1. prefixとCueScore payload識別
2. encoded payload size上限
3. Base45 decode
4. envelope / format version
5. integrity
6. bounded inflate
7. logical schema
8. UUID v4 `sharedMatchId`
9. supported game type
10. Player A / Player B
11. valid result
12. required common / game-specific data
13. duplicate `sharedMatchId`

未知formatVersionは推測変換しない。将来の互換adapterは対象versionを明示して別途設計する。

Prototypeで使用したSHA-256 digestは破損検出方式の正式候補とする。digest一致は送信者の本人性または悪意ある改変への暗号学的真正性を保証しない。v1で真正性保証を提供する場合は、別Decisionで署名、鍵、trust modelを定義する。

### 7.1 User-facing error direction

- unknown formatVersion：`この試合データを読み込むにはCueScoreの更新が必要です。`
- corrupted / invalid：`この試合データを読み込めませんでした。`
- non-CueScore QR：`CueScoreの試合共有コードではありません。`
- duplicate：`この試合はすでに取り込まれています。`

最終文言、accessibility announcement、error placementはUI Prototypeで確認する。

## 8. Import transaction

Importはall-or-nothingとする。

- validationとduplicate checkをすべて完了してからwrite phaseへ進む。
- Player新規作成とMatch保存を1つの論理transactionとして扱う。
- 全writeとread-back検証が成功した場合だけcommitする。
- 途中失敗、QuotaExceededError、検証不一致ではImport由来の変更を残さない。
- cancel時にPlayerまたはMatchのpartial stateを残さない。

localStorageの具体的snapshot、write順序、rollback、read-back照合はImplementation Designで現行Restore safety contractと競合しないよう設計する。

## 9. Imported record behavior

Import完了後の試合は通常試合と同じ読取経路を使用する。

- Match History
- Match Detail
- Player Detail
- Statistics
- Analytics

専用badge、専用一覧、共有元追跡UIを設けない。共有後の編集はreceiver local recordだけへ反映し、senderへ同期しない。

Importとread-backが成功した場合、receiverの通常Match Detailへ直接遷移し、現行CueScoreの淡緑success toast patternで`✓ 試合を取り込みました`を一時表示する。専用Success画面は追加しない。toast消失後は通常Match Detailと同じ表示とし、`共有`、`受信`、`Imported`、`QRから追加`等のimport由来badge、`sharedMatchId`、Import元を表示しない。通常Match Detailの`共有`actionは通常操作として維持できる。

### 9.1 Free / Pro record access

Match Sharing v1の送信・受信はFree / Pro共通機能とし、Pro badge、lock、paywall、entitlement gateを設けない。

現行`CueScoreRecordAccess`では、Freeの`FREE_LIMIT = 20`はstorage limitではない。保存済み全recordを日時の新しい順に安定sortし、先頭20件をHistory、基本統計、通常Match Detail等のeligible collectionとする。storage writeはunfiltered collectionへ行うため21件目以降も保存できる。

Import recordも通常Matchとして同じcontractに従う。ただし、共有元の試合日時が古く先頭20件外になる場合のImport直後Match Detail導線、Statistics／Analytics適用、success feedbackの順序はImplementation Designでsourceとtestを基に確定する。Match Sharingだけの特別なbypassまたはpaywallを本Specificationから推測して追加しない。

## 10. Demo separation

Demo modeではexport入口とimport入口の両方を拒否する。Demo fixtureをtechnical test inputとして使用することは、製品Demo Dataを共有可能にする許可ではない。

## 11. Backup and Restore

- BackupはImported matchの`sharedMatchId`を保持しなければならない。
- Restore後もduplicate rejectionが同じ`sharedMatchId`で機能しなければならない。
- 旧Backupの読込互換性を維持しなければならない。
- 既存Backup schemaへの追加方法、versioning、旧recordの`sharedMatchId`欠損時の扱いはImplementation Designで決定する。

## 12. Adopted Primary UI Prototype

Primary UI Prototypeは390×844を最低対象としてProduct Owner ReviewをPASSした。

1. Sender Entry：試合詳細header右上`QR glyph + 共有`。
2. Sender QR Display：header `試合を共有`、試合識別情報、約292×292ptの標準白黒Single QR、短い説明。
3. Receiver Entry：試合履歴一覧header右上`QR glyph + 受け取る`。件数行右側案は不採用。
4. Scanner：header `試合を受け取る`、camera preview、控えめなscan guide、短い説明。iOS標準permissionを使用する。
5. Match Preview / Side Selection：header `試合を確認`。試合情報と`あなたはどちらですか？`を統合し、Player A / Bを実名で選択する。未選択では`次へ` disabled、選択後enabled。タップ即遷移しない。
6. Self Mapping：共有名とlocal Playerを分離し、既存／新規を明示選択する。通常候補は簡素表示とする。
7. Opponent Mapping：header `対戦相手を選択`。同名1人はQuick候補、同名複数は既存Picker、Self選択済みPlayerはdisabled、新規追加を提供する。
8. Final Confirmation：header `取り込み内容を確認`、section `この端末での登録`。BackはOpponent Mappingへ戻り、項目別`編集`buttonは追加しない。新規予定は`＋`と`新しいプレーヤーとして追加`で表示し、`取り込むまでは試合とプレーヤーは保存されません`を表示する。
9. Import Success：通常Match Detailへ直接遷移し、`✓ 試合を取り込みました`を淡緑success toastで一時表示する。専用Success画面を追加しない。

次はImplementation Designで確定する：production scanner／camera decode、現行`NSCameraUsageDescription`へのQR用途反映、Dynamic Type、VoiceOver／focus、exact animation／haptics、permission denied production UI、new Player作成production flow、Free 20件境界の詳細動作、transaction／Backup統合、final implementation physical test。Prototype PASSを製品実装PASSへ拡張しない。

## 13. Verification evidence

| Area | Result |
|---|---:|
| 6 sports × Short / Medium / Long | 18 cases |
| ECC-M Single QR theoretical fit | 18/18 PASS |
| QR Version range | 18–30 |
| Physical iPhone QR test | V19 / V25 / V30, 3/3 PASS |
| Round-trip | 18/18 PASS |
| Parity checks | 162/162 PASS |
| History / Match Detail | 18/18 each |
| Player Detail / Statistics / Analytics | 18/18 each |
| Player mapping | 18/18 PASS |
| Sender local Player ID contamination | 0 |
| Negative tests | 10/10 PASS |
| Demo separation | PASS |
| Privacy prohibited-data contamination | 0 |
| Primary UI Prototype | Product Owner PASS |
| Sender QR 292pt physical iPhone | PASS |
| Free / Pro common availability | Product Owner ADOPTED |
| FAIL / BLOCKED | 0 / 0 |

Physical Evidenceは、試験済みのV19／V25／V30だけを支持する。未試験の全QR Version、全端末、全表示条件へ一般化しない。

## 14. Acceptance criteria for a future implementation

- 6競技の完了試合をRound-tripできる。
- Must Preserve factsと現行History / Detail / Statistics / Analyticsの結果が一致する。
- receiver視点のPlayer mappingが明示選択どおりになる。
- sender local IDsとMust Omit情報がpayloadへ混入しない。
- UUID v4 `sharedMatchId`を維持し、新local Match IDを生成する。
- duplicate、unknown version、truncated、corrupted、invalid game type、missing players、invalid result、malformed UUID、oversized payloadを保存前に拒否する。
- Demo export / importを拒否する。
- transaction失敗時にpartial Player / Matchを残さない。
- Backup / Restore後も`sharedMatchId`とduplicate protectionを維持する。
- UI PrototypeとProduct Owner ReviewをPASSする。
- Sender／Receiver入口、Scanner、side選択、Self／Opponent mapping、Final Confirmation、Import Successが本Specificationの採用UI contractと一致する。
- Match Sharing送受信をFree / Pro共通で利用でき、Pro gateを追加しない。

## 15. Evidence limitations

次は未確認であり、実装済みまたはPASSとして扱わない。

- Build 79 live user recordとpopulate済みcommon event journal
- production localStorage write / rollback
- Backup / Restore統合
- production UI実装、camera permission、scanner decode
- Dynamic Type、VoiceOver／focus、exact animation／haptics
- permission denied production UI、new Player creation production flow
- Free 20件境界におけるImport直後Detail／Statistics／Analyticsの詳細動作
- exact final payloadのphysical iPhone scan
- forward compatibility adapter
- sender authenticity

## 16. Implementation boundary

**Implementation NOT STARTED.**

本Specificationは製品source、保存schema、製品UI、Version、Build、配布、App Store状態を変更しない。Primary UI PrototypeはProduct Owner PASSだが、別のImplementation Decisionが発行されるまで製品実装へ進まない。
