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
- Sample Data is available for reviewing the app without changing the user's normal data. It is internally managed as Official Demo Data and remains isolated from normal user data.

Supported release scope:
- Rotation
- 9 Ball
- 10 Ball
- JPA 9 Ball
- Straight Pool (14.1)
- Three Cushion (3C)

Suggested review path:
1. Launch CueScore Apps.
2. Open “サンプルデータ” (Sample Data) from Settings and select “サンプルを見る” (View Sample) to enter the isolated sample area.
3. Review Players, History, and Analytics.
4. Start a new match and proceed through match entry.
5. Complete the match and confirm the saved result appears in History and Analytics.

No paid subscription or external purchase is required to review the Version 1.0 core experience.

Public pages and support contact:
- Privacy Policy: https://takaakimailbox-star.github.io/cuescore-apps/privacy.html
- Terms of Use: https://takaakimailbox-star.github.io/cuescore-apps/terms.html
- Support: https://takaakimailbox-star.github.io/cuescore-apps/support.html
- Support email: cuescore.apps@gmail.com
- Contact method: Email. No contact form is provided in Version 1.0.

## Final RC / PWAで確認済みの実装状態

- 6競技、サンプルデータ、バックアップ／復元、プレーヤー写真、オフライン利用経路はFinal RCに実装済み。
- サンプルデータは通常ユーザーデータと分離する仕様・実装になっている。
- これはPWA Final RCの実装状態であり、App Storeへ提出する実ビルドでの確認完了を意味しない。

## 提出前確認

以下は実際のApp Store提出ビルドで確認後に更新すること。現時点では未確認のため、完了扱いにしない。

- [ ] App Review担当者がアクセスできる正確なメニュー名称
- [ ] サンプルデータが提出ビルドに収録され、通常ユーザーデータと分離されている
- [ ] バックアップ／復元が提出ビルドで動作する
- [ ] プレーヤー写真が提出ビルドで動作する
- [ ] オフライン動作を提出ビルドの実機で確認済み
- [ ] 6競技すべてを提出ビルドで完走確認済み
- [ ] 提出ビルドでログインが不要である
- [ ] 提出ビルドの課金仕様が説明と一致する
- [ ] 提出ビルドとPrivacy Policy／Terms of Use／Support／Review Notesが最終一致する
- [ ] App Review連絡担当者の氏名・メール・電話番号をApp Store Connectに入力
