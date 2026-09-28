# CueScore Apps — Match Sharing v1 Design Decision

**Status:** Adopted / Design and Technical Feasibility Complete / Formal Specification Complete / Primary UI Prototype Product Owner PASS / Implementation NOT STARTED

**Decision date:** 2026-09-27

**Authority:** Product Owner adopted decision
**Scope:** CueScore Apps Match Sharing v1

## Decision

CueScore Appsは、完了・確定済みの1試合を相手のCueScoreへ1回受け渡すMatch Sharing v1を正式設計する。Match Sharingは同期機能ではない。共有後の両端末の試合は独立し、以後の編集を同期しない。アカウントまたはクラウド同期を必須にしない。

本DecisionはDesignおよびTechnical Feasibilityの完了を記録する。製品実装の開始は承認しない。

## Relationship to Decision 12

`12_CueScore_Later_Match_Sharing_Decision.md`は、Match SharingをLater / Deferredとして正式登録した履歴として維持する。本Decisionは、Decision 12で実装前に確定が必要とされた転送方式、Player mapping、重複防止、共有後の独立性、安定識別子、互換性、Demo分離、確認フロー、安全な拒否、privacy範囲を後続確定する。

Decision 12を削除または上書きしない。Formal Specificationの完了をImplementation承認と解釈しない。

## Primary transport

Match Sharing v1のPrimary transportとして、ECC-MのSingle QRを採用する。

- Secondary / fallback候補：共有ファイル、iOS共有シート
- Later：直接P2P
- 通常経路に採用しない：複数QR

共有ファイル方式を将来追加する場合も、可能な限り同じ論理Match Sharing Formatを再利用する。

## Sender navigation

送信入口は試合詳細ページとする。

`試合詳細 → 試合を共有 → 対象1試合のSingle QR表示`

共有対象は、完了・確定済みの表示中1試合だけとする。Product Owner UI Reviewにより、試合詳細header右上の`QR glyph + 共有`を採用した。visible labelは`共有`、accessibility labelは`試合を共有`相当とする。

遷移先headerは`試合を共有`とし、競技、日時、Player A / B、score / result、Race / target等の主要条件、短い読取説明、Single QRを表示する。QRは標準白黒、quiet zone維持、logo・着色・角丸なしとする。Prototypeの約292×292pt表示はProduct Owner physical iPhoneで`PASS — 普通に読めた`を確認した。この結果を未試験の全端末・全表示条件へ一般化しない。

## Receiver navigation

受信入口は試合履歴一覧ページとする。

`試合履歴一覧 → 試合を受け取る → QR読み取り → payload検証 → 試合内容確認 → あなたはどちらですか？ → 自分Player mapping → 相手Player mapping → 最終確認 → 試合を取り込む → 保存 → 通常の試合詳細`

Product Owner UI Reviewにより、試合履歴一覧header右上の`QR glyph + 受け取る`を採用した。visible labelは`受け取る`、accessibility labelは`試合を受け取る`相当とする。件数行右側へ置く案は、filter／Match cardとの混同と誤タップを避け、Senderとのheader action一貫性を保つため不採用とした。

## Primary UI Prototype decisions

Match Sharing v1 Primary UI PrototypeはProduct Owner ReviewをPASSした。製品実装の承認ではない。

- Scanner headerは`試合を受け取る`。未要求時はiOS標準Camera permission後にScannerへ進み、許可済みは直接Scanner、拒否済みは再要求ループを行わずSettings recoveryを示す。CueScore独自の事前permission tutorial画面を通常Flowへ追加しない。
- validation PASS後は`試合を確認`で試合内容と`あなたはどちらですか？`を1画面へ統合する。Player A / Bを実名表示し、未選択では`次へ` disabled、選択後は状態を明示して`次へ` enabledとする。名前タップだけで即遷移しない。
- Self Player Mappingは共有名とreceiver local Playerを分け、既存Playerまたは`新しいプレーヤーとして追加`をユーザーが明示選択する。名前一致や共有名からの自動mapping／自動作成を行わない。
- Opponent Player Mapping headerは`対戦相手を選択`。同名local Playerが1人ならQuick候補として提示するが自動選択しない。複数同名は既存Player Pickerで確認し、Selfで選択済みPlayerは`自分として選択済み`としてdisabledにする。同一local PlayerをSelf／Opponent両方へmappingしない。
- 最終確認headerは`取り込み内容を確認`、mapping sectionは`この端末での登録`とする。`取り込むまでは試合とプレーヤーは保存されません`を表示し、`試合を取り込む`押下前はMatch、Player、Historyを変更しない。
- Import transactionとread-back成功後は通常Match Detailへ直接遷移し、現行の淡緑success toast patternで`✓ 試合を取り込みました`を一時表示する。専用Success画面は追加しない。

## Player mapping

送信側local Player IDを共有しない。受信側は共有データ上のPlayer A / Player Bから自分側を明示選択する。

- 選択した自分側を受信端末のlocal Playerへmappingする。
- 相手側は既存Playerを明示選択するか、共有Player名を初期値としてImportフロー内で新規Playerを作成する。
- 自分側にも`新しいプレーヤーとして追加`を提供する。
- 名前だけで同一人物と自動判定しない。
- 未登録相手の作成にPlayer管理画面への離脱を必須としない。
- 通常候補表示はreceiver-local avatar、Player名、必要時の`メイン`表示に限定し、メモ全文や最終使用日を常時表示しない。
- 既存Player Pickerを再利用し、Match Sharing専用Pickerを新設しない。

