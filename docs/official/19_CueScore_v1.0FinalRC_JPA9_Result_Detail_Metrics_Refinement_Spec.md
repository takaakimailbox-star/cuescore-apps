# CueScore Apps v1.0 Final RC — JPA 9-Ball Result / Detail Metrics整理仕様

Status: Official Addendum  
Publication date: 2026年8月13日  
Supersedes: `17_CueScore_v1.0FinalRC_GameResult_MatchDetail_CommonLayout_Spec.md` のJPA情報配置  
Authority: `18_CueScore_v1.0FinalRC_JPA9_Result_Detail_Metrics_Refinement_Decision.md`

## 1. 上部試合結果情報

Game Result／Match Detail共通でPlayer名、Avatar、SL、Race／先取点、最終取得点、マッチポイントを表示する。最終取得点は左右の最終スコア、マッチポイントは中央値として表示する。

## 2. Metricsカード

下部の共通Metricsカードは次の5行をこの順で表示する。

1. イニング
2. セーフティ
3. アベレージ
4. ハイラン
5. ファール

SL、Race／先取点、最終取得点、マッチポイントはMetricsカードへ含めない。「試合結果情報」「分析情報」の見出しを表示しない。

## 3. 共通化と画面差分

`openMatchDetailV1(recordId, options)`を共通rendererとして維持する。Game Resultモードではゲーム履歴と削除UIを生成せず3アクションを表示する。Match Detailモードではゲーム履歴、削除UI、削除説明文を表示する。

## 4. 非変更事項

JPAマッチポイント計算、20点配分、Player順、スコア推移生成、保存schemaを変更しない。他5競技の条件、Metrics、スコア推移を変更しない。

## 5. 受入条件

両画面のJPA上部情報と5行Metricsが一致し、重複項目と旧見出しがなく、Game Result／Match Detail固有の下部差分、スコア推移、保存互換性が維持されること。
