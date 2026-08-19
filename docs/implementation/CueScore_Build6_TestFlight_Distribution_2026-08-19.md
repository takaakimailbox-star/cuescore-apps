# CueScore Apps — TestFlight Build 6 Distribution Record

Date: 2026-08-19 (JST)  
Status: Internal TestFlight distribution PASS / physical-device verification pending

## Scope and authority

- Product Owner explicitly approved creating and internally distributing Version 1.0 / Build 6.
- Export compliance was authorized as `上記のアルゴリズムのどれでもない`.
- Distribution was limited to the existing internal group `CueScore Internal Testers`.
- App Store Review submission, public release, and public-store final configuration were outside scope and were not performed.

## 1. Start state

- Starting `origin/main`: `8cf3c07afc34927d0c119e9e0088b51a2a369a31`
- Local branch: `codex/cuescore-step7b-native-ios-foundation`
- Local HEAD matched `origin/main`, and the worktree was clean before changing the Build Number.

## 2. Build source commit

- Build source commit: `7e54b8ce31aa2dde73568a1b08cdddb73a96fb20`
- Subject: `build: set TestFlight build number 6`
- The source commit was pushed to `origin/main` before distribution.

## 3. Version and identity

- Display Name: CueScore Apps
- Marketing Version: `1.0`
- Build Number: `6`
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Team ID: `U26DF88PRW`
- Device family: iPhone only
- Orientation: Portrait only
- Minimum iOS: 15.0
- Signing: Automatic Signing

## 4. Native asset consistency

- Source, generated native bundle, and Xcode copied assets matched by SHA-256 for the inspected Build 6 web assets.
- The archive contained the current App Icon and the Capacitor/Cordova privacy manifests.

## 5. Automated tests

- Result: `186 pass / 0 fail / 0 skipped`

## 6–7. Simulator builds

- iOS Simulator Debug: `BUILD SUCCEEDED`
- iOS Simulator Release: `BUILD SUCCEEDED`

## 8. Signed Release Archive

- Result: PASS
- Archive path: `/private/tmp/CueScore-Build6.xcarchive`
- Xcode Organizer identity: App `1.0 (6)`, correct Bundle ID, Team, iPhone-only destination, portrait orientation, iOS 15.0 minimum, and arm64 architecture.

## 9. App Store Validate

- Result: PASS
- Xcode result: `App 1.0 (6) validated`
- All validation checks passed before upload.

## 10. TestFlight upload

- Method: Xcode Organizer / `TestFlight Internal Only`
- Result: PASS
- Xcode result: `App 1.0 (6) uploaded`

## 11. Apple processing

- Result: PASS
- App Store Connect exposed Build 6 after processing.

## 12. Export compliance

- Answer: `上記のアルゴリズムのどれでもない`
- Saved successfully after Product Owner confirmation.
- Build 6 became ready for testing and then displayed as `テスト中`.

## 13. Internal tester group

- Existing group: `CueScore Internal Testers`
- Group type: Internal
- Build 6 was included through the `TestFlight Internal Only` upload flow.
- The group page showed `1人のテスター・6個のビルド`, and the Build 6 list row showed `CueScore Internal Testers`.
- A new group was not created.

## 14. Product Owner availability

- App Store Connect status: `テスト中`
- Build 6 group: `CueScore Internal Testers`
- Product Owner can update to Build 6 from the iPhone TestFlight app: YES
- The tester row may continue to show installed Build 5 until the Product Owner performs that update.

## 15. CURRENT_STATE update

- Recorded Build 6 Archive, Validate, upload, Apple processing, export-compliance answer, existing-group distribution, and `テスト中` status.
- Recorded physical-device verification as pending; no Build 6 physical-iPhone item was promoted to PASS.
- Recorded that Build Numbers 1–6 must not be reused.

## 16–17. GitHub documentation commit

- Documentation commit: recorded in Git history after this file and `docs/CURRENT_STATE.md` are committed.
- `origin/main` reflection: verified after push.

## 18. Pending verification

- Build 6 physical-iPhone verification remains pending Product Owner confirmation.
- Integrated Player Detail, sport switching, missing-data behavior, long Player names, normal/sample switching, self-best and recent-match links, and Rival/match-list navigation are not marked PASS by this distribution record.

## 19–20. Release controls

- App Store Review submission: not performed
- Public release: not performed
- Pricing, distribution regions, App Privacy, EU trader status, and public screenshots were not finalized or submitted.
- Bundle ID and Team ID were not changed.
- No unnecessary Distribution certificate was created.
- Build Numbers `1`–`6` must not be reused; a later distribution build must use `7` or greater.