## Match identity and duplicate prevention

共有単位の安定識別子としてUUID v4の`sharedMatchId`を採用する。

- `sharedMatchId`はlocal Match IDと分離する。
- Import先では新しいlocal Match IDを生成する。
- encode / decode / Import後も同じ`sharedMatchId`を維持する。
- 同一`sharedMatchId`が存在する場合は保存前にImportを拒否する。
- 通常UIへ`sharedMatchId`を表示しない。

重複時の案内は「この試合はすでに取り込まれています。」を第一候補とする。

## Imported match behavior

取り込んだ試合は通常試合として扱い、Match History、Match Detail、Player Detail、Statistics、Analyticsへ通常の1試合として反映する。

「共有」「受信」「Imported」「QRから追加」等のbadge、label、専用一覧、Import元表示は追加しない。通常Match Detailの`共有`actionは通常操作として維持できる。

## Free / Pro

Match Sharing v1はFree / Pro共通機能とする。送信・受信へPro badge、lock、paywall、entitlement gateを設けない。受信した試合は通常Matchとして既存Free / Pro record-access contractに従う。

現行sourceではFreeの20件はstorage上限ではなく、保存済み全recordを新しい順に安定sortした先頭20件のaccess／view policyである。storage writeはunfiltered collectionを使用するため21件目以降も保存可能である。ただし、古い日時のImport recordが先頭20件外になる場合のImport直後Detail導線、Statistics／Analytics適用、成功feedbackとの順序はImplementation Designで確定し、Match Sharingだけの特別扱いを推測で追加しない。

## Privacy and omitted data

Match Sharing payloadへ次を含めない。

- 個人メモ、reflection
- Player写真、avatar
- 送信側local Player ID
- Category、Season
- Pro、IAP情報
- device identifier
- Backup全体
- 他試合
- Demo管理情報
- 共有不要なUndo audit journal

CategoryとSeasonは受信側local contextで管理する。

## Demo separation

Official Demo DataではMatch Sharingを全面禁止する。

- Demo exportを許可しない。
- Demo importを許可しない。
- 通常データとの分離を維持する。

## Match Sharing Format v1

現行内部保存schemaを転送形式として直接使用しない。独立した`CueScore Match Sharing Format v1`を採用し、論理FormatとQR transport representationを分離する。

Primary pipelineは次とする。

`Match Sharing Format v1 → compact representation → deflate → Base45 → CSM1: prefix → ECC-M Single QR`

未知formatVersionを推測変換しない。破損検出のintegrityは必須とする。Prototypeで使用したSHA-256は正式仕様候補とし、破損検出であって送信者の真正性保証ではないことを明示する。

## Validation and transaction

保存前に、CueScore payload、formatVersion、integrity、sharedMatchId、game type、Player A / B、result、競技固有必須データ、payload size、duplicateを検証する。

Importは原子的に扱う。Player新規作成とMatch保存を含む全処理が成功した場合だけcommitし、途中失敗時はImportによる変更を残さない。現行localStorageにおける具体的transaction / rollback方式はImplementation Designでsource確認後に決定する。

## Backup and Restore

`sharedMatchId`はBackup / Restore後も保持し、二重取り込み防止を継続できなければならない。既存Backup schemaへの組込み方はImplementation前に互換性を確認して決定し、既存Backupを破壊しない。

## Evidence basis

- 6競技 × Short / Medium / Long：18ケース
- ECC-M Single QR theoretical fit：18/18 PASS
- QR Version範囲：18〜30
- Product Owner physical iPhone：V19 / V25 / V30、3/3 PASS
- Round-trip：18/18 PASS
- Parity：162/162 PASS
- History、Match Detail、Player Detail / Statistics、Analytics：各18/18 PASS
- Player mapping：18/18 PASS
- sender local Player ID混入：0
- Shared Match ID維持、new local Match ID、duplicate rejection：PASS
- Negative tests：10/10 PASS
- Demo separation：PASS
- privacy禁止データ混入：0
- Primary UI Prototype：Product Owner PASS
- Sender QR約292×292pt：Product Owner physical iPhone PASS
- Sender Entry、Receiver Entry、Scanner、Match Preview / Side Selection、Self Mapping、Opponent Mapping、Final Confirmation、Import Success：Product Owner ADOPTED
- Match Sharing Free / Pro共通：Product Owner ADOPTED
- FAIL：0、BLOCKED：0

EvidenceはOfficial Demo Data v3.1 fixturesと隔離prototypeを使用した。UI Prototype採用記録は`docs/implementation/CueScore_Match_Sharing_v1_UI_Prototype_PO_Acceptance_2026-09-27.md`を参照する。Build 79のlive user record、production localStorage transaction、Backup / Restore統合、production scanner／camera decode、Dynamic Type、VoiceOver／focus、permission denied production UI、new Player creation production flow、最終実装のphysical testは未確認であり、PASSへ拡張しない。

## Gate

**Design / Technical Feasibility Complete. Formal Specification Complete. Primary UI Prototype Product Owner PASS. Implementation NOT STARTED.**

今回のUI Prototype Decision同期は製品実装承認ではない。別のImplementation Decisionなしに製品実装、QR scanner実装、Camera API／Info.plist、schema、Backup、Free / Pro gate、Version、Build、配布へ進まない。
