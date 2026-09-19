# CueScore Current Report

- App: CueScore
- Decision ID: `CUESCORE-B76-SETTINGS-SCROLL-LOCK-20260919`
- Date: 2026-09-19
- Gate Result: `READY FOR PRODUCT OWNER BUILD 76 SETTINGS SCROLL LOCK TEST`
- Version / Build: `1.0 (76)`

## 結論

Build 75の表示とspacingを維持し、compact fit範囲のSettings scroll ownerだけを固定した。小さい端末のoverflow fallback、row、fixed bottom navigation、課金、Pro、保存data、navigation contractは変更していない。test、visual audit、Release build／Archive、GitHub main反映、Internal TestFlight配布をPASSした。

## Geometry Evidence

- Viewport: `390×844`
- Fixed bottom navigation: top `776px`／height `68px`
- Privacy Policy row: bottom `678.5px`／height `44px`
- Acceptance: `678.5 <= 776 - 60`、余裕`97.5px`
- Spacer: display `block`／height `40px`／min-height `40px`
- Data row: `63px`、legal row: `44px`
- horizontal overflowなし、initial `scrollTop=0`

## Test / Build Evidence

- Settings focused: `19 pass / 0 fail`
- Full Node regression: `428 pass / 0 fail / 0 skipped`
- Release iOS Simulator build: `BUILD SUCCEEDED`
- Release device Archive: `ARCHIVE SUCCEEDED`
- Archive identity: `com.takaakimailboxstar.cuescoreapps` / `1.0 (76)`
- Archive内`.storekit`: 0件
- source／iOS copied／Archive `navigation-phase2-6.css` SHA-256: `24c472291e0e61137e7dd483e88474bafcdead38d2e10011557efc43051dbf9b`

## Dependency Evidence

- `ion-ios-filesystem`: `1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm`: `8.0.2` / `13a39179b3df796f3bb2e70c47ccdd92593f34d2`
- `Package.resolved`: repositoryから無差分
- Fixed flags: `-onlyUsePackageVersionsFromResolvedFile`、`-disableAutomaticPackageResolution`、`-skipPackageUpdates`

## Distribution

- Build source commit: `84d53ba4bdaafc9b4a7f1e1a66bb143929883b25`
- Push: GitHub `main`へ成功
- Upload: `Upload succeeded`
- App Store Connect Build ID: `728bec63-150b-4736-ac71-42b61aa15b4b`
- Processing: `VALID`
- Encryption: `usesNonExemptEncryption=false`
- Internal group: `CueScore Internal Testers`（Build 76対象を確認済み）

## STOP

`READY FOR PRODUCT OWNER BUILD 76 SETTINGS SCROLL LOCK TEST`

External TestFlight、App Review、Releaseは実施しない。
