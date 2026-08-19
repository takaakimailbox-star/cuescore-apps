# CueScore Apps — TestFlight Build 7 Distribution Record

Date: 2026-08-19 (JST)  
Status: Internal TestFlight distribution PASS / physical-device verification pending

## Scope and authority

- Product Owner explicitly approved creating and internally distributing Version 1.0 / Build 7.
- Export compliance was authorized as `上記のアルゴリズムのどれでもない`.
- Distribution was limited to the existing internal group `CueScore Internal Testers`.
- App Store Review submission, public release, and public-store final configuration were outside scope and were not performed.

## 1. Start state

- Starting `origin/main`: `8ad50fa0f81139bb1d0d6f71b58a3549e9d90eca`
- Local branch: `codex/cuescore-step7b-native-ios-foundation`
- Local HEAD matched `origin/main`, and the worktree was clean before changing the Build Number.

## 2. Build source commit

- Build source commit: `a25c7c692637266f12abcc89e895bc64c65dce24`
- Subject: `build: set TestFlight build number 7`
- The source commit was pushed to `origin/main` before distribution.

## 3. Version and identity

- Display Name: CueScore Apps
- Marketing Version: `1.0`
- Build Number: `7`
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Team ID: `U26DF88PRW`
- Device family: iPhone only
- Orientation: Portrait only
- Minimum iOS: 15.0
- Signing: Automatic Signing

## 4. Native asset consistency

Source, generated native bundle, and Xcode copied assets matched by SHA-256:

- `index.html`: `61bc6844a52146be176160d56b394bd641ab21eed90a016f17cb38cd0c5e4d77`
- JavaScript bundle: `fd765c487a03cba1fc93cde0cf672e0a6e6f43451406dad6497f8a455249aeeb`
- CSS bundle: `b8a1eb8c348c62256f4f47a478cc2758f8d0794832715c66dff313b0010a5864`

The archive contained the current App Icon and privacy manifests.

## 5. Automated tests

- Result: `194 pass / 0 fail / 0 skipped`

## 6–7. Simulator builds

- iOS Simulator Debug: `BUILD SUCCEEDED`
- iOS Simulator Release: `BUILD SUCCEEDED`

## 8. Signed Release Archive

- Result: PASS
- Archive path: `/private/tmp/CueScore-Build7.xcarchive`
- Xcode Organizer identity: App `1.0 (7)`, correct Bundle ID and Team, iPhone-only destination, portrait orientation, iOS 15.0 minimum, and arm64 architecture.

## 9. App Store Validate

- Result: PASS
- Xcode result: `App 1.0 (7) validated`
- All validation checks passed before upload.

## 10. TestFlight upload

- Method: Xcode Organizer / `TestFlight Internal Only`
- Result: PASS
- Xcode result: `App 1.0 (7) uploaded`

## 11. Apple processing

- Result: PASS
- App Store Connect exposed Build 7 with upload date `2026年8月19日 18:17` after processing.

## 12. Export compliance

- Answer: `上記のアルゴリズムのどれでもない`
- Saved successfully after Product Owner confirmation.
- Build 7 changed from `コンプライアンスがありません` to ready for testing and then displayed as `テスト中`.

## 13. Internal tester group

- Existing group: `CueScore Internal Testers`
- Group type: Internal
- Build 7 was included through the `TestFlight Internal Only` upload flow.
- The Build 7 list row showed `CueScore Internal Testers`.
- A new group was not created.

## 14. Product Owner availability

- App Store Connect status: `テスト中`
- Build 7 group: `CueScore Internal Testers`
- Product Owner can update to Build 7 from the iPhone TestFlight app: YES

## 15. CURRENT_STATE update

- Recorded Build 7 Archive, Validate, upload, Apple processing, export-compliance answer, existing-group distribution, and `テスト中` status.
- Recorded physical-device verification as pending; no Build 7 physical-iPhone item was promoted to PASS.
- Recorded that Build Numbers 1–7 must not be reused.

## 16–17. GitHub documentation commit

- Documentation commit: recorded in Git history after this file and `docs/CURRENT_STATE.md` are committed.
- `origin/main` reflection: verified after push.

## 18. Pending verification

- Build 7 physical-iPhone verification remains pending Product Owner confirmation.
- Player information, all six sport-detail screens, white-background text visibility, primary metrics, recent form, self-best, recent matches, and Rival/all-match navigation are not marked PASS by this distribution record.

## 19–20. Release controls

- App Store Review submission: not performed
- Public release: not performed
- Pricing, distribution regions, App Privacy, EU trader status, and public screenshots were not finalized or submitted.
- Bundle ID and Team ID were not changed.
- No unnecessary Distribution certificate was created.
- Build Numbers `1`–`7` must not be reused; a later distribution build must use `8` or greater.
