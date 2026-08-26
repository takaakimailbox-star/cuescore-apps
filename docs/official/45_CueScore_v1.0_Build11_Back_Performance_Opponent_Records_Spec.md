# CueScore v1.0 Build 11 — Back Performance and Opponent Records Specification

- Status: Official Specification
- Adopted: 2026-08-26
- Approval: Product Owner

## Back

- edge Swipe Backの完了時に設けていた190ms／280msの固定待機を廃止し、表示中の標準Back controlを即時実行する。
- tapとswipeは入力元だけをruntime属性で識別し、Navigation処理と戻り先を共通化する。
- Back controlは押下中の視覚状態と`touch-action: manipulation`を持つ。
- Player一覧、Player情報、競技詳細、競技固定履歴、対戦相手別成績、相手固定履歴、Match Detail、Player編集は、保持済み画面を先に復帰する。
- `window.CueScoreBackPerfV11.records`は最大40件のruntime測定だけを保持し、`received`、`handlerStart`、`domComplete`、`visuallyUsable`を記録する。永続化しない。

## Opponent Records

- headerはPlayer avatar、Player名、固定競技をcompactに表示する。
- summaryは`対戦相手 / 試合 / 勝敗 / 勝率`の4要素。勝率は判定可能試合を分母として小数1桁、分母0は`—`。
- sortは対戦数順と勝率順を維持する。
- 各相手cardはavatar、名前、試合数、勝敗、勝率、chevronを表示し、過去試合のW／L badge列は表示しない。
- card全体の操作で、Player・相手・競技固定履歴を開く。履歴には日付、競技、対戦相手、勝敗、scoreとMatch Detail入口を表示する。
- 相手固定履歴では競技selectorと期間selectorを表示しない。

## Acceptance

- 390×844 portrait相当で横overflowがなく、長い名前はellipsisとaccessible nameを維持する。
- 左上BackとSwipe Backの戻り先が一致し、各階層でPlayer・競技・相手の文脈が保持される。
- 欠損結果を敗戦や0%として表示しない。
- source、generated native bundle、Xcode copied assetsが一致する。
- 全自動テスト、iOS Simulator Debug／ReleaseをPASSする。実iPhone未確認項目はPASS扱いにしない。
