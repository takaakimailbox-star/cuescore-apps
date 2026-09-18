# CueScore Current Status

- Updated: 2026-09-18
- Version / Build: `1.0 (69)`
- GitHub baseline: `6bd467fe5fdfe715ea24bc3fc1c3475ba434f65f`
- Build 68 Product Owner result: `PRODUCTS_OK`、purchase sheet、認証までPASS。認証後は`購入を確認しています…`のままでPro未解放。起動時errorも再現
- Build 69 scope: purchase behaviorを変えず、native P01〜P12、JavaScript J01〜J06、visibility／refresh、Transaction.updates、currentEntitlements、listener registration、Storefrontのdiagnosticを追加
- Product behavior: Product ID、StoreKit `displayPrice`、purchase、verified entitlement、finish、Restore、Free / Pro仕様は変更なし
- Tests: focused diagnostics `24 pass / 0 fail`、Full Node `402 pass / 0 fail / 0 skipped`、Release Simulator build PASS
- Local StoreKit: XCTestはiOS 26.5 Simulator、UITestはiOS 27 Simulatorでtest operationが応答せず中断。`TEST ENVIRONMENT BLOCKED`であり製品FAILではない
- TestFlight: Build ID `0a7e49b7-dd49-4ead-8733-5692e0bceef2`、`VALID`、`usesNonExemptEncryption=false`、`CueScore Internal Testers`配布対象
- Current gate: `READY FOR PRODUCT OWNER BUILD 69 PURCHASE DIAGNOSTIC TEST`
- Product Owner next: TestFlightで1.0 (69)へ更新し、購入を1回だけ実行して最終diagnostic phaseを報告。Restore／再購入は行わない
- External TestFlight: not performed
- App Review: not submitted
- Public release: not performed
- Canonical instruction: `docs/handoff/CURRENT_DECISION.md`
- Canonical report: `docs/handoff/CURRENT_REPORT.md`

For long-term history and evidence, use `docs/CURRENT_STATE.md`. Do not expand this file into a build-by-build archive.
