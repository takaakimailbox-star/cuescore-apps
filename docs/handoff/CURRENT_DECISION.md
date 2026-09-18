# CueScore Current Decision

- Decision ID: `CUESCORE-B72-CURRENT-PLAN-SETTINGS-20260918`
- Date: 2026-09-18
- Product Owner Decision: GO
- Gate result: `READY FOR PRODUCT OWNER BUILD 72 CURRENT PLAN UI TEST`

## Objective

Settings画面上部へ現在のFree／Pro／確認中状態を表示する「プラン」cardを、CueScoreの既存Design Systemと`CueScoreEntitlement` SSOTだけを使って最小実装する。購入／復元は既存CueScore Pro画面を再利用し、課金contractとFree／Pro境界を変更しない。

## Completed before upload

- baseline `e763170b7ec061050bb0ffd0796860ec11e97dc9`からBuild 72を実装した。
- Unknown `確認中`、Free `CueScore Free`、Pro `CueScore Pro ✓`と状態別導線を実装した。
- purchase／restore／foreground／refreshで既存entitlement subscriptionから即時更新する。
- Build 72 focused `7 pass`、Build 70 + 72 focused `16 pass`、Full Node `418 pass / 0 fail / 0 skipped`。
- 390×844相当でUnknown／Free／Proをvisual auditし、Pro badge除去と横崩れなしを確認した。
- Release Simulator buildとdevice ArchiveをPASSした。Simulator実行はXcode 27 SDKの既存UIScene lifecycle要件でenvironment BLOCKEDのため、Web資産の390×844 auditとdevice Archiveから分離した。
- Archiveは`com.takaakimailboxstar.cuescoreapps` / `1.0 (72)`、`.storekit` 0件。
- `-skipPackageUpdates`を含む固定手順でArchive build graphが`ion-ios-filesystem 1.1.2` / `0d81e26…`を使用し、repository `Package.resolved`と一致した。

## Boundary

Build 72をInternal TestFlightへ配布し、`READY FOR PRODUCT OWNER BUILD 72 CURRENT PLAN UI TEST`でSTOPする。Build 73、External TestFlight、App Review、Releaseへ進まない。

## Completed distribution

Build source commit `59e95be5342e8e0e7e11cc5d13593ba2a14db083`をGitHub mainへpushし、同一product sourceのArchiveをApp Store Connectへuploadした。Build ID `c0a3dddc-d3f0-4425-a2ab-63ed1b0c249f`は`VALID`、`usesNonExemptEncryption=false`。Internal group `CueScore Internal Testers`はinternal／全BuildアクセスでBuild 72を配布対象とする。Product Ownerの実機確認待ちでSTOPする。
