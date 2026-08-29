# CueScore v1.0 — Match History List UI Simplification Decision

- Status: Official / Product Owner adopted
- Date: 2026-08-30
- Scope: 全体の試合履歴一覧画面のみ

## Decision

1. 画面titleを`試合履歴一覧`とする。
2. 全体履歴の検索、詳細絞り込み、並び替えUIをv1.0では表示しない。
3. 種目tabは`すべて`、`9-Ball`、`10-Ball`、`Rotation`、`14-1`、`JPA 9-Ball`、`3 Cushion`の現行順を維持する。
4. 表示順は常に新しい試合から古い試合とし、同時刻はMatch IDで決定的に並べる。
5. 上からtitle、種目tab、対象試合件数、履歴card一覧の順とし、削除したcontrol領域の余白を残さない。
6. 履歴card、Match Detail、勝敗、score、Player情報、saved-data schemaは変更しない。
7. 詳細検索とユーザー指定の並び替えはLater / Deferredとする。

## Release Boundary

- 現在進行中のv1.0最終RCへ統合する。
- 実iPhone確認まではpendingとする。
- App Store Review、External TestFlight、一般公開は別の明示承認まで行わない。
