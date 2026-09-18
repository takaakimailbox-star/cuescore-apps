# CueScore Build 70 Pro UX + Startup Promise Safety

- Decision ID: `CUESCORE-B70-PRO-UX-STARTUP-SAFETY-20260918`
- Date: 2026-09-18
- Baseline: `5818a1714eda7b971a27dc98eea305f18cdb3b9b`
- Version / Build: `1.0 (70)`
- Result: `BLOCKED — TESTFLIGHT BUILD 70 SOURCE DEPENDENCY MISMATCH`

## Product implementation

- Purchase中の明確なstatus／spinnerと二重操作防止を追加。
- verified purchase成功を表示してから既存origin replay／restorationを実行。
- verified Pro時にPro badge／locked visual／history limitを除去。
- 購入済みPro表示へ切替え、購入buttonを再表示しない。
- Build 69の一時diagnostic UIを通常画面から除去し、内部helperを維持。
- entitlement refreshをinitial／Pro open／foreground／fallback共通safe boundaryへ集約。
- 一時的なrefresh／product failureで既存verified ProをFreeへ降格しない。
- global unhandled rejectionから根拠のない通信／保存toastを除去。

## Protected contracts

Product ID、Non-Consumable、StoreKit `displayPrice`、`product.purchase()`、verified requirement、`transaction.finish()`、`Transaction.currentEntitlements`、`Transaction.updates`、Restore、Free最新20件、保存／Backup／Restore format、6競技、Pro feature boundaryは変更していない。

## Evidence

- Focused: `34 pass / 0 fail / 0 skipped`
- IAP focused: `33 pass / 0 fail / 0 skipped`
- Full Node: `411 pass / 0 fail / 0 skipped`
- Native web sync: PASS
- Release Simulator: `BUILD SUCCEEDED`
- Test target compilation: `TEST BUILD SUCCEEDED`
- Free cold launch ×3／foreground return ×1: 誤通知なし
- Release Archive: `ARCHIVE SUCCEEDED`
- Identity: `com.takaakimailboxstar.cuescoreapps` / `1.0 (70)`
- Archive `.storekit`: 0件
- Upload: `EXPORT SUCCEEDED` / `Upload succeeded`
- App Store Connect Build ID: `edf4cd08-005c-4c96-abdc-57353b603e80`
- Processing: `VALID`
- Encryption: `usesNonExemptEncryption=false`
- Internal group: `CueScore Internal Testers`、Build 70対象

## Source identity blocker

Archive時、Xcodeはrepositoryで固定された`ion-ios-filesystem 1.1.2`（`0d81e26e…`）ではなく`1.1.4`（`56bd6f9e…`）を解決した。自動更新されたlockfileは復元し、依頼外のdependency updateをcommitしていない。その結果、GitHub main候補とTestFlight Build 70の依存source一致を証明できず、READY／commit／push／PO実機確認案内を停止した。

## Boundary

Build 71、External TestFlight、App Review、Releaseは未実施。追加Decisionなしに依存pin変更または再配布へ進まない。
