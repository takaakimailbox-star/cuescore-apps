# CueScore Apps Current State

Updated: 2026-08-10
Status: Living operational reference

## Purpose and Authority

ChatGPTとCodexで共有する現在状態の参照ファイル。Official Releaseを置き換えず、最新の実装状態、採用判断、延期項目を記録する。

1. `docs/official/` のOfficial Releaseが正式仕様。
2. Official Design Decision Logの最新適用判断を優先。
3. 本ファイルは運用上の現在状態であり、正式仕様を新規作成しない。
4. 正式資料と矛盾した場合は推測せずProduct Ownerへ確認する。

## App Store v1.0 RC：Game Result競技別統計2指標（2026年8月10日）

- Product Owner採用済み仕様として、Game Resultのプレーヤーカード下部2指標を競技別に切り替える。
- 9 Ball・10 Ball：シュート率／マス割。マス割は既存のブレイクランアウト成立回数を使用。
- Rotation：ハイラン／シュート率。
- JPA 9 Ball：アベレージ（総得点 ÷ 自分の総イニング数。0点で終了したイニングを含む）／ハイラン。
- Straight Pool（14.1）：アベレージ（総得点 ÷ イニング数）／ハイラン。
- Three Cushion（3C）：アベレージ（総得点 ÷ イニング数）／ハイラン。
- レイアウト、カード寸法、色、余白は変更せず、表示ラベルと計算式のみ切り替える。
- 試合終了時は結果を先に保存してGame Resultを表示する。Game Resultから「試合へ戻る」場合のみ、その保存済み結果を取り消して試合進行の再編集へ戻す。
- Undo反映後のイベントログから完了手番を再計算し、既存データ形式を変更しない。
- 本決定はGame Result表示に対する仕様であり、プレーヤー詳細のJPA 9 Ball「平均イニング」未確定事項は変更しない。
- 正式仕様：`docs/official/08_CueScore_v1.0RC_GameResult_Statistics_Spec.docx`。

## App Store v1.0 RC：競技別プレーヤー統計4指標（2026年8月9日）

- Product Owner採用済み仕様として、プレーヤー詳細の4カードを競技タブ別に切り替える実装へ更新。
- Rotation：試合数／ハイラン／シュート成功率／ブレイクイン率。
- 9 Ball・10 Ball：試合数／マス割率／シュート成功率／ブレイクイン率。
- JPA 9 Ball：試合数／シュート成功率／ブレイクイン率／平均イニング。
- Straight Pool（14.1）：試合数／ハイラン／シュート成功率／平均得点/イニング。
- Three Cushion（3C）：試合数／ハイラン／平均得点/イニング／おすすめ持ち点。
- ブレイクイン率は、自分のブレイクのうち「1球以上入球かつファールなし」の割合。スクラッチ、その他ファール、イリーガル、ブレイク失敗は入球があっても失敗として集計。
- 9 Ball／10 Ballのマス割率は、既存のブレイクランアウト判定による成立ラック数 ÷ 対象完了ラック数。既存判定ロジックは変更していない。
- 14.1／3Cの平均得点/イニングは、保存済み対象試合の総得点 ÷ 完了イニング総数。
- JPA 9 Ball平均イニングは正式な分母定義が未確定のため、推測せず「—」表示。
- 3Cおすすめ持ち点はNBA、JPBF、UMB等の公開原典から標準アベレージ対応表の具体値を確認できていないため、推測せず「—」表示。
- 新規保存項目・データ移行なし。既存試合とサンプルデータから表示時に再計算し、通常データとの分離や保存仕様は変更していない。
- 正式決定記録：`docs/official/07_CueScore_Official_Design_Decision_Log_v1.1_Official_Release.docx` Decision 017。

## Repository Baseline

- Repository: `takaakimailbox-star/cuescore-apps`
- Default branch: `main`
- Official index: `docs/README.md`
- App Store v1.0 package: `docs/official/app-store-v1.0/`
- Implementation reports: `docs/implementation/`

## Current Product Direction

- 新機能追加より、安定した公開可能版の完成を優先。
- iPhone縦画面、Safari/Home Screen PWA体験を維持。
- 保存データ互換、バックアップ/復元、オフライン、更新動作を壊さない。

## Current Implementation State

- CueScore AppsはiPhone縦画面向けPWAとして実装されている。
- Official Demo Dataは製品上「サンプルデータ」と表示し、通常ユーザーデータと完全分離して扱う。v3.0は登録済み10プレーヤー、全6競技、2025年4月〜2026年7月の500試合・16,000件超の詳細イベントで再構築済み。
- バックアップ/復元およびプレーヤー写真の実装経路を現行コードで確認済み。
- CSV出力およびクラウド同期関連コードは将来再利用のため残しているが、App Store v1.0 release profileでは非提供。
- ネイティブiOSプロジェクトおよびApp Store本審査提出は開始していない。

