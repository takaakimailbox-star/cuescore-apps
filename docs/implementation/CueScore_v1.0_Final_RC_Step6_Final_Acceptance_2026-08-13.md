# CueScore Apps v1.0 Final RC Step 6 Final Acceptance

検証日: 2026-08-13

基準main: `554e137463279fb5041295a5840bbc5c331d6ddf`

作業ブランチ: `codex/cuescore-step6-final-acceptance`

## FA-STEP6-001軽微修正後の再受入れ（2026-08-13）

- Product Ownerは初回`CONDITIONAL PASS`を承認したが、FA-STEP6-001は受容せず、ネイティブ化前の軽微修正を指示した。
- 独立ブランチ`codex/cuescore-step6-sample-data-label-fix`で、Settingsカード見出し・アクセシブル名・作成確認文・作成完了通知・データ削除説明の利用者向け表記を「サンプルデータ」へ統一した。
- 内部コメント、内部識別子、`demo-data.js`の保存キー／保存領域、変数名、技術資料上の内部名称`Official Demo Data`は変更していない。
- UI文言回帰テストを既存`demo-data.test.mjs`へ追加し、PWAキャッシュ版を`2.0-step6-sample-data-label-v1`へ同期した。
- 全自動テストは117件成功／失敗0／スキップ0。390 × 844pxブラウザでSettingsカード表示、データ削除説明、横スクロールなしを再確認し、作成確認文と作成完了通知はソースおよび回帰テストで確認した。
- 再受入れ集計はBlocker 0、Critical 0、Major 0、Minor 0、Cosmetic 0。FA-STEP6-001は解消済み。
- Step 6 Gate 1、6、9、10、13、14への回帰は確認されず、その他Gateに関係する競技・保存・データ処理は変更していない。
- Product Owner承認後の最終判定：`PWA Final Acceptance: PASS`。

## 検証環境

- macOSローカルワークツリー
- Node.js v24系、`node --test tests/*.test.mjs`
- Codex In-app Browser、viewport 390 × 844px
- Python localhost HTTP server
- Service Workerキャッシュ取得後にlocalhost serverを停止したオフライン模擬
- GitHub Pages公開URLへのHTTP HEAD確認

実iPhone、iOS Safari、Home Screen PWA、ネイティブiOS提出ビルド、TestFlight、App Store Connectは本検証環境に含まない。

## Acceptance Gate結果

### Gate 1：全自動テスト — PASS

- 117件成功／失敗0／スキップ0。
- QuotaExceeded／Rollback失敗の意図的な模擬ログを含むが、該当テストは期待どおり成功した。

### Gate 2：6競技 Core Flow — PASS（PWA Final RC証跡範囲）

- 9-Ballは390px幅ブラウザでPlayer選択、Race to 1-1、開始、ブレイク入力、9番勝利、Game Result、完了後Undo、再進行、保存、History、再読込、Analyticsまで確認した。早期9番の結果はマス割0でResultと整合した。
- Rotation、10-Ball、JPA 9-Ball、Straight Pool（14.1）、Three Cushion（3C）は、競技別自動テスト、共通Result / Detailテスト、Undoテスト、120試合サンプルデータ（各競技20試合）の生成・集計・表示互換証跡で確認した。
- 実iPhoneでの6競技一連完走は別途確認待ちであり、本報告では実機確認済みとしない。

### Gate 3：保存・再起動 — PASS（PWA）

- ブラウザで完了試合を保存し、ページ再読込後もHistoryに同一日時・スコアで残ることを確認した。Analyticsの最新試合にも同じ対戦・スコアが反映された。
- 進行中状態、Player、Avatar、写真、メインプレーヤー、Category / Seasonは現行localStorage保存経路とデータ領域解決関数を確認し、保存schema変更がないことを確認した。
- 実iPhoneでの強制終了／Home Screen再起動と写真保持は確認待ち。

### Gate 4：Undo安全性 — PASS

- 9-Ballは完了後に「試合へ戻る」からUndoし、0-1の完了状態が0-0・9番未入球へ戻り、再入力で再完了できることをブラウザ確認した。
- 6競技の共通Undo、3C、JPA、Break、Result保存取消は既存自動テストで確認した。保存schema変更なし。

