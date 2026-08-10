# CueScore Apps v1.0 RC — UI統一・Player Detail統計・不具合修正

Status: Adopted  
Decision date: 2026-08-10  
Authority: Product Owner adopted specification

## Decision

1. Player DetailはGame Result／Player Analyticsと分離した競技別4指標を維持する。
2. 戻る、編集、＋、進む、フィルター、並び替えは、既存レイアウトを変えず共通Design Systemトークンで統一する。
3. Player Detail表示時の実機エラーは、統計集計内の識別子衝突を解消し、古い／不完全な履歴を安全にスキップして再発を防止する。

## Player Detailの競技別4指標

- Rotation：試合数／ハイラン／シュート成功率／ブレイクイン率
- 9 Ball：試合数／マス割率／シュート成功率／ブレイクイン率
- 10 Ball：試合数／マス割率／シュート成功率／ブレイクイン率
- JPA 9 Ball：試合数／シュート成功率／ブレイクイン率／平均イニング
- Straight Pool（14.1）：試合数／ハイラン／シュート成功率／平均得点／イニング
- Three Cushion（3C）：試合数／ハイラン／平均得点／イニング／おすすめ持ち点

JPA 9 Ball平均イニングは、自分の完了イニング総数 ÷ 対象試合数とし、0点で終了した完了イニングも含める。3Cおすすめ持ち点は、信頼できる標準アベレージ対応表が確定するまで「—」とする。

## Navigation UI

共通トークンは48pxのタップ領域、2.4pxの基本線幅、12pxのCorner Radius、透明背景、Shadowなし、共通Paddingを基準とする。フィルター／並び替えは44px以上の高さと共通の白いSurface・境界線を使用する。

## Data compatibility

新規保存項目およびデータ移行は追加しない。既存プレーヤー、既存試合履歴、サンプルデータの保存形式と完全分離仕様を維持する。
