# CueScore Build 39 Player Detail Exact Back修正 実装記録

**Date:** 2026-09-02  
**Baseline:** `85a6517fa994cc0fedee0f7a32dc4454698c8a06`  
**Version / Build:** 1.0 / 39

## Root cause

Build 38のPlayer Hub再構成後も、Build 34の`exactMatchDetailOrigin`は旧Player Detail stateを参照していた。新しいPlayer Hubが所有するplayer、discipline、selected tab、tab内scrollをsnapshotせず、Match Detail close後にPlayer Library overlayを閉じ直す契約もなかった。このためclose自体は成功してもPlayer一覧が前面へ戻った。

## Fix

- Player Hubへ`CueScorePlayerHubV2.snapshot()`／`restore()`を追加し、player ID、discipline、tab、tab内scrollを同じownerで保存・復元する。
- restore時はPlayer Libraryを明示的に閉じ、Player Informationを表示して同じPlayer Hub contextを再描画する。
- `exactMatchDetailOrigin`はPlayer Hub snapshotを保持し、Player起点のclose後だけ同APIへ復元を委譲する。
- Hubの自己ベストは`personal-best`、最近の試合は`player-recent`として区別する。
- Build 35のBack button pointer/click入力と`closeFormalMatchDetailV2()`、Edge Swipeの共通close contractは変更していない。
- saved-data schema、scoring、winner、Race to、analytics、Backup/Restore、Match Card C、Bottom Navigation、9-Ball selectorは変更していない。

## Verification

- automated tests: `341 pass / 0 fail / 0 skipped`
- Simulator Debug: `BUILD SUCCEEDED`
- Simulator Release: `BUILD SUCCEEDED`
- 390×844: horizontal overflow `0`、console errors `0`
- local deterministic sample data:
  - 自己ベスト → Match Detail → Back: 同じPlayer／9-Ball／分析tabへ復元
  - 最近の試合 → Match Detail → Back: 同じPlayer／9-Ball／試合tabへ復元、Player一覧はhidden
  - すべての試合 → Match Detail → Back: discipline-fixed historyへ復元
  - 対戦相手別 → Match Detail → Back: 同じopponent-fixed historyへ復元
  - Global History → Match Detail → Back: Global Historyへ復元
- PWA cache version: `2.0-build39-player-exact-back`

## Acceptance status

実iPhoneでの5入口、1tap、scroll位置、Edge Swipeの最終受入はInternal TestFlight Build 39で確認待ち。自動／Simulator／browser結果を実iPhone PASSとは扱わない。

