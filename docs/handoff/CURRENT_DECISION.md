# CueScore Current Decision

- Decision ID: `CUESCORE-B69-PURCHASE-LIFECYCLE-DIAGNOSTIC-20260918`
- Date: 2026-09-18
- Product Owner Decision: GO
- Gate result: `READY FOR PRODUCT OWNER BUILD 69 PURCHASE DIAGNOSTIC TEST`

## Objective

Build 68のTestFlight Sandbox購入が認証後に停止したため、購入挙動を変えず、StoreKit native lifecycle、Capacitor Promise、JavaScript entitlement、foreground refreshの正確な停止phaseをBuild 69で特定する。

## Completed scope

- Version `1.0`を維持し、Buildを`69`へ更新した。
- native P01〜P12、JavaScript J01〜J06と、Transaction.updates／currentEntitlements／visibility／refresh／listener registrationの非機密diagnosticを追加した。
- Pro画面へStorefrontと最新20件のPurchase Diagnosticを一時表示した。
- listener registration rejectionを安全に捕捉し、unhandled Promiseを防止した。
- CueSnapi native architectureの移植、Product ID、purchase semantics、verified authority、finish、Restore、Free / Pro仕様は変更していない。
- Node regression、Release build、Release device Archive、App Store Connect uploadを完了した。

## Current boundary

Build 69はApp Store Connectで`VALID`となり、`CueScore Internal Testers`から利用可能である。Product Ownerが購入を1回だけ実施し、最終diagnostic phaseを報告する。Restore／再購入は行わない。実機Evidence受領前にnative refactor、Build 70、External TestFlight、App Review、Releaseへ進まない。