## App Store v1.0公開準備

- 2026-08-09付の公式Markdown一式を `docs/official/app-store-v1.0/` に登録。
- 公開文書とApp Store提出資料を分離して管理。
- Privacy Policy / Terms of Use / Support の公開用HTML入口を用意。
- URL、公開用連絡先、App Review連絡先は未確定のため未記入。
- 整合確認結果を `docs/implementation/CueScore_App_Store_v1.0_Consistency_Review_2026-08-09.md` に記録。
- 現段階は公式文書のGitHub反映と整合確認まで。ネイティブ化、TestFlight、App Store Connect登録、本審査提出には未着手。

## v1.0 Release Scope

- 6競技
- プレーヤー管理、メインプレーヤー、アバター／写真
- 試合進行、ブレイク入力、Undo
- 試合履歴、統計・分析、Official Demo Data
- オフライン利用、バックアップ／復元

## Deferred / Later

- CSV入出力
- 自動クラウド同期

## 要確認事項

- 公開用連絡先
- App Review担当者の氏名・メール・電話番号
- App Store提出時に使用する公開URL候補の最終採用
- 提出ビルドとPrivacy Policy / Review Notesの最終一致

## Active Decisions

- GitHub上の正式資料と本ファイルをChatGPT/Codexの共通参照に使う。
- v1.0ではバックアップ/復元とプレーヤー写真を採用する。
- v1.0ではCSVと自動クラウド同期をLaterとして扱う。
- App Store v1.0 release profileはCSV・クラウド同期を無効化し、関連UIを表示しない。
- Official Demo Dataは提出ビルドに収録し、通常データとの完全分離を維持する。
- Official Demo Dataの本番向け表示は「サンプルデータ」を採用し、状態を「通常データ／サンプルデータ」、操作を「準備する／サンプルを見る／通常データへ戻る／初期状態に戻す／削除」とする。

## App Store Public URL Candidates

- Privacy Policy: https://takaakimailbox-star.github.io/cuescore-apps/privacy.html
- Support: https://takaakimailbox-star.github.io/cuescore-apps/support.html
- Terms of Use: https://takaakimailbox-star.github.io/cuescore-apps/terms.html
- 2026-08-09にGitHub Pages上の外部表示、Official本文読み込み、3ページ間リンクを確認済み。
- 正式URL候補として管理する。Supportページの公開用連絡先確定後にApp Store提出用として最終採用する。

## v1.0 RC Verification

- 回帰テスト計画: `docs/implementation/CueScore_App_Store_v1.0_RC_Regression_Test_Plan_2026-08-09.md`
- Service Workerの現行2.0系版番号にテスト期待値を統一。
- 自動テスト14件の全成功をRC整合変更の必須条件とする。

## サンプルデータ v3.0（2026年8月9日）

- 旧サンプル試合を使用せず、安定したPlayer IDを持つ登録済み10プレーヤーだけで決定論的に再生成する。
- 本番収録は500試合。競技内訳は9 Ball 104、10 Ball 88、Rotation 101、JPA 9 Ball 74、Straight Pool 76、Three Cushion 57。
- 期間は2025年4月2日〜2026年7月27日。月ごとの件数、調子、強さ、得意競技、対戦頻度を均一化しない。
- 入球、ミス、手番交代、ブレイク、スクラッチ、ブレイクファール、セーフティ、ファール、ラック結果、マス割り、得点、イニング、勝敗、Undo利用済み最終状態を詳細イベントまたは既存保存項目で保持。
- 詳細イベントを維持した1,000試合は約6.10 MiBとなりlocalStorage安全域を超えるため、収録しない。性能ベンチマーク専用として生成・集計・JSON直列化／復元を検証する。
- 500試合は約3.14 MiB。通常データとの完全分離、初期化時の決定論的復元、存在しないPlayer ID参照なしを自動テストで固定。

## セーフティ成功率（Decision 018）

- 正式定義：セーフティ実行者の直後に行う相手の次手番で、有効な入球が1球も成立しなければ成功。
- 相手のミス、セーフティ返し、ファール、ファールしながらの入球は成功。有効入球が1球以上成立した場合のみ失敗。
- 成功率 ＝ 成功したセーフティ数 ÷ セーフティ実行数 × 100。
- 現行詳細記録の `safety`、相手の次手番イベント、`safety_result` で追跡可能。新しい保存項目は追加しない。根拠がない過去データは推測しない。
- サンプルデータは成功・失敗の双方と判定根拠をイベント順に保持。
- 正式決定記録：`docs/official/07_CueScore_Official_Design_Decision_Log_v1.2_Official_Release.docx` Decision 018。
