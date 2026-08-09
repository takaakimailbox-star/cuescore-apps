# CueScore Apps Current State

Updated: 2026-08-09  
Status: Living operational reference

## Purpose and Authority

ChatGPTとCodexで共有する現在状態の参照ファイル。Official Releaseを置き換えず、最新の実装状態、採用判断、延期項目を記録する。

1. `docs/official/` のOfficial Releaseが正式仕様。
2. Official Design Decision Logの最新適用判断を優先。
3. 本ファイルは運用上の現在状態であり、正式仕様を新規作成しない。
4. 正式資料と矛盾した場合は推測せずProduct Ownerへ確認する。

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
- Official Demo Dataは製品上「サンプルデータ」と表示し、通常ユーザーデータと完全分離して扱う。
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
