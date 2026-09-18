# CueScore Current Report

- App: CueScore
- Decision ID: `CUESCORE-B71-DEPENDENCY-REPRODUCIBILITY-20260918`
- Date: 2026-09-18
- Gate Result: `READY FOR PRODUCT OWNER BUILD 71 PRO UX + STARTUP SAFETY TEST`
- Version / Build: `1.0 (71)`

## 結論

Build 70候補の製品変更を維持し、GitHub `Package.resolved`を強制使用したBuild 71のtest／Release build／Archive／Internal TestFlight配布をPASSした。GitHub source dependencyとArchive dependencyは完全一致。Product OwnerのBuild 71実機確認待ちでSTOPする。

## Dependency Evidence

- `package.json` `@capacitor/filesystem`: `8.0.0`
- `package-lock.json`: 無変更
- GitHub `Package.resolved` `ion-ios-filesystem`: `1.1.2`
- GitHub revision: `0d81e26e828ff9582807e2339112cedf2e0fab85`
- Archive checkout `ion-ios-filesystem`: `1.1.2`
- Archive checkout revision: `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm`: `8.0.2` / `13a39179b3df796f3bb2e70c47ccdd92593f34d2`
- Xcode fixed resolution flags: `-onlyUsePackageVersionsFromResolvedFile`、`-disableAutomaticPackageResolution`
- `Package.resolved`: repositoryから無差分

## Product scope

- Build 70のpurchase processing／verified success／badge除去／購入済み表示を維持
- Build 69 diagnostic UI除去を維持
- entitlement refresh safe boundary／verified Pro保護を維持
- global unhandled rejectionの誤った通信／保存toast除去を維持
- Product ID、StoreKit contract、Restore、Free／Pro境界、保存dataは変更なし

## Test / Build Evidence

- Pro UX／Startup Promise focused: `9 pass / 0 fail`
- IAP combined focused: `33 pass / 0 fail`
- Full Node regression: `411 pass / 0 fail / 0 skipped`
- Native web sync: PASS
- Release iOS Simulator: `BUILD SUCCEEDED`
- Release device Archive: `ARCHIVE SUCCEEDED`
- Archive identity: `com.takaakimailboxstar.cuescoreapps` / `1.0 (71)`
- Archive内`.storekit`: 0件
- Archive dependency pathはBuild 71専用SourcePackages checkoutを参照

## Git / App Store Connect Evidence

- Build source commit: `aa67c564928725654403005ecf7e878daaf83e10`
- Push: `origin/main`へ成功、push直後`HEAD == origin/main`
- Upload: `EXPORT SUCCEEDED` / `Upload succeeded`
- App Store Connect Build ID: `2b8390e4-5436-4673-9ecf-9c1f7da1a77d`
- Processing: `VALID`
- Encryption: `usesNonExemptEncryption=false`
- Internal group: `CueScore Internal Testers`、internal／all-build access／Build 71対象

## Product Owner確認

1. TestFlightからCueScore `1.0 (71)`へ更新する。
2. アプリを完全終了して再起動する。
3. 起動時に誤った通信／保存通知が出ないことを確認する。
4. Pro状態が維持されていることを確認する。
5. Backup等に`🔒 Pro`が残っていないことを確認する。
6. Pro限定機能へ直接入れることを確認する。
7. アプリをbackgroundへ移し、foreground復帰後もエラー通知が出ないことを確認する。

再購入は行わない。

Build 72、External TestFlight、App Review、Releaseは未実施。
