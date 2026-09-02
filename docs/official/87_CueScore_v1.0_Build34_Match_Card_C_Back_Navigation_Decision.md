# CueScore v1.0 Build 34 Match Card C／Back Navigation Decision

- Status: Adopted / Implemented
- Date: 2026-09-02
- Baseline: `main` at `8ee1ee9a7e3d3bd641ed30fa6348d5ec7346d331`

## Decision

試合カードはC案の情報密度を、Playerの最近の試合、競技別全試合、対戦相手別試合、全体履歴へ共通適用する。日付、対戦相手、勝敗、スコア、Race to、詳細導線を文脈に応じて保持し、長い名前と大きいスコアでも横スクロールを発生させない。

Match DetailのBackは画面名から推測せず、開く直前の所有元を記録して同じ文脈へ戻す。対象は自己ベスト、最近の試合、全試合、対戦相手別試合、全体履歴で、一覧のスクロール位置も復元する。

## Boundary

scoring、winner、Race to、JPA、Break Input、14-1、Undo、Game Set、Player／Match ID、保存schema、Backup／Restore、analytics formula／aggregate SSOTは変更しない。App Review、External TestFlight、一般公開はこの判断に含めない。
