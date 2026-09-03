# CueScore Build 47 分析ファール率／推移グラフ撤去 実装記録

日付: 2026-09-03

## 決定

分析画面に表示していたファール率と推移グラフを廃止する。グラフを開くbutton、metric選択、point interaction、full-screen／modal表示も含め、入口を残さない。

## 実装

- Player Hubと競技別分析の指標定義から`foulRate`を除外。
- 分析renderから推移sectionと関連click handler／chart stateを削除。
- Player Detail上のmetric trend button、graph entry、full-screen trendを削除。
- 正式な分析画面からファール指標card、推移グラフ、metric tabを削除。
- saved match、foul event、内部の互換計算は変更せず、既存データを維持。
- Game Result／Match Detailの得点推移グラフは対象外として維持。
- cache versionを`2.0-build47-analysis-cleanup`、iOS build numberを`47`へ更新。

## 検証

- Node test: `343 pass / 0 fail / 0 skipped`
- Build 47専用regression testで対象UI不在と内部データ互換性を固定。
- native web生成とCapacitor iOS copy完了。
- iOS Simulator Debug: `BUILD SUCCEEDED`
- 実iPhone確認: Pending

## 配布境界

Internal TestFlightまで。External TestFlight、App Review、審査用追加、一般公開は行わない。
