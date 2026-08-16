# CueScore v1.0 — TestFlight Readiness

Date: 2026-08-16  
Status: Build 1 upload PASS / Apple processing in progress

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

## Next gates

1. Wait for Apple processing of Build 1.
2. Complete export-compliance information if App Store Connect requests it.
3. Enable internal TestFlight testing.
4. Install through TestFlight and verify that local data is retained across the update.

Build 1 was uploaded only after explicit Product Owner approval. App Store release submission has not been performed.
