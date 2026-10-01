# CueScore Current Report

- App: CueScore Apps
- Decision ID: `CUESCORE-1.2-BUILD80-INTERNAL-TESTFLIGHT-20261001`
- Date: 2026-10-01
- Baseline: `d1ba8b7fa8821e7f93a10b3b54dde0984b5e703e`
- Product Source commit: `810a9e134c5de1e033eb644027c37f51834fd6d4`
- Gate result: `VERSION 1.2 BUILD 80 INTERNAL TESTFLIGHT AVAILABLE / PRODUCT OWNER VERIFICATION PENDING / APP_STORE_ELIGIBLE NOT SATISFIED`

## Result

凍結済みVersion 1.2 Build 80 sourceを正式native syncし、fresh test、Release device Archive、Apple Uploadを実施した。Build ID `0851e2bb-b9dc-47b3-bab6-04d3f687e200`は`VALID`／`IN_BETA_TESTING`で、Internal group `CueScore Internal Testers`からProduct Ownerが取得可能。製品source、Version／Build、公開Version 1.1は変更していない。Build audienceだけは要求の`APP_STORE_ELIGIBLE`ではなく`INTERNAL_ONLY`で、Apple APIにより後変更不可と確認した。

## Evidence

- Cache / version focused: `42 PASS / 0 FAIL / 0 SKIPPED`
- Player Delete dedicated: `11 PASS / 0 FAIL / 0 SKIPPED`
- Match Sharing focused: `109 PASS / 0 FAIL / 0 SKIPPED`
- Integration focused: `102 PASS / 0 FAIL / 0 SKIPPED`
- Native foundation: `6 PASS / 0 FAIL / 0 SKIPPED`
- Full Node: `578 PASS / 0 FAIL / 0 SKIPPED`
- Release Simulator: PASS; product Bundle ID `com.takaakimailboxstar.cuescoreapps`; `1.2 (80)`; `.storekit` 0
- Native parity: PASS; source／native-web／iOS public／built App `index.html` SHA-256 `9cbeaaf799502ba68859cde484bab333c3da3c91b5c49543c7ab2c3111169e9c`
- `git diff --check`: PASS
- Release device Archive: PASS; App / dSYM UUID `632DAB3A-DFD1-3A32-B10F-B27CE6B0EB5D`; executable SHA-256 `f7d30575f30469f58c5f8023c9b6848c4fff082b58918172529d537f7e33571a`
- Apple Upload / processing: PASS; Build 80 `VALID`; `usesNonExemptEncryption=false`; Internal `IN_BETA_TESTING`
- Internal TestFlight: `CueScore Internal Testers` includes Build 80; tester count 1
- Boundary: public Version 1.1 unchanged; App Store Version 1.2 does not exist; External TestFlight / App Review / Release not started
- FAIL: Build audience `INTERNAL_ONLY`; requested `APP_STORE_ELIGIBLE` not satisfied and not mutable after upload

## Boundary / STOP

Build 80がInternal TestFlightで取得可能になったためSTOP。次GateはProduct Owner physical iPhone verification。Build 81、App Store Version 1.2、External TestFlight、App Review、Releaseへ進まない。
