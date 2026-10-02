# CueScore Current Report

- App: CueScore Apps
- Decision ID: `CUESCORE-1.2-BUILD84-APP-STORE-ELIGIBLE-INTERNAL-TESTFLIGHT-20261003`
- Date: 2026-10-03
- Baseline / GitHub main: `b076e5e8b25be7a91c1e3e373923be70119a0d80`
- Build 84 Product Source Commit: `8783c5e2ef4a73405ea6334c268422f6964fc920`
- App Store Connect Build ID: `51ee69a0-e238-4382-9cbb-8529f4d0a682`
- App Store Version ID: `b794d928-74af-45e4-8342-65a570f294f2`
- Review Submission ID: `ae69d05f-3f0c-4f10-bcb0-b72893db66f1`
- Gate result: `BUILD 84 VALID / APP_STORE_ELIGIBLE / INTERNAL TESTFLIGHT AVAILABLE / PRODUCT OWNER FINAL SMOKE PENDING`

## Result

Physical Accepted済みBuild 84 sourceを変更せずfresh regression、runtime Sender／Receiver E2E、native sync、Simulator／Archive、Apple validation／Uploadまで完了した。Build 84は`VALID`／`APP_STORE_ELIGIBLE`／`IN_BETA_TESTING`で、Product OwnerがInternal TestFlightから`1.2 (84)`を取得できる。

## Evidence

- Build 84 source: privacy allow-list export、QR成功後の`sharedMatchId`保存、Receiver native-start後のScanner表示、Settings-only denied UI。
- Automated: Build 84 dedicated `13/13`、Match Sharing `122/122`、related focused `67/67`、Full Node `609/609`、native foundation `6/6`、FAIL／SKIPPED `0/0`。
- Runtime: production DOM Sender click→Single QR、およびReceiver click→authorization→native scanner start requestをfresh PASS。
- Native parity、Release Simulator Build、Release device Archive、Apple validation／Upload: PASS。Archive／IPA `.storekit`: 0。
- ASC: Build 84 ID `51ee69a0-e238-4382-9cbb-8529f4d0a682`、`VALID`／`APP_STORE_ELIGIBLE`／`usesNonExemptEncryption=false`／Internal `IN_BETA_TESTING`。

## Boundary / STOP

Build 84はInternal TestFlightまで。Version 1.2 Review Build差替え、App Review再提出、Release、External TestFlight、Build 85は未実施。Build 83と公開Version 1.1変更0。次はProduct Owner Final Smoke。
