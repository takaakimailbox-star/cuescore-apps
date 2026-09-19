# CueScore Current Report

- App: CueScore
- Decision ID: `CUESCORE-B77-FRESH-STOREKIT-PRICE-20260919`
- Date: 2026-09-19
- Gate Result: Build 77 candidate verified; Internal TestFlight pending
- Version / Build: `1.0 (77)`

## 結論

Pro画面open時の旧価格即時描画を停止し、明示的なFresh商品loadingへ変更した。native StoreKitのFresh取得成功時だけ`Product.displayPrice`を表示して購入可能にし、失敗時は旧storefront価格へfallbackしない。StoreKit購入・verified entitlement・restoreの契約は変更していない。

## Test / Build Evidence

- IAP focused: `29 pass / 0 fail`
- Full Node regression: `432 pass / 0 fail / 0 skipped`
- Release iOS Simulator build: `BUILD SUCCEEDED`
- Release device Archive: `ARCHIVE SUCCEEDED`
- Archive identity: `com.takaakimailboxstar.cuescoreapps` / `1.0 (77)`
- Archive内`.storekit`: 0件
- source／iOS copied／Archive `monetization-v1.js` SHA-256: `388ce045c2c925c761cc3f7c1055c4a41f76dbecdf5f9069d5cfc2dca9f30dca`
- source／iOS copied／Archive `index.html` SHA-256: `531e8e892ded979670ac5dac7d7ceebd79475a5ba93843e8a2c61f483dd1ffa0`

## Dependency Evidence

- `ion-ios-filesystem`: `1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm`: `8.0.2` / `13a39179b3df796f3bb2e70c47ccdd92593f34d2`
- `Package.resolved`: repositoryから無差分
- Fixed flags: `-onlyUsePackageVersionsFromResolvedFile`、`-disableAutomaticPackageResolution`、`-skipPackageUpdates`

## Distribution

- Build source commit: pending
- Push: pending
- Upload: pending
- App Store Connect Build ID: pending
- Processing: pending
- Encryption: pending
- Internal group: pending

## STOP

GitHub反映とInternal TestFlight配布完了後、`READY FOR PRODUCT OWNER BUILD 77 FRESH STOREKIT PRICE TEST`でSTOPする。External TestFlight、App Review、Releaseは実施しない。
