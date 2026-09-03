# CueScore Build 54 Readable Trends

Date: 2026-09-03

## 改善内容

- Build 53で復元した従来の専用推移画面と累積集計contractを維持。
- graph cardをcompact化し、一画面で次のcardも把握しやすい高さへ調整。
- 各cardの右上に最新累積値を大きく表示。
- X軸日付を`M/D`へ短縮し、同日複数試合は`①`、`②`等で区別。
- plot左右marginを均等に広げ、最初／最後の日付とpointの端切れを防止。
- pointをtapすると日付と値をcard下部へ表示。
- 推移専用画面の表示中はBottom Navigationを非表示にして表示領域を確保。
- percent指標は0〜100%／25%刻みを維持し、その他は実data範囲に追従。
- ファール率／ファール平均は削除状態を維持。
- cache version `2.0-build54-readable-trends`、iOS Build 54。

## 検証・配布

- 全Node回帰test: `356 pass / 0 fail / 0 skipped`
- native web生成、Capacitor iOS同期、署名付きRelease Archive、IPA export成功。
- source/archive commit: `cc6fb58`
- Delivery / Build ID: `f1f4b399-4468-4730-9308-46ce4a6e6b43`
- Apple processing / import: `VALID`
- `usesNonExemptEncryption=false`
- Internal group `CueScore Internal Testers`は全Build自動アクセスで、Build 54の配布対象化をAPIで確認。
- External TestFlight、App Review、審査用build追加、一般公開は行わない。
