# CueScore Apps v1.2 Build 84 Manual Release

- Date: 2026-10-04 JST
- External GitHub baseline: `01151b9a20f00102bad19c8f60b3f972c932e809`
- Product source: `8783c5e2ef4a73405ea6334c268422f6964fc920`
- Gate result: `RELEASE EXECUTED / ASC READY_FOR_SALE / PUBLIC PROPAGATION PENDING`

## Conclusion

Product Owner approval was received to manually release only Version `1.2` / Build `84`. All release identity checks passed, and the official App Store Connect API accepted the manual release request with HTTP `201 Created`.

App Store Connect changed Version 1.2 to `READY_FOR_SALE`. The Japan App Store public catalog continued to return Version `1.1` during the immediate post-release checks, so public Version 1.2 propagation is not yet recorded as verified.

## Release preflight

Fresh read-back: `2026-10-04T05:08:59.759Z` (`2026-10-04 14:08:59.759 JST`).

- Submission ID: `935f4971-9fb9-43a9-ae28-7292bd693c7d`
- Submission state: `COMPLETE`
- Submitted items: `1`
- Review item: Version `1.2` / `APPROVED`
- App Store Version ID: `b794d928-74af-45e4-8342-65a570f294f2`
- App Version state: `PENDING_DEVELOPER_RELEASE`
- Release type: `MANUAL`
- Linked Build: `84`
- Build ID: `51ee69a0-e238-4382-9cbb-8529f4d0a682`
- Build state / audience: `VALID` / `APP_STORE_ELIGIBLE`
- `usesNonExemptEncryption`: `false`
- App availability: `JPN` only
- `availableInNewTerritories`: `false`
- CueScore Pro: `APPROVED` / `NON_CONSUMABLE` / `JPY 980` / JPN only
- Blocking identity mismatch: `0`

An initial safety-check invocation stopped before release because the review-item query did not request relationship expansion. No release request was sent by that invocation. The read-only guard was corrected to request `include=appStoreVersion`, and the complete identity was revalidated before release.

## Manual Release execution

- Official endpoint: `POST /v1/appStoreVersionReleaseRequests`
- Requested at: `2026-10-04T05:10:59.784Z` (`2026-10-04 14:10:59.784 JST`)
- Completed at: `2026-10-04T05:11:02.349Z` (`2026-10-04 14:11:02.349 JST`)
- HTTP result: `201 Created`
- Release request resource ID: `b794d928-74af-45e4-8342-65a570f294f2`
- Released resource: App Store Version `1.2`, Build `84`

No operation was performed on Version 1.1, Build 83, TestFlight, metadata, screenshots, Privacy, CueScore Pro, price, availability, or Score RC.

## Post-release App Store Connect read-back

First authoritative read-back: `2026-10-04T05:11:17.803Z` (`2026-10-04 14:11:17.803 JST`).

- Version 1.2 state: `READY_FOR_SALE`
- Version 1.2 → Build 84 relationship: retained
- Build 84: `VALID` / `APP_STORE_ELIGIBLE`
- Release type: `MANUAL`
- Submission: `COMPLETE`; only item `APPROVED`

Full post-release read-back: `2026-10-04T05:14:17.976Z` (`2026-10-04 14:14:17.976 JST`).

- App availability: `JPN` only
- `availableInNewTerritories`: `false`
- CueScore Pro: `com.takaakimailboxstar.cuescoreapps.pro`
- CueScore Pro state / type / price: `APPROVED` / `NON_CONSUMABLE` / `JPY 980`
- CueScore Pro availability: `JPN` only; `availableInNewTerritories=false`
- What's New: approved Version 1.2 text retained
- Screenshots: iPhone 6.5-inch `6/6 COMPLETE`

## Japan App Store public verification

Public page: `https://apps.apple.com/jp/app/cuescore-apps/id6802027038`

Repeated public checks were performed after release. At the final check, `2026-10-04T05:16:38.528Z` (`2026-10-04 14:16:38.528 JST`), Apple's Japan catalog API still returned:

- App: `CueScore Apps`
- Public version: `1.1`
- Current release date: `2026-09-26T22:15:57Z`
- Version 1.1 release notes
- Screenshot count: `6`

The public HTML retained:

- `データの収集なし`
- `データを収集しません`
- CueScore Pro
- `¥980`

Therefore:

- App Store Connect authoritative release state: `READY_FOR_SALE`
- Japan App Store public Version 1.2 display: `NOT YET VERIFIED`
- Version 1.2 What's New on the public page: `NOT YET VERIFIED`
- Public screenshots remain accessible, but their Version 1.2 association is `NOT YET VERIFIED`

This is classified as Apple public catalog propagation delay, not a product or release-request failure. A later read-only public verification is required before recording `PUBLIC RELEASE VERIFIED`.

## Boundary

- Product source changes: `0`
- Score RC changes: `0`
- Build 85: not created
- Archive / Upload / TestFlight changes: `0`
- Metadata / screenshots / Privacy / CueScore Pro / price / availability changes: `0`
- Direct Version 1.1 operations: `0`
- New feature work: not started

`RELEASE EXECUTED / PUBLIC PROPAGATION PENDING — STOP`
