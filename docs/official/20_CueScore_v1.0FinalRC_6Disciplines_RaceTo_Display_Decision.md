# CueScore Apps v1.0 Final RC — 6競技 Race to表示統一決定

Status: Adopted / Official
決定日: 2026年8月13日
Authority: Product Owner Decision
対象: Game Result / Match Detail（6競技）

## 決定

Game ResultとMatch Detailの試合条件表示を、6競技すべて `Race to X-Y` へ統一する。XはPlayer 1、YはPlayer 2の既存目標値とし、区切りにはスラッシュではなくハイフンを使用する。

9-Ball／10-Ballの「最終ラック数」、Rotation／14.1の「目標点」、JPA 9-Ballの「Race／先取点」、3Cの「持ち点」は、両画面の試合条件表示から廃止する。

## 表示例

- 9-Ball／10-Ball: `Race to 2-1`
- Rotation: `Race to 61-61`
- JPA 9-Ball: `Race to 14-14`
- Straight Pool（14.1）: `Race to 25-25`
- Three Cushion（3C）: `Race to 15-20`

## 意味と互換性

本決定はCueScore Apps上の表示ラベル統一であり、競技ルール上の名称を変更しない。勝敗判定、Race／目標点／持ち点の内部値、JPA SL対応表、マッチポイント計算、保存schema、履歴、Metrics、スコア推移を変更しない。

共通目標値しかない場合は同じ値を左右へ表示する。新しい保存項目は追加せず、既存のPlayer別goalから表示時に生成する。

## 既存Decisionとの関係

本DecisionはDecision 022の後続Decisionであり、6競技のGame Result／Match Detail試合条件ラベルのみを上書きする。既存Decisionは履歴として維持する。

## 有効性

Adopted / Official。2026年8月13日以降のCueScore Apps v1.0 Final RCに適用する。
