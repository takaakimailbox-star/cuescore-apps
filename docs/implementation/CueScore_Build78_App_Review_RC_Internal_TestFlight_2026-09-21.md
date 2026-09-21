# CueScore Build 78 App Review RC / Internal TestFlight

- Date: 2026-09-21
- Version / Build: `1.0 (78)`
- Product source commit: `6e0a569e32e473f6b5bfa14c74eeca1482820467`
- Baseline: GitHub `main` / `9c15e8507805702f72873aa9c6c2c022edcc5b41`
- Gate: `READY FOR PRODUCT OWNER BUILD 78 INTERNAL TESTFLIGHT REVIEW`

## Included fixes

Build 78 contains only the three authorized product fixes plus build/cache identity and their tests/evidence.

1. The confirmed Build 77 iOS/iPadOS 27 launch crash was fixed by adopting a single `UIWindowScene` lifecycle: `UIApplicationSceneManifest`, `SceneDelegate`, and AppDelegate `configurationForConnecting`. `Main.storyboard` still owns `CueScoreBridgeViewController`; Capacitor URL and user-activity forwarding remain present.
2. The shared 9-Ball / 10-Ball Race selector now gives its scroll container Bottom Navigation height plus safe-area bottom clearance. Race 1–100 behavior remains unchanged.
3. Only `.player-library-search` suppresses the shared yellow `focus` / `focus-visible` outline. Its white background, border, radius, text caret, Japanese input, and filtering behavior remain unchanged; global focus styling is intact.

No persistence schema, Player schema, game rules, IAP Product ID, Free/Pro behavior, History behavior, App Store metadata, or official product specification was changed.

## Verification

- Scene + Race selector + Player Search focused Node: `11 pass / 0 fail`.
- Full Node regression: `443 pass / 0 fail / 0 skipped`.
- Release Simulator build with Xcode 27 / iOS 27 SDK: `BUILD SUCCEEDED`.
- Native UI (`testProGateLoadsLocalStoreKitProductWithoutDiagnosticUI`): `1 pass / 0 fail`; Home, Settings, Pro, native bridge, and StoreKit product display were reached.
- iPhone 18 Pro / iOS 27.0 Simulator runtime `24A434`: Release cold launch `3/3 pass`.
- iPad Air 11-inch (M4) / iOS 27.0 Simulator runtime `24A434`: Release cold launch `3/3 pass` in iPhone compatibility presentation.
- `NoSceneLifecycleAdoption`: `0` after excluding the `log show` command's self-referential argument record.
- Race selector, Player Search, Player list/selection, History, IAP, and all six discipline contracts are included in the full regression. Product Owner physical-device acceptance remains the next gate.

The known iOS 27 Simulator StoreKit unit environment can return USA / `$5.99` despite a JPN / `980` StoreKit configuration. This was not classified as a product failure; the separate native UI test passed and the product source/IAP identity was not changed.

Visual evidence:

- `evidence/build78-app-review-rc/ios27-iphone-release-home.png` — SHA-256 `727e3a989d8d52f35f5cacd604140fa034ec5b12b268603ab0edcc215101bb27`
- `evidence/build78-app-review-rc/ios27-ipad-release-home.png` — SHA-256 `dd9e36467b99608fba8d2537a4352be30621c995806463446e9d70e9570a068c`

## Archive and identity

- Device Archive: `ARCHIVE SUCCEEDED`.
- Archive path used for local verification: `/private/tmp/CueScoreBuild78-6e0a569.xcarchive`.
- Bundle / version / build: `com.takaakimailboxstar.cuescoreapps` / `1.0` / `78`.
- Minimum OS / SDK build / device family: iOS `15.0` / `24A430` / iPhone `[1]`.
- Packaged scene configuration: `App.SceneDelegate` / `Main`.
- `.storekit` files in Archive: `0`.
- App and dSYM UUID: `080FD5E7-F806-3676-9AFD-500ED91C421B`.
- Archive executable SHA-256: `284bac85c018ee1edb89c5656e57284770297baa8f8000ee8660a5deee8309c4`.
- Repository `Package.resolved` SHA-256: `1e68bbcd65eea223108220becced97a2d9eb05c79aaaa88e6f879078b8a6a0aa`.
- Fixed dependency flags: `-skipPackageUpdates`, `-onlyUsePackageVersionsFromResolvedFile`, and `-disableAutomaticPackageResolution`.
- Repository and Archive build graph: `ion-ios-filesystem 1.1.2` / revision `0d81e26e828ff9582807e2339112cedf2e0fab85`; `capacitor-swift-pm 8.0.2` / revision `13a39179b3df796f3bb2e70c47ccdd92593f34d2`.
- `index.html`, `navigation-shell-phase1.css`, and `navigation-phase2-6.css` SHA-256 values matched across source, iOS copied assets, and Archive.

## Upload and Internal TestFlight

- App Store Connect upload: `Upload succeeded` / `EXPORT SUCCEEDED`.
- Build ID: `eb2f6582-c42b-444d-9755-218e5e03ff49`.
- Processing: `VALID`.
- Audience: `APP_STORE_ELIGIBLE`.
- Export compliance: `usesNonExemptEncryption=false`.
- Beta state: internal `IN_BETA_TESTING`; external `READY_FOR_BETA_SUBMISSION`.
- Internal group: `CueScore Internal Testers`, internal, `hasAccessToAllBuilds=true`; Build 78 was returned in the group's build relationship.

The first CLI export attempt using the individual App Store Connect API key failed authentication at Xcode's legacy submission-settings service. The same unchanged Archive then validated and uploaded successfully using the Apple Account already configured in Xcode. This was an upload-authentication path issue, not an Archive or product failure.

## App Review boundary

- Review submission `7fd64b66-fe2e-424e-9038-a37cbddf8e87` remains `UNRESOLVED_ISSUES`.
- Version 1.0 remains `REJECTED`, manual release.
- Version 1.0's review build relationship remains Build 77 (`a1ebcb96-b6a4-4e88-b5e5-f79e149e15dd`).
- Build 78 was not attached to the App Store version for review.
- No App Review resubmission, Apple reply, metadata change, external TestFlight distribution, or release was performed.

## Product Owner physical-device gate

Install Build 78 from Internal TestFlight and confirm:

1. iPhone cold launch and terminate/relaunch at least three times; no immediate crash.
2. If available, iPad cold launch and terminate/relaunch at least three times.
3. In 9-Ball and 10-Ball, select Race 1, 5, 12, 13, 50, and 100; verify 100 stays visible/tappable above Bottom Navigation and the selected value is applied.
4. After closing the Race selector, verify Bottom Navigation returns to its normal layout.
5. In Player1 selection, Player2 selection, and Player list, tap Search; verify no yellow outer ring, while the caret, Japanese input, and filtering remain normal.
6. Smoke-test Home, Player, History, Settings, Pro/StoreKit, and entry into all six disciplines.
