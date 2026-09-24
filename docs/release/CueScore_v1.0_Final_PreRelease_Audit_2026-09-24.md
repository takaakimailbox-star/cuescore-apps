# CueScore Apps v1.0 Final Pre-Release Audit

- Date: 2026-09-24
- Repository main: `c66008647a79c624bfd40df300956c84a7a4bc97`
- Product source: `6e0a569e32e473f6b5bfa14c74eeca1482820467`
- Candidate: `1.0 (78)`
- Result: `READY FOR PRODUCT OWNER MANUAL RELEASE`
- Release performed: **No**

## Apple approval and release control

Read-only App Store Connect API read-back at `2026-09-24T02:29:12.961Z` confirmed:

- Review submission `7fd64b66-fe2e-424e-9038-a37cbddf8e87`: `COMPLETE`.
- iOS App Version 1.0 item: `APPROVED`.
- CueScore Pro IAP version item: `APPROVED`.
- Version 1.0: `PENDING_DEVELOPER_RELEASE`, release type `MANUAL`, earliest release date unset.
- Selected build: Build `78`, ID `eb2f6582-c42b-444d-9755-218e5e03ff49`, `VALID`, `APP_STORE_ELIGIBLE`.
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`.

These values match the Product Owner's 2026-09-24 Acceptance notice. No Release or App Store Connect mutation was performed.

## Availability and CueScore Pro

- App: JPN only; `availableInNewTerritories=false`.
- CueScore Pro: JPN only; `availableInNewTerritories=false`.
- Product ID: `com.takaakimailboxstar.cuescoreapps.pro`.
- Type/state: `NON_CONSUMABLE` / `APPROVED`.
- Active Japan customer price: `JPY 980`.
- Existing TestFlight `$5.99` display remains the accepted TestFlight/Sandbox storefront metadata risk. Product pricing was not changed.

## Approved metadata

The API values match the Official v1.0 package for App name, subtitle, description, promotional text, keywords, Support URL, Privacy Policy URL, copyright, categories, and age-rating answers. The iPhone 6.5-inch screenshot set contains six assets and all are `COMPLETE`. Privacy, Terms, and Support public URLs each returned HTTP 200.

Current API values include primary category `SPORTS`, secondary category `UTILITIES`, and all age-rating content answers at their approved non-restricted values. The App Privacy questionnaire itself is not exposed by the authenticated public API, and the in-app browser session was not signed in; therefore a fresh 2026-09-24 UI read-back is `NOT VERIFIED`. Prior accepted evidence shows “data not collected,” the product source has not changed since Build 78, and Apple approved the version, so the existing privacy evidence gap remains non-blocking.

The Official App Store package's operational notes still mention Build 77 because that package revision predates the Build 78 crash recovery. The approved metadata text is unchanged; Build 78 identity is governed by the later RC, resubmission, and this audit evidence. No Official document was rewritten during this audit.

## Build 78 identity and fixes

- Source commit is an ancestor of current main; every change after it is documentation/evidence only. Product diff from the source commit to current main is zero.
- Archive exists at the recorded local verification path. Bundle/version/build are `com.takaakimailboxstar.cuescoreapps` / `1.0` / `78`.
- Archive `.storekit`: 0 files.
- App/dSYM UUID: `080FD5E7-F806-3676-9AFD-500ED91C421B`.
- Executable SHA-256: `284bac85c018ee1edb89c5656e57284770297baa8f8000ee8660a5deee8309c4`.
- `Package.resolved` SHA-256: `1e68bbcd65eea223108220becced97a2d9eb05c79aaaa88e6f879078b8a6a0aa`.
- Dependencies remain `ion-ios-filesystem 1.1.2` at `0d81e26e828ff9582807e2339112cedf2e0fab85` and `capacitor-swift-pm 8.0.2` at `13a39179b3df796f3bb2e70c47ccdd92593f34d2`.
- UIScene lifecycle, Race selector bottom clearance, and Player Search focus fix are present in the unchanged Build 78 source.

Verification evidence remains: focused `11/11`, full Node `443/443`, native UI `1/1`, iPhone iOS 27 cold launch `3/3`, iPad iOS 27 Simulator cold launch `3/3`, and `NoSceneLifecycleAdoption` 0. Product Owner physical iPhone checks passed for cold launch, Race selector, Player Search, and Pro entitlement. Physical iPad and completed Restore authentication remain not verified, not failed.

## Release classification

### BLOCKER

- None.

### NON-BLOCKING

- Empty unsubmitted review draft `ccca99c0-4ab6-4518-8133-58c51abe378e` remains `READY_FOR_REVIEW`, has no submitted date and zero items. It has no relationship to the complete accepted submission, Version 1.0, Build 78, or Release.
- Historical Build 77 references remain in the Official App Store package's operational notes; later Build 78 evidence is authoritative for artifact identity.

### ACCEPTED RISK

- TestFlight/Sandbox `$5.99` display anomaly; ASC Japan price and Apple purchase sheet remain `¥980`.
- Blank Xcode Privacy Report evidence gap; no confirmed product privacy defect or missing declaration.

### NOT VERIFIED

- Physical iPad execution (iPad Simulator is `3/3 PASS`).
- Restore completion after Apple Account password authentication (initiation and existing verified entitlement passed).
- Fresh App Privacy UI read-back on 2026-09-24; prior accepted UI evidence and approved review remain consistent.

## STOP

The pre-release audit found no blocker. The next action belongs to the Product Owner: manually release Version 1.0 in App Store Connect. This audit did not click Release, change automatic release, create Build 79, archive, upload, or change source, metadata, price, availability, IAP, or Official specifications.
