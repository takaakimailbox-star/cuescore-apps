# CueScore Current Report

- App: CueScore Apps
- Decision ID: `CUESCORE-V11-FINAL-RELEASE-AUDIT-20260927`
- Date: 2026-09-27
- Gate result: `READY FOR PRODUCT OWNER v1.1 MANUAL RELEASE / STOP`
- Released Version / Build: `1.0 (78)` unchanged

## Result

Product Owner-provided notice reports that Version 1.1 review completed and is eligible for distribution. A fresh authenticated App Store Connect browser read-back confirms Version 1.1 is `デベロッパによるリリース待ち` (Pending Developer Release), Build 79 is selected, and the enabled release button has not been activated. This Gate is ready for the Product Owner's Manual Release only.

## Evidence

- Dead dedicated scenarios: `16/16 PASS`（Node entry `17/17`）。
- JPA／Undo／in-progress／History／Backup focused: `64/64 PASS`。
- 全Node: `459/459 PASS`。
- Release Simulator Build: PASS。
- Visual: CSS viewport 390×844、summary `ラック 2 ｜ イニング 3 ｜ デッド 4`、既存Dead visual 4球、通常得点球④を維持。
- Source／native／Archive `index.html` SHA-256一致: `448d66f09a797e1fa6e5328709eefec315c71bbe46208054a8d2bcf500618af9`。
- Candidate Archive: `com.takaakimailboxstar.cuescoreapps` / `1.1 (79)`、UUID `080FD5E7-F806-3676-9AFD-500ED91C421B`、executable SHA-256 `98557ceec8924d56ccdaa462f868a5394cc220d2b83fcfc7eeb1b46b7ea386c4`、`.storekit` 0件。
- IPA SHA-256: `3db17894813a5d578840255c4629e04ae6027f2425cbc054aef6ce2d3e902e6f`。
- Apple validation: PASS、error 0。旧`90186`／`90062`解消。
- ASC read-back: Build 79 ID `0b61e6fe-14b6-452a-bc2e-a6b2b02524d2`、`VALID`／`APP_STORE_ELIGIBLE`／encryption false／internal `IN_BETA_TESTING`。
- Physical iPhone: Product Owner `ALL PASS / ALL OK`。screenshot Evidenceなし。
- dry scratch、9番除外、中断復元、History／Backupはautomated PASSのみで、physical deviceでは`NOT VERIFIED`。
- ASC Version 1.1 ID `33dfe87f-9b22-42b5-acff-ef52e3c6464e`、Build 79 ID `0b61e6fe-14b6-452a-bc2e-a6b2b02524d2`、release type `MANUAL`。
- Review submission `ccca99c0-4ab6-4518-8133-58c51abe378e`: `WAITING_FOR_REVIEW`、submitted `2026-09-26T02:40:12.101Z`、Version 1.1のみ1 item、IAP itemなし。
- Current Version 1.1 state, selected Build 79, exact What's New, and six screenshots were freshly read. App Privacy UI, separate CueScore Pro / availability pages, and Version 1.0 page remain `NOT VERIFIED` in this resumed browser session; their committed API Evidence is consistent and no change action was performed.

## Files and boundary

- Product: `index.html` and generated native web copy。
- Tests: `tests/jpa9-dead-ball-ui-implementation.test.mjs`。
- Docs: Official 99／100、CURRENT_STATE／STATUS、README、Prototype／Implementation Evidence、handoff、and `docs/release/CueScore_v1.1_Final_PreRelease_Audit_2026-09-27.md`.
- Build 79 source commit: `39e3071f898c7af8499abbfee6f0043307699f6f`、GitHub mainへpush済み。
- Build 79 Archive／IPA／Upload／Internal TestFlight: 完了。
- App Store Version 1.1 preparation／App Review submission are documented as complete. External TestFlight、公開Build 78、Release: 未操作。
- Release、automatic release変更、External TestFlight、Build 80は未実施。次GateはProduct Owner Manual Release後のread-only public-release verification。
