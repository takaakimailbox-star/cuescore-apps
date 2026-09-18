# CueScore Current Status

- Updated: 2026-09-18
- Version / Build: `1.0 (67)`
- GitHub baseline: `47934551f3dad205aeb1b8864f9dedeaa898b5a5`
- Build 66 Product Owner result: TestFlight Sandboxで`¥980` NOT DISPLAYED、product fetch FAIL
- Build 67: diagnostic-only Internal TestFlight build READY
- Diagnostic states: `BRIDGE_ERROR` / `STOREKIT_ERROR`（domain・code）/ `PRODUCTS_EMPTY`（count=0）/ `PRODUCTS_OK`（count・Product ID一致）
- Product behavior: Product ID、StoreKit `displayPrice`、purchase、verified entitlement、Restore、Free / Pro仕様は変更なし
- TestFlight: Build ID `50063f56-1a0f-4c05-9ef1-3ece12d40ae0`、`VALID`、`usesNonExemptEncryption=false`、`CueScore Internal Testers`配布対象
- Current gate: `READY FOR PRODUCT OWNER BUILD 67 DIAGNOSTIC TEST`
- Product Owner next: TestFlightで1.0 (67)へ更新し、`Settings → CueScore Pro`の価格とdiagnostic表示をそのまま報告
- External TestFlight: not performed
- App Review: not submitted
- Public release: not performed
- Canonical instruction: `docs/handoff/CURRENT_DECISION.md`
- Canonical report: `docs/handoff/CURRENT_REPORT.md`

For long-term history and evidence, use `docs/CURRENT_STATE.md`. Do not expand this file into a build-by-build archive.
