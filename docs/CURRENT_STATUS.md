# CueScore Current Status

- Updated: 2026-09-19
- Version / Build: `1.0 (74)`
- Build 73 Product Owner device review: FAIL（Privacy Policyがfixed bottom tab barの下）
- Build 74 scope: 後段CSSが再適用したSettings spacerだけを除去し、Privacy Policyをbottom tab barより上へ配置
- States: `確認中` / `CueScore Free` / `CueScore Pro ✓`を維持
- Entry: Freeは`Proを購入・購入を復元`、Proは`購入・復元について`から既存CueScore Pro画面を再利用
- Protected scope: StoreKit、購入／復元、Free／Pro境界、保存data、Build 71 Startup Promise Safetyは変更なし
- Tests: Settings focused `25 pass / 0 fail`、Full Node `422 pass / 0 fail / 0 skipped`
- Geometry: 390×844 fixed tab bar込みでPrivacy bottom `586.5px` <= bottom nav top `776px`（余裕`189.5px`）、spacer 0px、Data row 63px／legal row 44px
- Dependency: `ion-ios-filesystem 1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`、`capacitor-swift-pm 8.0.2`
- Build verification: Release Simulator build／device Archive PASS、Bundle ID `com.takaakimailboxstar.cuescoreapps`、Archive `1.0 (74)`、`.storekit` 0件
- Build source commit: commit前
- App Store Connect: upload前
- Internal TestFlight: upload前
- Current gate: Build 74 Archive PASS、GitHub反映／Internal TestFlight upload前
- External TestFlight: not performed
- App Review: not submitted
- Public release: not performed
- Canonical instruction: `docs/handoff/CURRENT_DECISION.md`
- Canonical report: `docs/handoff/CURRENT_REPORT.md`

For long-term history and evidence, use `docs/CURRENT_STATE.md`. Do not expand this file into a build-by-build archive.
