# CueScore Version 1.2 Build 83 — Final App Store Eligible Candidate / Internal TestFlight Evidence

- Date: 2026-10-02 JST
- Gate result: `BUILD 83 VALID / APP_STORE_ELIGIBLE / INTERNAL TESTFLIGHT AVAILABLE / PRODUCT OWNER FINAL SMOKE PENDING`
- Physical-accepted product-content source: `f2cd1c769c96c1104caf33944eb35d65372f4a0e`
- Gate baseline: `8df7160b2cb675e5f9d771b4a823e369781f9373`
- Build 83 Source Commit: `1fc69c80370620b4db0448ecbcea1f5d28f003ca`
- App Store Connect Build ID: `f45b388a-9268-4d94-aa7a-56c4299799c1`

## Source identity and pre-Archive verification

- External GitHub `main` matched the expected baseline before work. The dirty local mirror was not accessed or modified.
- The Build 83 source diff changed only the Build number, Build-linked Service Worker cache identity, and corresponding automated expectations. Product behavior, UI, schema, Match Sharing, Player Delete／Identity, Player UX, Navigation, and layout contracts remained identical to the Physical-accepted product source.
- Version / Build / Bundle ID: `1.2` / `83` / `com.takaakimailboxstar.cuescoreapps`.
- Cache identity: `2.0-build83-app-store-eligible-rc-v1`.
- Historical or independent Build 60／66／72／81 asset queries were preserved.
- Build 83 identity was committed and pushed before Archive. `HEAD == github/main == External GitHub main` was confirmed at `1fc69c80370620b4db0448ecbcea1f5d28f003ca`.
- Source／native-web／iOS public／Release Simulator／Archive `index.html` SHA-256: `9478a36c631a2ff4fa78261feb049e2ccb05491e0cdee30fd63f375c9204e9e5`.
- Focused verification: `230 PASS / 0 FAIL / 0 SKIPPED`.
- Full Node: `596 PASS / 0 FAIL / 0 SKIPPED`.
- Native parity and `git diff --check`: PASS.
- Release Simulator Build: PASS; executable SHA-256 `4d1906308c0caecc51e80a0738476cabec696bd0b6cc5420e93f4914976331d9`.

## Archive and artifact identity

- Release device Archive: `ARCHIVE SUCCEEDED`.
- Archive path: `/private/tmp/CueScore-1.2-83-1fc69c8.xcarchive`.
- App / dSYM UUID: `A32FE558-2519-33DD-B47B-D66A59FDA74B`.
- Archive executable SHA-256: `affc869a13912a65f03d3291b63c639c240a85613c158c25857d817fe227e388`.
- Exported IPA SHA-256: `f71fc7cd290a62f484ba8d681e90f6b7bf4083b32447202960e68ca5e027d317`.
- Archive／IPA `.storekit`: 0.
- `Package.resolved` SHA-256: `1e68bbcd65eea223108220becced97a2d9eb05c79aaaa88e6f879078b8a6a0aa`.
- `capacitor-swift-pm`: `8.0.2`, revision `13a39179b3df796f3bb2e70c47ccdd92593f34d2`.
- `ion-ios-filesystem`: `1.1.2`, revision `0d81e26e828ff9582807e2339112cedf2e0fab85`.
- Fixed dependency flags remained enabled: `-skipPackageUpdates`, `-onlyUsePackageVersionsFromResolvedFile`, and `-disableAutomaticPackageResolution`.

## Distribution, validation, upload, and audience

- Distribution method: Xcode `app-store-connect` / normal `TestFlight & App Store` path.
- Both export and upload options explicitly read back `testFlightInternalTestingOnly=false`; Internal Testing Only was OFF.
- Xcode package analysis and Apple-side upload validation completed with error 0.
- Upload completed with `Upload succeeded` / `EXPORT SUCCEEDED`.
- Processing: `VALID`.
- Audience read-back: `APP_STORE_ELIGIBLE`.
- `usesNonExemptEncryption=false` was saved through the App Store Connect API using the pre-approved historical answer.

## Internal TestFlight read-back

- App Store Connect Build ID: `f45b388a-9268-4d94-aa7a-56c4299799c1`.
- Internal state: `IN_BETA_TESTING`; external state: `READY_FOR_BETA_SUBMISSION`.
- Internal group: `CueScore Internal Testers`.
- The group is internal, has `hasAccessToAllBuilds=true`, and includes Build 83.
- Product Owner can obtain Version `1.2 (83)` through Internal TestFlight.

## Build 82 history and App Store boundary

- Build 82 remains immutable as `APP_STORE_ELIGIBLE / Internal TestFlight`, but is superseded by Build 83 because it predates the Few-Players Content-Fit fix. It was not deleted or modified.
- Public Version `1.1` remains unchanged.
- App Store Version `1.2` does not exist and was not created.
- External TestFlight, App Review, Release, metadata, screenshots, App Privacy, CueScore Pro, price, and availability were not changed.
- Build 84 was not created.

## Product Owner final smoke

Use TestFlight Version `1.2 (83)` and perform only the final non-destructive smoke:

1. Confirm TestFlight shows `1.2 (83)`.
2. Cold launch and open Home.
3. Open Player list and confirm each Player row has one pencil action.
4. Confirm Player sort remains correct.
5. Use Player search to show a small result set and confirm the card fits its content.
6. Confirm a longer Player list remains above Bottom Navigation.
7. Open the interrupted-match modal and confirm all three actions are visible.
8. Confirm no yellow touch-focus outline.
9. Confirm the Match Sharing entry is visible.

Do not repeat destructive Player Delete, same-name identity, or historical-retention physical tests. Those contracts retain their automated and Physical RC Evidence.
