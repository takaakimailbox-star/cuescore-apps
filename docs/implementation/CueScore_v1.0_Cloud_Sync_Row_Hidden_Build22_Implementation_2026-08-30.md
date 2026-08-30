# CueScore v1.0 Cloud Sync Row Hidden / Build 22 Implementation

- Date: 2026-08-30
- Version: 1.0
- Build: 22
- Status: implementation / automated verification / Archive / normal App Store Connect upload / Version 1.0 attachment PASS; stopped immediately before Add for Review

## Change

設定画面のクラウド同期buttonには既に`hidden`が付いていたが、`.settings-data-row-v1 { display:grid; }`がブラウザ標準のhidden表示規則を上書きしていた。`.settings-data-row-v1[hidden] { display:none; }`を追加し、v1.0で利用不能な行を確実に非表示にした。

この修正以外のUI、機能、scoring、saved-data schema、Backup／Restore、analytics、Navigation Architectureは変更していない。PWA cache versionをBuild 22用に更新し、Marketing Version 1.0のままBuild Numberを22へ更新した。

## Verification

- 全自動テスト: `276 pass / 0 fail / 0 skipped`
- 390×844: viewport／document／body幅390px、クラウド同期`display:none`・表示領域なし、バックアップ／復元／削除表示、横overflowなし、console error 0
- native asset: source／native-web／Xcode copied `index.html` SHA-256一致
- iOS Simulator Debug: `BUILD SUCCEEDED`
- iOS Simulator Release: `BUILD SUCCEEDED`
- Signed Release Archive: `ARCHIVE SUCCEEDED`
- Xcode Organizer distribution method: `App Store Connect`（`TestFlight Internal Only`ではない）
- Upload result: `App 1.0 (22) uploaded`（2026-08-30 17:10 JST）
- Apple processing: complete
- Export compliance: existing formal answer saved
- App Store version: Build 22 linked to Version 1.0 and saved with the prepared metadata and screenshots
- TestFlight: `提出準備完了`; internal group `CueScore Internal Testers`（招待1名）を確認
- Submission boundary: 「審査用に追加」が有効な状態で停止し、buttonは押していない

## Remaining gate

実iPhoneでBuild 22を最終確認する。公開判断後にProduct Ownerが「審査用に追加」を押してApp Store Reviewへ進める。現時点ではReview提出も一般公開も行っていない。
