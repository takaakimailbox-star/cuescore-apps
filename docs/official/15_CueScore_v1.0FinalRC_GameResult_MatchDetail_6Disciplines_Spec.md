# CueScore Apps v1.0 Final RC — Game Result / Match Detail 6競技表示仕様

Status: Official Addendum  
Publication date: 2026年8月13日  
Supersedes: `08_CueScore_v1.0RC_GameResult_Statistics_Spec.docx` の競技別表示項目  
Authority: `14_CueScore_v1.0FinalRC_GameResult_MatchDetail_6Disciplines_Decision.md`

## 1. 画面責務

Game Resultは終了直後の結果確認画面であり、競技別の主要2指標を表示する。Match Detailは保存済み試合の再確認画面であり、日時・種目、Player情報・最終結果、競技固有条件、Metrics、スコア推移、ゲーム履歴、試合削除をこの順で構成する。

## 2. 競技別表示契約

### 9-Ball

- Game Result: シュート率／マス割
- Match Detail: シュート率／マス割／ファール
- 条件: 最終ラック数、Race設定
- 推移: X軸＝ラック、Y軸＝累積ラック勝利数

### 10-Ball

- Game Result: シュート率／マス割
- Match Detail: シュート率／マス割／ファール
- 条件: 最終ラック数、Race設定
- 推移: X軸＝ラック、Y軸＝累積ラック勝利数
- マス割判定は10番を対象とする既存ロジックを使用する。

### Rotation

- Game Result: シュート率／ハイラン
- Match Detail: シュート率／ハイラン／ファール
- 条件: 最終得点、目標点／試合設定
- 推移: X軸＝イニング、Y軸＝累積得点

### JPA 9-Ball

- Game Result主要指標: イニング／セーフティ
- Game Result維持項目: Player名、Avatar、SL、最終取得点、マッチポイント
- Match Detail試合結果情報: Player名、Avatar、SL、Race／先取点、最終取得点、マッチポイント、イニング、セーフティ
- Match Detail分析情報: アベレージ／ハイラン／ファール
- 推移: X軸＝イニング、Y軸＝累積取得点
- 既存マッチポイント計算、20点配分、Player順を維持する。

### Straight Pool（14.1）

- Game Result: アベレージ／ハイラン
- Match Detail: アベレージ／ハイラン／ファール
- 条件: 最終得点、目標点
- 推移: X軸＝イニング、Y軸＝累積得点
- 現行の得点／減点反映を維持する。

### Three Cushion（3C）

- Game Result: アベレージ／ハイラン
- Match Detail: アベレージ／ハイラン
- 条件: 最終得点、Player別持ち点
- 推移: X軸＝イニング、Y軸＝累積得点
- ファール項目、0件表示、ダミー項目を追加しない。

## 3. ラベル

9-Ball／10-Ballでは「シュート成功率」を「シュート率」、「マスワリ回数」を「マス割」、「ファール回数」を「ファール」と表示する。これは表示ラベルの変更であり、計算式を変更しない。

## 4. Game Result共通要件

日付、終了時刻、試合時間、Player 1 / Player 2、Avatar、Player名、最終スコア、競技別主要2指標、スコア推移、「試合へ戻る」「ホームへ戻る」「もう一度対戦する」を維持する。右上Closeは表示しない。

## 5. Match Detail共通要件

試合メモ／タグはv1.0では表示、入力、編集しない。ゲーム履歴とスコア推移は既存保存データから復元し、根拠のない値を補完しない。

## 6. 互換性

保存データschema、localStorage、Backup、Restore、過去試合データ、Undo、保存取消ロジックを変更しない。既存値と既存イベントから表示時に算出する。

## 7. 受入条件

6競技のGame Result／Match Detail項目が本書の表と一致し、JPAの試合結果情報と分析情報が区別され、3Cにファールが表示されず、全競技のスコア推移・ゲーム履歴・Player 1実線／Player 2破線が維持されること。iPhone縦画面で横スクロールやカード崩れがないこと。
