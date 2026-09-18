# CueScore Current Report

- App: CueScore
- Decision ID: `CUESCORE-B68-IAP-BRIDGE-FIX-20260918`
- Date: 2026-09-18
- Gate Result: `READY FOR PRODUCT OWNER BUILD 68 SANDBOX IAP TEST`
- Version / Build: `1.0 (68)`

## 結論

Build 67の`BRIDGE_ERROR`をglobal plugin registry優先の最小差分で修正し、Build 68をInternal TestFlightで利用可能にした。Product OwnerのSandbox IAP実機確認を待ってSTOPする。

## 実装

- `Capacitor.Plugins.CueScoreStoreKit`を第一候補としてnative adapterへ接続する。
- `Plugins`がない環境では`registerPlugin("CueScoreStoreKit")`へfallbackする。
- 両方ない場合は既存どおり`BRIDGE_ERROR`を表示する。
- Build 67 diagnosticを残し、`PRODUCTS_OK`時のproducts count／Product ID一致を表示する。
- 正式Product ID `com.takaakimailboxstar.cuescoreapps.pro`、StoreKit `displayPrice`、purchase、verified entitlement、Restore、Free最新20件／保存継続を変更していない。

## Test / Build Evidence

- Focused bridge test: `29 pass / 0 fail`
- Full Node regression: `394 pass / 0 fail / 0 skipped`
- Release iOS Simulator build: `BUILD SUCCEEDED`
- Local StoreKit Simulator UITest: `1 pass / 0 fail`、画面上で`PRODUCTS_OK / count=1 / match=YES`
- Local StoreKit XCTest: 実機は端末ロックで開始前BLOCKED。Simulatorは既知の`SKInternalErrorDomain Code=3`でStoreKitTest override不可としてenvironment BLOCKED。native StoreKitコードはBuild 67から未変更、Build 67実機XCTestは`1 pass / 0 fail`
- Release device Archive: `ARCHIVE SUCCEEDED`
- Archive identity: Bundle ID `com.takaakimailboxstar.cuescoreapps`、Version `1.0`、Build `68`
- Archive内Local StoreKit configuration: 0件
- App Store Connect upload: `EXPORT SUCCEEDED` / `Upload succeeded`

## App Store Connect Evidence

- App Store Connect Build ID: `c2b68531-4333-47ca-957d-501287330eb4`
- processing state: `VALID`
- `usesNonExemptEncryption=false`
- Internal group: `CueScore Internal Testers`
- group type: internal
- all-build access: true
- Build 68 group membership: true
- External TestFlight、App Review、Version 1.0審査用build変更、一般公開: 未実施

## Product Owner確認

1. TestFlightからCueScore `1.0 (68)`へ更新する。
2. `Settings → CueScore Pro`を開く。
3. `¥980`表示を確認する。
4. diagnosticが`PRODUCTS_OK`であることを確認する。
5. 「Proを購入」を押す。
6. Sandbox購入sheetを確認する。
7. 購入を完了する。
8. 即時Pro解放を確認する。
9. Pro限定機能を1つ開く。
10. アプリを完全終了する。
11. 再起動後もPro維持を確認する。
12. 「購入を復元」を実行する。
13. Pro維持を確認する。
14. 保存済み試合が消えていないことを確認する。

途中でFAILした場合はそこでSTOPし、表示内容をEvidenceとして報告する。

## STOP / protected state

- Build 68候補と主working treeの既存変更は保全した。
- Build 69、External TestFlight、App Review、Releaseは開始していない。
- 次工程はProduct OwnerのBuild 68実機Sandbox IAP報告後に別Gateで判断する。
