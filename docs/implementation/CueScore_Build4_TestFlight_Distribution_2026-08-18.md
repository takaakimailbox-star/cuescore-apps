# CueScore Apps — TestFlight Build 4 Distribution Record

Date: 2026-08-18  
Status: Internal TestFlight distribution PASS / physical-device verification pending

## Scope and authority

- Product Owner explicitly approved creating and internally distributing Build 4.
- Export compliance was authorized as `上記のアルゴリズムのどれでもない`.
- Distribution was limited to the existing internal group `CueScore Internal Testers`.
- Xcode direct installation to the Product Owner iPhone was not required.
- App Store Review submission and public release were outside scope and were not performed.

## Start state

- Starting `origin/main`: `ba86d53faa684a7a5038253db85907fe834a36a2`
- Local branch: `codex/cuescore-step7b-native-ios-foundation`
- Local HEAD matched `origin/main` and the worktree was clean before the Build 4 change.

## Build identity

- Display Name: CueScore Apps
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Team ID: `U26DF88PRW`
- Marketing Version: `1.0`
- Build Number: `4`
- Build source commit: `257f707022afe0f4b9b3f119b28e2532259dcb49`
- Source commit subject: `build: set TestFlight build number 4`
- Device family: iPhone only
- Orientation: Portrait only
- Minimum iOS: 15.0
- Signing: Automatic Signing

## Included scope

- Player analysis top reordered as: 今の状態 → 主要指標 → 推移 → 今回のポイント → 自己ベスト → 詳細分析入口
- Eligible-record-only break-in rate for 9-Ball, 10-Ball, Rotation, and JPA 9-Ball
- Player-break eligible-rack masuwari rate for 9-Ball and 10-Ball
- Existing average-foul definition retained
- Eligible-record-only personal bests with Match Detail links
- Missing-value contract: `—`, `データなし`, `比較できません`
- Rival Analysis and Single Match Analysis retained

## Preflight verification

- Automated tests: 175 pass / 0 fail / 0 skipped
- Source／generated／Xcode-copied native asset SHA-256: `4fb3e4d935f085485305c530b129b7f7052d940b4493788ff7dcabaaf8a3fbc1`
- iOS Simulator Debug: BUILD SUCCEEDED
- iOS Simulator Release: BUILD SUCCEEDED
- Signed Release Archive: PASS
- Archive: `/tmp/CueScoreApps-1.0-4.xcarchive`

## Apple distribution result

- App Store validation: PASS
- TestFlight upload: PASS
- Xcode Organizer record: Version `1.0 (4)`, Build Number `4`, uploaded to Apple
- Apple processing: PASS
- Export compliance: `上記のアルゴリズムのどれでもない`; saved and accepted
- Existing internal group: `CueScore Internal Testers`
- Group build count after addition: 4
- Build 4 App Store Connect status: `Testing`
- Product Owner can update from the iPhone TestFlight app: YES

## Physical-iPhone verification

Status: pending Product Owner verification.

No Build 4 physical-device item is marked PASS by this record. The following remain pending:

- Player analysis top layout and portrait overflow
- Per-discipline primary metrics for all six disciplines
- Eligible/ineligible break-in and masuwari display
- Trend tabs
- Personal best eligibility and Match Detail navigation
- Missing-value display
- Rival Analysis and Single Match Analysis navigation
- Long player names and empty-data states

## Release controls

- Build Numbers `1`, `2`, `3`, and `4` must not be reused.
- The next distribution build must use Build Number `5` or greater.
- App Store Review submission: not performed
- Public release: not performed
- Pricing, regions, App Privacy, EU trader status, and public screenshots were not finalized or submitted.
- Any App Store Review submission or public release requires separate explicit Product Owner approval.
