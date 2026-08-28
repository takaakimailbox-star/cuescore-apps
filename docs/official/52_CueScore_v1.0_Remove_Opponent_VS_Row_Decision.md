# CueScore v1.0 — Opponent-fixed History VS Row Removal Decision

Status: Official Release
Date: 2026-08-28
Approval: Product Owner instruction dated 2026-08-28

## Decision

1. 相手・競技固定履歴では、画面タイトルが相手と競技を明示するため、本文先頭の`Player vs Opponent`行をavatar・Player名・`vs`・Opponent名を含めて表示しない。
2. aggregate、月別履歴、勝敗、score、race、chevron、Match Detail、左上Back、edge Swipe Backは維持する。
3. 全6競技へ共通適用する。通常のPlayer試合履歴や他画面の対戦表示は変更しない。
4. 本決定はOfficial 046／047／048／049のうち、相手固定履歴に`Player vs Opponent`行を置く記述だけを置き換える。その他の仕様は維持する。

## Boundaries

Scoring rules、saved-data schema、Backup／Restore、analytics formula、App Store公開範囲は変更しない。レビュー画像は正式採用前の確認資料として管理する。
