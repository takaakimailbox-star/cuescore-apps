# CueScore ローカルStoreKit実取引テスト環境 実装記録

日付: 2026-09-14

## 目的

App Store ConnectのPaid Applications Agreement／税務情報がActiveになる前でも、CueScoreの正式な買い切りPro商品についてStoreKit取引契約をローカル環境で検証できるようにする。App Store Connect実商品を使うTestFlight Sandbox購入とは明確に分離する。

## 実装範囲と保護条件

- 共有Scheme `CueScoreLocalStoreKit`を追加し、Run／Testへ`CueScore.storekit`を接続した。
- hosted XCTest target `CueScoreStoreKitTests`と最小UITest target `CueScoreStoreKitUITests`を追加した。
- `SKTestSession`でローカルStoreKit transactionを生成し、StoreKit 2の`Product`／`Transaction`／`AppStore.sync()`を検証した。
- 製品コードは変更していない。
- 正式Product ID `com.takaakimailboxstar.cuescoreapps.pro`は変更していない。
- Free／Pro仕様と保存済み試合dataは変更していない。
- CueSnapiから実装をコピーしていない。比較したのは「共有Scheme、StoreKit Configuration、SKTestSessionを用いるローカルtest方式」だけである。

## 追加・更新ファイル

- `ios/App/App.xcodeproj/xcshareddata/xcschemes/CueScoreLocalStoreKit.xcscheme`
- `ios/App/CueScoreStoreKitTests/CueScoreStoreKitLocalTests.swift`
- `ios/App/CueScoreStoreKitUITests/CueScoreStoreKitLocalUITests.swift`
- `ios/App/App.xcodeproj/project.pbxproj`
- `ios/App/CueScore.storekit`

`CueScore.storekit`はローカルtest用metadataをXcode現行形式へ正規化しただけで、正式Product IDと価格`980`を維持している。

## 実取引相当テスト

接続実機へTestFlight版とは別のtest用bundle IDを一時指定し、既存アプリと保存dataを上書きせずに実行した。

```sh
xcodebuild test \
  -project ios/App/App.xcodeproj \
  -scheme CueScoreLocalStoreKit \
  -destination 'platform=iOS,id=00008140-00020C523E69801C' \
  PRODUCT_BUNDLE_IDENTIFIER=com.takaakimailboxstar.cuescoreapps.localstorekit
```

結果: `TEST SUCCEEDED`

| 必須確認項目 | 検証方法 | 結果 |
|---|---|---|
| Pro ¥980の商品取得 | `Product.products(for:)`で正式Product ID、non-consumable、`Decimal(980)`を確認 | PASS |
| purchase success | `Product.purchase()`のsuccessを確認 | PASS |
| verified entitlement | purchase resultと`Transaction.currentEntitlements`のverified transactionを確認 | PASS |
| Pro即時解放 | purchase完了直後にcurrent entitlementが有効になるまで待機して確認 | PASS |
| 再起動後のPro維持 | 新しいentitlement readで同じverified entitlementが残ることを確認 | PASS |
| 購入復元 | `AppStore.sync()`後もverified entitlementが有効であることを確認 | PASS |
| refund後のFree復帰 | `SKTestSession.refundTransaction`後にcurrent entitlementが消えることを確認 | PASS |
| 保存済み試合を削除せずFree最新20件 | 既存`free-pro-record-policy` testで全保存配列不変とFree表示20件を確認 | PASS |
| Pro導線 | UITestでSettingsからCueScore Pro画面へ到達 | PASS |

unit testは1件PASS、UITestは1件PASS。既存を含むNode全自動testは`386 pass / 0 fail / 0 skipped`だった。

## 実行環境に関する記録

iOS 26.5 Simulatorでは`SKTestSession`初期化が`SKInternalErrorDomain Code=3`で失敗した。同じhost／SimulatorでCueSnapiの既存local StoreKit testも同じerrorになったため、CueScore固有のconfiguration不良とは判定せず、接続実機のXcode local StoreKit環境で検証を完了した。

## 判定と停止条件

CueScore専用local StoreKit test環境で、要求されたtransaction／entitlement／refund／Free表示契約を確認できた。これはApple側の実商品availabilityを証明するtestではない。

Paid Applications Agreement、銀行・税務情報を含むApple側契約がActiveになるまで、TestFlight Sandbox購入確認は保留する。この作業では新Build作成、TestFlight Upload、External TestFlight、App Review、一般公開を行わない。
