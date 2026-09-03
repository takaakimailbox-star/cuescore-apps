# CueScore Build 45 Match Detail body-state owner修正

## 基準と実iPhone結果

- 実装前latest `main`: `7d48fbe`
- TestFlight Build 44を実iPhoneで確認。左上Backは1tapで正常だが、自己ベスト／最近の試合からのEdge Swipeはanimation完走後に同じMatch Detailへ戻り、画面を閉じなかった。
- Build 44をFAILとして扱う。

## Root cause

Build 44はdirect-close判定をoverlay自身のopen stateへ変更したが、その前段のowner選択が`#recordDetailBackBtn.getClientRects().length > 0`を要求していた。Player起点ではMatch Detailがhidden shellをまたぐため、実iPhone WebView上でこの矩形判定を満たさず、背後の`#playerStatsBackBtn`を選択する余地が残った。その場合、Match Detail direct-close分岐へ到達せず、animation後にDetailが再表示される実機結果になる。

## 修正

- `body.match-detail-visible-v1`を表示状態とEdge Swipe ownerの唯一のSSOTにした。
- body stateが有効な間は矩形、祖先visibility、overlay属性に依存せず`#recordDetailBackBtn`を選択する。
- Edge Swipe完了は実行時点の`window.closeFormalMatchDetailV2()`へ直接合流する。
- 左上Back、Build 39 `exactMatchDetailOrigin`復元、Build 41 gesture lifecycle、他画面のBack contractは維持する。
- 新しいrouteや入口別close処理は追加しない。

## 検証

- 全自動test: `363 pass / 0 fail / 0 skipped`
- 専用test: body stateによる無条件owner取得、矩形／visibility非依存、exact close contract直結、renderer／closerの同一state利用
- native-web／iOS copied assets同期済み
- Simulator Debug／Release: `BUILD SUCCEEDED`
- 390×844 horizontal overflow: `0`
- browser console error: `0`
- Version `1.0`／Build `45`

## 実iPhone Acceptance（Pending）

Internal TestFlight Build 45で確認する。確認前はPASS扱いにしない。

- TestFlight上のBuild番号が45
- 自己ベスト → Match Detail → Edge SwipeでDetail close／analysis origin復元
- 最近の試合 → Match Detail → Edge SwipeでDetail close／matches origin復元
- 左上Backとの結果一致
- player、discipline、opponent、filter、scroll保持

## 配布境界

Internal TestFlightまでで停止する。External TestFlight、Beta App Review、App Review、審査用追加、一般公開は行わない。
