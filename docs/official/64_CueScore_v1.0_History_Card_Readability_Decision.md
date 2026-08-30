# CueScore v1.0 — History Card Readability Decision

- Date: 2026-08-30
- Status: Official RC addendum
- Approval: Product Owner adopted

## Decision

1. 全体の`試合履歴一覧`は、左右どちらのPlayer名も全角6文字相当までellipsisなしで表示できる領域を確保する。7文字以上は必要に応じて1行ellipsisとする。
2. 競技固定履歴のcardを1行中心から2段へ変更する。上段は左に`M/D HH:mm`、右に`勝ち`／`負け`、下段は相手avatar、相手名、score、chevronを表示する。
3. 競技固定履歴cardの`vs`は削除する。相手名も全角6文字相当までellipsisなしとし、scoreとchevronを独立した右側領域に保持する。
4. 勝敗表示は既存の緑／赤semantic色を使った文字と薄い背景とし、一覧の相手名・scoreより主張を弱める。

## Replacement Boundary

本DecisionはOfficial 061のうち、競技固定履歴を`勝敗、短縮日時、vs、相手avatar、相手名、score、chevron`の1行中心で表示する箇所だけを置き換える。

title、card内競技名とRace toの非表示、Race to保存値、Match DetailのRace to、月別grouping、集計、card tap、Back／Swipe Backは維持する。通常Player履歴、相手固定履歴、採点、勝敗判定、saved-data schema、Backup／Restore、分析は変更しない。