### Gate 5：Backup / Restore Final Acceptance — PASS（自動・実装経路）

- Backup schema・ファイル名互換、Replace、Merge、重複抑止、不正JSON、形式不一致、QuotaExceeded、メモリスナップショット、書込み後再読込、Rollback、Rollback再検証を現行実装と自動テストで確認した。
- 実iPhoneのファイル保存／ファイル選択UIは確認待ち。

### Gate 6：通常データ／サンプルデータ分離 — PASS

- `demo-data.js`の専用キー解決、通常キーとの分離、10プレーヤー・6競技各20試合・合計120試合・3,523イベント、作成／初期化／削除経路を確認した。
- Settingsに「準備する」「サンプルを見る」「通常データへ戻る」「初期状態に戻す」「削除」が存在する。
- 初回監査で検出した名称上のMinorはFA-STEP6-001で解消済み。内部名称`Official Demo Data`は利用者向けテキストへ表示されない。

### Gate 7：Player Final Acceptance — PASS

- Player Library、検索、メインプレーヤー最上位、Player1選択済みdisabled、Player2選択、Avatar、写真、Player Detail、Analytics、削除後の履歴保持を既存自動テストとブラウザのPlayer2選択画面で確認した。
- 実iPhoneの写真選択は確認待ち。

### Gate 8：History / Detail / Analytics整合 — PASS

- ブラウザで保存した9-Ballの0-1、Race to 1-1、マス割0がResult、History、Analyticsで整合した。
- Race to X-Y、9-Ball / 10-Ballマス割、JPAマッチポイント、JPA Result / Detail Metrics、3C Metrics、Rotationハイラン、14.1アベレージは対応する自動テストで確認した。
- 表示時のrecord書換えを追加する変更はない。

### Gate 9：Offline / PWA — PASS（ブラウザ模擬）

- 初回キャッシュ後にlocalhost serverを停止し、Home、10-Ball New Match、120件のHistory、Supportを表示できた。Supportは`mailto:cuescore.apps@gmail.com`を保持し、390px幅で横スクロールなし。
- Service Workerテストでアプリシェル、Legal / Support、release profile、更新処理を確認した。
- 実iPhoneの機内モード／Home Screenオフライン起動は確認待ち。

### Gate 10：Settings — PASS

- Player、Backup / Restore、サンプルデータ、Terms、Privacyへの導線と戻る矢印を確認した。
- CSVとMatch Sharingの操作UIは露出しない。自動クラウド同期はdisabled・「未設定」で操作不能であり、利用可能な現行機能としては表示されない。自動通信を開始するrelease profileではない。

### Gate 11：Legal / Support — PASS

- Privacy、Terms、SupportはMarkdown生表示なし、公開前TODOなし、共通戻るUI、相互リンク、長文縦スクロール、390px幅の横スクロールなしを確認した。
- Supportメールと`mailto:cuescore.apps@gmail.com`を確認した。
- 公開3 URLはいずれも2026-08-13確認時にHTTP 200。

### Gate 12：公開表記・Later機能 — PASS

- CSV、自動クラウド同期、Match Sharingはv1.0非搭載／Later。CSVはrelease profileで無効・UI hidden、Match Sharingは実装導線なし、自動クラウド同期は操作不能。
- JSON Backup / Restoreはv1.0採用範囲として維持される。

### Gate 13：iPhone縦画面レイアウト — PASS（390pxブラウザ）

- Home、New Match、Player選択、9-Ball Game、Break、Game Result、History、Analytics、Settings、Privacy、Terms、Supportを390 × 844pxで確認した。
- 確認画面で横スクロール、主要ボタン欠け、閉じられないResult、Legal長文の横はみ出しは確認されなかった。
- safe-areaやSafari UIとの干渉は実iPhone確認待ち。

### Gate 14：公開前残存文字列監査 — PASS

- `TODO`、`FIXME`、`prototype`、`development`、`debug`、`temporary`、`RC`、`demo`、`Official Demo Data`、`Cloud Sync`、`CSV`、`公開前`、`未確定`をrepo全体検索した。
- TODO／公開前／未確定はテスト、CURRENT_STATE、過去Implementation Report、提出前に本当に未確定な事項。RC、prototype、development、temporaryは履歴資料、内部コメント、識別子。CSVとCloud SyncはLater説明、hidden／disabled UI、将来用コードであり一律削除対象ではない。
- 初回監査で公開UI上に確認した内部名称`Official Demo Data`はFA-STEP6-001で解消済み。内部コメント、技術資料、歴史資料の内部名称は意図どおり維持した。

