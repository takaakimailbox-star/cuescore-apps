# CueScore Apps — App Review Notes v1.0 Official

## Purpose

この文書は、App Store Connect の App Review Notes 欄へ転記するための正式テンプレートです。提出する実ビルドで機能確認が完了した後に使用します。

## Review Notes（提出用）

CueScore Apps is a billiards match scoring, history, player management, and analytics app.

The app is designed for iPhone use and provides match workflows for multiple billiards disciplines.

Key review points:
- No CueScore account or sign-in is required for Version 1.0.
- Core match entry and history viewing are intended to work offline.
- User-created data is stored locally on the device in Version 1.0.
- Automatic cloud sync is not included in Version 1.0.
- CSV import/export is not included in Version 1.0.
- Player photos are optional and are used only for player identification within the app.
- Version 1.0 includes user-initiated backup and restore.

Supported release scope:
- Rotation
- 9 Ball
- 10 Ball
- JPA 9 Ball
- Straight Pool (14.1)
- Three Cushion (3C)

Suggested review path:
1. Launch CueScore Apps.
2. Open “プレーヤー” (Players) from the top navigation and register two players.
3. Return to “ホーム” (Home), select a discipline, and start a match.
4. Complete the match and confirm the saved result in “履歴” (History).
5. Open a player from “プレーヤー” to review that player's match statistics.
6. Open “設定” (Settings) and select “バックアップ” to review the user-initiated backup flow.

No paid subscription or external purchase is required to review the Version 1.0 core experience.

Public pages and support contact:
- Privacy Policy: https://takaakimailbox-star.github.io/cuescore-apps/privacy.html
- Terms of Use: https://takaakimailbox-star.github.io/cuescore-apps/terms.html
- Support: https://takaakimailbox-star.github.io/cuescore-apps/support.html
- Support email: cuescore.apps@gmail.com
- Contact method: Email. No contact form is provided in Version 1.0.

## Build 21 RCで確認済みの実装状態

- 6競技、バックアップ／復元、プレーヤー写真、オフライン利用経路はBuild 21に実装済み。
- App Store公開UIではサンプルデータ導線を表示しない。
- Build 21は実機iPhoneで主要導線および6競技の完走確認済み。

## 提出前確認

Build 21で確認済みの項目を反映する。

- [x] App Review担当者がアクセスできる正確なメニュー名称
- [x] App Store公開UIにサンプルデータ導線が表示されない
- [x] バックアップ／復元が提出ビルドで動作する
- [x] プレーヤー写真が提出ビルドで動作する
- [x] オフライン動作を提出ビルドの実機で確認済み
- [x] 6競技すべてを提出ビルドで完走確認済み
- [x] 提出ビルドでログインが不要である
- [x] 提出ビルドに課金機能がない
- [x] 提出ビルドとPrivacy Policy／Terms of Use／Support／Review Notesが最終一致する
- [ ] App Review連絡担当者の氏名・メール・電話番号をApp Store Connectに入力

## App Store Connect設定

- Sign-in required: `No`
- Release option: `Manually release this version`
- Review Notes: 上記「Review Notes（提出用）」本文を転記
