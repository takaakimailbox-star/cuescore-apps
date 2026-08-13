# CueScore Apps v1.0 Final RC — JPA 9-Ball Result / Detail Metrics整理決定

Status: Adopted / Official  
決定日: 2026年8月13日  
Authority: Product Owner Decision  
対象: JPA 9-Ball Game Result / Match Detail

## 決定

JPA 9-BallのGame ResultとMatch Detailは、上部にPlayer名、Avatar、SL、Race／先取点、最終取得点、マッチポイントを表示する。下部は1枚のMetricsカードとし、イニング、セーフティ、アベレージ、ハイラン、ファールをこの順で表示する。

下部MetricsカードにはSL、Race／先取点、最終取得点、マッチポイントを再表示しない。「試合結果情報」「分析情報」の見出しと2段階カード分離を廃止する。

## 維持事項

- Game ResultとMatch DetailはDecision 021で採用した共通rendererを維持する。
- JPAスコア推移はX軸＝イニング、Y軸＝累積取得点、Player 1＝実線、Player 2＝破線を維持する。
- Game Resultは履歴・削除UIを表示せず3アクションを維持する。Match Detailは履歴・削除UI・削除説明文を維持する。
- JPAマッチポイント計算、20点配分、Player 1／Player 2順を変更しない。
- 他5競技、保存schema、localStorage、Backup／Restore、過去試合、Undo、保存取消、Analytics各画面を変更しない。

## 既存Decisionとの関係

本DecisionはDecision 021の後続Decisionであり、JPA 9-Ballの情報配置とMetrics順のみを上書きする。Decision 020およびDecision 021は履歴として維持する。

## 有効性

Adopted / Official。2026年8月13日以降のCueScore Apps v1.0 Final RCに適用する。
