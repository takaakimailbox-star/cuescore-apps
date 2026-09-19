# CueScore Current Status

- Updated: 2026-09-19
- Version / Build: `1.0 (76)`
- Build 75 Product Owner device review: PASS（全項目fit／spacing）、follow-upとして上下スワイプ時の移動を停止
- Build 76 scope: 1画面に収まるcompact Settingsのscroll ownerだけを固定し、小さい端末のoverflow fallbackを維持
- States: `確認中` / `CueScore Free` / `CueScore Pro ✓`を維持
- Entry: Freeは`Proを購入・購入を復元`、Proは`購入・復元について`から既存CueScore Pro画面を再利用
- Protected scope: StoreKit、購入／復元、Free／Pro境界、保存data、Build 71 Startup Promise Safetyは変更なし
- Tests: Settings focused `19 pass / 0 fail`、Full Node `428 pass / 0 fail / 0 skipped`
- Geometry: 390×844 fixed tab bar込みでPrivacy bottom `678.5px` <= bottom nav top `776px - 60px`（余裕`97.5px`）、bounded spacer 40px、Data row 63px／legal row 44px
- Dependency: `ion-ios-filesystem 1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`、`capacitor-swift-pm 8.0.2`
- Build verification: Release Simulator build／device Archive PASS、Bundle ID `com.takaakimailboxstar.cuescoreapps`、Archive `1.0 (76)`、`.storekit` 0件
- Build source commit: `84d53ba4bdaafc9b4a7f1e1a66bb143929883b25`（mainへpush済み）
- App Store Connect: Build ID `728bec63-150b-4736-ac71-42b61aa15b4b`、`VALID`、`usesNonExemptEncryption=false`
- Internal TestFlight: `CueScore Internal Testers`対象を確認済み
- Current gate: `READY FOR PRODUCT OWNER BUILD 76 SETTINGS SCROLL LOCK TEST`
- External TestFlight: not performed
- App Review: not submitted
- Public release: not performed
- Canonical instruction: `docs/handoff/CURRENT_DECISION.md`
- Canonical report: `docs/handoff/CURRENT_REPORT.md`

For long-term history and evidence, use `docs/CURRENT_STATE.md`. Do not expand this file into a build-by-build archive.
