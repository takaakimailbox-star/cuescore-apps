# CueScore Current Report

- App: CueScore
- Decision ID: `CUESCORE-B72-CURRENT-PLAN-SETTINGS-20260918`
- Date: 2026-09-18
- Gate Result: `READY FOR PRODUCT OWNER BUILD 72 CURRENT PLAN UI TEST`
- Version / Build: `1.0 (72)`

## 結論

Build 72の現在プランSettings UI、test、visual audit、固定dependency Release build／device Archive、GitHub main反映、Internal TestFlight配布をPASSした。Product Ownerの実機現在プランUI確認待ちでSTOPする。

## Product Evidence

- Unknown: `確認中`
- Free: `CueScore Free` / `Proを購入・購入を復元`
- Pro: `CueScore Pro ✓` / `購入・復元について`
- Pro時の`🔒 Pro` badgeなし
- 既存CueScore Pro画面を再利用
- `CueScoreEntitlement` SSOTを使用し、local Pro flag追加なし
- StoreKit、purchase／restore、Free／Pro境界、保存dataは変更なし

## Test / Build Evidence

- Build 72 focused: `7 pass / 0 fail`
- Build 70 + Build 72 focused: `16 pass / 0 fail`
- Full Node regression: `418 pass / 0 fail / 0 skipped`
- 390×844 visual audit: Unknown／Free／Pro PASS、横崩れなし
- Release iOS Simulator build: `BUILD SUCCEEDED`
- Simulator runtime: Xcode 27 SDKの既存UIScene lifecycle要件でenvironment BLOCKED。製品UI判定とは分離
- Release device Archive: `ARCHIVE SUCCEEDED`
- Archive identity: `com.takaakimailboxstar.cuescoreapps` / `1.0 (72)`
- Archive内`.storekit`: 0件

## Dependency Evidence

- `ion-ios-filesystem`: `1.1.2`
- revision: `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm`: `8.0.2`
- `Package.resolved`: repositoryから無差分
- Archive build graph: Build 72専用fixed checkoutを参照
- Fixed flags: `-onlyUsePackageVersionsFromResolvedFile`、`-disableAutomaticPackageResolution`、`-skipPackageUpdates`

## Distribution

- Build source commit: `59e95be5342e8e0e7e11cc5d13593ba2a14db083`
- Push: `origin/main`へ成功
- Upload: `EXPORT SUCCEEDED` / `Upload succeeded`
- App Store Connect Build ID: `c0a3dddc-d3f0-4425-a2ab-63ed1b0c249f`
- Processing: `VALID`
- Encryption: `usesNonExemptEncryption=false`
- Internal group: `CueScore Internal Testers`、internal／全Buildアクセス、Build 72対象

## Product Owner確認

1. TestFlightからCueScore `1.0 (72)`へ更新する。
2. Settingsを開き、「プラン」が表示されることを確認する。
3. 購入済み端末で`CueScore Pro ✓`を確認する。
4. Pro限定機能に`🔒 Pro`が残っていないことを確認する。
5. Pro機能へ直接入れることを確認する。
6. 完全終了して再起動後も`CueScore Pro ✓`を確認する。

External TestFlight、App Review、Releaseは未実施。
