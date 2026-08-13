# CueScore Apps v1.0 Final RC — Game Result / Match Detail 6競技表示決定

Status: Adopted / Official  
決定日: 2026年8月13日  
Authority: Product Owner Decision  
対象: Game Result / Match Detail

## 決定

Game Resultは試合終了直後の短時間確認、Match Detailは保存後の再確認を担う。Game Resultは競技別の主要2指標を基本とし、Match Detailは試合結果、競技固有条件、主要指標、スコア推移、ゲーム履歴を表示する。

| 競技 | Game Result | Match Detail |
|---|---|---|
| 9-Ball | シュート率／マス割 | シュート率／マス割／ファール |
| 10-Ball | シュート率／マス割 | シュート率／マス割／ファール |
| Rotation | シュート率／ハイラン | シュート率／ハイラン／ファール |
| JPA 9-Ball | イニング／セーフティ | 試合結果情報＋アベレージ／ハイラン／ファール |
| Straight Pool（14.1） | アベレージ／ハイラン | アベレージ／ハイラン／ファール |
| Three Cushion（3C） | アベレージ／ハイラン | アベレージ／ハイラン |

## JPA 9-Ball専用構成

Game ResultはPlayer名、Avatar、SL、最終取得点、マッチポイントを維持し、主要2指標をイニング／セーフティへ変更する。

Match Detailでは試合結果情報と分析情報を意味的に分離する。試合結果情報はPlayer名、Avatar、SL、Race／先取点、最終取得点、マッチポイント、イニング、セーフティを表示する。分析情報はアベレージ、ハイラン、ファールを表示する。

既存のマッチポイント計算式、20点配分、Player 1 / Player 2順は変更しない。

## 共通規則

- 9-Ball／10-Ballの表示ラベルは「シュート率」「マス割」「ファール」とする。
- 10-Ballのマス割は10番を対象とする既存計算ロジックを維持する。
- 3Cにはファール入力がないため、ファール、0件、ダミー項目を表示しない。
- 9-Ball／10-Ballのスコア推移はラック別累積ラック勝利数とする。
- Rotation／JPA 9-Ball／14.1／3Cのスコア推移はイニング別累積得点とする。
- Player 1は実線、Player 2は破線を維持する。
- Game Resultの中央Modal、右上Close非表示、3つのActionを維持する。
- Match Detailでは試合メモ／タグを表示、入力、編集しない。

## 変更しない事項

- 保存データschema
- localStorage、Backup、Restore互換性
- 過去試合データ
- Undoロジック
- Game Result保存タイミングと「試合へ戻る」時の保存取消
- スコア推移生成ロジック
- JPAマッチポイント算出表
- Player Analytics、Match Analytics、Player Detail

## 既存Decisionとの整合

Decision 017のPlayer Detail統計、Decision 018のセーフティ成功率定義、Decision 019のGame Result Modal Close例外を変更しない。本DecisionはGame ResultとMatch Detailの表示責務および競技別表示項目を確定する。

## 有効性

Adopted / Official。2026年8月13日以降のCueScore Apps v1.0 Final RCに適用する。
