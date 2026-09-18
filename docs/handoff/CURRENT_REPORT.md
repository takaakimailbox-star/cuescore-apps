# CueScore Current Report

- App: CueScore
- Decision ID: `CUESCORE-B71-DEPENDENCY-REPRODUCIBILITY-20260918`
- Date: 2026-09-18
- Gate Result: `PRE-UPLOAD SOURCE / ARTIFACT GATE PASS`
- Version / Build: `1.0 (71)`

## 結論

Build 70候補の製品変更を維持し、GitHub `Package.resolved`を強制使用したBuild 71のtest／Release build／ArchiveをPASSした。GitHub反映予定sourceとArchive dependencyは完全一致。commit／push後にだけInternal TestFlight uploadへ進む。

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

## Pending

- source commit／push
- App Store Connect upload／Build ID／processing
- encryption／Internal group確認

Build 72、External TestFlight、App Review、Releaseは未実施。