## 発見不具合

### FA-STEP6-001 — Resolved

- 初回Severity: Minor
- 最終状態: Resolved
- 再現手順: Home → Settings → サンプルデータ。
- 期待結果: Step 6定義どおり製品表示は「サンプルデータ」、`Official Demo Data`は内部名称としてのみ扱う。
- 初回結果: セクション名・状態は「サンプルデータ」だが、カード見出し、作成確認文、データ削除説明に`Official Demo Data`が表示された。
- 修正後結果: カード見出し、アクセシブル名、作成確認文、作成完了通知、データ削除説明を「サンプルデータ」へ統一し、390 × 844pxで可視UIに`Official Demo Data`が残らないことを確認した。
- 影響範囲: Settingsの名称整合のみ。試合、保存、通常／サンプル分離、Backup / Restoreには影響しない。
- 実施修正: 独立した軽微修正Stepで利用者向け表記を統一し、内部識別子、保存領域、変数名、データschema、内部ロジック、技術資料上の内部名称は変更していない。
- 保存互換への影響: なし。
- 修正リスク: 低。ただし既存の正式Regression Planのカード名記載とテスト期待値を同時に整合する必要がある。

## Severity集計

- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Cosmetic: 0

## 実機確認待ち

- Home Screen PWA起動と再起動
- iOS Safari固有挙動
- safe-area周辺とiPhone縦画面全画面
- 6競技の実機一連完走と各競技Undo
- 進行中試合を終了して再起動した場合の復元
- プレーヤー写真の選択・変更・再起動後保持
- Backupファイル保存、Restoreファイル選択、Replace / Merge結果
- `mailto:`によるMail起動
- 機内モードでのオフライン起動・主要機能・Legal / Support
- 長時間試合
- 画面回転抑止

## Final Acceptance判定

`PWA Final Acceptance: PASS`

Blocker 0、Critical 0、Major 0、Minor 0、Cosmetic 0、自動テスト全成功。FA-STEP6-001は解消済みで、Step 6 Gate 1〜14を覆す回帰は確認されなかった。

## FA-IPHONE-001：進行中試合の再起動復元（2026年8月14日）

- iPhone Home Screen PWAで9-Ball進行中にアプリを完全終了すると、再起動後にHomeへ戻り、Player、Race、得点、手番、入力履歴を継続できない事象を実機確認した。
- 原因は、進行中状態とUndoスナップショットがJavaScriptメモリにしか存在せず、永続キー、保存処理、起動時復元処理がなかったこと。9-Ball固有ではなく6競技共通で、通常データ／サンプルデータ双方に影響した。
- Product Owner Decisionにより、進行中試合がある場合は再起動時に自動復帰する仕様と、完了試合recordおよびBackup JSONから独立した専用localStorageスナップショットをVersion 1.0へ追加することを承認した。
- `cueScore.inProgressMatch.v1`を通常データ用キーとし、サンプルデータ中は既存の設定キーresolverにより`cuescore-demo.settings.cueScore.inProgressMatch.v1`へ分離する。既存データ移行は行わない。
- Player、競技、Race／目標点／持ち点、得点、ラック、手番、ブレイク、イニング、ファール、入力履歴、競技固有状態、イベントログおよび直近50状態のUndoを、各確定操作後と`visibilitychange`／`pagehide`で同期保存する。
- 試合完了・履歴保存時、Homeへ戻る明示破棄時、ブレイク入力からの明示中断時に専用スナップショットを削除する。不正・完了済み・未知競技のスナップショットは復帰せず削除する。
- 9-Ballは異なるRace 2-3、Player名、ブレイク入力、入球、手番交代後にブラウザ再読込し、自動復帰後の表示・履歴一致とUndo成立を確認した。
- 6競技共通の保存対象、復元対象、競技allowlist、通常／サンプル分離、完了／破棄cleanupを自動テストで固定した。全自動テストは122件成功／失敗0／スキップ0。
- 完了試合record、Backup JSON、Player、History、Analyticsの保存形式、競技ルールは変更していない。Service Workerキャッシュ版のみ`2.0-fa-iphone-001-v1`へ同期した。
- Severity最終判定は修正前Critical、コード修正後Resolved候補。実iPhoneでの再確認前は実機PASSとしない。
- 現在状態：`FA-IPHONE-001: Code Fix Complete / iPhone Re-test Required`。

