# CueScore Current Report

- App: CueScore Apps
- Decision ID: `CUESCORE-1.2-BUILD80-PLAYER-LIST-BOTTOM-NAV-FIX-20261001`
- Date: 2026-10-01
- Baseline: `d1ba8b7fa8821e7f93a10b3b54dde0984b5e703e`
- Product Source commit: `810a9e134c5de1e033eb644027c37f51834fd6d4`
- Player List Fix Product Source Commit: `7e2beb0ade0685ff331fa808273e00e6f832bd2c`
- Gate result: `IMPLEMENTATION FIX COMPLETE / SIMULATOR VERIFICATION PASS / PRODUCT OWNER RE-TEST REQUIRED`

## Result

Internal TestFlight Build 80のPlayer一覧physical FAILを受け、実scroll owner不一致を修正した。Bottom Navigation reserve、scroll保存、root resetを`.player-library-list`へ揃え、Player末尾がNavigation上まで安定してscrollできることを390×844で確認した。試合履歴一覧も同時監査し、既存clearanceで最終試合がNavigation上に収まるため同症状なし。既存Build 80は修正前sourceであり、physical PASSとは記録しない。

## Evidence

- Player list / Navigation focused: `15 PASS / 0 FAIL / 0 SKIPPED`
- Player Delete dedicated: `11 PASS / 0 FAIL / 0 SKIPPED`
- Match Sharing focused: `109 PASS / 0 FAIL / 0 SKIPPED`
- Full Node: `583 PASS / 0 FAIL / 0 SKIPPED`
- 390×844: Player 7／12 final gap 19pt; History 12 final gap 23pt; final edit target 44×56; scroll stable
- Release Simulator: PASS; product Bundle ID `com.takaakimailboxstar.cuescoreapps`; `1.2 (80)`; `.storekit` 0
- Native parity: PASS; source／native-web／iOS public／built App `index.html` SHA-256 `b3c28ddc51ec9c45ed0b9dd6c397621654e5667512675258dc9236bb2ce1ec25`
- `git diff --check`: PASS

### Existing Build 80 Distribution State（unchanged in this Gate）

- Release device Archive: PASS; App / dSYM UUID `632DAB3A-DFD1-3A32-B10F-B27CE6B0EB5D`; executable SHA-256 `f7d30575f30469f58c5f8023c9b6848c4fff082b58918172529d537f7e33571a`
- Apple Upload / processing: PASS; Build 80 `VALID`; `usesNonExemptEncryption=false`; Internal `IN_BETA_TESTING`
- Internal TestFlight: `CueScore Internal Testers` includes Build 80; tester count 1
- Boundary: public Version 1.1 unchanged; App Store Version 1.2 does not exist; External TestFlight / App Review / Release not started
- FAIL: Build audience `INTERNAL_ONLY`; requested `APP_STORE_ELIGIBLE` not satisfied and not mutable after upload

## Boundary / STOP

修正、Tests、Visual、native parity、Release Simulator BuildまででSTOP。commit／push、Build 81、Archive、Upload、TestFlight、App Store Connectへ進まない。次Gateはcommit/pushと配布Build番号の独立承認後、Product Owner physical re-test。
