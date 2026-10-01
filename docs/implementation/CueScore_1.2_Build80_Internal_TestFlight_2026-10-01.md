# CueScore Version 1.2 Build 80 Internal TestFlight Evidence

- Date: 2026-10-01 JST
- Gate result: `INTERNAL TESTFLIGHT AVAILABLE / PRODUCT OWNER PHYSICAL VERIFICATION PENDING`
- Product Source commit: `810a9e134c5de1e033eb644027c37f51834fd6d4`
- Source-freeze Documentation commit / archive baseline: `d1ba8b7fa8821e7f93a10b3b54dde0984b5e703e`
- App Store Connect Build ID: `0851e2bb-b9dc-47b3-bab6-04d3f687e200`

## Pre-Archive verification

- GitHub `main` fresh read-back: `d1ba8b7fa8821e7f93a10b3b54dde0984b5e703e`.
- Formal native sync completed from source to `native-web` to Capacitor iOS public; tracked working tree remained unchanged.
- Version / Build / Bundle ID: `1.2` / `80` / `com.takaakimailboxstar.cuescoreapps`.
- Cache identity: `2.0-build80-match-sharing-player-identity-v1`.
- Source / native-web / iOS public `index.html` SHA-256: `9cbeaaf799502ba68859cde484bab333c3da3c91b5c49543c7ab2c3111169e9c`.
- Cache / version focused: `42/42 PASS`.
- Player Delete dedicated: `11/11 PASS`.
- Match Sharing focused: `109/109 PASS`.
- Integration focused: `102/102 PASS`.
- Native foundation: `6/6 PASS`.
- Full Node: `578/578 PASS`, FAIL 0, SKIPPED 0.
- `git diff --check`: PASS.

## Archive and artifact identity

- Release device Archive: `ARCHIVE SUCCEEDED`.
- Archive path: `/private/tmp/CueScore-1.2-80-d1ba8b7.xcarchive`.
- App / dSYM UUID: `632DAB3A-DFD1-3A32-B10F-B27CE6B0EB5D`.
- Executable SHA-256: `f7d30575f30469f58c5f8023c9b6848c4fff082b58918172529d537f7e33571a`.
- Exported IPA SHA-256: `c5a44ecb1b7b72c7fd00cdc1d04fc736cdedc7410ccd965888cc592ffc250031`.
- `.storekit` files in Archive / IPA: `0`.
- Archive `index.html` SHA-256 matched source / native copies: `9cbeaaf799502ba68859cde484bab333c3da3c91b5c49543c7ab2c3111169e9c`.
- `Package.resolved` SHA-256: `1e68bbcd65eea223108220becced97a2d9eb05c79aaaa88e6f879078b8a6a0aa`.
- `capacitor-swift-pm`: `8.0.2` / revision `13a39179b3df796f3bb2e70c47ccdd92593f34d2`.
- `ion-ios-filesystem`: `1.1.2` / revision `0d81e26e828ff9582807e2339112cedf2e0fab85`.
- Fixed dependency flags were retained: `-skipPackageUpdates`, `-onlyUsePackageVersionsFromResolvedFile`, and `-disableAutomaticPackageResolution`.

## Apple validation, upload, and processing

- The standalone `altool` personal-key attempt was not an Apple product validation result: the legacy tool rejected the personal API key authentication shape. No product/archive change was made.
- The same unchanged Archive was submitted through the Apple Account configured in Xcode, as used by the accepted Build 78 / 79 workflow.
- Apple package analysis completed without a validation error; upload result: `Upload succeeded` / `EXPORT SUCCEEDED`.
- Processing state: `VALID`.
- `usesNonExemptEncryption=false`.
- Build audience read-back: `INTERNAL_ONLY`.

### Audience deviation

The Gate requested `APP_STORE_ELIGIBLE`, but the upload used Xcode's `testFlightInternalTestingOnly=true`, so Apple permanently recorded Build 80 as `INTERNAL_ONLY`. App Store Connect API rejected a later audience update with `ENTITY_ERROR.ATTRIBUTE.NOT_ALLOWED`; `buildAudienceType` is not updateable. The requested Internal TestFlight availability is complete, but App Store eligibility is **not satisfied for Build 80**. Build 81, a replacement upload, App Store Version creation, App Review, and Release were outside this Gate and were not performed.

## Internal TestFlight read-back

- Build ID: `0851e2bb-b9dc-47b3-bab6-04d3f687e200`.
- Build number: `80`.
- Processing: `VALID`.
- Internal state: `IN_BETA_TESTING`.
- External state: `NOT_APPLICABLE`.
- Internal group: `CueScore Internal Testers`.
- Group is internal: `true`.
- `hasAccessToAllBuilds=true`; group relationship includes Build 80.
- Internal tester count: `1`.
- Product Owner can obtain Version `1.2 (80)` through Internal TestFlight; physical-device result remains pending.

## App Store boundary

- Public Version `1.1` remains `READY_FOR_SALE`; no change was made.
- App Store Version `1.2` does not exist and was not created.
- External TestFlight, App Review, Release, metadata, screenshots, Privacy, CueScore Pro, price, and availability were not changed.

## Product Owner physical-device gate

Use TestFlight Version `1.2 (80)` and safe test data only:

1. Confirm TestFlight identity, cold launch, and Home.
2. Player Edit shows Delete, hides `Player ID <UUID>`, and Registration has no Delete.
3. Create disposable Player A / B and a completed Match; delete B and confirm the historical Match, name, Detail, and A-side history remain.
4. If safely practical, recreate a new Player with B's old name and confirm the old ID-backed Match does not appear for the new Player.
5. With a disposable Player in an interrupted Match, confirm deletion is blocked with the in-progress guidance.
6. If two iPhones are available, verify Sender QR, Receiver scan, symmetric Player A / B mapping, Import, Match Detail, and duplicate rejection. If a second device is unavailable, record this as `NOT VERIFIED` rather than PASS.

No Product Owner physical PASS is recorded by this Evidence.
