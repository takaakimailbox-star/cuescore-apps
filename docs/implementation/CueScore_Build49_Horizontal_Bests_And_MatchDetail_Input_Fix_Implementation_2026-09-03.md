# CueScore Build 49 自己ベスト横1列／Match Detail入力修正 実装記録

日付: 2026-09-03

## 実機報告

- 自己ベストは縦列ではなく横1列が正式仕様。
- 自己ベストおよびPlayer情報の最近の試合から開くMatch Detailが、Build 48でも下へscrollできない。

## 原因

- 共通Bottom Navigationの`z-index:18000`がMatch Detailの`16000`より上で、詳細表示中も入力面に残っていた。
- modal accessibility controllerがselector配列順で最前面を決めていたため、DOM上で後から表示したMatch Detailではなく背面のPlayer Statsを最前面と判定した。
- その結果、Match Detailへ`aria-hidden=true`が再設定され、共通CSS `[aria-hidden="true"] { pointer-events:none }`によりscroll領域がタッチ入力を受け取れなかった。

## 修正

- 自己ベスト2〜3項目を等幅の横1列へ変更。
- Match Detailをopen時に`document.body`直下へ移し、`overflow:hidden`のapp shellから独立させた。
- modalの最前面判定をselector順から実DOM順へ変更した。
- Match Detail表示中は共通Bottom Navigationを非表示・非操作にした。
- 既存Backと`exactMatchDetailOrigin`によるPlayer／discipline／tab／scroll復元は維持した。
- cache versionを`2.0-build49-player-hub-scroll-portal`、iOS build numberを`49`へ更新した。

## 検証

- 390×844: 自己ベスト3件が`112px × 3`、1行表示。
- Match Detail: `parent=BODY`、`aria-hidden=false`、`pointer-events=auto`、Bottom Navigation `display:none`。
- 下方向実操作: `scrollTop 0 → 520`。
- Back後: Player情報／Rotation／試合tabを保持して復元。
- Node test: `352 pass / 0 fail / 0 skipped`
- native web生成／Capacitor iOS copy完了。
- iOS Simulator Debug: `BUILD SUCCEEDED`
- 実iPhone確認: Pending

## 配布境界

Internal TestFlightまで。External TestFlight、App Review、審査用追加、一般公開は行わない。
