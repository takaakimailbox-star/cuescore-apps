# CueScore Build 44 Player-origin Match Detail visible owner修正

## 基準と実iPhone結果

- 実装前latest `main`: `bb87953`
- Build 43実iPhone、自己ベスト／最近の試合 → Match Detailでanimation後に元のDetail位置へ戻り、画面は閉じなかった。
- Build 43で左上Backは1tap正常。TestFlight Build番号43も確認済み。
- Build 43をFAILとして扱う。

## Root cause

Build 43はMatch Detail ownerなら`closeFormalMatchDetailV2()`を直接呼ぶ実装だったが、owner判定に共通`isVisible(matchDetail)`を使っていた。この関数は要素自身だけでなく`.closest("[hidden],.hidden,[aria-hidden='true']")`で祖先も検査する。

Player Information起点のMatch Detailは、DOM上では非表示Player／History shell内の`#recordDetailOverlay`をfull-screen表示する構造で、画面自体が表示中でもhidden祖先を持つ。このためdirect-close条件がfalseとなり、失敗が確認済みの合成click fallbackへ落ちていた。Swipe後にDetailが元位置へ戻る実機結果と一致する。

## 修正

- Match Detail owner選択はbutton自身のrendered rectで判定し、hidden祖先を継承しない。
- direct-close条件は`#recordDetailOverlay`自身の`.hidden`と`aria-hidden`だけをSSOTとする。
- open Match Detailでは必ず実行時点の`window.closeFormalMatchDetailV2()`を呼ぶ。
- 左上Back、Build 39 exact origin restore、Build 41 lifecycle reset、他画面のbutton click contractは維持。

## 検証

- 全自動test: `360 pass / 0 fail / 0 skipped`
- 専用test: hidden祖先非継承、overlay自身のopen state、open Detailで合成click fallback不使用
- Simulator Debug／Release: `BUILD SUCCEEDED`
- native-web／iOS copied assets同期済み
- 390×844 horizontal overflow: `0`
- browser console error: `0`
- Bottom Navigation: visible
- New Match左上Back: DOM count `0`
- Version `1.0`／Build `44`候補（App Store Connectで未使用確認済み）

## 実iPhone Acceptance（Pending）

Internal TestFlight Build 44で各3回確認する。確認前はPASS扱いにしない。

- 自己ベスト → Match Detail → Edge SwipeでDetail close／analysis origin復元
- 最近の試合 → Match Detail → Edge SwipeでDetail close／matches origin復元
- 短いSwipe cancel後の再Swipe
- すべての試合／対戦相手別／Global History → Match Detail
- 対戦相手別 → 特定相手の試合画面
- 左上Backとの結果一致
- player、discipline、opponent、filter、scroll保持

## 配布境界

source/archive commitは`d3ab1c6`。Signed Archive `/private/tmp/CueScore-Build44.xcarchive`からApp Store Connect uploadに成功。Build upload ID `575a51c9-09ee-480e-83b6-ae1a000cfec7`、processing `VALID`、`usesNonExemptEncryption=false`を確認した。Build 44はInternal group `CueScore Internal Testers`の配布対象で、実iPhoneのTestFlightから更新・インストール可能。

Internal TestFlightまでで停止。External TestFlight、Beta App Review、App Review、審査用追加、一般公開は行っていない。
