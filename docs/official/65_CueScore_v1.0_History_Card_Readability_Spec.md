# CueScore v1.0 — History Card Readability Spec

- Date: 2026-08-30
- Status: Official RC addendum
- Decision: Official 064

## Global Match History

- titleと現行7種目tabを維持する。
- card下段は両Playerに均等な可変領域を与え、390pt幅で左右とも全角6文字相当までellipsisなしとする。
- 7文字以上は必要に応じて1行ellipsisとする。文字列は加工しない。
- avatar、`vs`、score、chevron、card tapによるMatch Detail遷移を維持する。
- 大きいscoreと桁数の多い競技でも横overflowを発生させない。

## Discipline-fixed Match History

- titleは`{競技名}の全試合`を維持する。
- cardは約115〜120px相当を第一候補とする2段構成にする。
- 上段は短縮日時`M/D HH:mm`を左、`勝ち`／`負け`を右に配置する。
- 下段は相手avatar、相手名、score、chevronを配置し、`vs`は表示しない。
- 相手名は全角6文字相当までellipsisなし、7文字以上は必要に応じて1行ellipsisとする。
- 勝敗は既存semantic色の文字と薄い背景を使い、outline pillより主張を弱める。
- card内競技名とRace toは表示しない。Match Detailでは保存済みRace toを表示する。

## Acceptance

- 390×844でviewport幅とdocument幅が390、横overflow、文字重なり、score／chevron欠けがない。
- 全角6文字相当のPlayer名／相手名にellipsisがなく、7文字以上は必要に応じてellipsisとなる。
- 競技固定cardは上段日時・勝敗、下段avatar・相手名・score・chevronとなり、`vs`、競技名、Race toが0件である。
- 月見出し、集計card、Match Detail、Race to、card tap、Back／Swipe Backを維持する。
- 全自動testは0 fail／0 skipped、native asset一致、Simulator Debug／Releaseは`BUILD SUCCEEDED`とする。実iPhone未確認はpendingとして記録する。

