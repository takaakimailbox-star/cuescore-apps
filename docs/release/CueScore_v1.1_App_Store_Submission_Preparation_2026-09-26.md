# CueScore Apps v1.1 App Store Submission Preparation

- Date: 2026-09-26
- Product source: `39e3071f898c7af8499abbfee6f0043307699f6f`
- Candidate: `1.1 (79)`
- Result: `READY FOR PRODUCT OWNER APP REVIEW SUBMISSION`
- App Review submitted: **No**

## App Store Version and build

App Store Connect Version `1.1` was created and read back as `READY_FOR_REVIEW`. Release type is `MANUAL`; automatic release is not enabled.

- App Store Version ID: `33dfe87f-9b22-42b5-acff-ef52e3c6464e`
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Selected build: `79`
- Build ID: `0b61e6fe-14b6-452a-bc2e-a6b2b02524d2`
- Build state: `VALID` / `APP_STORE_ELIGIBLE`
- `usesNonExemptEncryption=false`

Build 79 is the Product Owner accepted JPA 9-Ball Dead Ball UI candidate. No new archive, upload, Build 80, or product-source change was made during this preparation.

## What's New

The third proposed sentence about general stability and usability was omitted because the Build 79 product diff only supports the JPA Dead Ball changes. The exact Japanese release notes are:

```text
JPA 9-Ballの試合入力を改善しました。
・試合中にデッドボールの累計数を確認できるようになりました。
・ブレイクスクラッチ時などのデッドボール表示を統一しました。
```

## Existing metadata and screenshots

The Version 1.1 Japanese localization inherited the approved Version 1.0 metadata. Read-back confirmed that description, keywords, Support URL, and promotional text match Version 1.0. App name, subtitle, Privacy Policy URL, categories, and age-rating answers remain unchanged at the app-info level.

The inherited `APP_IPHONE_65` screenshot set contains six assets and all six are `COMPLETE`. No screenshot was created, replaced, or uploaded.

Public URLs returned HTTP 200:

- Support: `https://takaakimailbox-star.github.io/cuescore-apps/support.html`
- Privacy Policy: `https://takaakimailbox-star.github.io/cuescore-apps/privacy.html`
- Terms: `https://takaakimailbox-star.github.io/cuescore-apps/terms.html`

The public Japanese App Store page still reports that data is not collected. A direct authenticated App Store Connect App Privacy UI read-back was not available in the in-app browser session; no privacy answer was changed.

## Availability and CueScore Pro

- App availability: JPN only; `availableInNewTerritories=false`.
- CueScore Pro: `com.takaakimailboxstar.cuescoreapps.pro`.
- Type/state: `NON_CONSUMABLE` / `APPROVED`.
- IAP availability: JPN only; `availableInNewTerritories=false`.
- Active Japan price: `JPY 980`.

CueScore Pro is already approved and unchanged, so it was not added to the Version 1.1 review draft. Product ID, price, availability, and IAP metadata were not changed.

## Review submission draft

The previously known empty draft `ccca99c0-4ab6-4518-8133-58c51abe378e` was retained and prepared for this update instead of creating a duplicate draft. Before preparation it had zero items. Read-back after preparation confirmed:

- Submission state: `READY_FOR_REVIEW`.
- Submitted date: unset.
- Item count: 1.
- Item: iOS App Version `1.1` only.
- Item state: `READY_FOR_REVIEW`.
- IAP item: none.

The draft has **not** been submitted. Version 1.1 and its only review item being `READY_FOR_REVIEW`, together with the exact Build 79 relationship, confirms that App Store Connect reports no blocking required-field error at this gate.

The inherited review-contact details and review notes were not changed. The existing notes remain factual but include the historical phrase “Version 1.0”; this is non-blocking and was left untouched to avoid an unnecessary metadata change.

## Build 79 verification basis

No tests were rerun for this metadata-only preparation. Existing accepted Evidence remains the basis:

- Dead dedicated: `16 pass / 0 fail / 0 skipped`.
- JPA / Undo / in-progress / History / Backup focused: `64 pass / 0 fail / 0 skipped`.
- Full Node: `459 pass / 0 fail / 0 skipped`.
- Release Simulator Build: PASS.
- Apple validation: PASS.
- Internal TestFlight: `IN_BETA_TESTING`.
- Product Owner physical iPhone: ALL PASS for the explicitly recorded items.

Physical-iPhone PASS is not extended to scenarios the Product Owner did not execute. Dry scratch, 9-ball exclusion, interrupted-match restore, History, and Backup retain automated Evidence only.

## Final classification and STOP

### BLOCKER

- None detected.

### NON-BLOCKING

- Direct authenticated App Store Connect App Privacy UI could not be freshly read in the in-app browser. The public Japan App Store privacy disclosure, approved Version 1.0 Evidence, unchanged privacy answers, and unchanged product scope remain consistent.
- Inherited review notes mention Version 1.0; the statement remains true and is not a required-field or identity conflict.

### READY

- Version 1.1, Build 79, Japanese What's New, inherited metadata/screenshots, Japan-only availability, MANUAL release, and the one-item unsubmitted review draft have all been read back.

This gate stops immediately before `Submit for Review`. No App Review submission, release, external TestFlight distribution, source change, Build 80, archive, upload, IAP change, price change, availability change, or automatic-release change was performed.
