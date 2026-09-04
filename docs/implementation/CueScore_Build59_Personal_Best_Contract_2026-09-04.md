# CueScore Build 59 自己ベスト項目更新 実装記録

## 実装内容

- 9-Ball／10-Ball：最高シュート率、1試合最多マス割り、最高ブレイクポケット数
- Rotation：最高シュート率、最大ハイラン、最高ブレイク得点
- 14-1：最大ハイラン、最高アベレージ
- JPA 9-Ball：最大ハイラン、最高アベレージ、最短イニング
- 3 Cushion：最大ハイラン、最高アベレージ、最少イニング勝利

最高ブレイクポケット数は、1回の有効なブレイクで合法的にポケットした球数の最大値とした。Rotationの最高ブレイク得点は、1回の有効なブレイクで合法的にポケットした球番号の合計最大値とした。いずれもファール、スクラッチ、不正ブレイクを除外し、判定に必要な詳細を持たない旧記録は対象外とする。JPA 9-Ballの最短イニングは勝利試合だけを対象とする。

## 検証・配布

- 全自動test：366 pass / 0 fail / 0 skipped
- native web生成、Capacitor iOS同期、Release Archive成功
- Version 1.0 / Build 59
- source/build commit：95961f6
- App Store Connect Build ID：5369fad0-21bb-4ea0-90ff-6eb9dd1de031
- 輸出コンプライアンス：「上記のアルゴリズムのどれでもない」
- Internal group：CueScore Internal Testers（内部、テスター1名）
- グループ上のBuild 59ステータス：「テスト中」
- 実iPhone受入：pending
- External TestFlight、App Review、審査用追加、一般公開：未実施
