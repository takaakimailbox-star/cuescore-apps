# CueScore Version 1.1 Build 79 Internal TestFlight Evidence

- Date: 2026-09-26 JST
- Gate result: `PRODUCT OWNER ACCEPTED — INTERNAL TESTFLIGHT PASS`
- Source commit: `39e3071f898c7af8499abbfee6f0043307699f6f`
- App Store Connect Build ID / Delivery UUID: `0b61e6fe-14b6-452a-bc2e-a6b2b02524d2`
- Public production: Version 1.0 / Build 78 unchanged

## Retry decision and scope

The first Build 79 candidate used Marketing Version 1.0 and was rejected during validation with `90186` and `90062` because the publicly released 1.0 train is closed. That historical Evidence is retained. Product Owner then authorized changing only Marketing Version from 1.0 to 1.1 for Internal TestFlight. JPA Dead Ball product logic, persistence schema, game rules, IAP, metadata, privacy, price, and availability were not changed.

No App Store Version 1.1 record was created. No App Review, External TestFlight, or Release action was performed.

## Verification

| Check | Result |
| --- | --- |
| Dead dedicated scenarios | 16 PASS / 0 FAIL / 0 SKIPPED; Node runner reports 17 entries including the wrapper check |
| JPA / Undo / in-progress / History / Backup focused | 64 PASS / 0 FAIL / 0 SKIPPED |
| Full Node regression | 459 PASS / 0 FAIL / 0 SKIPPED |
| Release Simulator Build | PASS |
| `git diff --check` | PASS |
| Bundle identity | `com.takaakimailboxstar.cuescoreapps` |
| Version / Build | `1.1 (79)` |

## Archive and dependency identity

- Archive: `/private/tmp/CueScore-Build79-v1.1-39e3071.xcarchive`
- App / dSYM UUID: `080FD5E7-F806-3676-9AFD-500ED91C421B`
- Executable SHA-256: `98557ceec8924d56ccdaa462f868a5394cc220d2b83fcfc7eeb1b46b7ea386c4`
- IPA SHA-256: `3db17894813a5d578840255c4629e04ae6027f2425cbc054aef6ce2d3e902e6f`
- Source / native-web / Archive `index.html` SHA-256: `448d66f09a797e1fa6e5328709eefec315c71bbe46208054a8d2bcf500618af9`
- `.storekit` files: 0
- `Package.resolved` SHA-256: `1e68bbcd65eea223108220becced97a2d9eb05c79aaaa88e6f879078b8a6a0aa`
- `ion-ios-filesystem`: 1.1.2 / revision `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm`: 8.0.2 / revision `13a39179b3df796f3bb2e70c47ccdd92593f34d2`

## Apple validation and upload

- Apple validation: `VERIFY SUCCEEDED with no errors`.
- Previous `90186` and `90062`: absent and resolved by Marketing Version 1.1.
- Upload: `UPLOAD SUCCEEDED with no errors`.
- Delivery UUID: `0b61e6fe-14b6-452a-bc2e-a6b2b02524d2`.
- Processing: `VALID`.
- Build audience: `APP_STORE_ELIGIBLE`.
- Export compliance: `usesNonExemptEncryption=false`.

## Internal TestFlight read-back

At `2026-09-26T01:32:35.912Z` App Store Connect API returned:

- Build ID `0b61e6fe-14b6-452a-bc2e-a6b2b02524d2`, Build `79`.
- Internal build state `IN_BETA_TESTING`.
- External state `READY_FOR_BETA_SUBMISSION`; no external group was configured.
- Internal group `CueScore Internal Testers`, `hasAccessToAllBuilds=true`, includes Build 79.

## Public App Store boundary

- Public Version 1.0 remains `READY_FOR_SALE` / `READY_FOR_DISTRIBUTION`.
- Selected public Build remains Build 78, ID `eb2f6582-c42b-444d-9755-218e5e03ff49`.
- App Store Version 1.1 was not created.
- App Review, External TestFlight, Release, metadata, screenshots, Privacy, CueScore Pro, price, and availability were not changed.

## Product Owner device gate

Product Owner completed the physical iPhone review on 2026-09-26 with `ALL PASS / ALL OK` for Version `1.1 (79)`, cold launch／Home, JPA Dead summary, normal Dead cumulative update, break scratch Dead history／existing visual／cumulative update, and Undo history／cumulative restore. No screenshot was supplied. dry scratch, 9 ball exclusion, in-progress recovery, History, and Backup remain automated Evidence only and are not recorded as physical-device PASS. See `CueScore_Build79_Product_Owner_Physical_iPhone_Acceptance_2026-09-26.md`.
