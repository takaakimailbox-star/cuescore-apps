# CueScore v1.0 StoreKit Price A/B Diagnostic

- Decision ID: `CUESCORE-V1-STOREKIT-PRICE-AB-DIAGNOSTIC-20260920`
- Date: 2026-09-20
- Gate: Diagnostic only
- Conclusion: `TESTFLIGHT-SPECIFIC`

## Source and device safety

- Repository HEAD / `origin/main`: `f877b90e400a722632de4e4aa78471079a65aa91`
- Product source commit: `9828a8499f514d239b717d248a9a99976db23944`
- Product source diff between product commit and current HEAD: none for `index.html`, `monetization-v1.js`, native app source, project settings, and `Package.resolved`
- Version / Build: `1.0 (77)`; no Build 78 source or Archive was created
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Product ID: `com.takaakimailboxstar.cuescoreapps.pro`
- Device: paired physical iPhone 16e
- Pre-install app data backup: `/private/tmp/CueScore-AB-Before-Direct-20260920` (`14 MB`, `22` files)

## A — TestFlight Build 77

Existing accepted evidence was reused as permitted by the Decision.

- Environment: Japan Sandbox tester; Media & Purchases signed out
- Fresh `Product.displayPrice`: `$5.99`
- Apple purchase confirmation sheet: `¥980`
- Sandbox purchase: PASS
- Verified entitlement / immediate Pro unlock: PASS
- Settings `CueScore Pro ✓`: PASS
- Relaunch persistence: PASS
- Storefront runtime country / ID: not re-read in this Gate

Source: `docs/release/CueScore_v1.0_Final_Release_Readiness_Audit_2026-09-20.md` B-04 and Product Owner device evidence.

## B — Xcode direct install

### Build identity

- Configuration: Release target build with Apple Development signing
- Version / Build: `1.0 (77)`
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Local StoreKit configuration: none on the direct App target
- Built app `.storekit` files: `0`
- `ion-ios-filesystem`: `1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm`: `8.0.2` / `13a39179b3df796f3bb2e70c47ccdd92593f34d2`
- `monetization-v1.js` SHA-256, source / copied native asset / direct app: `388ce045c2c925c761cc3f7c1055c4a41f76dbecdf5f9069d5cfc2dca9f30dca`
- `index.html` SHA-256, source / copied native asset / direct app: `531e8e892ded979670ac5dac7d7ceebd79475a5ba93843e8a2c61f483dd1ffa0`
- Build: `BUILD SUCCEEDED`
- Direct install: PASS

### Sandbox reset and runtime

- App Store Connect API listed two JPN Sandbox testers.
- The Product Owner identified the signed-in tester; exactly one API resource matched.
- Clear purchase history request: HTTP `201 Created`.
- Product Owner signed out and back in on-device and waited five minutes.
- Verified Pro entitlement remained available; tapping Restore returned Pro again.
- Price after the direct-install StoreKit fetch / Restore: `¥980`.
- UI remained `✓ CueScore Pro 有効`.
- `localizedPrice`: `¥980`.
- Runtime `Storefront.current.countryCode`: not directly captured; the selected Sandbox tester territory was confirmed `JPN` by App Store Connect API.
- Runtime `Storefront.current.id`: not directly captured.
- Product ID request path: exact protected Product ID above; runtime `productIdMatched` flag was not surfaced in the production UI.
- Direct-install Apple purchase sheet: not captured because the verified non-consumable entitlement remained active and the purchase action was unavailable.

Product Owner screenshots attached to this diagnostic task:

- `IMG_3677.PNG`: direct-install Settings, `CueScore Pro ✓`.
- `IMG_3678.PNG`: direct-install Pro screen, `¥980`, verified Pro active after Restore.

## A/B result

| Runtime | Product display price | Apple sheet |
|---|---:|---:|
| TestFlight Build 77 | `$5.99` | `¥980` |
| Xcode direct, identical product source | `¥980` | Not captured because verified Pro remained active |

The same protected Product ID and the same Build 77 product source returned different product-display metadata depending on distribution path. The Xcode direct install returned the expected Japanese `Product.displayPrice`, while the TestFlight runtime returned US-dollar display metadata even though Apple's authoritative purchase sheet showed `¥980`.

This is strong evidence of a TestFlight / Sandbox runtime metadata discrepancy rather than a CueScore price-rendering or currency-conversion defect. CueScore uses StoreKit `Product.displayPrice`; no price hard-code or independent conversion exists.

Classification: `TESTFLIGHT-SPECIFIC`.

Limitation: a direct-install purchase sheet was not captured, and direct runtime Storefront country/ID fields were not surfaced without adding diagnostic source. These are recorded as not verified, not inferred as exact runtime values.

## Privacy Validation

- Organizer selected archive: UI identified `1.0 (77)` and archive/app plists both read Build `77`.
- Organizer Validate completed without a warning sheet, but the validation completion and Submission Status reported `App 1.0 (78)` / Build `78`.
- App Store Connect API read after validation: Build 78 count `0`; nothing was uploaded or created in App Store Connect.
- No Distribute, Submit, App Review, External TestFlight, or Release action occurred.

Because the validator's reported Build number did not match the selected Build 77 archive, this run is not accepted as Build 77 warning evidence.

Privacy Validation result: `NOT VERIFIED`.

## Protection / STOP state

- Product source changes: none
- Build number changes: none
- App Store Connect metadata changes: none
- Review draft changes: none
- Commit: none
- Push: none
- Build 78 App Store Connect record: none
- App Review submission: none
- Release: none

## Final Product Owner Decision

- Decision ID: `CUESCORE-V1-FINAL-PRICE-PRIVACY-DECISION-20260920`
- B-04 classification: `ACCEPTED RISK — TESTFLIGHT-SPECIFIC SANDBOX METADATA ISSUE`
- Privacy classification: `NOT VERIFIED EVIDENCE GAP — NON-BLOCKING FOR APP REVIEW SUBMISSION`
- Product source change: none
- Price hard-code: none
- Build 78: not created
- App Review submission: not performed

`READY FOR PRODUCT OWNER APP REVIEW SUBMISSION`
