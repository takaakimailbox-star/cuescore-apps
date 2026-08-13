# CueScore Apps v1.0 Final RC — Game Result / Match Detail 共通レイアウト決定

Status: Adopted / Official  
決定日: 2026年8月13日  
Authority: Product Owner Decision  
対象: Game Result / Match Detail

## 決定

Game ResultとMatch Detailは、スコア推移まで同一の情報構造、表示順、デザイン、描画ロジックを使用する。差分は画面下部に限定する。

Game Resultは日時・種目、Player情報、最終結果、競技条件、競技別Metrics、スコア推移、終了後3アクションを表示する。ゲーム履歴、削除UI、削除説明文は表示しない。

Match Detailは同じ上半分とスコア推移に加え、ゲーム履歴、削除UI、削除説明文を表示する。

## 競技別Metrics

| 競技 | Game Result / Match Detail共通Metrics |
|---|---|
| 9-Ball | シュート率／マス割／ファール |
| 10-Ball | シュート率／マス割／ファール |
| Rotation | シュート率／ハイラン／ファール |
| JPA 9-Ball | 試合結果情報＋アベレージ／ハイラン／ファール |
| Straight Pool（14.1） | アベレージ／ハイラン／ファール |
| Three Cushion（3C） | イニング／ハイラン／アベレージ |

3Cにはファール、0件、ダミー項目を表示しない。

## Game Result専用アクション

「試合へ戻る」「ホームへ戻る」「もう一度対戦する」を維持する。右上Close、Backdropタップ、Escapeによる閉鎖は追加しない。「試合へ戻る」時の保存取消を維持する。

## 既存Decisionとの関係

本DecisionはDecision 020の後続Decisionである。Decision 020で定めたJPA専用情報、3Cファール非表示、保存互換性を維持する一方、Game Resultの主要2指標中心UIを上書きし、両画面を共通表示へ変更する。3C Metricsは両画面とも「イニング／ハイラン／アベレージ」へ更新する。Decision 020は履歴として削除しない。

## 変更しない事項

保存データschema、localStorage、Backup／Restore、過去試合データ、Undo、Game Result保存タイミング、保存取消、スコア推移生成、Player 1実線／Player 2破線、JPAマッチポイント、10-Ballマス割判定、Player Analytics、Match Analytics、Player Detailを変更しない。

## 有効性

Adopted / Official。2026年8月13日以降のCueScore Apps v1.0 Final RCに適用する。
