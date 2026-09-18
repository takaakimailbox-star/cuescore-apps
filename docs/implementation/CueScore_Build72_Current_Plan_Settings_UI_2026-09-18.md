# CueScore Build 72 Current Plan Settings UI

- Decision ID: `CUESCORE-B72-CURRENT-PLAN-SETTINGS-20260918`
- Date: 2026-09-18
- Baseline: `e763170b7ec061050bb0ffd0796860ec11e97dc9`
- Version / Build: `1.0 (72)`

## Implementation

Settings上部へ既存card radius／typography／spacingを使った「プラン」cardを追加した。既存`CueScoreEntitlement` snapshotを表示の唯一の正本とし、Unknownは`確認中`、confirmed Freeは`CueScore Free`、verified Proは`CueScore Pro ✓`を表示する。Free導線は`Proを購入・購入を復元`、Pro導線は`購入・復元について`とし、どちらも既存CueScore Pro画面を開く。

entitlement subscriptionへSettings同期を接続したため、purchase success、Restore success、foreground、entitlement refresh後に再起動不要で更新される。Pro booleanやUI専用永続flagは追加していない。StoreKit、purchase、verified transaction、current entitlements、transaction updates、Restore、Free最新20件、Backup／Restore format、6競技は変更していない。

## Verification

- Build 72 focused: `7 pass / 0 fail`
- Build 70 + Build 72 focused: `16 pass / 0 fail`
- Full Node: `418 pass / 0 fail / 0 skipped`
- 390×844: Unknown／Free／Pro表示、Pro badge除去、横崩れなし
- Release Simulator build: `BUILD SUCCEEDED`
- Device Archive: `ARCHIVE SUCCEEDED`
- Identity: `com.takaakimailboxstar.cuescoreapps` / `1.0 (72)`
- Archive `.storekit`: 0件

## Dependency reproducibility

最初のRelease buildでXcodeが1.1.4へ切り替えたことをPre-Archive Gateで検出し、そのartifactは正式候補から除外した。repository `Package.resolved`を1.1.2へ復元し、Build 71の2固定flagに`-skipPackageUpdates`を追加して再解決／再Buildした。正式Archiveは次に一致する。

- `ion-ios-filesystem 1.1.2`
- `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm 8.0.2`
- repository `Package.resolved`: 無差分

## Environment note

Release Simulator artifactのcompileは成功したが、iOS Simulator起動はXcode 27 SDKが要求するUIScene lifecycle未採用という既存native environment制約で開始直後にOSから停止された。Build 71のTestFlight実機PASSとは分離し、Settings visual auditは同一native web bundleを390×844で検証した。device Archiveは正常に成功している。

## Boundary

Internal TestFlight Build 72配布後、Product Ownerの実機現在プランUI確認でSTOPする。Build 73、External TestFlight、App Review、Releaseへ進まない。

## Distribution Evidence

- Build source commit: `59e95be5342e8e0e7e11cc5d13593ba2a14db083`
- Push: `origin/main`へ成功
- Upload: `EXPORT SUCCEEDED` / `Upload succeeded`
- App Store Connect Build ID: `c0a3dddc-d3f0-4425-a2ab-63ed1b0c249f`
- Processing: `VALID`
- Encryption: `usesNonExemptEncryption=false`
- Internal group: `CueScore Internal Testers`（internal／全Buildアクセス）
