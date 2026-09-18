# CueScore Current Report

- App: CueScore
- Decision ID: `CUESCORE-B67-IAP-DIAGNOSTIC-20260918`
- Date: 2026-09-18
- Gate Result: `READY FOR PRODUCT OWNER BUILD 67 DIAGNOSTIC TEST`
- Version / Build: `1.0 (67)`

## 結論

Build 66のSandbox商品取得FAILを実機で分類するdiagnostic-only Build 67を実装し、Internal TestFlightで利用可能にした。Product Ownerの実機結果を待ってSTOPする。

## 実装

- native `getProduct()`成功時に`PRODUCTS_OK`、products 0件時に`PRODUCTS_EMPTY`、throw時に`STOREKIT_ERROR`を返す。
- throw時はNSError domain／codeのみ、商品応答時はproducts countと対象Product ID一致を非機密Evidenceとして返す。
- Web bridge呼び出し失敗を`BRIDGE_ERROR`へ分類する。
- CueScore Pro画面へ購入UIを置換しない小さなdiagnostic表示を追加した。
- 正式Product ID `com.takaakimailboxstar.cuescoreapps.pro`、StoreKit `displayPrice`、purchase、verified entitlement、Restore、Free最新20件／保存継続を変更していない。

## Test / Build Evidence

- Focused／関連Node test: `57 pass / 0 fail`
- Full Node regression: `391 pass / 0 fail / 0 skipped`
- Diagnostic分岐専用test: `5 pass`
- Release iOS Simulator build: `BUILD SUCCEEDED`
- Local StoreKit実機XCTest: `1 pass / 0 fail`
- Local StoreKit実機UITest: test runnerのAutomation Mode有効化タイムアウトにより開始前BLOCKED
- iOS 27 Simulator UITest補完: 既存アプリのUIScene lifecycle要件でapp launch前停止し`1 fail`。diagnostic分岐FAILではなくXcode 27 test environment問題として分離した
- Release device Archive: `ARCHIVE SUCCEEDED`
- Archive identity: Bundle ID `com.takaakimailboxstar.cuescoreapps`、Version `1.0`、Build `67`
- Archive内Local StoreKit configuration: 0件
- App Store Connect upload: `EXPORT SUCCEEDED` / `Upload succeeded`

## App Store Connect Evidence

- App Store Connect Build ID: `50063f56-1a0f-4c05-9ef1-3ece12d40ae0`
- processing state: `VALID`
- `usesNonExemptEncryption=false`
- Internal group: `CueScore Internal Testers`
- group type: internal
- all-build access: true
- Build 67 group membership: true
- External TestFlight、App Review、Version 1.0審査用build変更、一般公開: 未実施

## Product Owner確認

1. TestFlightからCueScore `1.0 (67)`へ更新する。
2. `Settings → CueScore Pro`を開く。
3. `¥980`が表示されるか確認する。
4. diagnostic表示を確認する。
5. 表示内容を省略せずそのまま報告する。

判定は、`¥980 + PRODUCTS_OK`なら商品取得PASS、`PRODUCTS_EMPTY / count=0`ならApple Sandbox／availability側優先、`STOREKIT_ERROR`ならdomain／code起点、`BRIDGE_ERROR`ならCapacitor bridge／plugin経路優先とする。

## STOP / protected state

- Build 67候補と主working treeの既存変更は保全した。
- Build 68、原因修正、External TestFlight、App Review、Releaseは開始していない。
- 次工程はProduct OwnerのBuild 67実機diagnostic報告後に別Gateで判断する。
