# CueScore Current Decision

- Decision ID: `CUESCORE-V11-APP-STORE-SUBMISSION-PREPARATION-20260926`
- Date: 2026-09-26
- Product Owner instruction: prepare App Store Version 1.1 with Build 79 and stop immediately before App Review submission
- Gate: `READY FOR PRODUCT OWNER APP REVIEW SUBMISSION / STOP`

## App Store preparation

- App Store Version `1.1` created and Build `79` selected; exact Build ID is `0b61e6fe-14b6-452a-bc2e-a6b2b02524d2`.
- Release type is `MANUAL`; App and CueScore Pro remain JPN only with `availableInNewTerritories=false`.
- Japanese What's New is limited to JPA Dead cumulative display and break-scratch Dead visual unification. Approved Version 1.0 metadata and six screenshots are inherited unchanged.
- Review draft `ccca99c0-4ab6-4518-8133-58c51abe378e` contains one `READY_FOR_REVIEW` item: iOS App Version 1.1. It is not submitted. Approved CueScore Pro is not re-added.

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

- Product Owner physical iPhone: Version、cold launch／Home、JPA Dead summary、normal Dead、break scratch Dead visual／count、Undo history／countをALL PASS。
- dry scratch、9番除外、中断復元、History／Backupはautomated Evidenceのみ。physical iPhone PASSへ拡張しない。screenshot Evidenceなし。
- Build 79 source commit／push、Test、Archive、IPA export、Apple validation、Upload、Internal TestFlight、Product Owner verificationまで完了。
- Build ID `0b61e6fe-14b6-452a-bc2e-a6b2b02524d2`は`VALID`／`APP_STORE_ELIGIBLE`／internal `IN_BETA_TESTING`を維持。
- 公開済みVersion 1.0 Build 78は変更しない。
- App Store Version 1.1 preparation is complete. `Submit for Review`、App Review submission、External TestFlight、Release、Build 80は実施しない。次GateはProduct Ownerによる提出承認。