このため、実iPhone再確認が完了するまでPWA Final Acceptanceは再確認待ちとし、App Store提出、Release確定、ネイティブ化へ進まない。

### FA-IPHONE-001 UX更新：Homeカード方式（2026年8月14日）

- Product Ownerは起動直後の自動Game復帰を変更し、進行中スナップショットが存在してもHomeを表示する方式を採用した。
- Homeの6競技カードより上に「中断中の試合」カードを表示し、競技、Player 1／2、競技別条件、開始時刻と主操作「試合を再開」を提示する。復元はこの明示操作時だけ実行する。
- 中断中に6競技カードを選択した場合は、「中断中の試合を再開」「新しい試合を始める」「キャンセル」の3分岐を表示する。新規開始を明示選択した場合だけ現在データ領域の中断スナップショットを削除する。
- 既存`cueScore.inProgressMatch.v1`、schema version 1、直近50 Undo、通常／サンプル分離、検証・cleanup、完了試合record、Backup JSONを変更していない。既存FA-IPHONE-001スナップショットをそのまま利用する。
- 390×844pxブラウザで、再起動後Home維持、長いPlayer名を含む9-Ballカード、Race 2-3、横スクロールなし、再開後の状態一致、3分岐を確認した。全自動テストは125件成功／失敗0／スキップ0。
- 6競技のカード表記と再開経路、通常／サンプル領域分離は共通実装と回帰テストで確認した。実iPhone再確認前は実機PASSとしない。
- 現在状態：`In-progress Match UX: Home Card Implemented / iPhone Re-test Required`。

### FA-IPHONE-001 実機UX改善：コンパクト中断カード（2026年8月14日）

- Product OwnerはHome中断カード方式を維持し、大型の縦カードを高さを抑えたコンパクト横長カードへ変更することを採用した。
- 必須情報を3段へ整理し、大きな黒い再開ボタンを廃止した。カード全体がタップ／クリック／キーボード操作可能な再開操作で、右側に補助導線「再開 ›」を表示する。
- 長いPlayer名は視覚上ellipsisとし、カードのaccessible nameではPlayer 1／2の完全な名前、競技、条件、再開操作を提供する。競技アイコンは装飾扱いを維持する。
- 6競技の条件表記と新規試合開始時の3分岐は変更していない。`cueScore.inProgressMatch.v1`、サンプルデータ分離キー、schema version 1、直近50 Undo、復元・cleanup、完了試合record、Backup JSON、History、Analytics、競技ルールも変更していない。
- 390×844px相当のブラウザでカード寸法、横スクロールなし、長いPlayer名、カード全体からの再開、3分岐を再確認する。実iPhone再確認前は実機PASSとしない。
- 現在状態：`In-progress Match Compact Card: Implemented / iPhone Re-test Required`。

### FA-IPHONE-001 実機UX改善：2段コンパクトカード v2（2026年8月14日）

- Product Ownerは132pxの3段カードをさらに圧縮し、高さ約90〜100pxの2段構成を正式採用した。
- 1段目は「中断中の試合」・競技名・競技アイコン、2段目はPlayer 1／2・競技条件・開始時刻・補助導線「再開 ›」で構成する。
- Player名を優先的にellipsisし、競技条件・開始時刻・再開導線を固定表示する。accessible nameでは完全なPlayer名、競技名、条件、再開操作を保持する。
- カード全体のタップ／クリック／Enter／Spaceによる再開、新規試合時の3分岐を維持する。保存schema、復元、Undo、通常／サンプル分離、Backup JSON、競技ルールは変更していない。
- 390×844px相当でカード高、横スクロール、長いPlayer名、再開動作を確認する。実iPhone再確認前は実機PASSとしない。
- 現在状態：`In-progress Match Compact Card v2: Implemented / iPhone Re-test Required`。

