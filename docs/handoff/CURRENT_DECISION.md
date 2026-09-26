# CueScore Current Decision

- Decision ID: `CUESCORE-BUILD79-V1.1-INTERNAL-TESTFLIGHT-20260926`
- Date: 2026-09-26
- Product Owner instruction: retry the accepted JPA 9-Ball Dead Ball UI as Marketing Version 1.1 Build 79 for Internal TestFlight only
- Gate: `READY FOR PRODUCT OWNER BUILD 79 INTERNAL TESTFLIGHT REVIEW / STOP`

## Implemented behavior

- JPA 9-Ballだけ、ゲーム中に`ラック ｜ イニング ｜ デッド`を常時表示する。
- 通常`ball_dead`とbreak foul／scratchの`break_result.data.deadBalls`から1〜8番を試合累計し、Foul／scratch flag自体、dry scratch、9番は数えない。
- 同一event＋球番号の重複を除外し、Undo-awareな`commonEventsV7`から再計算する。保存schemaを追加しない。
- live historyとMatch Detailは通常Deadを含む全Deadへ既存`CueScoreBallIcon.html(...,{size:"history",state:"used"})`を共通適用する。
- `DEAD`label、badge、×印、新しいopacity／filter／色／サイズ、履歴順序／spacing変更は追加しない。
- 他5競技、Analytics式、JPA SL／Race／得点、Player／History／Backup schemaを変更しない。

## Verification and packaging

- Dedicated Dead scenarios: `16 pass / 0 fail / 0 skipped`（Node entry `17/17`）。
- Combined focused: `64 pass / 0 fail / 0 skipped`。
- Full Node: `459 pass / 0 fail / 0 skipped`。
- Release Simulator build、device Archive、App Store IPA export: PASS with the fixed dependency identity。
- 390×844 visual: PASS。summary Dead 4、history `state="used"` 4球、横overflowなし。
- Archive: `com.takaakimailboxstar.cuescoreapps` / `1.1 (79)`、UUID `080FD5E7-F806-3676-9AFD-500ED91C421B`、`.storekit` 0件。

## Boundary / STOP

- Build 79 source commit／push、Test、Archive、IPA export、Apple validation、Uploadまで完了。
- Version 1.1 validationはerror 0。旧`90186`／`90062`は解消。
- Build ID `0b61e6fe-14b6-452a-bc2e-a6b2b02524d2`は`VALID`／`APP_STORE_ELIGIBLE`／internal `IN_BETA_TESTING`。
- 公開済みVersion 1.0 Build 78は変更しない。
- App Store Version 1.1、App Review、External TestFlight、Releaseは開始しない。次GateはProduct Owner実機確認。
