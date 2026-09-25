# CueScore Apps v1.0 App Store Public Release Evidence

- Record date: 2026-09-25
- Gate: `CUESCORE v1.0 RELEASE COMPLETE`
- Product: CueScore Apps
- Version / Build: `1.0 (78)`
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Product source commit: `6e0a569e32e473f6b5bfa14c74eeca1482820467`
- App Store Connect Build ID: `eb2f6582-c42b-444d-9755-218e5e03ff49`
- App Review Submission ID: `7fd64b66-fe2e-424e-9038-a37cbddf8e87`

## Release conclusion

`CUESCORE v1.0 RELEASE COMPLETE`

Apple approved CueScore Apps Version 1.0 and CueScore Pro on 2026-09-24. The Product Owner performed Manual Release on 2026-09-24. Read-only App Store Connect and public Japan App Store evidence confirm that Version 1.0 is now generally available in Japan.

This task recorded and synchronized the released state only. It did not change product source, App Store metadata, price, availability, IAP configuration, or release settings, and it did not create Build 79 or Version 1.1.

## App Store Connect read-back

Read-only API verification at `2026-09-25T07:44:05.427Z` (`2026-09-25 16:44:05.427 JST`) returned:

- App Store Version ID: `deb842d0-c7f5-4bcf-9248-443bcb090cdf`.
- Version: `1.0`.
- `appStoreState`: `READY_FOR_SALE`.
- `appVersionState`: `READY_FOR_DISTRIBUTION`.
- Release type: `MANUAL`.
- Selected build: `78` / `eb2f6582-c42b-444d-9755-218e5e03ff49`.
- Build state: `VALID` / `APP_STORE_ELIGIBLE`.
- Review submission: `COMPLETE`.
- App Version review item: `APPROVED`.
- CueScore Pro review item: `APPROVED`.

The App Store Connect state names above are recorded independently from the Product Owner's physical-device confirmation below.

## Japan App Store public evidence

The Japan App Store public Lookup API returned one result for App ID `6802027038`:

- App: `CueScore Apps`.
- Seller: `TAKAAKI ISHIZUKA`.
- Version: `1.0`.
- Storefront: Japan.
- Formatted app price: `無料`.
- `currentVersionReleaseDate`: `2026-09-24T08:07:06Z` (`2026-09-24 17:07:06 JST`).
- `releaseDate`: `2026-09-24T07:00:00Z` (`2026-09-24 16:00:00 JST`).
- Public URL: `https://apps.apple.com/jp/app/cuescore-apps/id6802027038`.

These are Apple public API fields. They are not treated as the exact Product Owner button-press time. The Product Owner-provided Manual Release date remains 2026-09-24; its exact operation time was not independently obtained.

## Product Owner physical-device evidence

At approximately `2026-09-25 16:37 JST`, the Product Owner searched `cuescore apps` in the Japan App Store app and confirmed:

- `CueScore Apps`.
- Subtitle `ビリヤードの試合・履歴・分析`.
- Developer `TAKAAKI ISHIZUKA`.
- `入手`.
- `アプリ内購入`.
- Public screenshots.

Evidence file actually supplied: `/Users/Ludique/Desktop/IMG_3733.PNG` (the request body also referred to `.jpeg`; the attached file is PNG).

- Dimensions: `1170 × 2532`.
- SHA-256: `47e58c29b02c635072b02aa69ef8101834a14fc5cabf1998770f2c38e9da4ff5`.
- Visible device time: `16:37`.

This establishes general-user listing availability in the Japan storefront no later than the Product Owner observation time.

## Availability and CueScore Pro

- App availability: `JPN` only.
- App `availableInNewTerritories`: `false`.
- CueScore Pro availability: `JPN` only.
- CueScore Pro `availableInNewTerritories`: `false`.
- Product ID: `com.takaakimailboxstar.cuescoreapps.pro`.
- Type: `NON_CONSUMABLE`.
- State: `APPROVED`.
- Japan price: `JPY 980`.

## Build 78 identity

- Product source commit: `6e0a569e32e473f6b5bfa14c74eeca1482820467`.
- App Store Connect Build ID: `eb2f6582-c42b-444d-9755-218e5e03ff49`.
- Processing / audience: `VALID` / `APP_STORE_ELIGIBLE`.
- Archive App/dSYM UUID: `080FD5E7-F806-3676-9AFD-500ED91C421B`.
- Archive executable SHA-256: `284bac85c018ee1edb89c5656e57284770297baa8f8000ee8660a5deee8309c4`.
- Archive `.storekit`: `0`.
- Product diff from source commit through the pre-release documentation commit: `0`.

## v1.0 close classification

### COMPLETE

- Version 1.0.
- Build 78.
- App Review.
- CueScore Pro approval.
- Product Owner Manual Release.
- Japan App Store public availability.

### Historical / Accepted

- Build 77 launch crash Reject.
- UIScene lifecycle recovery in Build 78.
- TestFlight/Sandbox `$5.99` storefront metadata issue; App Store Connect Japan price remains `¥980`.
- Blank Xcode Privacy Report evidence gap, previously accepted as non-blocking.

### NOT VERIFIED / non-blocking historical

- Physical iPad execution; iPad iOS 27 Simulator cold launch was `3/3 PASS`.
- Restore completion after Apple Account password authentication; initiation and existing verified entitlement passed.

### Deferred / Later

- CSV import/export.
- Automatic cloud sync.
- Match Sharing.
- Territories outside Japan.

No deferred work or next-version work was started.

## Empty review draft

The unsubmitted draft `ccca99c0-4ab6-4518-8133-58c51abe378e` still exists with state `READY_FOR_REVIEW`, no submitted date, and zero items. It did not prevent Version 1.0 from reaching `READY_FOR_SALE` / `READY_FOR_DISTRIBUTION` and has no relationship to the completed accepted submission, Build 78, or the released Version 1.0. It was not deleted, submitted, or changed.
