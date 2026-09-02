# CueScore Build 43 Match Detail Edge Swipe direct close修正

## 基準と実iPhone結果

- 実装前latest `main`: `e5e66dc84b90bb9a34b487a4ed7b9356c021317a`
- Build 42実iPhoneでも、自己ベスト／最近の試合 → Match DetailでSwipe animationは完走するが画面が閉じなかった。
- Build 41のgesture lifecycle resetとBuild 42のMatch Detail owner優先は有効。Build 42も実機FAILとして扱う。

## Root cause

Build 42でEdge Swipeは正しい`#recordDetailBackBtn`を所有したが、完了処理はDOMの合成`button.click()`に依存していた。iPhone WebViewでは、この合成clickがMatch Detailを描画するたびに登録される動的click listenerへ到達しない実機経路が残った。

左上Backはpointerup handler内から`window.closeFormalMatchDetailV2()`を直接呼ぶため正常だった。animation完走後に画面だけ残る症状は、gesture／ownerではなく最終dispatch方式の差と一致する。

## 修正

- 共通`requestBackContract()`をEdge Swipe完了処理のSSOTとして追加した。
- ownerが表示中Match Detailの`#recordDetailBackBtn`なら、合成clickを介さず実行時点の`window.closeFormalMatchDetailV2()`を直接呼ぶ。
- この関数はBuild 39 wrapperを含む現在のclose contractなので、左上Backと同じexact origin復元を通る。
- Match Detail以外は既存のvisible Back button clickを維持した。
- 新しい入口別route、独自復元処理、別のclose implementationは追加していない。

## 保護対象

- Build 35左上Back 1tap
- Build 39 exact origin restore
- Build 41 cancel／second gesture lifecycle reset
- Build 42 visible Match Detail owner優先
- 5 origin、対戦相手別journey、Bottom Navigation、New Match Back削除
- Match Card C、scoring、analytics、saved-data schema

## 検証

- 全自動test: `357 pass / 0 fail / 0 skipped`
- 専用test: Match Detail direct close、非Match Detail button contract、Build 39 wrapperと5 origin保護
- Simulator Debug／Release: `BUILD SUCCEEDED`
- native-web／iOS copied assets同期済み
- 390×844 horizontal overflow: `0`
- browser console error: `0`
- Bottom Navigation: visible
- New Match左上Back: DOM count `0`
- Version `1.0`／Build `43`

## 実iPhone Acceptance（Pending）

Internal TestFlight Build 43で各3回確認する。実機確認前はPASS扱いにしない。

- 自己ベスト → Match Detail → Edge SwipeでDetailが閉じ、analysis originへ復元
- 最近の試合 → Match Detail → Edge SwipeでDetailが閉じ、matches originへ復元
- 両入口で短いSwipe cancel後の再Swipe
- すべての試合／対戦相手別／Global History → Match Detail
- 対戦相手別 → 特定相手の試合画面
- Edge Swipeと左上Backで同じ復元結果
- player、discipline、opponent、filter、scroll位置保持

## 配布境界

現時点はローカル検証・コミット前。main pushとInternal TestFlightはProduct Ownerの明示承認後に行う。External TestFlight、Beta App Review、App Review、`審査用に追加`、一般公開は行わない。

