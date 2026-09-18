# CueScore Build 67 IAP Diagnostic TestFlight

- Date: 2026-09-18
- Decision: `CUESCORE-B67-IAP-DIAGNOSTIC-20260918`
- Version / Build: `1.0 (67)`
- Result: `READY FOR PRODUCT OWNER BUILD 67 DIAGNOSTIC TEST`

## Purpose

Internal TestFlight Build 66の`¥980`未表示について、製品仕様を変更せず、bridge失敗、StoreKit throw、products 0件、商品取得成功を実機上で区別する。

## Changes

- Swift StoreKit bridgeは商品配列全体を取得し、`PRODUCTS_EMPTY`と`PRODUCTS_OK`へcount／Product ID一致を付与する。
- `Product.products(for:)` throwは`STOREKIT_ERROR`として非機密なNSError domain／codeを返す。
- Web bridge例外は`BRIDGE_ERROR`へ分類する。
- Pro画面へBuild 67専用の小さなdiagnostic表示を追加する。
- Versionは`1.0`、Buildは`67`。正式Bundle IDとProduct IDを維持する。

購入、verified entitlement、`Transaction.currentEntitlements`、`Transaction.updates`、`AppStore.sync()`、StoreKit `displayPrice`、Free / Proデータ仕様は変更していない。

## Verification

- Focused／関連Node: `57 pass / 0 fail`
- Full Node: `391 pass / 0 fail / 0 skipped`
- Release iOS Simulator: `BUILD SUCCEEDED`
- Local StoreKit physical-device XCTest: `1 pass / 0 fail`
- Physical-device UITest: Automation Mode有効化タイムアウトでtest runner開始前BLOCKED
- iOS 27 Simulator UITest: Xcode 27のUIScene lifecycle要件により既存app launch前停止。diagnostic test failureではない
- Signed Release Archive: `ARCHIVE SUCCEEDED`
- Archive: `com.takaakimailboxstar.cuescoreapps` / `1.0 (67)`、`.storekit`混入なし
- Upload: `Upload succeeded`
- App Store Connect Build ID: `50063f56-1a0f-4c05-9ef1-3ece12d40ae0`
- Processing: `VALID`
- Export compliance: `usesNonExemptEncryption=false`
- Internal TestFlight: `CueScore Internal Testers`、internal／all-build access、Build membership確認済み

## Boundary

Product OwnerはTestFlight Build 67で`Settings → CueScore Pro`を開き、`¥980`の表示有無とdiagnostic全文を報告する。Build 68、StoreKit原因修正、External TestFlight、App Review、ReleaseはこのGateに含めない。
