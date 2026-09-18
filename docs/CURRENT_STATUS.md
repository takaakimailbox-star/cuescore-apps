# CueScore Current Status

- Updated: 2026-09-18
- Version / Build: `1.0 (72)`
- Build 71 Product Owner device review: PASS
- Build 72 scope: Settings上部へ既存`CueScoreEntitlement`をSSOTとする現在プランcardを追加
- States: `確認中` / `CueScore Free` / `CueScore Pro ✓`
- Entry: Freeは`Proを購入・購入を復元`、Proは`購入・復元について`から既存CueScore Pro画面を再利用
- Protected scope: StoreKit、購入／復元、Free／Pro境界、保存data、Build 71 Startup Promise Safetyは変更なし
- Tests: Build 72 focused `7 pass`、Build 70 + Build 72 focused `16 pass`、Full Node `418 pass / 0 fail / 0 skipped`
- Visual: 390×844相当でUnknown／Free／Pro、badge除去、横崩れなしを確認
- Dependency: `ion-ios-filesystem 1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`、`capacitor-swift-pm 8.0.2`
- Build verification: Release Simulator build／device Archive PASS、Bundle ID `com.takaakimailboxstar.cuescoreapps`、Archive `1.0 (72)`、`.storekit` 0件
- App Store Connect: upload pending
- External TestFlight: not performed
- App Review: not submitted
- Public release: not performed
- Canonical instruction: `docs/handoff/CURRENT_DECISION.md`
- Canonical report: `docs/handoff/CURRENT_REPORT.md`

For long-term history and evidence, use `docs/CURRENT_STATE.md`. Do not expand this file into a build-by-build archive.
