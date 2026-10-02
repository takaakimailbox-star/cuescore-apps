# CueScore Current Report

- App: CueScore Apps
- Decision ID: `CUESCORE-1.2-APP-REVIEW-SUBMISSION-20261002`
- Date: 2026-10-02
- Baseline / GitHub main: `32e19aa5d4bb4e9d701fb04448a99a605b1644d3`
- Build 83 Source Commit: `1fc69c80370620b4db0448ecbcea1f5d28f003ca`
- App Store Connect Build ID: `f45b388a-9268-4d94-aa7a-56c4299799c1`
- App Store Version ID: `b794d928-74af-45e4-8342-65a570f294f2`
- Review Submission ID: `ae69d05f-3f0c-4f10-bcb0-b72893db66f1`
- Gate result: `APP REVIEW SUBMITTED — WAITING FOR REVIEW`

## Result

提出直前read-backで要求identityが全件一致したため、Version 1.2／Build 83のReview SubmissionをApple公式APIで提出した。AppleはHTTP 200で受理し、Submission／App Versionを`WAITING_FOR_REVIEW`としてread-backした。

## Evidence

- Submitted timestamp: `2026-10-02T05:50:15.919Z` / `2026-10-02 14:50:15.919 JST`。
- Submission／Version state: `WAITING_FOR_REVIEW`。
- Submitted item: Version 1.2 only、1件。review-item resource直後stateは`READY_FOR_REVIEW`。
- Build relationship: Version `1.2` → Build `83` / `VALID` / `APP_STORE_ELIGIBLE`。
- Release type: `MANUAL`。Japan only。CueScore Pro `APPROVED`／`NON_CONSUMABLE`／`JPY 980`。
- Product source、Build、metadata、screenshots、Privacy、IAP、price、availabilityは変更なし。

## Boundary / STOP

Apple審査結果待ち。Release未実施、Automatic Release未設定、Build 84未作成、Archive／Upload未実施、公開Version 1.1変更0。
