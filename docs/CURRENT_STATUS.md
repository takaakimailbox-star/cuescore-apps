# CueScore Current Status

- Updated: 2026-09-19
- Version / Build: `1.0 (75)`
- Build 74 Product Owner device review: PASS（全項目がスクロールなしで表示）
- Build 75 scope: Build 74の余剰189.5pxを、rowを変えず4ブロック間の固定spacingへ再配分
- States: `確認中` / `CueScore Free` / `CueScore Pro ✓`を維持
- Entry: Freeは`Proを購入・購入を復元`、Proは`購入・復元について`から既存CueScore Pro画面を再利用
- Protected scope: StoreKit、購入／復元、Free／Pro境界、保存data、Build 71 Startup Promise Safetyは変更なし
- Tests: Settings focused `44 pass / 0 fail`、Full Node `425 pass / 0 fail / 0 skipped`
- Geometry: 390×844 fixed tab bar込みでPrivacy bottom `678.5px` <= bottom nav top `776px - 60px`（余裕`97.5px`）、bounded spacer 40px、Data row 63px／legal row 44px
- Dependency: `ion-ios-filesystem 1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`、`capacitor-swift-pm 8.0.2`
- Build verification: Release Simulator build／device Archive PASS、Bundle ID `com.takaakimailboxstar.cuescoreapps`、Archive `1.0 (75)`、`.storekit` 0件
- Build source commit: `9cfbf671f7d858602cd72aa015443f112cfae21b`（mainへpush済み）
- App Store Connect: Build ID `1c0b1ec2-24c1-4e73-a15c-c6eed4b950aa`、`VALID`、`usesNonExemptEncryption=false`
- Internal TestFlight: `CueScore Internal Testers`対象を確認済み
- Current gate: `READY FOR PRODUCT OWNER BUILD 75 SETTINGS SPACING POLISH TEST`
- External TestFlight: not performed
- App Review: not submitted
- Public release: not performed
- Canonical instruction: `docs/handoff/CURRENT_DECISION.md`
- Canonical report: `docs/handoff/CURRENT_REPORT.md`

For long-term history and evidence, use `docs/CURRENT_STATE.md`. Do not expand this file into a build-by-build archive.
