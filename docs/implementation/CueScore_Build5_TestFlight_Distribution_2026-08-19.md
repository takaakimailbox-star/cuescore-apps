# CueScore Apps — TestFlight Build 5 Distribution Record

Date: 2026-08-19 (JST)  
Status: Internal TestFlight distribution PASS / physical-device verification pending

## Scope and authority

- Product Owner explicitly approved creating and internally distributing Version 1.0 / Build 5.
- Export compliance was authorized as `上記のアルゴリズムのどれでもない`.
- Distribution was limited to the existing internal group `CueScore Internal Testers`.
- App Store Review submission, public release, and public-store final configuration were outside scope and were not performed.

## 1. Start state

- Starting `origin/main`: `1797e4337b7e8fba6a5a3c18c230a84625183cba`
- Local branch: `codex/cuescore-step7b-native-ios-foundation`
- Local HEAD matched `origin/main`, and the worktree was clean before changing the Build Number.

## 2. Build source commit

- Build source commit: `f7f7f97bb705619fbebad98f99d4c57643ebe7a4`
- Subject: `build: set TestFlight build number 5`
- The source commit was pushed to `origin/main` before distribution.

## 3. Version and identity

- Display Name: CueScore Apps
- Marketing Version: `1.0`
- Build Number: `5`
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Team ID: `U26DF88PRW`
- Device family: iPhone only
- Orientation: Portrait only
- Minimum iOS: 15.0
- Signing: Automatic Signing

## 4. Native asset consistency

Source, generated native bundle, and Xcode copied assets matched by SHA-256.

| Asset | SHA-256 |
| --- | --- |
| `index.html` | `a5b9761eddf58f88b9404fb112478444f6e4c60d49b3631ef1d4d94db1a55d85` |
| `analysis-build4.js` | `96ef723c7b32c5d97723420e2bd6c724274100e62153525f8e68f447d10f2ea1` |
| `analysis-build4.css` | `4fb67c5a59305d365efd95c1c075a69fe22231332bb311c3dc10e843d3bdd95e` |
| `analytics-build4-metrics.js` | `0fcd14fbc1886352e1b11e24c9ef6e8449951b0fb65b975fb5870c7850a1cbc0` |

## 5. Automated tests

- Result: `180 pass / 0 fail / 0 skipped`
- The expected quota-boundary rollback console message appeared; it was covered by the passing safety test and was not a failure.

## 6–7. Simulator builds

- iOS Simulator Debug: `BUILD SUCCEEDED`
- iOS Simulator Release: `BUILD SUCCEEDED`

## 8. Signed Release Archive

- Result: PASS
- Archive path: `/private/tmp/CueScore-Build5.xcarchive`
- Xcode Organizer identity: App `1.0 (5)`, correct Bundle ID, Team, and arm64 architecture.

## 9. App Store Validate

- Result: PASS
- Xcode result: `App validation complete: App 1.0 (5) validated`
- All validation checks passed before upload.

## 10. TestFlight upload

- Method: Xcode Organizer / `TestFlight Internal Only`
- Result: PASS
- Xcode result: `App upload complete: App 1.0 (5) uploaded`

## 11. Apple processing

- Result: PASS
- App Store Connect exposed Build 5 for testing after processing.

## 12. Export compliance

- Answer: `上記のアルゴリズムのどれでもない`
- Saved successfully.
- Build 5 changed from `コンプライアンスがありません` to `テスト準備完了`, and then to `テスト中` after internal-group availability.

## 13. Internal tester group

- Existing group: `CueScore Internal Testers`
- Group type: Internal
- Tester count shown for Build 5: 1
- A new group was not created.

## 14. Product Owner availability

- App Store Connect status: `テスト中`
- Build 5 group: `CueScore Internal Testers`
- Product Owner can update to Build 5 from the iPhone TestFlight app: YES

## 15. CURRENT_STATE update

- Recorded Build 5 Archive, Validate, upload, Apple processing, export-compliance answer, existing-group distribution, and `テスト中` status.
- Recorded physical-device verification as pending; no Build 5 physical-iPhone item was promoted to PASS.
- Recorded that Build Numbers 1–5 must not be reused.

## 16–17. GitHub documentation commit

- Documentation commit: recorded after this file and `docs/CURRENT_STATE.md` are committed.
- `origin/main` reflection: recorded after push.

## 18. Pending verification

- Build 5 physical-iPhone verification remains pending Product Owner confirmation.
- In particular, Player-origin navigation, compact Player Analytics UI, self-best Match Detail links, rate eligibility behavior, missing-data display, and retained Rival / Single Match Analysis navigation are not marked PASS by this distribution record.

## 19–20. Release controls

- App Store Review submission: not performed
- Public release: not performed
- Pricing, distribution regions, App Privacy, EU trader status, and public screenshots were not finalized or submitted.
- Bundle ID and Team ID were not changed.
- No unnecessary Distribution certificate was created.
- Build Numbers `1`–`5` must not be reused; a later distribution build must use `6` or greater.
