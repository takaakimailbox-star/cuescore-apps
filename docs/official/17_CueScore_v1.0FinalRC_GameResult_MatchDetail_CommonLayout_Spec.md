# CueScore Apps v1.0 Final RC — Game Result / Match Detail 共通レイアウト仕様

Status: Official Addendum  
Publication date: 2026年8月13日  
Supersedes: `15_CueScore_v1.0FinalRC_GameResult_MatchDetail_6Disciplines_Spec.md` の画面責務・競技別表示項目  
Authority: `16_CueScore_v1.0FinalRC_GameResult_MatchDetail_CommonLayout_Decision.md`

## 1. 共通表示契約

両画面は同一rendererと同一表示データを使用し、日時・種目、Player／Avatar／最終スコア、競技条件、競技別Metrics、スコア推移の順に表示する。

Game Resultは共通部分の後に「試合へ戻る」「ホームへ戻る」「もう一度対戦する」を表示し、ゲーム履歴と削除UIを生成しない。Match Detailは共通部分の後にゲーム履歴、削除UI、削除説明文を表示する。

## 2. 競技別表示契約

- 9-Ball／10-Ball: 最終ラック数、Race設定、シュート率／マス割／ファール、ラック別累積ラック勝利数。
- Rotation: 最終得点、目標点、シュート率／ハイラン／ファール、イニング別累積得点。
- JPA 9-Ball: Player名、Avatar、SL、Race／先取点、最終取得点、マッチポイント、イニング、セーフティ。分析情報はアベレージ／ハイラン／ファール。推移はイニング別累積取得点。
- Straight Pool（14.1）: 最終得点、目標点、アベレージ／ハイラン／ファール、イニング別累積得点。
- Three Cushion（3C）: 最終得点、Player別持ち点、イニング／ハイラン／アベレージ、イニング別累積得点。ファールは表示しない。

## 3. 共通描画と差分

`openMatchDetailV1(recordId, options)`を共通rendererとし、`options.source === "result"`をGame Resultモードとする。競技条件、Metrics、JPA試合結果情報、スコア推移は同じ処理から生成する。Game Resultモードでは履歴を生成せず、削除セクションを出力しない。

## 4. 互換性

保存データschemaと保存値を変更しない。既存レコードとイベントから表示時に算出する。スコア推移、JPAマッチポイント、10-Ballの10番マス割、保存取消の既存ロジックを維持する。

## 5. 受入条件

6競技の両画面で共通部分とMetricsが一致し、3Cは「イニング／ハイラン／アベレージ」の順でファールなし、Game Resultは3アクションのみ、Match Detailは履歴と削除UIを維持する。iPhone 390px以下で横スクロールを生じさせない。
