# CueScore v1.0 Post-Build 2 Manual Turn Change UI Unification Spec

Status: Official Release
Publication date: 2026-08-18
Decision: `26_CueScore_v1.0_PostBuild2_ManualTurnChange_UI_Unification_Decision.md`

## Applicable disciplines and events

| Discipline | Foul | Safety | Manual switch wait |
| --- | --- | --- | --- |
| Rotation | Yes | Yes | Required |
| 9-Ball | Yes | Yes | Required |
| 10-Ball | Yes | Yes | Required |
| 14-1 | Yes | Yes | Required for ordinary events |
| JPA 9-Ball | Yes | Yes | Required |
| 3C | No change | No change | Outside scope |

14-1の3ファール成立時は既存の3ファール処理を優先する。

## Interaction contract

1. ファール／セーフティを現在Playerへ記録する。
2. `currentPlayer`を自動変更しない。
3. 交代待ち状態を保存対象snapshotへ含める。
4. 交代待ち中は、入球、ファール、セーフティ、JPAデッド、Push Outなど通常のゲーム入力を受け付けない。
5. 「交代」と既存Rotation方式で許可されているUndoは使用できる。
6. 「交代」は次Playerへ変更し、交代待ちを解除する。
7. 中断／再開、画面復帰、Undoでは既存Rotationのsnapshot復元契約を使用する。

## JPA Dead placement

- JPA 9-Ballで表示される操作ボタンのうち「デッド」を一番左に置く。
- 390px幅のiPhone縦画面で既存サイズと横overflowなしを維持する。
- Deadイベントの意味、得点、保存内容は変更しない。

## Acceptance criteria

- 対象5競技の通常ファール／セーフティ後に自動交代しない。
- 交代前は通常入力が無効、交代後は再び有効になる。
- Rotationの既存動作とUndo／中断snapshot互換を維持する。
- 14-1の得点および3ファール処理に回帰がない。
- JPAの得点、SL、Race、マッチポイント、Dead機能に回帰がない。
- 3Cにコード上の動作変更がない。
- 全自動テスト、native asset一致、iOS Debug／Release simulator buildをPASSする。

## Revision history

- 2026-08-18: Decision 26の実装契約と受入基準を初版発行。
