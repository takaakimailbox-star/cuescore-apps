# CueScore Current Status

- Updated: 2026-09-18
- Version / Build: `1.0 (68)`
- GitHub baseline: `d48630539a73b148a0bb7555e8aa3696f6028405`
- Build 67 Product Owner result: TestFlightで`Diagnostic: BRIDGE_ERROR`、`¥980` NOT DISPLAYED
- Build 68 fix: `Capacitor.Plugins.CueScoreStoreKit`を第一候補、`registerPlugin`をfallbackとする最小bridge修正
- Diagnostic states: `BRIDGE_ERROR` / `STOREKIT_ERROR` / `PRODUCTS_EMPTY` / `PRODUCTS_OK`
- Product behavior: Product ID、StoreKit `displayPrice`、purchase、verified entitlement、Restore、Free / Pro仕様は変更なし
- TestFlight: Build ID `c2b68531-4333-47ca-957d-501287330eb4`、`VALID`、`usesNonExemptEncryption=false`、`CueScore Internal Testers`配布対象
- Current gate: `READY FOR PRODUCT OWNER BUILD 68 SANDBOX IAP TEST`
- Product Owner next: TestFlightで1.0 (68)へ更新し、`Settings → CueScore Pro`で`¥980`、`PRODUCTS_OK`、Sandbox購入、即時／再起動後／復元後のPro維持を確認
- External TestFlight: not performed
- App Review: not submitted
- Public release: not performed
- Canonical instruction: `docs/handoff/CURRENT_DECISION.md`
- Canonical report: `docs/handoff/CURRENT_REPORT.md`

For long-term history and evidence, use `docs/CURRENT_STATE.md`. Do not expand this file into a build-by-build archive.
