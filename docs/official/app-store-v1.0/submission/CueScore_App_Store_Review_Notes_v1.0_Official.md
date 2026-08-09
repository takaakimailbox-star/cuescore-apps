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
- Official Demo Data is available for reviewing the app without changing the user's normal data.

Supported release scope:
- Rotation
- 9 Ball
- 10 Ball
- JPA 9 Ball
- Straight Pool (14.1)
- Three Cushion (3C)

Suggested review path:
1. Launch CueScore Apps.
2. Open Sample Data from Settings and select “View Sample” to enter the isolated Official Demo Data area.
3. Review Players, History, and Analytics.
4. Start a new match and proceed through match entry.
5. Complete the match and confirm the saved result appears in History and Analytics.

No paid subscription or external purchase is required to review the Version 1.0 core experience.

## 提出前確認

以下は実ビルド確認後に必ず更新すること。

- [ ] App Review担当者がアクセスできる正確なメニュー名称
- [x] Official Demo Data を本番ビルドに収録する
- [ ] バックアップ／復元が提出ビルドで完成している
- [ ] プレーヤー写真が提出ビルドで完成している
- [ ] オフライン動作を実機確認済み
- [ ] 6競技すべてを提出ビルドで完走確認済み
- [ ] ログインが本当に不要
- [ ] 課金仕様が説明と一致
- [ ] App Review連絡担当者の氏名・メール・電話番号をApp Store Connectに入力
