# CueScore Build 40 Edge Swipe監査／New Match Back削除 実装記録

## 基準と範囲

- 実装基準: latest `main` `df5729e3a5eb02c0470ac819231df2e43365b6c4`
- Version: `1.0`
- Build: `40`
- 対象: 全Edge Swipe Backの共通実装監査、遅いスワイプの成立、cancel挙動、visible Back contractとの統一、New Match左上Back削除
- 保護対象: Build 39 `exactMatchDetailOrigin`、Match Detail close contract、Match Card C、scoring、analytics、saved-data schema、Backup／Restore、Bottom Navigation

## 監査結果とroot cause

Edge Swipeは画面ごとの独自実装ではなく、`index.html`末尾の共通gesture controllerがvisible Back buttonを探索してclickする構造だった。監査で次の阻害要因を確認した。

1. gesture duration上限が1,200msで、左端から画面中央までゆっくり動かす正常操作を失敗扱いにしていた。
2. `button`／`a`を一律に開始除外していたため、画面幅を占めるcard／row上の左端ではgestureが開始しなかった。
3. `touchstart`直後にtracking状態と`pointer-events:none`を適用し、まだswipe意図が確定していないtapを阻害し得た。
4. follow transformの対象が`.app`だけで、`body`直下へ描画されるPlayer journey overlayが指に追従しなかった。

## 修正

- gesture duration上限を4,000msへ広げ、左端から約50%までの遅いswipeを完了条件内にした。
- 開始除外をフォーム入力、contenteditable、tab、discipline selectorへ限定し、card／row上からも開始可能にした。
- 横移動8px超かつ縦移動の1.2倍を超えた時点で初めてtrackingへ移行する。短いtapの入力経路を維持する。
- CSS変数を`body`へ集約し、`.app`に加えてbody直下のPlayer opponent records、match history、trends overlayも同じprogressで追従させた。nested overlayは二重transformしない。
- 完了時は新しいnavigation routeを作らず、現在表示中のBack buttonをclickする。Match DetailではBuild 35以降の入力contractから`closeFormalMatchDetailV2()`へ到達し、Build 39の`exactMatchDetailOrigin`をそのまま復元する。
- New Matchは`#cueMatchSetupBackV3`をDOMから削除し、Edge Swipe対象selectorからも除外した。Bottom Navigationは維持した。

## 共通gesture contract

- 開始位置: viewport左端から64px以内
- intent開始: `dx > 8px`かつ`dx > |dy| × 1.2`
- 完了: 横移動60px以上、縦移動60px以内、横優位1.2倍、4,000ms以内
- cancel: 上記未達。180msで元位置へ戻す
- complete animation: 残り距離に応じ最大220msで画面外へ送り、その後visible Back buttonの既存click contractを呼ぶ
- velocityだけによる別判定は設けない

## 画面インベントリ

### Enabled

visible Backが存在し、modal／active matchでblockされていない次のchild/detail画面は共通controllerの対象。

- Match Detail: `#recordDetailBackBtn` → formal Match Detail close → exact origin restore
- Player Information child/detail: `#playerStatsBackBtn`
- Player別全試合／対戦相手別／対戦相手履歴: `[data-journey-back]`
- Player trends: `.pd12-trends-back`
- Player library child: `#playerLibraryBackBtn`
- History child: `#recordsBackV2`
- Settings／Data Management／分類／filter／ranking／Vs Analysis／analytics／suite child: 対応する既存visible Back contract

### Not Applicable

- Home、Player root、History root、Settings root: top-levelなので戻り先を所有しない
- New Match: Product Owner指定により左上Backを削除。Bottom Navigationを使用
- Active Match／Game Result／blocking modal表示中: 誤終了防止の既存block contractを維持

### Deferred

- なし。実iPhoneの操作受入だけをPendingとする。

## 検証

- 全自動test: `346 pass / 0 fail / 0 skipped`
- Build 40専用test: 遅いhalf-width swipe、短距離cancel、intent確定前tap保護、body直下overlay follow、New Match Back削除、Build 39 exact contract維持
- Simulator Debug: `BUILD SUCCEEDED`
- Simulator Release: `BUILD SUCCEEDED`
- 390×844: horizontal overflow `0`
- browser console errors: `0`
- New Match: `#cueMatchSetupBackV3` count `0`、visible `false`

## 実iPhone受入チェックリスト（Pending）

自動test、Simulator、browser結果は実iPhone PASSとして扱わない。Internal TestFlight Build 40で以下を確認する。

- 各Enabled画面: 左端から約50%までゆっくりswipeして1回でBack完了
- 各Enabled画面: 短いswipeでcancelし、元画面のtap／scrollが継続可能
- 各Enabled画面: animationが指に追従し、二重移動・flash・freezeなし
- Match Detail 5入口: 自己ベスト／最近の試合／すべての試合／対戦相手別／全体History
- Match Detail 5入口それぞれ: player、discipline、opponent、filter、scroll位置を保持して直前入口へ復元
- 同じ5入口: 左上Back 1tapとEdge Swipeが同じ結果
- Player／History／Settings各child: visible BackとEdge Swipeが同じ戻り先
- New Match: 左上Back非表示、Bottom Navigation正常
- 画面端のcard／row上から開始してもswipe成立
- Dynamic Type／長いplayer名でもBack hit areaと横layoutに破綻なし

## 配布境界

Internal TestFlightまで。External TestFlight、外部テスター、Public Link、Beta App Review、App Review、審査用への追加、Version 1.0審査用build変更、一般公開は行わない。

