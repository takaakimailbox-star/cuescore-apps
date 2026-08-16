# CueScore v1.0 — TestFlight Readiness

Date: 2026-08-16  
Status: Internal TestFlight Build 1 smoke test PASS

## App identity

- Display Name: CueScore Apps
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Apple Team: `U26DF88PRW`
- Marketing Version: `1.0`
- Build: `1`
- Platform: iPhone only
- Orientation: Portrait only
- Minimum iOS: 15.0
- Signing: Automatic

## Local preflight

- Git worktree clean at preflight start: PASS
- Automated tests: 146 pass / 0 fail
- Debug simulator build: PASS
- Release simulator build: PASS
- Native Backup export: physical iPhone PASS
- Native Backup restore: physical iPhone PASS
- Offline cold launch and primary flows: physical iPhone PASS
- Player photo and local data persistence: physical iPhone PASS
- 1024×1024 App icon, no alpha: PASS
- Capacitor／Cordova Privacy Manifest inclusion: PASS
- Official Description／Review Notes／Keywords／Release Notes／Public URLs: prepared

## Apple-side registration

- App ID registration: PASS
- App Store Connect app record creation: PASS
- Registered record values:
  - Platform: iOS
  - Name: CueScore Apps
  - Primary language: Japanese
  - Bundle ID: `com.takaakimailboxstar.cuescoreapps`
  - SKU: `cuescore-apps-ios-v1`
  - User Access: Full Access
- Latest Apple agreements must be accepted by the Account Holder when App Store Connect requires them.
- App Review contact name, email, and phone remain Product Owner input.

## Signing finding

- Installed valid identity: Apple Development
- Local Apple Distribution identity: not present after upload
- Xcode managed distribution signing: PASS
- Release archive creation and App Store validation: PASS
- App Store Connect upload: PASS at 2026-08-16 21:24 JST
- Export compliance: no encryption algorithms implemented; saved and accepted
- Internal group: `CueScore Internal Testers`（automatic distribution enabled）
- Internal tester: Product Owner invited
- TestFlight install on physical iPhone: PASS（2026-08-17）
- Existing players, photos, and match history retained after TestFlight install: PASS
- Offline launch after TestFlight install: PASS
- Native backup export after TestFlight install: PASS

## Next gates

1. Continue development with Build 2 or later when changes are ready.
2. Keep App Store release submission behind a separate Product Owner approval gate.

Build 1 was uploaded only after explicit Product Owner approval. App Store release submission has not been performed.
