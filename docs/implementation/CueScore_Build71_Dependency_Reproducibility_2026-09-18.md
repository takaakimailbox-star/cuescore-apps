# CueScore Build 71 Dependency Reproducibility

- Decision ID: `CUESCORE-B71-DEPENDENCY-REPRODUCIBILITY-20260918`
- Date: 2026-09-18
- Baseline: `5818a1714eda7b971a27dc98eea305f18cdb3b9b`
- Version / Build: `1.0 (71)`

## Purpose

Build 70のPro UX／Startup Promise Safety実装を変更せず、GitHub `Package.resolved`のdependencyを強制使用して再現可能なBuild 71を作る。Build 70はsource／artifact dependency不一致のため正式受入対象外。

## Reproducible environment

- Node dependencies: npm `11.6.0`による`npm ci`
- `package.json`／`package-lock.json`: 無変更
- Capacitor: clean npm node_modulesから`cap sync ios`
- local SPM path: `node_modules/@capacitor/filesystem`、`node_modules/@capacitor/share`
- Xcode確認済みflags: `-onlyUsePackageVersionsFromResolvedFile`、`-disableAutomaticPackageResolution`
- 専用checkout: `work/SourcePackages-B71`

## Dependency identity

- `ion-ios-filesystem`: `1.1.2`
- revision: `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm`: `8.0.2`
- revision: `13a39179b3df796f3bb2e70c47ccdd92593f34d2`
- Package.resolved、workspace-state、checkout HEAD、Archive build graphを相互確認済み

## Evidence

- Pro UX／Startup Promise focused: `9 pass / 0 fail`
- IAP combined: `33 pass / 0 fail`
- Full Node: `411 pass / 0 fail / 0 skipped`
- Release Simulator: `BUILD SUCCEEDED`
- Release Archive: `ARCHIVE SUCCEEDED`
- Identity: `com.takaakimailboxstar.cuescoreapps` / `1.0 (71)`
- Archive `.storekit`: 0件
- GitHub source dependencyとArchive dependency: 完全一致
- Build source commit: `aa67c564928725654403005ecf7e878daaf83e10`
- Push: `origin/main`へ成功
- Upload: `EXPORT SUCCEEDED` / `Upload succeeded`
- App Store Connect Build ID: `2b8390e4-5436-4673-9ecf-9c1f7da1a77d`
- Processing: `VALID`
- Encryption: `usesNonExemptEncryption=false`
- Internal group: `CueScore Internal Testers`、Build 71対象

## Boundary

`READY FOR PRODUCT OWNER BUILD 71 PRO UX + STARTUP SAFETY TEST`でSTOPする。新機能・追加製品修正、dependency version変更、Build 72、External TestFlight、App Review、Releaseは実施しない。
