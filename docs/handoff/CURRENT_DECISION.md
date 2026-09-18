# CueScore Current Decision

- Decision ID: `CUESCORE-B67-IAP-DIAGNOSTIC-20260918`
- Date: 2026-09-18
- Product Owner Decision: GO
- Gate result: `READY FOR PRODUCT OWNER BUILD 67 DIAGNOSTIC TEST`

## Objective

Build 66で区別できなかったWeb → native bridge失敗、`Product.products(for:)` throw、products 0件、商品取得成功を、製品仕様を変えずBuild 67の実機画面で識別できるようにする。

## Completed scope

- Version `1.0`を維持し、Buildを`67`へ更新した。
- `BRIDGE_ERROR`、`STOREKIT_ERROR`、`PRODUCTS_EMPTY`、`PRODUCTS_OK`を独立表示するdiagnostic-only layerを追加した。
- StoreKit throwは非機密なNSError domain／code、empty／successはproducts count、successは対象Product ID一致を返す。
- CueScore Pro画面へ小さな補助diagnosticを追加した。
- Product ID、商品type、StoreKit `displayPrice`、purchase、verified transaction、current entitlement、transaction updates、`AppStore.sync()`、Free / Pro保存・表示仕様を変更していない。
- Regression、Release Simulator build、Release device Archive、App Store Connect uploadを完了した。
- Build 67はApple処理`VALID`、輸出コンプライアンス回答済み、内部テスター配布対象である。

## Current boundary

Product OwnerがTestFlight Build 67で`Settings → CueScore Pro`を開き、`¥980`の有無とdiagnostic全文を報告するまでSTOPする。結果を推測しない。Build 68、StoreKit原因修正、External TestFlight、App Review、Releaseへ進まない。
