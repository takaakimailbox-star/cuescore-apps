# CueScore Build 46 全Swipe機能撤去

## 決定

- Build 45実iPhoneで、自己ベスト → Match DetailのEdge Swipeがanimationもしなくなった。
- Edge Swipeを継続修正せず、アプリ全体のSwipe操作を正式に廃止する。
- 戻る操作は各画面の左上Backを正式導線とする。

## 実装

- 共通Edge Back controllerを削除。
- `touchstart`／`touchmove`／`touchend`／cancel系listener、gesture state、timer、threshold、candidate Back探索を削除。
- `cue-edge-back-*` class、CSS custom property、完了／cancel animationを削除。
- 試合結果のページSwipe、旧試合詳細のページSwipe、新規試合の競技切替Swipeを削除。
- Match Detail左上Backのpointerdown／pointerup／click入力とtap feedbackは維持。
- Build 39 `exactMatchDetailOrigin`によるplayer、discipline、opponent、filter、scroll復元は維持。
- ページタブ、競技button、Bottom Navigationなど明示的なbutton操作は維持。

## 検証

- 全自動test: `344 pass / 0 fail / 0 skipped`
- 専用test: Edge controller／listener／animation／state不在、全ページSwipe navigation不在、左上Back／exact origin維持
- source／native-web／iOS copied assetsでSwipe実装不在を確認
- Simulator Debug／Release: `BUILD SUCCEEDED`
- 390×844 horizontal overflow: `0`
- browser console error: `0`
- Version `1.0`／Build `46`

## 実iPhone Acceptance（Pending）

- TestFlight上のBuild番号が46
- 画面端をSwipeしても遷移・追従animationが発生しない
- 自己ベスト／最近の試合を含む各Match Detailで左上Backが1tapで動作する
- 左上Back後にplayer、discipline、opponent、filter、scrollを復元する

## 配布境界

source/archive commitは`db3123a`。Signed Archive `/private/tmp/CueScore-Build46.xcarchive`からApp Store Connect uploadに成功。Delivery／Build ID `219b0c56-2074-4932-9370-203aa8ff2886`、processing／import `VALID`、`usesNonExemptEncryption=false`を確認した。Build 46はInternal group `CueScore Internal Testers`の配布対象で、実iPhoneのTestFlightから更新・インストール可能。

Internal TestFlightまでで停止。External TestFlight、Beta App Review、App Review、審査用追加、一般公開は行っていない。
