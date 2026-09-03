# CueScore Build 52 Player Hub Analysis Trend Restore

Date: 2026-09-03

## 実機報告と原因

- Build 51でも「プレーヤー情報 → 分析」に推移グラフが表示されずFAIL。
- Build 51は別screenのPlayer分析へ復元しており、実機で確認対象となるPlayer Hub内の「成績／試合／分析」タブにはグラフを追加していなかった。

## 修正

- Player Hub分析タブの描画SSOTである`navigation-phase2-6.js`へ推移グラフを直接追加。
- 直近10試合を古い順から描画し、勝率と競技別主要指標をselectorで切替可能にした。
- ファール率／ファール平均は主要指標、selector、グラフの全てで削除状態を維持。
- Build 51の起動スプラッシュ全面表示修正を維持。
- cache version `2.0-build52-player-hub-trend`、iOS build 52。

## 検証・配布

- 全Node回帰test: `355 pass / 0 fail / 0 skipped`
- native web生成、Capacitor iOS同期、署名付きRelease Archive、IPA export成功。
- Delivery / Build ID: `21fb3302-17a0-41b3-a0eb-a48ab26af2a0`
- Apple processing / import: `VALID`
- `usesNonExemptEncryption=false`
- Internal group `CueScore Internal Testers`は全Build自動アクセスのためBuild 52を自動配布。
- External TestFlight、App Review、審査用build追加、一般公開は未実施。
