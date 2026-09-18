# CueScore Current Status

- Updated: 2026-09-18
- Version / Build: `1.0 (73)`
- Build 72 Product Owner device review: PASS
- Build 73 scope: Build 72の現在プラン表示を維持し、390×844のSettingsで全主要項目をroot scrollなしに表示
- States: `確認中` / `CueScore Free` / `CueScore Pro ✓`を維持
- Entry: Freeは`Proを購入・購入を復元`、Proは`購入・復元について`から既存CueScore Pro画面を再利用
- Protected scope: StoreKit、購入／復元、Free／Pro境界、保存data、Build 71 Startup Promise Safetyは変更なし
- Tests: Settings focused `8 pass / 0 fail`、Full Node `419 pass / 0 fail / 0 skipped`
- Visual: 390×844でUnknown／Free／Pro、縦横overflowなし、Privacyとcopyrightまで初期位置で表示、Data row 63px／legal row 44px
- Dependency: `ion-ios-filesystem 1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`、`capacitor-swift-pm 8.0.2`
- Build verification: Release Simulator build／device Archive PASS、Bundle ID `com.takaakimailboxstar.cuescoreapps`、Archive `1.0 (73)`、`.storekit` 0件
- Build source commit: `50db6291a12222f31e708c86ce3f68af3123edd3`（mainへpush済み）
- App Store Connect: Build ID `c494bb28-686a-4dbd-a0cb-60555a4b90db`、`VALID`、`usesNonExemptEncryption=false`
- Internal TestFlight: `CueScore Internal Testers`へ追加済み
- Current gate: `READY FOR PRODUCT OWNER BUILD 73 COMPACT SETTINGS TEST`
- External TestFlight: not performed
- App Review: not submitted
- Public release: not performed
- Canonical instruction: `docs/handoff/CURRENT_DECISION.md`
- Canonical report: `docs/handoff/CURRENT_REPORT.md`

For long-term history and evidence, use `docs/CURRENT_STATE.md`. Do not expand this file into a build-by-build archive.
