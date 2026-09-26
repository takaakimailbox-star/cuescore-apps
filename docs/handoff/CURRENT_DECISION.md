# CueScore Current Decision

- Decision ID: `CUESCORE-V11-FINAL-RELEASE-AUDIT-20260927`
- Date: 2026-09-27
- Product Owner instruction: perform a read-only final audit before Manual Release of Version 1.1 / Build 79
- Gate: `READY FOR PRODUCT OWNER v1.1 MANUAL RELEASE / STOP`

## Audit boundary

- Do not release, enable automatic release, create Build 80, archive, upload, or change metadata, screenshots, Privacy, CueScore Pro, price, availability, Version 1.0, or product source.
- Read current App Store Connect values only. Fresh authenticated read-back confirms Version 1.1 is Pending Developer Release; this Decision does not authorize Codex to release it.
- Candidate identity to verify: Version `1.1`, Build `79`, Build ID `0b61e6fe-14b6-452a-bc2e-a6b2b02524d2`, Submission `ccca99c0-4ab6-4518-8133-58c51abe378e`, Bundle ID `com.takaakimailboxstar.cuescoreapps`, source commit `39e3071f898c7af8499abbfee6f0043307699f6f`.

## Scope retained from the approved implementation

- JPA 9-Ballだけ、ゲーム中に`ラック ｜ イニング ｜ デッド`を常時表示する。
- 通常`ball_dead`とbreak foul／scratchの`break_result.data.deadBalls`から1〜8番を試合累計し、Foul／scratch flag自体、dry scratch、9番は数えない。
- 同一event＋球番号の重複を除外し、Undo-awareな`commonEventsV7`から再計算する。保存schemaを追加しない。
- live historyとMatch Detailは通常Deadを含む全Deadへ既存`CueScoreBallIcon.html(...,{size:"history",state:"used"})`を共通適用する。
- `DEAD`label、badge、×印、新しいopacity／filter／色／サイズ、履歴順序／spacing変更は追加しない。
- 他5競技、Analytics式、JPA SL／Race／得点、Player／History／Backup schemaを変更しない。

## Existing verification and packaging

- Dedicated Dead scenarios: `16 pass / 0 fail / 0 skipped`（Node entry `17/17`）。
- Combined focused: `64 pass / 0 fail / 0 skipped`。
- Full Node: `459 pass / 0 fail / 0 skipped`。
- Release Simulator build、device Archive、App Store IPA export: PASS with the fixed dependency identity。
- 390×844 visual: PASS。summary Dead 4、history `state="used"` 4球、横overflowなし。
- Archive: `com.takaakimailboxstar.cuescoreapps` / `1.1 (79)`、UUID `080FD5E7-F806-3676-9AFD-500ED91C421B`、`.storekit` 0件。

## STOP

- The API credential remains unavailable for automation (`401 NOT_AUTHORIZED`), but the Product Owner's authenticated App Store Connect browser read-back shows Version 1.1 Pending Developer Release, Build 79 selected, the release button untouched, exact What's New, and six screenshots.
- Stop without Manual Release. The next action belongs to the Product Owner: select the existing Version 1.1 release button without changing settings. Codex must perform a separate read-only post-release verification afterward.
