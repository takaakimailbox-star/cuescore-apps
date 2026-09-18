# CueScore Current Decision

- Decision ID: `CUESCORE-B68-IAP-BRIDGE-FIX-20260918`
- Date: 2026-09-18
- Product Owner Decision: GO
- Gate result: `READY FOR PRODUCT OWNER BUILD 68 SANDBOX IAP TEST`

## Objective

Build 67の実機diagnosticで確定した`BRIDGE_ERROR`を最小修正し、Internal TestFlight Build 68でApple実商品の価格取得とSandbox購入を再検証する。

## Completed scope

- Version `1.0`を維持し、Buildを`68`へ更新した。
- native StoreKit plugin取得を`Capacitor.Plugins.CueScoreStoreKit`第一候補、`registerPlugin` fallbackへ最小修正した。
- Build 67のdiagnosticを維持し、Local StoreKit UI testで`PRODUCTS_OK / count=1 / match=YES`を確認した。
- Product ID、商品type、StoreKit `displayPrice`、purchase、verified transaction、current entitlement、transaction updates、`AppStore.sync()`、Free / Pro保存・表示仕様を変更していない。
- Focused test、Full Node regression、Release Simulator build、Release device Archive、App Store Connect uploadを完了した。
- Build 68はApple処理`VALID`、輸出コンプライアンス回答済み、内部テスター配布対象である。

## Current boundary

Product OwnerがTestFlight Build 68で`¥980`、`PRODUCTS_OK`、Sandbox購入、即時Pro解放、再起動維持、購入復元、保存済み試合維持を確認するまでSTOPする。Build 69、External TestFlight、App Review、Releaseへ進まない。
