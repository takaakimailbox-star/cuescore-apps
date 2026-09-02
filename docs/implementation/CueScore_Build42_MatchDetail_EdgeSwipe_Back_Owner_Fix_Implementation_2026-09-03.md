# CueScore Build 42 Match Detail Edge Swipe Back owner修正

## 基準と実機結果

- 実装前latest `main`: `2152b37485227c29aee62da57ed5c5928285d81f`
- Build 41実iPhone:
  - 自己ベスト → 試合詳細: animationは完走するが画面が戻らない
  - 最近の試合 → 試合詳細: animationは完走するが画面が戻らない
- Build 41のgesture lifecycle resetは有効。今回の対象はcompletion後のBack ownership。

## Root cause

Match DetailはPlayer Informationの上へoverlay表示されるため、背面の`#playerStatsBackBtn`もCSS／DOM上はvisibleのままだった。共通Edge Swipeの`candidateBackButton()`はselector配列順に最初のvisible Backを返し、`#playerStatsBackBtn`が`#recordDetailBackBtn`より前にあった。

このため自己ベスト／最近の試合ではanimation完了後に背面Player Backをclickし、表示中のMatch Detail close contractへ到達しなかった。一方、対戦相手別では`#recordDetailBackBtn`が`[data-journey-back]`より先だったため正常に戻れていた。入口ごとの差と完全に一致する。

## 修正

- visibleな`#recordDetailOverlay`内の`#recordDetailBackBtn`を最優先ownerとして明示した。
- Match Detailが表示中なら、背面にあるPlayer／History／Journey Backはcandidateにしない。
- Edge Swipeは引き続き選ばれたvisible buttonの`click()`を呼び、Build 35の`window.closeFormalMatchDetailV2()`とBuild 39の`exactMatchDetailOrigin`復元を通る。
- 新しいclose routeや入口別handlerは追加していない。
- Build 41のcancel／second gesture lifecycle resetは維持。

## 保護対象

- Match Detail左上Back 1tap
- Build 39 exact origin restore
- 自己ベスト／最近／すべての試合／対戦相手別／Global Historyの5 origin
- 対戦相手別 → 特定相手の試合画面
- Match Card C、scoring、analytics、saved-data schema
- Bottom Navigation、New Match左上Back削除

## 検証

- 全自動test: `354 pass / 0 fail / 0 skipped`
- 専用test: Match Detail owner優先、Player背面Back非選択、同一click close contract、5 origin、journey回帰
- native-web／iOS copied assets同期済み
- Simulator Debug／Release: `BUILD SUCCEEDED`
- 390×844 horizontal overflow: `0`
- browser console error: `0`
- Bottom Navigation: visible
- New Match左上Back: DOM count `0`
- Version `1.0`／Build `42`

## 実iPhone Acceptance（Pending）

Internal TestFlight Build 42で以下を各3回確認する。実機確認前はPASS扱いにしない。

- 自己ベスト → Match Detail → Edge Swipeで画面が閉じ、analysis originへ復元
- 最近の試合 → Match Detail → Edge Swipeで画面が閉じ、matches originへ復元
- 両入口で短いSwipe cancel後の再Swipeも成功
- すべての試合／対戦相手別／Global History → Match DetailのEdge Swipeと左上Back
- 対戦相手別 → 特定相手の試合画面のBuild 40 PASS維持
- player、discipline、opponent、filter、scroll位置保持

## 配布境界

Internal TestFlightまで。External TestFlight、Beta App Review、App Review、`審査用に追加`、一般公開は行わない。
