# CueScore Version 1.2 Build 82 — App Store Eligible / Internal TestFlight Evidence

- Date: 2026-10-02 JST
- Gate result: `BUILD 82 VALID / APP_STORE_ELIGIBLE / INTERNAL TESTFLIGHT AVAILABLE / PRODUCT OWNER FINAL SMOKE PENDING`
- Accepted product-content source: `a0971212b13fa09ace7bbb2b0ab2571a0cd7497b`
- Gate baseline: `b78bdb5e00ad8cb95361af0751fb219a3b0c7493`
- Build 82 Source Commit: `7c7ba922c2ba0603757aa1a4f832324b5833dafe`
- App Store Connect Build ID: `b06e47f5-74eb-4e01-b4b3-7a3a2ca3c1e1`

## Source identity and pre-Archive verification

- GitHub `main` matched the expected baseline before work; the working tree was clean.
- Only Build number, Build-linked app-shell cache identity, and corresponding automated expectations changed. Product behavior, UI, schema, Match Sharing, Player UX, and Player Delete contracts did not change.
- Version / Build / Bundle ID: `1.2` / `82` / `com.takaakimailboxstar.cuescoreapps`.
- Cache identity: `2.0-build82-app-store-eligible-rc-v1`.
- Build 60／66／72 and Build 81 Player List historical or independent asset queries were preserved.
- Build 82 identity was committed and pushed before Archive. `HEAD == origin/main == GitHub main` was confirmed at `7c7ba922c2ba0603757aa1a4f832324b5833dafe`.
- Source／native-web／iOS public／Archive／IPA `index.html` SHA-256: `8f3cc2784e5cc835c6431d10ca866b1023751355ff97e3bb3bf65d968a19372d`.
- Version／cache／Player UX／Player Delete／Interrupted Match Modal／Match Sharing／native foundation focused verification: `180 PASS / 0 FAIL / 0 SKIPPED`.
- Full Node: `596 PASS / 0 FAIL / 0 SKIPPED`.
- Native parity and `git diff --check`: PASS.
- Release Simulator Build: PASS.

## Archive and artifact identity

- Release device Archive: `ARCHIVE SUCCEEDED`.
- Archive path: `/private/tmp/CueScore-1.2-82-7c7ba92.xcarchive`.
- App / dSYM UUID: `632DAB3A-DFD1-3A32-B10F-B27CE6B0EB5D`.
- Executable SHA-256: `bf535e72dc6da33c6602bd80782017e17b3a3166aaca1199f09f82a6ef3519f4`.
- Exported IPA SHA-256: `a97220a36d4ced3f423bbfe9304e1eb728c6e89f8b32cbf38748dd943ed6b207`.
- Archive／IPA `.storekit`: 0.
- `Package.resolved` SHA-256: `1e68bbcd65eea223108220becced97a2d9eb05c79aaaa88e6f879078b8a6a0aa`.
- `capacitor-swift-pm`: `8.0.2`, revision `13a39179b3df796f3bb2e70c47ccdd92593f34d2`.
- `ion-ios-filesystem`: `1.1.2`, revision `0d81e26e828ff9582807e2339112cedf2e0fab85`.
- Fixed dependency flags remained enabled: `-skipPackageUpdates`, `-onlyUsePackageVersionsFromResolvedFile`, and `-disableAutomaticPackageResolution`.

## Distribution, validation, upload, and audience

- Distribution method: Xcode `app-store-connect` / `TestFlight & App Store` normal distribution path.
- The pre-upload ExportOptions read-back contained no `testFlightInternalTestingOnly` key. Internal Testing Only was OFF.
- Xcode package analysis and Apple validation completed with error 0.
- Upload completed with `Upload succeeded` / `EXPORT SUCCEEDED`.
- Processing: `VALID`.
- Audience read-back: `APP_STORE_ELIGIBLE`.
- `usesNonExemptEncryption=false` was set through the App Store Connect API using the pre-approved historical answer.

## Internal TestFlight read-back

- App Store Connect Build ID: `b06e47f5-74eb-4e01-b4b3-7a3a2ca3c1e1`.
- Internal state: `IN_BETA_TESTING`; external state: `READY_FOR_BETA_SUBMISSION`.
- Internal group: `CueScore Internal Testers`.
- Group is internal, `hasAccessToAllBuilds=true`, and includes Build 82.
- Internal tester count: 1.
- Product Owner can obtain Version `1.2 (82)` through Internal TestFlight.

## App Store boundary

- Public Version `1.1` remains `READY_FOR_SALE` and unchanged.
- App Store Version `1.2` does not exist and was not created.
- External TestFlight, App Review, Release, metadata, screenshots, Privacy, CueScore Pro, price, and availability were not changed.
- Build 83 was not created. Builds 80／81 remain historical Internal TestFlight evidence and were not deleted or overwritten.

## Product Owner final smoke

Use TestFlight Version `1.2 (82)` and perform only artifact-identity smoke verification:

1. Confirm TestFlight shows `1.2 (82)`.
2. Cold launch and open Home.
3. Open Player list and confirm the Player pencil action is present.
4. Confirm Player sort remains correct.
5. Open the interrupted-match modal and confirm all three actions are visible.
6. Confirm no Bottom Navigation overlap and no yellow touch-focus outline.
7. Confirm the Match Sharing entry is visible.

Do not repeat destructive Player Delete or same-name identity testing. Those contracts retain the accepted Build 81 product content, automated Evidence, and Physical RC Evidence.
