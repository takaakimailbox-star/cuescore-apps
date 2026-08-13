# CueScore Apps v1.0 Final RC Step 6 Final Acceptance

検証日: 2026-08-13  
基準main: `554e137463279fb5041295a5840bbc5c331d6ddf`  
作業ブランチ: `codex/cuescore-step6-final-acceptance`

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

### Gate 6：通常データ／サンプルデータ分離 — PASS（Minor 1件）

- `demo-data.js`の専用キー解決、通常キーとの分離、10プレーヤー・6競技各20試合・合計120試合・3,523イベント、作成／初期化／削除経路を確認した。
- Settingsに「準備する」「サンプルを見る」「通常データへ戻る」「初期状態に戻す」「削除」が存在する。
- 名称上のMinorとして、内部名称`Official Demo Data`がSettingsカードの利用者向けテキストにも表示される。詳細は不具合一覧に記録する。

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

### Gate 14：公開前残存文字列監査 — PASS（Minor 1件）

- `TODO`、`FIXME`、`prototype`、`development`、`debug`、`temporary`、`RC`、`demo`、`Official Demo Data`、`Cloud Sync`、`CSV`、`公開前`、`未確定`をrepo全体検索した。
- TODO／公開前／未確定はテスト、CURRENT_STATE、過去Implementation Report、提出前に本当に未確定な事項。RC、prototype、development、temporaryは履歴資料、内部コメント、識別子。CSVとCloud SyncはLater説明、hidden／disabled UI、将来用コードであり一律削除対象ではない。
- 公開UI上の内部名称`Official Demo Data`だけをMinorとして記録した。

## 発見不具合

### FA-STEP6-001 — Settingsに内部名称が利用者向け表示される

- Severity: Minor
- 再現手順: Home → Settings → サンプルデータ。
- 期待結果: Step 6定義どおり製品表示は「サンプルデータ」、`Official Demo Data`は内部名称としてのみ扱う。
- 実際結果: セクション名・状態は「サンプルデータ」だが、カード見出し、作成確認文、データ削除説明に`Official Demo Data`が表示される。
- 影響範囲: Settingsの名称整合のみ。試合、保存、通常／サンプル分離、Backup / Restoreには影響しない。
- 推奨修正: Product Owner承認後の独立した軽微修正Stepで、利用者向け3箇所を「サンプルデータ」へ統一し、`aria-label`や内部識別子はアクセシビリティ要件とテストを確認して変更する。
- 保存互換への影響: なし。
- 修正リスク: 低。ただし既存の正式Regression Planのカード名記載とテスト期待値を同時に整合する必要がある。

## Severity集計

- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 1
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

`PWA Final Acceptance: CONDITIONAL PASS`

Blocker 0、Critical 0、Major 0、自動テスト全成功。残存は機能影響のない名称整合Minor 1件のみ。Step 6定義上、ネイティブ化を停止する条件には該当しない。

## ネイティブ化可否

Product OwnerがFA-STEP6-001を受容するか、別の軽微修正Stepとして扱うかを決定した後、ネイティブ化へ進行可能。実iPhone確認待ち項目をネイティブ／提出ビルドの確認完了とみなしてはならない。

## 変更範囲

- Final Acceptance Reportを追加。
- `docs/CURRENT_STATE.md`へ確定した受入れ結果だけを追記。
- アプリコード、競技ルール、保存schema、localStorage、PWA、Official Releaseは変更していない。
