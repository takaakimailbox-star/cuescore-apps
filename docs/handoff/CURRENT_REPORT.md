# CueScore Current Report

- App: CueScore Apps
- Decision ID: `CUESCORE-1.2-BUILD84-APP-REVIEW-RESUBMISSION-20261003`
- Date: 2026-10-03
- Baseline / GitHub main: `1ca1e50a06bfed6fccc55373b65a1998378ef4ae`
- Build 84 Product Source Commit: `8783c5e2ef4a73405ea6334c268422f6964fc920`
- App Store Connect Build ID: `51ee69a0-e238-4382-9cbb-8529f4d0a682`
- App Store Version ID: `b794d928-74af-45e4-8342-65a570f294f2`
- Review Submission ID: `935f4971-9fb9-43a9-ae28-7292bd693c7d`
- Gate result: `APP REVIEW RESUBMITTED — WAITING FOR REVIEW`

## Result

Product Ownerの明示承認後、製品sourceを変更せず、Version 1.2／Build 84をApp Reviewへ再提出した。Apple authoritative submitted timestampは`2026-10-03T02:18:14.384Z`（`2026-10-03 11:18:14.384 JST`）。SubmissionとApp Versionは`WAITING_FOR_REVIEW`。

## Evidence

- Build 84 source: privacy allow-list export、QR成功後の`sharedMatchId`保存、Receiver native-start後のScanner表示、Settings-only denied UI。
- Automated: Build 84 dedicated `13/13`、Match Sharing `122/122`、related focused `67/67`、Full Node `609/609`、native foundation `6/6`、FAIL／SKIPPED `0/0`。
- Runtime: production DOM Sender click→Single QR、およびReceiver click→authorization→native scanner start requestをfresh PASS。
- Native parity、Release Simulator Build、Release device Archive、Apple validation／Upload: PASS。Archive／IPA `.storekit`: 0。
- ASC: Build 84 ID `51ee69a0-e238-4382-9cbb-8529f4d0a682`、`VALID`／`APP_STORE_ELIGIBLE`／`usesNonExemptEncryption=false`／Internal `IN_BETA_TESTING`。
- Version 1.2: Build 84 selected、release `MANUAL`、What's New／Review Notes／metadata変更0、screenshots `6/6 COMPLETE`。
- Store: JPN only、CueScore Pro `APPROVED`／`NON_CONSUMABLE`／`JPY 980`、App Privacy整合、公開URL 5/5 HTTP 200。
- Review Submission `935f4971-9fb9-43a9-ae28-7292bd693c7d`: Version 1.2のみ1 item、CueScore Pro item 0、`WAITING_FOR_REVIEW`、blocking error 0。

## Boundary / STOP

Release、Automatic Release、External TestFlight、Build 85は未実施。Build 83と公開Version 1.1変更0。次はApple審査結果待ち。
