# CueScore Build 68 IAP Bridge Fix

- Decision ID: `CUESCORE-B68-IAP-BRIDGE-FIX-20260918`
- Date: 2026-09-18
- Baseline: `d48630539a73b148a0bb7555e8aa3696f6028405`
- Version / Build: `1.0 (68)`

## Root cause and fix

Build 67の実機diagnosticは`BRIDGE_ERROR`だった。Capacitor iOSが登録済みnative pluginを`window.Capacitor.Plugins.CueScoreStoreKit`へ公開している一方、Web adapterは`registerPlugin`だけを参照していた。

Build 68ではplugin取得だけを次の順序へ最小修正した。

1. `Capacitor.Plugins.CueScoreStoreKit`
2. `Capacitor.registerPlugin?.("CueScoreStoreKit")`
3. どちらもなければ`null`として既存`BRIDGE_ERROR`

Product ID、StoreKit購入処理、verified transaction authority、entitlement、Restore、Free / Pro仕様、保存schema、App Store Connect IAP設定は変更していない。

## Evidence

- Focused bridge test: `29 pass / 0 fail`
- Full Node regression: `394 pass / 0 fail / 0 skipped`
- Release iOS Simulator build: `BUILD SUCCEEDED`
- Local StoreKit Simulator UITest: `1 pass / 0 fail`、`PRODUCTS_OK / count=1 / match=YES`
- Local StoreKit XCTest再実行: 実機は端末ロックで開始前BLOCKED。Simulatorは既知の`SKInternalErrorDomain Code=3`によりStoreKitTest override不可。製品FAILとは分離した。Build 67の同一native StoreKit XCTestは実機で`1 pass / 0 fail`
- Release device Archive: `ARCHIVE SUCCEEDED`
- Archive identity: `com.takaakimailboxstar.cuescoreapps` / `1.0 (68)`
- Release Archive内`.storekit`: 0件
- Upload: `EXPORT SUCCEEDED` / `Upload succeeded`
- App Store Connect Build ID: `c2b68531-4333-47ca-957d-501287330eb4`
- Processing: `VALID`
- Encryption: `usesNonExemptEncryption=false`
- Internal group: `CueScore Internal Testers`、internal／all-build access／Build 68 membership確認

## Boundary

`READY FOR PRODUCT OWNER BUILD 68 SANDBOX IAP TEST`でSTOPする。Build 69、External TestFlight、App Review、Releaseへ進まない。
