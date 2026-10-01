# CueScore Version 1.2 Build 81 — Player List Fix Internal TestFlight Evidence

- Date: 2026-10-01 JST
- Gate result: `BUILD 81 INTERNAL TESTFLIGHT AVAILABLE / PRODUCT OWNER PLAYER LIST RE-TEST REQUIRED`
- Player List Fix Product Source Commit: `7e2beb0ade0685ff331fa808273e00e6f832bd2c`
- Player List Fix Documentation Commit: `b1d40c3d429a0fd899e98367ce46036f8d7ad3f4`
- Build 81 Source Commit: `79a031a0a656b3ea486dcf28a0def5a1243576ba`
- App Store Connect Build ID: `0df0161d-11df-42a3-af3a-81a79fda7719`

## Source identity and pre-Archive verification

- GitHub `main` matched expected baseline `4872bc39793ba61374e7810b3e00333dd2710069` before the Player List commits.
- Product fix and contract tests were committed separately from Documentation/Evidence. Build 81 identity was committed and pushed before Archive.
- Version / Build / Bundle ID: `1.2` / `81` / `com.takaakimailboxstar.cuescoreapps`.
- Cache identity: `2.0-build81-player-list-bottom-inset-v1`.
- Build 60／66／72 historical or independent asset queries were not changed.
- Source／native-web／iOS public／Archive `index.html` SHA-256: `197d0b0e46985756cfab3aa2773981d4cd75f9455a23401326cdc917e0ced530`.
- Player List / Navigation focused: `15/15 PASS`.
- Player Delete dedicated: `11/11 PASS`.
- Match Sharing focused: `109/109 PASS`.
- Combined integration focused: `135/135 PASS`.
- Cache / version / native identity focused: `68/68 PASS`.
- Native foundation: `6/6 PASS`.
- Full Node: `583/583 PASS`, FAIL 0, SKIPPED 0.
- Native parity and `git diff --check`: PASS.

## Archive and artifact identity

- Release device Archive: `ARCHIVE SUCCEEDED`.
- Archive path: `/private/tmp/CueScore-1.2-81-79a031a.xcarchive`.
- App / dSYM UUID: `632DAB3A-DFD1-3A32-B10F-B27CE6B0EB5D`.
- Executable SHA-256: `b5c588e33b6c6a3d00d217e4a513764b58aa028eff987541667bbc8ac37e4e82`.
- Exported IPA SHA-256: `d83ed200537c384adbf88ca8464d8a74ea8ef216a35f9433c42d32798e999522`.
- Archive／IPA `.storekit`: 0.
- `Package.resolved` SHA-256: `1e68bbcd65eea223108220becced97a2d9eb05c79aaaa88e6f879078b8a6a0aa`.
- `capacitor-swift-pm`: `8.0.2`, revision `13a39179b3df796f3bb2e70c47ccdd92593f34d2`.
- `ion-ios-filesystem`: `1.1.2`, revision `0d81e26e828ff9582807e2339112cedf2e0fab85`.
- Fixed dependency flags remained enabled: `-skipPackageUpdates`, `-onlyUsePackageVersionsFromResolvedFile`, and `-disableAutomaticPackageResolution`.

## Validation, upload, and audience

- Xcode distribution package analysis completed without validation errors.
- Upload completed with `Upload succeeded` / `EXPORT SUCCEEDED`.
- Audience was intentionally selected as immutable `INTERNAL_ONLY` using `testFlightInternalTestingOnly=true`, prioritizing Product Owner physical verification.
- A later App Store-eligible build, if needed, requires a separate Gate after physical PASS.
- Processing: `VALID`.
- `usesNonExemptEncryption=false` was set through the App Store Connect API using the pre-approved historical answer.
- Internal state: `IN_BETA_TESTING`; external state: `NOT_APPLICABLE`.

## Internal TestFlight read-back

- App Store Connect Build ID: `0df0161d-11df-42a3-af3a-81a79fda7719`.
- Internal group: `CueScore Internal Testers`.
- Group is internal and `hasAccessToAllBuilds=true`.
- Group includes Build 81: true.
- Internal tester count: 1.
- Product Owner can obtain Version `1.2 (81)` through Internal TestFlight.

## App Store boundary

- Public Version `1.1` remains `READY_FOR_SALE` / `READY_FOR_DISTRIBUTION` and unchanged.
- App Store Version `1.2` does not exist and was not created.
- External TestFlight, App Review, Release, metadata, screenshots, Privacy, CueScore Pro, price, and availability were not changed.
- Build 80 remains historical physical FAIL/Internal TestFlight evidence and was not deleted or overwritten.

## Product Owner re-test

Use TestFlight Version `1.2 (81)` and first verify only the original failure point:

1. Open Player list.
2. Scroll to the final Player.
3. Confirm the complete final Player remains above Bottom Navigation after releasing the finger.
4. Tap the final Player edit action and confirm Player Edit opens.

After this point passes, the interrupted Build 80 Player Delete physical verification may resume. No Product Owner physical PASS is recorded by this Evidence.
