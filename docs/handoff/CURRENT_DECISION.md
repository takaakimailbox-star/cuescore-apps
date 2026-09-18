# CueScore Current Decision

- Decision ID: `CUESCORE-B71-DEPENDENCY-REPRODUCIBILITY-20260918`
- Date: 2026-09-18
- Product Owner Decision: GO
- Gate result: `READY FOR PRODUCT OWNER BUILD 71 PRO UX + STARTUP SAFETY TEST`

## Objective

正式受入対象外としたBuild 70の製品変更を維持し、GitHub正本の`Package.resolved`を強制使用してBuild 71を再Build／Archive／Internal TestFlight配布する。新機能・追加製品修正は行わない。

## Completed before upload

- latest `origin/main`が`5818a1714eda7b971a27dc98eea305f18cdb3b9b`であることを確認した。
- clean worktree dependencyを`npm ci`で`package-lock.json`から再現した。
- `cap sync ios`でnpm標準pathのlocal Capacitor packagesを生成した。package.json／package-lock.json／Package.resolvedは無差分。
- Xcode 27のhelpで`-onlyUsePackageVersionsFromResolvedFile`と`-disableAutomaticPackageResolution`対応を確認し、両方を使用した。
- `ion-ios-filesystem 1.1.2` / `0d81e26…`、`capacitor-swift-pm 8.0.2` / `13a391…`を専用checkoutへ固定した。
- Pro UX／Promise focused、IAP combined、Full Node regression、Release Simulator build、device ArchiveをPASSした。
- Archiveは`com.takaakimailboxstar.cuescoreapps` / `1.0 (71)`、`.storekit` 0件。
- Archive build graphが専用checkoutの`ion-ios-filesystem 1.1.2` / `0d81e26…`を使用したことを確認した。

## Completed distribution

Build source commit `aa67c564928725654403005ecf7e878daaf83e10`をGitHub mainへpushし、同一sourceのArchiveをApp Store Connectへuploadした。Build ID `2b8390e4-5436-4673-9ecf-9c1f7da1a77d`は`VALID`、`usesNonExemptEncryption=false`、Internal group `CueScore Internal Testers`対象。Product OwnerのBuild 71実機確認待ちでSTOPする。Build 72、External TestFlight、App Review、Releaseへ進まない。
