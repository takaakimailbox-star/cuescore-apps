# CueScore Build 48 Player Hub表示／Match Detailスクロール修正 実装記録

日付: 2026-09-03

## 対象

- Player情報「最近の試合」で勝敗badgeと大きなscoreが重なる問題
- 9-Ball自己ベストの「最高ブレイクイン率」撤去
- 10-Ball自己ベスト項目の9-Ballとの統一
- 2〜3件の自己ベストを縦1列で表示
- Player情報の最近の試合から開いたMatch Detailを下へscrollできない問題

## 実装

- 最近の試合cardで勝敗badgeに34〜36px、scoreに最低76〜80pxの独立したgrid trackを確保。2桁・3桁scoreでも重ならないようにした。
- 9-Ball／10-Ballの自己ベスト表示から`breakInRate`を共通filterで除外し、最大3項目に統一した。
- Player Hubと旧互換Player Detailの自己ベストcardを縦1列に統一した。
- Match Detailのscroll領域を`flex:1 1 0`、`height:0`、`overflow-y:scroll`としてiOS WebView上でも明示的に確保し、open時は先頭位置へ初期化した。
- cache versionを`2.0-build48-player-hub-fixes`、iOS build numberを`48`へ更新した。

## 検証

- 390×844実画面: Rotation `120−63`で勝敗badgeとの間隔5px、重なりなし。
- 390×844実画面: 10-Ball自己ベストが1列、最高ブレイクイン率なし。
- 390×844実画面: Match Detail scroll領域 `793px / scrollHeight 1354px`、下方向操作でゲーム履歴の途中まで移動。
- Node test: `351 pass / 0 fail / 0 skipped`
- native web生成／Capacitor iOS copy完了。
- iOS Simulator Debug: `BUILD SUCCEEDED`
- source/archive commit: `1a5ae38`
- Delivery／Build ID: `a503d323-2d56-4a55-86df-d89e83a3fb20`
- App Store Connect processing／import: `VALID`
- `usesNonExemptEncryption=false`
- Internal group `CueScore Internal Testers`: Build 48を含むことを確認
- 実iPhone確認: Pending

## 配布境界

Internal TestFlightまで。External TestFlight、App Review、審査用追加、一般公開は行わない。
