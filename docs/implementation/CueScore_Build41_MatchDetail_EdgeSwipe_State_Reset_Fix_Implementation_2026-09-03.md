# CueScore Build 41 Match Detail Edge Swipe state reset修正 実装記録

## 基準

- 実装前latest `main`: `9dc58e46479b7b5f707ea4665cc1e227d75983f1`
- Build 40 Edge Swipe実装: `4ced986fc7878798b7d07ae4b72fc4b73d597cba`
- Version `1.0`／Build `41`

## Build 40実iPhone結果

- FAIL: 自己ベスト → Match Detail。途中cancel後に次のEdge Swipeが無反応。
- FAIL: 最近の試合 → Match Detail。同症状。
- PASS: 対戦相手別 → 特定相手の試合画面。
- 左上Backは正常だったため、Build 35 close contractとBuild 39 exact origin restoreは変更対象外とした。

## Root cause

Build 40のcancel animationは190ms後にvisual stateを解除するtimeoutを所有していたが、次のgesture開始時にそのtimeoutをcancelしていなかった。短いSwipe後すぐに再Swipeすると、旧gestureのtimeoutが新gesture中のtracking class／transform変数を削除し、追従が途中で切れた。

また、縦方向逸脱のcancel pathでは`cancelled=true`だけを設定し、gesture object／touch identifierを`touchend`まで保持していた。これは「cancel時点でactive=false」の契約を満たさず、`touchcancel`／WebKit cancellationが重なる場合にowner stateを残す余地があった。

pointer captureを取得する実装は存在せず、release漏れは直接原因ではなかった。Match Detail専用Edge Swipeもなく、共通controllerとBuild 35 Back handlerの二重navigation競合はなかった。

## Gesture lifecycle修正

- `abortGesture()`をcancel／interruption cleanupのSSOTにした。
- cancel判定時点でgesture objectを即時`null`にし、active ownerとtouch identifierを同時に解除する。
- touch identifierを保存し、move／endは同じtouchだけを処理する。
- visual reset timeoutを明示所有し、新gesture開始時に必ずclearする。
- sequence tokenにより旧timeoutが新gestureのclass／transformを解除できないようにした。
- trackingだけでなくcancelling class／pending timeoutも残留stateとして認識し、次のtouchstartで即時cleanupする。
- `touchcancel`、touch `pointercancel`、touch `lostpointercapture`、window `blur`、`pagehide`を同じcleanupへ接続した。
- 横Swipe intent時はDOMのpointer-events変更より先に`preventDefault()`を実行する。
- listener登録は既存の`window.__cueScoreEdgeBackV1` guardで1回だけ。rerenderごとの再登録はしない。
- 診断用`debugState()`と強制`reset()`を公開し、active、identifier、transition、pending timerを確認可能にした。

## Reset対象

- active gesture object
- touch identifier／gesture owner
- previous cancel timeout
- gesture sequence ownership
- tracking class
- cancelling class
- `--cue-edge-back-x`
- `--cue-edge-back-progress`
- interruption時のtemporary visual state

pointer captureは取得していないためrelease対象はない。`pointercancel`／`lostpointercapture`は防御的cleanup signalとして処理する。

## Changed files

- `index.html`
- `sw.js`
- `ios/App/App.xcodeproj/project.pbxproj`
- `tests/build41-edge-swipe-state-reset.test.mjs`
- Build／cache versionを参照する既存回帰test
- `docs/CURRENT_STATE.md`
- 本実装記録

## 検証

- 全自動test: `351 pass / 0 fail / 0 skipped`
- 追加test: cancel時active reset、cancel直後のsecond gesture、pointercancel、lostpointercapture、x3反復契約、listener一重登録、Match Detail exact-origin保護
- Match Detail 5入口: `personal-best`、`player-recent`、`player-history`、`opponent-history`、`global-history`の既存SSOT回帰test PASS
- 対戦相手別 → 特定相手の試合画面: 共通`[data-journey-back]`経路と既存handlerを変更せず、回帰test PASS
- Simulator Debug: `BUILD SUCCEEDED`
- Simulator Release: `BUILD SUCCEEDED`
- 390×844 horizontal overflow: `0`
- browser console error: `0`
- Bottom Navigation: visible
- New Match左上Back: DOM count `0`

## 実iPhone Acceptance（Pending）

Internal TestFlight Build 41で各項目を3回連続確認する。自動／Simulator結果を実iPhone PASSとは扱わない。

- 自己ベスト → Match Detail: 短いSwipe → cancel → 再Swipe成功
- 自己ベスト → Match Detail: 約50%の遅いSwipe成功、analysis origin完全復元
- 最近の試合 → Match Detail: 短いSwipe → cancel → 再Swipe成功
- 最近の試合 → Match Detail: 約50%の遅いSwipe成功、matches origin完全復元
- すべての試合 → Match Detail: Edge Swipe／左上Back
- 対戦相手別 → Match Detail: Edge Swipe／左上Back、opponent保持
- Global History → Match Detail: Edge Swipe／左上Back、filter／scroll保持
- 対戦相手別 → 特定相手の試合画面: Build 40 PASS維持
- 全対象でcancel後にtransform／class残留、freeze、二重navigationなし

## 配布境界

Internal TestFlightまで。External TestFlight、外部テスター、Public Link、Beta App Review、App Review、`審査用に追加`、Version 1.0審査用build変更、一般公開は行わない。
