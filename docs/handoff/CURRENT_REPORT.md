# CueScore Current Report

- App: CueScore
- Decision ID: `CUESCORE-TESTFLIGHT-SANDBOX-IAP-20260918`
- Date: 2026-09-18
- Gate Result: READY
- TestFlight Sandbox IAP: NOT TESTED YET

## 結論

`READY FOR PRODUCT OWNER TESTFLIGHT SANDBOX IAP TEST`

Codex Phase Aのpreflightに、製品コード変更またはBuild 67を必要とする問題はなかった。Product OwnerがInternal TestFlightのCueScore Version 1.0 / Build 66をiPhoneで操作し、Apple実商品のSandbox transactionを確認する段階で停止する。

## 理由

### Git baseline

- 2026-09-18に`origin/main`をfetchし、最新が`ed7ad32f160a39d96508624c07406eff5ebea6d5`であることを確認した。
- 製品コード基準は`28491de158a3d078b8d844a671dc9327f3463a9a`。`28491de → ed7ad32`の差分はhandoff／status文書8ファイルだけで、製品コード、Xcode、StoreKit、Version、Buildに差分はない。
- 既存の主working treeは別branch上に未commit変更があるため、clean／reset／stashせず保全した。今回のGateは`origin/main`から作成した専用worktreeで実施した。

### Product baseline / StoreKit

- Xcode設定はVersion `1.0`、Build `66`、正式Bundle ID `com.takaakimailboxstar.cuescoreapps`。
- Product IDはWeb、native StoreKit bridge、StoreKit Configurationで`com.takaakimailboxstar.cuescoreapps.pro`に一致する。
- 商品typeはNon-Consumable。価格表示はStoreKit `Product.displayPrice`を使用する。
- Pro authorityはStoreKit 2のverified transactionであり、`Transaction.currentEntitlements`と`Transaction.updates`を確認する。
- 購入成功時は即時にPro entitlementを更新する。Restoreは`AppStore.sync()`後のverified current entitlementだけを採用する。
- 商品取得が失敗しても、先に取得したverified entitlementがProならFreeへ降格しない。
- Freeは全保存recordを削除・変更せず、全競技共通で新しい順の20件だけを表示対象にする。Proは全件を利用する。

### Build 66 / App Store Connect

App Store Connect APIを読み取り専用で確認した。

- App ID: `6802027038`
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Build ID: `cb98d62a-3a43-45c6-8c45-b8f5a72c2486`
- Version / Build: `1.0 (66)`
- Build processing state: `VALID`
- Build expired: `false`
- Internal group: `CueScore Internal Testers`
- group type: internal、all-build access有効
- IAP Apple ID: `6808464490`
- IAP state: `READY_TO_SUBMIT`
- IAP type: `NON_CONSUMABLE`
- Product ID: `com.takaakimailboxstar.cuescoreapps.pro`
- Japanese localization: 1件
- Availability: `JPN`
- Base territory / currency: `JPN / JPY`
- JPN customer price: `980`
- Review screenshot: `1170 × 2532`、asset state `COMPLETE`

IAPに明白なmetadata／availability未設定はない。Build 66は有効なInternal TestFlight配布対象であり、Build 67を作成する必要はない。Apple側契約状態はAPIで取得せず、Decisionに記録された2026-09-18のProduct Owner確認をGate前提として扱った。

## 数字 / Evidence

- GitHub main SHA: `ed7ad32f160a39d96508624c07406eff5ebea6d5`
- Product code SHA: `28491de158a3d078b8d844a671dc9327f3463a9a`
- Version / Build: `1.0 (66)`
- Product ID: `com.takaakimailboxstar.cuescoreapps.pro`
- TestFlight group: `CueScore Internal Testers`
- Focused Node regression: `15 pass / 0 fail / 0 skipped`
- Existing full Node regression: `386 pass / 0 fail / 0 skipped`
- Existing Local StoreKit XCTest: `1 pass`
- Existing Local StoreKit UITest: `1 pass`
- Changed files: `docs/CURRENT_STATUS.md`、`docs/handoff/CURRENT_DECISION.md`、`docs/handoff/CURRENT_REPORT.md`

Local StoreKit transaction suiteは、製品コード・test・StoreKit configurationが既存PASSの基準から変わっておらず、今回の目的がApple実商品によるTestFlight Sandbox確認であるため再実行していない。focused Node regressionは現行sourceに対して再実行した。

## Product Owner実機確認

対象：Internal TestFlightのCueScore Version 1.0 / Build 66

1. CueScoreをTestFlightから起動する。
2. Settings → CueScore Proを開く。
3. 「価格を取得できません」ではなく、Appleから取得した`¥980`が表示されることを確認する。
4. 購入ボタンを押す。
5. Sandbox購入sheetが表示されることを確認する。
6. Sandbox購入を完了する。
7. CueScoreへ戻った直後にProが解放されることを確認する。
8. Pro限定入口へ実際に入れることを確認する。
9. CueScoreを完全終了する。
10. CueScoreを再起動する。
11. Pro状態が維持されることを確認する。
12. Restore／購入を復元を実行する。
13. エラーにならずPro状態が維持されることを確認する。
14. 保存済み試合が消えていないことを確認する。

TestFlightのIAPはSandbox環境であり、実料金を発生させる本番購入として扱わない。パスワード、認証コード、Sandbox Apple Accountの認証情報は報告に含めない。

## Protected / not performed

- 製品コード、StoreKit実装、Product ID、Bundle ID、価格、商品type、Version、Build番号は変更していない。
- Build、Archive、Build 67作成、TestFlight Upload、External TestFlight、App Review、一般公開は行っていない。
- Product Ownerの実機Sandbox purchaseは未実施であり、PASS扱いしていない。

## STOP reason

Codex Phase AはREADY。次の操作はProduct OwnerによるiPhone実機のTestFlight Sandbox IAP確認である。実機結果を受け取るまで、コード修正、新Build、External TestFlight、App Review、Releaseへ進まない。
