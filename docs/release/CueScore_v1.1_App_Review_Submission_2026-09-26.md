# CueScore Apps v1.1 App Review Submission

- Date: 2026-09-26
- Result: `APP REVIEW SUBMITTED — WAITING FOR REVIEW`
- Product source: `39e3071f898c7af8499abbfee6f0043307699f6f`
- Candidate: `1.1 (79)`

## Submission

Product Owner approval was received to submit Version 1.1 Build 79. A fresh pre-submission App Store Connect API read-back at `2026-09-26T02:39:57.180Z` confirmed every required gate value before the mutation:

- App Store Version `1.1`: `READY_FOR_REVIEW`.
- Build `79`, ID `0b61e6fe-14b6-452a-bc2e-a6b2b02524d2`: `VALID` / `APP_STORE_ELIGIBLE`.
- Release type: `MANUAL`.
- Approved Japanese What's New matched exactly.
- App: JPN only; `availableInNewTerritories=false`.
- Review draft `ccca99c0-4ab6-4518-8133-58c51abe378e`: one Version 1.1 item, no IAP item.
- CueScore Pro: `APPROVED`, JPN only, `JPY 980`.
- Blocking errors detected: 0.

The submission was then sent through the App Store Connect API. The authoritative submitted timestamp is:

- UTC: `2026-09-26T02:40:12.101Z`
- JST: `2026-09-26 11:40:12.101 JST`

## Post-submission read-back

Read-back at `2026-09-26T02:40:41.508Z` confirmed:

| Field | Value |
| --- | --- |
| Submission ID | `ccca99c0-4ab6-4518-8133-58c51abe378e` |
| Submission state | `WAITING_FOR_REVIEW` |
| App Store Version ID | `33dfe87f-9b22-42b5-acff-ef52e3c6464e` |
| App Version state | `WAITING_FOR_REVIEW` |
| Submitted item count | `1` |
| Submitted item | iOS App Version `1.1` only |
| Selected build | `1.1 (79)` |
| Build ID | `0b61e6fe-14b6-452a-bc2e-a6b2b02524d2` |
| Build state | `VALID` / `APP_STORE_ELIGIBLE` |
| Release type | `MANUAL` |

The review-item resource itself continued to report `READY_FOR_REVIEW` immediately after submission, while both the parent submission and App Version were authoritatively `WAITING_FOR_REVIEW`. Its relationship remained exactly Version 1.1 and no IAP version was attached. This is recorded without rewriting the item state.

## What's New

```text
JPA 9-Ballの試合入力を改善しました。
・試合中にデッドボールの累計数を確認できるようになりました。
・ブレイクスクラッチ時などのデッドボール表示を統一しました。
```

## Availability and CueScore Pro

- App: JPN only; `availableInNewTerritories=false`.
- CueScore Pro product ID: `com.takaakimailboxstar.cuescoreapps.pro`.
- CueScore Pro: `NON_CONSUMABLE` / `APPROVED` / `JPY 980`.
- CueScore Pro availability: JPN only; `availableInNewTerritories=false`.
- CueScore Pro was not added to this update submission and was not changed.

## Boundary and STOP

Version 1.1 is now waiting for Apple review. No release, automatic-release change, Build 80, archive, upload, external TestFlight, metadata change, screenshot change, App Privacy change, CueScore Pro change, price or availability change, or public Version 1.0 operation was performed.

The next gate is Apple's review result. No Product Owner action is required while the state remains `WAITING_FOR_REVIEW`.
