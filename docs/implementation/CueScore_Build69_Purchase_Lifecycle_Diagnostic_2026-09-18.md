# CueScore Build 69 Purchase Lifecycle Diagnostic

- Decision ID: `CUESCORE-B69-PURCHASE-LIFECYCLE-DIAGNOSTIC-20260918`
- Date: 2026-09-18
- Baseline: `6bd467fe5fdfe715ea24bc3fc1c3475ba434f65f`
- Version / Build: `1.0 (69)`

## Build 68 runtime result

Build 68は`PRODUCTS_OK`、native bridge、Apple実商品、purchase sheet、Apple Account認証までPASSした。表示価格は`$5.99`。認証後は`購入を確認しています…`から完了せず、Proは解放されなかった。起動時のgeneric unhandled rejection messageも再現した。

## Diagnostic-only implementation

- Swift `purchase()`へP01〜P12を追加し、product fetch、purchase await／return status、verification、finish、bridge resolveを区別する。
- JavaScriptへJ01〜J06を追加し、button click、entitlement entry、native Promise wait／resolve／reject、Pro applicationを区別する。
- Transaction.updates、currentEntitlements、visibility、foreground refresh、native listener registrationをdiagnostic化する。
- Storefront country code／identifierと、最新20件のphase historyをPro画面へ一時表示する。
- listener registration rejectionは最小catchで処理し、unhandled Promiseを防止する。
- diagnosticはentitlement判定へ使用しない。
- Product ID、StoreKit `displayPrice`、`product.purchase()`、result semantics、verified requirement、`transaction.finish()`、current entitlement、Restore、Free最新20件、保存data／schemaを変更していない。
- CueSnapi `PurchaseService`、ledger、`Transaction.all`／`latest`は移植していない。

## Evidence

- Focused diagnostics: `24 pass / 0 fail`
- Full Node regression: `402 pass / 0 fail / 0 skipped`
- Release iOS Simulator build: `BUILD SUCCEEDED`
- Local StoreKit XCTest: iOS 26.5 Simulatorでtest operationが331秒応答せず中断
- Local StoreKit UITest: iOS 27 Simulatorでtest operationが351秒応答せず中断
- Local StoreKit: `TEST ENVIRONMENT BLOCKED`、製品FAILではない
- Release device Archive: `ARCHIVE SUCCEEDED`
- Archive identity: `com.takaakimailboxstar.cuescoreapps` / `1.0 (69)`
- Release Archive内`.storekit`: 0件
- Upload: `EXPORT SUCCEEDED` / `Upload succeeded`
- App Store Connect Build ID: `0a7e49b7-dd49-4ead-8733-5692e0bceef2`
- Processing: `VALID`
- Encryption: `usesNonExemptEncryption=false`
- Internal group: `CueScore Internal Testers`、internal／all-build access／Build 69 membership確認

## Boundary

Build 69がInternal TestFlightで利用可能になったら`READY FOR PRODUCT OWNER BUILD 69 PURCHASE DIAGNOSTIC TEST`でSTOPする。Product Ownerは購入を1回だけ行い、最終phaseを報告する。Restore、再購入、native refactor、Build 70、External TestFlight、App Review、Releaseへ進まない。
