# CueScore v1.0 — iPhone UI / Back Fix Specification

- Status: Official Specification
- Adopted: 2026-08-27
- Approval: Product Owner
- Implements: Official Decision 048

## Opponent Records

- headerはsmall avatar、選択Player名、固定競技icon／textで構成する。
- headerは白い角丸cardとして表示しない。競技selector／chevron、summary、sort controlを表示しない。
- 対戦相手だけを白い一覧cardにし、採用済みの最新対戦順とstable ID tie-breakを維持する。
- 長いPlayer名はellipsisとし、390px幅で横overflowを発生させない。

## Opponent-fixed History

- 順序はtitle、compact Player vs Opponent、aggregate、月別履歴。
- Player vs Opponentはsmall avatar、Player名、`vs`、small avatar、Opponent名だけ。競技icon／textを表示しない。
- match cardは日付／時刻、勝ち／負け、score、race／target、right chevronだけ。競技icon／text、Opponent avatar／name、詳細／分析buttonを表示しない。
- card全体をMatch Detail入口とし、一行中心、補助race行、最小高さ48pxを基準とする。

## Player History

- 期間、詳細、分析buttonを表示しない。
- 競技名、日付／時刻、勝敗、Opponent名、score、race／target、right chevronを保持する。大きな競技iconとOpponent avatarは表示しない。
- card全体をMatch Detail入口とし、一行中心、補助情報行、最小高さ54pxを基準とする。

## Match Detail Back

- 相手固定履歴またはPlayer履歴のcardを開く直前に、history originとOpponent contextを保持する。
- 左上Backとedge Swipe Backは表示中の`recordDetailBackBtn`を経由し、同じclose／restore処理を呼ぶ。
- 相手固定履歴からは同一Player／Opponent／Disciplineの履歴へ、Player履歴からは同一Player履歴へ戻す。
- 他のMatch Detail入口はoriginを上書きせず、既存の戻り先を維持する。

## Compatibility

表示とruntime navigation contextだけを変更する。saved record、Player schema、計算関数、試合結果、Match Detail本文、削除処理、Backup／Restoreを変更しない。
