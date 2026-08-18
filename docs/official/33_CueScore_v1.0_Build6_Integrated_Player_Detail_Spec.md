# CueScore v1.0 Build 6 Integrated Player Detail Specification

- Status: Official Specification
- Published: 2026-08-19 (JST)
- Supersedes: Player DetailからPlayer Analysisへ遷移する通常導線（Decision 030/031の指標・安全契約は維持）

## Screen contract

1. compactプロフィールheader：avatar、Player名、Main Player、メモ、既存編集操作。
2. compact通算：全競技の試合数、勝敗、勝率。
3. 競技selector：9-Ball、10-Ball、Rotation、14-1、JPA 9-Ball、3 Cushion。
4. 今の状態／主要指標：選択競技の直近10試合と正式derived metrics。
5. 最近の調子：直近5試合のW/L。graphは初期非表示。「推移を見る」で指標選択と実測値chartを展開する。
6. 自己ベスト：eligible recordだけを用い、初期3件、全件展開、記録元Match Detailへ遷移。
7. 最近の試合：初期2件、全件展開、各Match Detailへ遷移。
8. compact詳細入口：対戦相手別成績と試合一覧。試合一覧から既存Player目線Match Analysisへ進める。

## Metric contract

競技別主要指標とeligible判定はOfficial 029および031を再利用する。実装は`CueScoreBuild4Metrics.aggregate`、`bests`、既存正式マス割り判定を呼び出し、同じ計算を別実装しない。欠損数値は`—`、空状態は`データなし`とし、推定値や0で補完しない。

## Compatibility and prohibited changes

既存のPlayer編集、削除後の履歴保持、Rival Analysis、Single Match Analysis、History、Match Detail、Backup／Restore、Main Player保持、通常／サンプル分離を維持する。schema migration、新保存field、競技仕様変更、Build Number 6設定、配布操作は禁止する。
