# CueScore v1.0 — TestFlight Readiness

Date: 2026-08-16  
Status: Build 1 smoke test PASS / Build 2 internal distribution PASS / Build 2 Main Player physical-device check PASS / Build 3 internal distribution PASS / Build 3 approved UI-change physical-device scope PASS

## App identity

- Display Name: CueScore Apps
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Apple Team: `U26DF88PRW`
- Marketing Version: `1.0`
- Initial TestFlight Build: `1`
- Latest TestFlight Build: `3`
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
- TestFlight App Review contact name, email, and phone: registered in App Store Connect（personal details intentionally omitted from this repository）

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
- Internal TestFlight Build 1 smoke test: PASS（Product Owner report, 2026-08-17）

## TestFlight Build 2 distribution（2026-08-17）

- Source commit: `b54649f` (`build: set TestFlight build number 2`)
- Marketing Version／Build: `1.0 (2)`
- Automated tests: 152 pass / 0 fail
- Source／generated／Xcode-copied native asset SHA-256: `7cc4d67e55936face1885d7b026c785ba49fbba35fda91197ed34d1be0d81e07`
- Signed Release Archive: PASS
- App Store validation: PASS（Xcode Organizer: all validation checks passed）
- TestFlight upload: PASS（2026-08-17 16:56 JST）
- Apple processing: PASS
- Export compliance: no encryption algorithms implemented; saved and accepted
- Internal group: `CueScore Internal Testers`（2 builds／automatic distribution）
- App Store Connect status: `Testing`
- Product Owner TestFlight update availability: PASS
- Build 2 physical-iPhone Main Player retention check: PASS（Product Owner report, 2026-08-18）
- Build 2 remaining physical-iPhone smoke-test items: not recorded as complete in this document
- The post-Build 2 manual-turn-change UI unification adopted on 2026-08-18 is implemented in source but is not included in uploaded Build 2.

## TestFlight Build 3 distribution（2026-08-18）

- Source commit: `d3aa729ff68533d4edf82fd8865df08b5894161a` (`build: set TestFlight build number 3`)
- Marketing Version／Build: `1.0 (3)`
- Included scope: post-Build 2 manual-turn-change UI unification
- Automated tests: 153 pass / 0 fail
- Source／generated／Xcode-copied native asset SHA-256: `23ae38c0a98413a7c8ef273a0af7dc888f92d9048a376bc59c14ed987b94bae9`
- iOS Simulator Debug build: PASS
- iOS Simulator Release build: PASS
- Signed Release Archive: PASS
- App Store validation: PASS（Xcode Organizer: all validation checks passed, approximately 12:57 JST）
- TestFlight upload: PASS（2026-08-18 13:01 JST）
- Apple processing: PASS
- Export compliance: `上記のアルゴリズムのどれでもない`; saved and accepted
- Internal group: `CueScore Internal Testers`（3 builds）
- App Store Connect status: `Testing`
- Build 3 physical-iPhone approved UI-change scope: PASS（manual turn change in Rotation／9-Ball／10-Ball／14-1／JPA 9-Ball, and JPA Dead leftmost placement; Product Owner report, 2026-08-18）
- Build 3 Backup／Offline／all-six-discipline completion／all-Analytics and other full smoke items: not newly verified
- App Store Review submission／public release: not performed

## Next gates

1. Decide the formally adopted analytics-renewal scope after reviewing the Build 4 candidate data audit; do not infer missing historical values.
2. Never reuse Build Number 1, 2, or 3 for a future upload.
3. Use Build Number 4 or greater for the next distribution build.
4. Keep App Store Review submission and public release behind a separate Product Owner approval gate.

Build 1, Build 2, and Build 3 were uploaded only after explicit Product Owner approval. App Store Review submission and public release have not been performed.
