# CueScore Apps Current State

Updated: 2026-08-09  
Status: Living operational reference

## Purpose and Authority

ChatGPTとCodexで共有する現在状態の参照ファイル。Official Releaseを置き換えず、最新の実装状態、採用判断、延期項目を記録する。

1. `docs/official/` のOfficial Releaseが正式仕様。
2. Official Design Decision Logの最新適用判断を優先。
3. 本ファイルは運用上の現在状態であり、正式仕様を新規作成しない。
4. 正式資料と矛盾した場合は推測せずProduct Ownerへ確認する。

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
- Official Demo Dataは通常ユーザーデータと分離された開発・デモ用機能として扱う。
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

- Privacy Policy URL、Support URL、公開用連絡先
- App Review担当者の氏名・メール・電話番号
- Privacy Policy / Support / Terms of Useの正式URL採用
- 提出ビルドとPrivacy Policy / Review Notesの最終一致

## Active Decisions

- GitHub上の正式資料と本ファイルをChatGPT/Codexの共通参照に使う。
- v1.0ではバックアップ/復元とプレーヤー写真を採用する。
- v1.0ではCSVと自動クラウド同期をLaterとして扱う。
- App Store v1.0 release profileはCSV・クラウド同期を無効化し、関連UIを表示しない。
- Official Demo Dataは提出ビルドに収録し、通常データとの完全分離を維持する。
- Official Demo Dataの本番向け表示は「サンプルデータ」を採用し、状態を「通常データ／サンプルデータ」、操作を「準備する／サンプルを見る／通常データへ戻る／初期状態に戻す／削除」とする。

## v1.0 RC Verification

- 回帰テスト計画: `docs/implementation/CueScore_App_Store_v1.0_RC_Regression_Test_Plan_2026-08-09.md`
- Service Workerの現行2.0系版番号にテスト期待値を統一。
- 自動テスト14件の全成功をRC整合変更の必須条件とする。
