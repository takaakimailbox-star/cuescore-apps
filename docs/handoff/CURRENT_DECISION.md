# CueScore Current Decision

- Decision ID: `CUESCORE-JPA9-DEAD-BALL-UI-IMPLEMENTATION-20260926`
- Date: 2026-09-26
- Product Owner instruction: implement the approved JPA 9-Ball cumulative Dead Ball UI without a new Dead visual or schema
- Gate: `IMPLEMENTATION COMPLETE / PRODUCT OWNER ACCEPTED / UNRELEASED / STOP`

## Implemented behavior

- JPA 9-Ballだけ、ゲーム中に`ラック ｜ イニング ｜ デッド`を常時表示する。
- 通常`ball_dead`とbreak foul／scratchの`break_result.data.deadBalls`から1〜8番を試合累計し、Foul／scratch flag自体、dry scratch、9番は数えない。
- 同一event＋球番号の重複を除外し、Undo-awareな`commonEventsV7`から再計算する。保存schemaを追加しない。
- live historyとMatch Detailは通常Deadを含む全Deadへ既存`CueScoreBallIcon.html(...,{size:"history",state:"used"})`を共通適用する。
- `DEAD`label、badge、×印、新しいopacity／filter／色／サイズ、履歴順序／spacing変更は追加しない。
- 他5競技、Analytics式、JPA SL／Race／得点、Player／History／Backup schemaを変更しない。

## Verification

- Dedicated Dead: `16 pass / 0 fail / 0 skipped`。
- Combined focused: `58 pass / 0 fail / 0 skipped`。
- Full Node: `459 pass / 0 fail / 0 skipped`。
- Release Simulator build: PASS with the fixed Build 78 dependency identity。
- 390×844 visual: PASS。summary Dead 4、history `state="used"` 4球、横overflowなし。

## Boundary / STOP

- Implementation、Test、Evidence、Product Owner Acceptance、commit／pushまで完了してSTOP。
- 実装は未配布。次Gateは将来Buildへの収載判断。
- Build番号は78のまま。Build 79、Archive、TestFlight、App Store Connect、Version 1.1は開始しない。
- 公開済みVersion 1.0 Build 78は変更しない。
