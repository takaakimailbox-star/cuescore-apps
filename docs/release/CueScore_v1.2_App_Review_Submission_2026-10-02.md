# CueScore Apps v1.2 App Review Submission

- Date: 2026-10-02
- Result: `APP REVIEW SUBMITTED — WAITING FOR REVIEW`
- Product source: `1fc69c80370620b4db0448ecbcea1f5d28f003ca`
- Candidate: `1.2 (83)`

## Submission

Product Owner approval was received to submit Version 1.2 Build 83. A fresh pre-submission App Store Connect API read-back at `2026-10-02T05:49:07.765Z` confirmed every required gate value before submission:

- App Store Version `1.2`: `READY_FOR_REVIEW`.
- Build `83`, ID `f45b388a-9268-4d94-aa7a-56c4299799c1`: `VALID` / `APP_STORE_ELIGIBLE`.
- Review Submission `ae69d05f-3f0c-4f10-bcb0-b72893db66f1`: one Version 1.2 item only.
- Release type: `MANUAL`.
- App: JPN only; `availableInNewTerritories=false`.
- CueScore Pro: `APPROVED` / `NON_CONSUMABLE` / JPN only / `JPY 980`.
- Blocking errors detected: `0`.

An initial attempt against an unsupported action-path URL returned HTTP 404 and did not change the submission. The official App Store Connect API submission operation was then performed by modifying the review submission with `submitted=true`; Apple returned HTTP 200.

The authoritative submitted timestamp is:

- UTC: `2026-10-02T05:50:15.919Z`
- JST: `2026-10-02 14:50:15.919 JST`

## Post-submission read-back

Fresh read-back at `2026-10-02T05:50:35.154Z` confirmed:

| Field | Value |
| --- | --- |
| Submission ID | `ae69d05f-3f0c-4f10-bcb0-b72893db66f1` |
| Submission state | `WAITING_FOR_REVIEW` |
| App Store Version ID | `b794d928-74af-45e4-8342-65a570f294f2` |
| App Version state | `WAITING_FOR_REVIEW` |
| Submitted item count | `1` |
| Submitted item | iOS App Version `1.2` only |
| Selected build | `1.2 (83)` |
| Build ID | `f45b388a-9268-4d94-aa7a-56c4299799c1` |
| Build state | `VALID` / `APP_STORE_ELIGIBLE` |
| Release type | `MANUAL` |

The review-item resource continued to report `READY_FOR_REVIEW` immediately after submission, while both the parent submission and App Version were authoritatively `WAITING_FOR_REVIEW`. Its relationship remained exactly Version 1.2; no IAP version was attached.

## Submitted What's New

```text
試合記録の共有とプレーヤー管理を改善しました。
・完了した試合をQRコードで別のCueScore Appsへ共有できるようになりました。
・プレーヤーの削除や並び順、一覧表示を改善しました。
・中断中の試合の再開画面など、表示と操作性を改善しました。
```

## Availability and CueScore Pro

- App: JPN only; `availableInNewTerritories=false`.
- CueScore Pro product ID: `com.takaakimailboxstar.cuescoreapps.pro`.
- CueScore Pro: `NON_CONSUMABLE` / `APPROVED` / `JPY 980`.
- CueScore Pro availability: JPN only; `availableInNewTerritories=false`.
- CueScore Pro was not added to this update submission and was not changed.

## Boundary and STOP

Version 1.2 is waiting for Apple review. Release type remains `MANUAL`; no general release was performed. No product-source change, Build 84, archive, upload, metadata change after preparation, screenshot change, App Privacy change, CueScore Pro change, price or availability change, automatic-release change, external TestFlight operation, or public Version 1.1 operation was performed.

The next gate is Apple's review result. No Product Owner action is required while the state remains `WAITING_FOR_REVIEW`.
