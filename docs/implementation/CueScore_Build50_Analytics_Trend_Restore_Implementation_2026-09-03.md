# CueScore Build 50 分析画面 推移グラフ復元 実装記録

日付: 2026-09-03

## 依頼

- 正式な分析画面の推移グラフを復元する。
- ファール率は削除状態を維持する。

## 実装

- 分析画面へ勝率／シュート成功率／セーフティ成功率の切替タブと月別推移グラフを復元した。
- プレーヤー、期間、フィルター変更時に同じ集計条件でグラフを再描画する。
- ファール平均／ファール率のカード、タブ、グラフ指標は復元していない。
- Player Hubの重複した推移リンクやPlayer Detail内の旧グラフは復元せず、正式な分析画面だけをSSOTとした。
- Version 1.0、Build 50、cache version `2.0-build50-analytics-trend-restore`。

## 検証

- Node test: `353 pass / 0 fail / 0 skipped`
- native web生成／Capacitor iOS同期完了。
- iOS Simulator Debug: `BUILD SUCCEEDED`
- Release Archive／export: `SUCCEEDED`
- Delivery／Build ID: `a779a3bd-6d7c-4b9d-8f42-7bc38f31c405`
- processing／import: `VALID`
- `usesNonExemptEncryption=false`
- Internal group `CueScore Internal Testers`: `hasAccessToAllBuilds=true`（Build 50は自動配布対象）

## 配布境界

Internal TestFlightまで。External TestFlight、App Review、審査用追加、一般公開は行わない。
