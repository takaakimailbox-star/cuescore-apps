# CueScore Build 51 Player Analysis Trend / Splash Fix

Date: 2026-09-03

## 実機報告と原因

- Build 50で推移グラフが復元されていないことを実iPhoneで確認。
- Build 50は別の正式分析screenへグラフを追加しており、実際にユーザーが開く「プレーヤー情報 → 分析」は`analysis-build4.js`が再描画していたため表示されなかった。
- 起動WebスプラッシュよりBottom Navigationが上位に描画され、読み込み中の下端へ露出していた。

## 修正

- Player分析のSSOTである`analysis-build4.js`へ、直近10試合の推移グラフを復元。
- 勝率と各競技の主要指標をselectorで切替可能にした。
- ファール率／ファール平均はselector・主要指標・グラフのいずれにも復元していない。
- 起動スプラッシュを最大z-index、`inset:0`、`100vw × 100dvh`で全面固定した。
- cache versionを`2.0-build51-player-trend-splash`、iOS buildを51へ更新した。

## 検証・配布

- 全Node回帰test PASS。
- native web生成、Capacitor iOS同期、署名付きRelease Archive、IPA export成功。
- Delivery / Build ID: `4672179a-4d2e-45dd-84d4-f1cdcac926f4`
- Apple processing / import: `VALID`
- `usesNonExemptEncryption=false`
- Internal group `CueScore Internal Testers`は全Build自動アクセスのためBuild 51を自動配布。
- External TestFlight、App Review、審査用build追加、一般公開は未実施。
