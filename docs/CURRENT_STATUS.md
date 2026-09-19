# CueScore Current Status

- Updated: 2026-09-19
- Version / Build: `1.0 (77)`
- Build 76 Product Owner evidence: Japan SandboxでFree、Pro画面`$5.99`、Apple購入sheet`¥980`。購入は未確定
- Build 77 scope: Pro画面open時に古い商品価格を破棄し、native StoreKitから商品をFresh取得するまで`価格を確認中…`／購入不可
- Success: Fresh `Product.displayPrice`を表示して購入buttonを有効化
- Failure: `価格を取得できません`、購入不可、古いstorefront価格へfallbackしない
- Protected scope: Product ID、purchase、verified transaction／finish、currentEntitlements、Transaction.updates、restore、CueScoreEntitlement、Free／Pro境界、Build 76 Settings、Startup Promise Safetyは変更なし
- Tests: IAP focused `29 pass / 0 fail`、Full Node `432 pass / 0 fail / 0 skipped`
- Dependency: `ion-ios-filesystem 1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`、`capacitor-swift-pm 8.0.2`
- Build verification: Release Simulator build／device Archive PASS、Bundle ID `com.takaakimailboxstar.cuescoreapps`、Archive `1.0 (77)`、`.storekit` 0件
- Source identity: source／iOS copied／Archiveの`monetization-v1.js` SHA-256一致
- Distribution: commit／push／Internal TestFlightは未実施
- Current gate: Build 77候補完成。GitHub反映とInternal TestFlight配布待ち
- External TestFlight: not performed
- App Review: not submitted
- Public release: not performed
- Canonical instruction: `docs/handoff/CURRENT_DECISION.md`
- Canonical report: `docs/handoff/CURRENT_REPORT.md`

For long-term history and evidence, use `docs/CURRENT_STATE.md`. Do not expand this file into a build-by-build archive.
