# CueScore Apps — TestFlight Build 3 Distribution Record

Date: 2026-08-18  
Status: Internal TestFlight distribution PASS / approved UI-change physical-device scope PASS

## Scope and authority

- Product Owner explicitly approved creating and distributing Build 3.
- Export compliance was authorized as `上記のアルゴリズムのどれでもない`.
- Distribution was limited to the existing internal group `CueScore Internal Testers`.
- App Store Review submission and public release were outside scope and were not performed.

## Build identity

- Display Name: CueScore Apps
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Marketing Version: `1.0`
- Build Number: `3`
- Source commit: `d3aa729ff68533d4edf82fd8865df08b5894161a`
- Source commit subject: `build: set TestFlight build number 3`
- Included scope: post-Build 2 manual-turn-change UI unification

## Preflight verification

- Automated tests: 153 pass / 0 fail
- Source／generated／Xcode-copied native asset SHA-256: `23ae38c0a98413a7c8ef273a0af7dc888f92d9048a376bc59c14ed987b94bae9`
- iOS Simulator Debug build: PASS
- iOS Simulator Release build: PASS
- Signed Release Archive: PASS

## Apple distribution result

- App Store validation: PASS（approximately 12:57 JST）
- Upload to Apple: PASS（13:01 JST）
- Xcode Organizer record: Version `1.0 (3)`, Build Number `3`, `Uploaded to Apple`
- Apple processing: PASS
- Export compliance: `上記のアルゴリズムのどれでもない`; saved and accepted
- Existing internal group: `CueScore Internal Testers`
- Group build count after addition: 3
- Build 3 App Store Connect status: `Testing`

## Physical-iPhone verification（Product Owner report, 2026-08-18）

- Rotation：通常ファール／セーフティ後の手動交代 PASS
- 9-Ball：通常ファール／セーフティ後の手動交代 PASS
- 10-Ball：通常ファール／セーフティ後の手動交代 PASS
- Straight Pool（14-1）：通常ファール／セーフティ後の手動交代 PASS
- JPA 9-Ball：通常ファール／セーフティ後の手動交代 PASS
- JPA 9-Ball：「デッド」の一番左配置 PASS
- 3 Cushion：今回の変更対象外であることを仕様・実装scopeで確認。3C完走PASSではない

## Items not newly verified by this report

- Backup書き出し／復元
- Offline起動
- Player写真／データ保持
- 全6競技の完全完走
- 全Analytics
- その他のBuild 3総合スモーク項目

These items retain any prior-build historical result but are not newly treated as Build 3 PASS.

## Release controls

- Build Number `3` must not be reused.
- The next distribution build must use Build Number `4` or greater.
- App Store Review submission: not performed
- Public release: not performed
- Any future App Store Review submission or public release requires separate explicit Product Owner approval.
