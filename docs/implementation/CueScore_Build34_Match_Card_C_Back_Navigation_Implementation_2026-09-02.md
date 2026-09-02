# CueScore Build 34 Match Card C／Back Navigation 実装記録

## Baseline

2026-09-02に`origin/main`をfetchし、local HEADと同一の`8ee1ee9a7e3d3bd641ed30fa6348d5ec7346d331`を基準に実装した。

## Implementation

- 最近の試合へBuild 34 C-balance markupを導入し、日付、相手、勝敗、score、chevronをcompact gridに統合。
- 競技別全試合はRace toを復元した3行76px contractへ変更。
- 対戦相手別／通常Player履歴の既存fixed-context情報削減を維持。
- 全体履歴cardを66px基準へ圧縮し、2 player lane、discipline／Race、score、chevronを維持。
- Match Detailを開くcapture phaseで、自己ベスト、最近、全試合、相手別、全体履歴のoriginとscrollTopをsnapshot。共通close contractで同じ所有元へ戻す。
- app shell versionを`2.0-build34-match-card-c-back-v1`、iOS build numberを34へ更新。
- native-webと`ios/App/App/public`をsourceから再生成・同期。

## Verification

- JavaScript syntax check: PASS
- automated tests: 316 pass / 0 fail / 0 skipped
- 390×844 in-app Browser: viewport 390px / document scrollWidth 390px / body scrollWidth 390px
- source／native-web／iOS copied `index.html`: exact equality PASS
- scoring／saved-data／analytics contractの変更なし

## Distribution Boundary

Build 34はMatch Detail Backの実iPhone checkpointに適する。Internal TestFlightまでを対象とし、App Review、Version 1.0審査用build紐付け、External TestFlight、一般公開は行わない。