### FA-IPHONE-002：再起動後カード消失修正／Compact Card v3（2026年8月14日）

- 実iPhone Home Screen PWAで、Homeに中断カードを表示して完全終了後、再起動するとカードが表示されない事象を確認した。
- 根本原因は`pagehide`／`visibilitychange`時の`persistInProgressMatchV1`が、Homeの非`pro-game-mode`状態を破棄条件として扱い、保存済みsnapshotを削除していたことだった。
- 終了、再起動、単なるHome表示ではsnapshotを保持する。試合完了、確認付き明示破棄、「新しい試合を始める」、不正snapshotの場合のみ削除し、`pageshow`時にカードを再描画する。
- 最終UIは高さ88pxの2段構成。上段は「中断中の試合」・競技アイコン・開始年月日時分、下段はPlayer 1／2・競技条件・「再開 ›」。競技名文字は省き、accessible nameには競技名と完全なPlayer名を保持する。
- 保存schema、キー、50 Undo、通常／サンプル分離、Backup JSON、完了試合record、History、Analytics、競技ルールは変更していない。
- Severityは修正前Critical候補、修正・回帰後の残存Blocker／Critical／Majorは0。現在状態：`FA-IPHONE-002: Code Fix Complete / Compact Card v3 Implemented / iPhone Re-test Required`。

### Compact Card v4 Avatar／FA-IPHONE-002実機PASS（2026年8月14日）

- Product Owner実機確認で、Home中断カード表示、PWA完全終了、Home Screen再起動、同一カード再表示、snapshot保持を確認した。`FA-IPHONE-002: Resolved / iPhone PASS`。
- 中断カードを高さ64pxの1列へ変更し、競技アイコン、Player 1 avatar＋名前、`vs`、Player 2 avatar＋名前、`再開 ›`を表示する。日時・競技条件はHomeカード上のみ非表示とした。
- 競技アイコンは34px・左端独立領域、Player avatarは24pxとし、薄い縦線とサイズ差で識別する。Player写真、preset、defaultは既存resolverを利用する。
- 名前のみ均等にellipsisし、accessible nameには競技名と完全な両Player名を保持する。保存schema・復元ロジック・Undo・通常／サンプル分離・3分岐・Backup JSON・競技ルールは変更していない。
- 現在状態：`Compact Card v4: Implemented / FA-IPHONE-002 iPhone PASS / iPhone UI Re-test Required`。
- Compact Card v4 micro adjustmentとして、競技アイコン右側dividerを削除し、Player 1／`vs`／Player 2を1つの対戦ブロックへ統合した。64px高、34px競技アイコン、24px avatar、右端「再開 ›」、保存・復元仕様は変更していない。

### Compact Card v4 Player Name初期描画／Matchup Flex補正（2026年8月14日）

- Player名は中断snapshotの`playerNames`を同期的に最優先してHome初回描画から表示する。空白または旧不完全snapshotの場合だけ、同じ同期処理内で登録Player名へfallbackする。後続タイマーやPlayer Library再描画への依存は追加していない。
- Player 1／`vs`／Player 2の対戦ブロックを均等3列Gridから内容幅ベースのcompact flexへ変更した。要素間は5px、両Player領域は同じ最大幅、名前はellipsisとし、両avatar・`vs`・右端「再開 ›」を常時表示する。
- カード高64px、競技アイコン34px、Player avatar 24px、dividerなし、カード全体からの再開、3分岐、50 Undo、通常／サンプル分離は維持した。保存schema、Backup JSON、完了試合record、History、Analytics、競技ルール、Official Releaseは変更していない。
- 状態：`Compact Card v4 Name Render Fix + Matchup Flex: Implemented / iPhone UI Re-test Required`。

## ネイティブ化可否

FA-IPHONE-001のコード修正は完了したが、実iPhone再確認が終わるまではネイティブ化へ進行しない。実iPhone確認待ち項目をネイティブ／提出ビルドの確認完了とみなしてはならない。

## 変更範囲

- Final Acceptance Reportを追加。
- `docs/CURRENT_STATE.md`へ確定した受入れ結果だけを追記。
- アプリコード、競技ルール、保存schema、localStorage、PWA、Official Releaseは変更していない。
