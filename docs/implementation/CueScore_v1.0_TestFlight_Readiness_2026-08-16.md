# CueScore v1.0 — TestFlight Readiness

Date: 2026-08-16  
Status: Local preflight PASS / Apple distribution setup required

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

## Apple-side prerequisites

- App Store Connect app record must exist before the first build upload.
- Proposed record values:
  - Platform: iOS
  - Name: CueScore Apps
  - Primary language: Japanese
  - Bundle ID: `com.takaakimailboxstar.cuescoreapps`
  - SKU candidate: `cuescore-apps-ios-v1`
  - User Access: Full Access（single-owner operation assumption; owner decides）
- Latest Apple agreements must be accepted by the Account Holder when App Store Connect requires them.
- App Review contact name, email, and phone remain Product Owner input.

## Signing finding

- Installed valid identity: Apple Development
- Apple Distribution identity: not found at 2026-08-16 preflight
- Distribution certificate/profile creation changes persistent Apple account signing state. Create through Xcode automatic signing only after Product Owner confirmation.

## Next gates

1. Product Owner confirms the SKU and User Access choice.
2. Product Owner signs in to App Store Connect and creates the app record; legal agreement acceptance remains a user action.
3. Create or fetch Apple Distribution signing material through Xcode.
4. Produce the Release archive and run Validate App.
5. Review validation output; do not upload until Product Owner explicitly approves upload.
6. Upload Build 1, wait for Apple processing, complete export-compliance information, and enable internal testing.
7. Install through TestFlight and verify that local data is retained across the update.

No build has been uploaded and no App Store Connect record has been created by this preparation step.
