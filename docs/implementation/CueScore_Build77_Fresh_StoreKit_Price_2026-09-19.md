# CueScore Build 77 Fresh StoreKit Price

- Decision ID: `CUESCORE-B77-FRESH-STOREKIT-PRICE-20260919`
- Date: 2026-09-19
- Baseline: `5e5f65171f66454bd3e118fed6a83afd93e5b35b`
- Version / Build: `1.0 (77)`

## Root cause and minimal fix

native `CueScoreStoreKitPlugin.getProduct`は既に毎回`Product.products(for:)`を呼び、価格authorityを`Product.displayPrice`としていた。一方Web側はPro画面open時にrefreshより先に既存`state.product.localizedPrice`を描画し、商品取得失敗時も前回productを保持していた。このためstorefront変更後に古い`$5.99`を一時的または継続的に表示できた。

Pro画面open時に同期的にFresh product loadingへ入り、旧productをnullへする。取得中は`価格を確認中…`／購入不可、成功時だけFresh `Product.displayPrice`／購入可能、失敗時は`価格を取得できません`／購入不可とした。並行refreshの古い応答はserialで無視する。通常foreground refreshの既存product保持と、verified Pro保護は維持した。

Product ID、Non-Consumable、purchase、verified transaction、transaction.finish、currentEntitlements、Transaction.updates、restore、CueScoreEntitlement、Free／Pro境界、Build 76 Settings、Startup Promise Safetyは変更していない。`¥980`や`$5.99`のhard-codeは製品sourceへ追加していない。

## Evidence

- IAP focused: `29 pass / 0 fail`
- Full Node: `432 pass / 0 fail / 0 skipped`
- Release Simulator: `BUILD SUCCEEDED`
- Device Archive: `ARCHIVE SUCCEEDED`
- Archive: `com.takaakimailboxstar.cuescoreapps` / `1.0 (77)` / `.storekit` 0件
- `monetization-v1.js` SHA-256: `388ce045c2c925c761cc3f7c1055c4a41f76dbecdf5f9069d5cfc2dca9f30dca`（source／iOS copied／Archive一致）
- `index.html` SHA-256: `531e8e892ded979670ac5dac7d7ceebd79475a5ba93843e8a2c61f483dd1ffa0`（source／iOS copied／Archive一致）
- `ion-ios-filesystem 1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm 8.0.2` / `13a39179b3df796f3bb2e70c47ccdd92593f34d2`

## Distribution

- Build source commit: `9828a8499f514d239b717d248a9a99976db23944`
- GitHub push: `origin/main`へ成功
- App Store Connect upload: `Upload succeeded`
- Build ID: `a1ebcb96-b6a4-4e88-b5e5-f79e149e15dd`
- Processing: `VALID`
- Encryption: `usesNonExemptEncryption=false`
- Internal group: `CueScore Internal Testers`（internal／全Buildアクセス）

`READY FOR PRODUCT OWNER BUILD 77 FRESH STOREKIT PRICE TEST`でSTOPした。Build 78、External TestFlight、App Review、Releaseへ進まない。
