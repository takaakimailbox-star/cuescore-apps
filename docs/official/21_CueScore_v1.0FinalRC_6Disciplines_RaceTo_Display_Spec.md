# CueScore Apps v1.0 Final RC — 6競技 Race to表示統一仕様

Status: Official Addendum
Publication date: 2026年8月13日
Supersedes: `17_CueScore_v1.0FinalRC_GameResult_MatchDetail_CommonLayout_Spec.md` および `19_CueScore_v1.0FinalRC_JPA9_Result_Detail_Metrics_Refinement_Spec.md` の試合条件表示ラベル
Authority: `20_CueScore_v1.0FinalRC_6Disciplines_RaceTo_Display_Decision.md`

## 1. 表示契約

`openMatchDetailV1(recordId, options)`は全競技・両画面で `Race to X-Y` を表示する。XはPlayer 1のgoal、YはPlayer 2のgoalを使用する。一方しか保存されていない共通目標データでは、その値を左右へ表示する。

## 2. 競技別値

- 9-Ball／10-Ball: Player別Race設定。
- Rotation: Player別目標点。共通目標点は同値を左右表示。
- JPA 9-Ball: SLに対応する既存先取点。
- Straight Pool（14.1）: Player別目標点。共通目標点は同値を左右表示。
- Three Cushion（3C）: Player別持ち点。

## 3. 廃止表示

Game Result／Match Detailの条件行では「最終ラック数」「目標点」「Race／先取点」「持ち点」およびスラッシュ区切りを出力しない。最終スコア、JPAのSL・マッチポイント、Metricsは維持する。

## 4. 互換性

表示時の文字列生成のみを変更する。保存schema、localStorage、Backup／Restore、既存record、各競技のgoal値、勝敗判定、Undo、スコア推移を変更しない。

## 5. 受入条件

6競技のGame ResultとMatch Detailが同じ `Race to X-Y` を表示し、旧ラベルを表示せず、内部goalと保存互換性が維持されること。
