# CueScore Build 79 JPA Dead Ball Internal TestFlight Evidence

- Date: 2026-09-26 JST
- Gate result: `BLOCKED — VERSION 1.0 PRE-RELEASE TRAIN CLOSED`
- Product source commit: `a66293a8082498ae28f0d8a96d80d302cca91639`
- Intended distribution: Internal TestFlight only
- Public production: Version 1.0 / Build 78 unchanged

## Included product change

Build 79 contains the Product Owner accepted JPA 9-Ball Dead Ball UI from Official Decision 99 / Spec 100. It displays match-cumulative Dead count, derives 1–8 Dead balls from Undo-aware existing events, excludes foul/scratch flags and the 9 ball, and uses the unchanged existing `state="used"` ball visual for normal, break-foul, and normal-foul Dead balls. No persistence schema was added.

## Pre-Archive Gate

| Check | Result |
| --- | --- |
| Dead dedicated | 16 PASS / 0 FAIL / 0 SKIPPED |
| JPA / Undo / in-progress / History / Backup focused | 59 PASS / 0 FAIL / 0 SKIPPED |
| Full Node regression | 459 PASS / 0 FAIL / 0 SKIPPED |
| Release Simulator Build | PASS |
| `git diff --check` | PASS |

The full regression includes the six-discipline entry and non-JPA Dead-UI boundaries. No product test failure was detected.

## Build and Archive identity

- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Marketing version: `1.0`
- Build: `79`
- Archive: `/private/tmp/CueScore-Build79-a66293a.xcarchive`
- App / dSYM UUID: `080FD5E7-F806-3676-9AFD-500ED91C421B`
- Executable SHA-256: `a109268c93ecf132d3e50c72ebfd729fe4f584611c206012ed76214d1453fa2b`
- Exported IPA SHA-256: `1845dd7d084038ca42e0de781d982ed588ffc5e7d93959a701af898bf4c38351`
- Source / native-web / Archive `index.html` SHA-256: `448d66f09a797e1fa6e5328709eefec315c71bbe46208054a8d2bcf500618af9`
- `.storekit` files in Archive / IPA: 0

## Dependency identity

- `Package.resolved` SHA-256: `1e68bbcd65eea223108220becced97a2d9eb05c79aaaa88e6f879078b8a6a0aa`
- `ion-ios-filesystem`: 1.1.2 / revision `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm`: 8.0.2 / revision `13a39179b3df796f3bb2e70c47ccdd92593f34d2`
- Dependency updates were disabled with the repository-resolved fixed build procedure.

## Apple validation blocker

The App Store IPA export succeeded. Before Upload, `altool --validate-app` authenticated with the configured personal App Store Connect API key and returned two server validation errors:

1. `90186 Invalid Pre-Release Train`: train version `1.0` is closed for new build submissions.
2. `90062`: `CFBundleShortVersionString [1.0]` must be higher than the previously approved version `[1.0]`.

This is an Apple distribution rule triggered because Version 1.0 is already approved and publicly available, not a product source, Archive, signing, or dependency failure. A higher marketing version is required for a new upload. The task explicitly prohibited Version 1.1 creation or changing Version 1.0, so no version change or Upload was attempted after this definitive validation result.

## App Store Connect read-back

Read-only API check at `2026-09-26T01:15:57.318Z` showed:

- Build 79 query: 0 records; no App Store Connect Build ID exists.
- Public Version 1.0: `READY_FOR_SALE` / `READY_FOR_DISTRIBUTION`, release type `MANUAL`.
- Selected public build: Build 78 / ID `eb2f6582-c42b-444d-9755-218e5e03ff49` / `VALID` / `APP_STORE_ELIGIBLE` / encryption false.
- Build 78 internal state: `IN_BETA_TESTING`.
- `CueScore Internal Testers`: internal group, `hasAccessToAllBuilds=true`; Build 79 is absent because validation prevented upload.

## Boundary and next gate

- Build 79 Internal TestFlight: `BLOCKED / NOT DISTRIBUTED`.
- Product Owner device verification: not performed and not recorded as PASS.
- Public Build 78, App Review, App Store Version, metadata, screenshots, privacy, IAP, price, availability, and Release: no changes.
- Version 1.1: not created.
- Next gate: Product Owner Decision authorizing a higher marketing version for the Internal TestFlight candidate. Creating an App Store Version or submitting App Review is not part of that upload gate unless separately authorized.
