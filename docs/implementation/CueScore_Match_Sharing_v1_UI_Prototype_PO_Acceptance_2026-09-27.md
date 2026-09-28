# CueScore Apps — Match Sharing v1 UI Prototype Product Owner Acceptance

- Date: 2026-09-27
- Gate: `MATCH SHARING v1 PRIMARY UI PROTOTYPE — PRODUCT OWNER PASS`
- Implementation: `NOT STARTED`
- Source baseline: `5038884374a5a3540ff92efef43597c5c28a863b`

## Conclusion

Formal Decision 101／Specification 102の後に実施した一画面単位のUI Prototype ReviewをProduct Ownerが完了し、Match Sharing v1のPrimary UI Flowを採用した。本EvidenceはDesign Decisionを追跡可能にするもので、製品実装、保存schema、Camera API、Info.plist、Build、配布を承認しない。

## Product Owner adopted UI

### Sender

- 試合詳細header右上：`QR glyph + 共有`
- visible label：`共有`
- accessibility label：`試合を共有`相当
- QR画面header：`試合を共有`
- 競技、日時、Player A / B、score / result、Race / target等の主要条件を表示
- 約292×292pt、標準白黒、quiet zone維持、logo・着色・角丸なし
- Product Owner physical iPhone：`PASS — 普通に読めた`

### Receiver Entry and Scanner

- 試合履歴一覧header右上：`QR glyph + 受け取る`
- 件数行右側案：不採用
- Scanner header：`試合を受け取る`
- 未要求：iOS標準Camera permission後にScanner
- 許可済み：Scannerへ直接
- 拒否済み：再要求ループを行わずSettings recovery
- CueScore独自permission tutorial：通常Flowへ追加しない

### Match Preview and side selection

- header：`試合を確認`
- 試合内容と`あなたはどちらですか？`を1画面へ統合
- Player A / Bを実名表示
- 未選択：`次へ` disabled
- 選択済み：選択状態を明示し`次へ` enabled
- 名前タップだけで即遷移しない

### Self Player Mapping

- 共有名とreceiver local Playerを分離して明示mapping
- 自分側にも`新しいプレーヤーとして追加`
- 共有名から自動作成しない
- 通常候補はlocal avatar、Player名、必要時の`メイン`表示
- メモ全文／最終使用日は通常表示しない

### Opponent Player Mapping

- header：`対戦相手を選択`
- 同名local Playerが1人ならQuick候補、ただし自動選択しない
- Self選択済みPlayerは`自分として選択済み`としてdisabled
- Self／Opponentへ同一local Playerをmappingしない
- 同名複数時は既存Player Pickerで確認
- `ほかのプレーヤーを選ぶ`と`新しいプレーヤーとして追加`を提供
- Match Sharing専用Pickerは新設しない

### Final Import Confirmation

- header：`取り込み内容を確認`
- section：`この端末での登録`
- Back：直前のOpponent Mapping
- 項目別`編集`button：追加しない
- 新規Player予定：`＋`と`新しいプレーヤーとして追加`
- 説明：`取り込むまでは試合とプレーヤーは保存されません`
- Primary action：`試合を取り込む`
- 押下前はMatch／新規Player保存、History変更なし

### Import Success

- transaction／read-back成功後に通常Match Detailへ直接遷移
- 文言：`✓ 試合を取り込みました`
- 現行CueScoreの淡緑success toast pattern
- 専用Success画面なし
- toast消失後は通常Match Detailと同一
- Import由来badge、`sharedMatchId`、Import元表示なし

## Free / Pro Decision

Product OwnerはMatch Sharing v1をFree / Pro共通機能として採用した。送信／受信へPro badge、lock、paywall、entitlement gateを設けない。受信Matchは通常Matchとして扱う。

## Free 20-record source evidence

- `record-access-v1.js`の`FREE_LIMIT`は20。
- `getEligibleRecords`はProで全件、Freeで保存済みcollectionを新しい順に安定sortして先頭20件を返す。
- `hasHiddenRecords`はFreeかつ保存済み件数が20件を超える場合にtrue。
- Official 98は「Free newest-20 history and details」「storage writes always use the unfiltered collection」を正式contractとしている。
- History、Player record集計、通常Match Detailは`getEligibleRecords`を使用する。
- したがって20件はstorage上限ではなくaccess／view limitで、21件目以降も保存可能。

未確定：共有元日時が古くImport recordが先頭20件外になる場合のImport直後Detail導線、Statistics／Analytics適用、success feedback順序。Implementation Designで現行contractを変更せず通常Matchと同じ扱いにできるかをfocused testで確定する。

## NOT VERIFIED

- production scanner／camera decode
- actual Dynamic Type
- VoiceOver／focus
- exact animation／haptics
- permission denied production UI
- `NSCameraUsageDescription`のMatch Sharing QR用途文言
- new Player creation production flow
- production localStorage transaction／rollback／read-back
- Backup／Restore統合
- Free 20件境界の詳細動作
- final implementation physical device test

## Boundary

- Product source変更：0件
- Match Sharing実装：未着手
- Info.plist／schema／Backup／Free-Pro gate変更：0件
- Version／Build／Archive／Upload／TestFlight／App Store Connect：未操作
- Commit／push：Product Owner / ChatGPT Final Review承認後、documentation-onlyでGitHub `main`へ正本化
