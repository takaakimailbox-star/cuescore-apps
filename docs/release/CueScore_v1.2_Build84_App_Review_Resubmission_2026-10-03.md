# CueScore Version 1.2 Build 84 — App Review Resubmission Evidence

- Date: 2026-10-03 JST
- Gate: `APP REVIEW RESUBMITTED — WAITING FOR REVIEW`
- External GitHub baseline: `1ca1e50a06bfed6fccc55373b65a1998378ef4ae`
- Product Source commit: `8783c5e2ef4a73405ea6334c268422f6964fc920`
- App Store Version ID: `b794d928-74af-45e4-8342-65a570f294f2`
- Build 84 ID: `51ee69a0-e238-4382-9cbb-8529f4d0a682`
- Review Submission ID: `935f4971-9fb9-43a9-ae28-7292bd693c7d`

## Product Owner approval and accepted evidence

Product Owner explicitly approved App Review resubmission for Version `1.2` / Build `84` using the prepared content without metadata changes. Internal TestFlight Build 84 Final Smoke was already `4/4 PASS`; Camera Permission denied UI and Settings recovery were previously Physical RC accepted.

Existing automated evidence for the unchanged Product Source remains:

- Build 84 plus Camera UI `13/13 PASS`.
- Match Sharing `122/122 PASS`.
- Player / Navigation / Native `67/67 PASS`.
- Full Node `609/609 PASS`; FAIL / SKIPPED `0/0`.
- Runtime Sender and Receiver E2E, native parity, Release Simulator Build, Release device Archive, and Apple validation PASS.
- `.storekit` 0.

These tests were not rerun during this submission-only gate.

## Submit preflight

Immediately before submission, App Store Connect was read back and matched the approved identity:

- Version `1.2`, Version ID `b794d928-74af-45e4-8342-65a570f294f2`, state `READY_FOR_REVIEW`.
- Selected Build `84`, Build ID `51ee69a0-e238-4382-9cbb-8529f4d0a682`.
- Build `VALID`, `APP_STORE_ELIGIBLE`, `usesNonExemptEncryption=false`.
- Review Submission `935f4971-9fb9-43a9-ae28-7292bd693c7d`, Version 1.2 only, one item, submitted date unset, IAP item 0.
- Release type `MANUAL`.
- App and CueScore Pro availability JPN only; both `availableInNewTerritories=false`.
- CueScore Pro `APPROVED` / `NON_CONSUMABLE` / `JPY 980`.
- What's New, Review Notes, existing metadata, and `APP_IPHONE_65` screenshots `6/6 COMPLETE` remained unchanged.
- Blocking error 0.

## Submission

- Operation: Review Submission `submitted=true`.
- HTTP result: `200`.
- Apple authoritative submitted timestamp: `2026-10-03T02:18:14.384Z`.
- JST: `2026-10-03 11:18:14.384 JST`.

## Post-submission authoritative read-back

- Review Submission state: `WAITING_FOR_REVIEW`.
- App Version state: `WAITING_FOR_REVIEW`.
- Version / Build relationship: Version `1.2` → Build `84` (`51ee69a0-e238-4382-9cbb-8529f4d0a682`).
- Build: `VALID` / `APP_STORE_ELIGIBLE` / encryption false.
- Submitted item count: `1`.
- Sole submitted item: App Store Version `1.2`.
- CueScore Pro submitted item count: `0`.
- Release type: `MANUAL`.
- The child review-item resource remained `READY_FOR_REVIEW` immediately after submission. This is recorded separately from the authoritative parent Submission and App Version states, both of which are `WAITING_FOR_REVIEW`.

## Build 83 and boundaries

- Build 83 remains `VALID` / `APP_STORE_ELIGIBLE` / Internal `IN_BETA_TESTING`; it was not deleted or changed. Its withdrawn Review history remains intact.
- Product source change: 0.
- Build 85, Archive, Upload, TestFlight change, External TestFlight, metadata, screenshots, Privacy, CueScore Pro, price, availability, Automatic Release, general Release, and public Version 1.1 change: not performed.
- The dirty local mirror and old worktrees were not touched.

## STOP

`APP REVIEW RESUBMITTED — WAITING FOR REVIEW`

The next gate begins only after Apple returns a review result. General release is not authorized by this gate.
