# CueScore Current Report

- App: CueScore
- Decision ID: `CUESCORE-B74-SETTINGS-REAL-DEVICE-FIT-20260919`
- Date: 2026-09-19
- Gate Result: `READY FOR PRODUCT OWNER BUILD 74 SETTINGS REAL-DEVICE FIT TEST`
- Version / Build: `1.0 (74)`

## 結論

Build 73実機FAILの原因を後段`navigation-phase2-6.css`によるspacer再適用と特定し、そのspacer 1要素だけをcompact iPhone条件で0pxにした。row、fixed bottom navigation、課金、Pro、保存data、navigation contractは変更していない。test、geometry、Release build／Archive、GitHub main反映、Internal TestFlight配布をPASSした。

## Geometry Evidence

- Viewport: `390×844`
- Fixed bottom navigation: top `776px`／height `68px`
- Privacy Policy row: top `542.5px`／bottom `586.5px`／height `44px`
- Acceptance: `586.5 <= 776`、余裕`189.5px`
- Spacer: display `none`／height `0px`／min-height `0px`
- Data row: `63px`、legal row: `44px`
- horizontal overflowなし、initial `scrollTop=0`

## Test / Build Evidence

- Settings focused: `25 pass / 0 fail`
- Full Node regression: `422 pass / 0 fail / 0 skipped`
- Release iOS Simulator build: `BUILD SUCCEEDED`
- Release device Archive: `ARCHIVE SUCCEEDED`
- Archive identity: `com.takaakimailboxstar.cuescoreapps` / `1.0 (74)`
- Archive内`.storekit`: 0件
- source／native-web／iOS copied／Archive `navigation-phase2-6.css` SHA-256: `0446001b3d4d81229c271dd496a6e8c3881b764f26f276566f9263fabb549dd7`

## Dependency Evidence

- `ion-ios-filesystem`: `1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm`: `8.0.2` / `13a39179b3df796f3bb2e70c47ccdd92593f34d2`
- `Package.resolved`: repositoryから無差分
- Fixed flags: `-onlyUsePackageVersionsFromResolvedFile`、`-disableAutomaticPackageResolution`、`-skipPackageUpdates`

## Distribution

- Build source commit: `416bb4c6a0ba0f43d51ac8ba444edec894d34999`
- Push: GitHub `main`へ成功
- Upload: `Upload succeeded`
- App Store Connect Build ID: `602c7f3f-29bc-461a-ab29-e4f84337fe73`
- Processing: `VALID`
- Encryption: `usesNonExemptEncryption=false`
- Internal group: `CueScore Internal Testers`（Build 74 membership確認済み）

## STOP

`READY FOR PRODUCT OWNER BUILD 74 SETTINGS REAL-DEVICE FIT TEST`

External TestFlight、App Review、Releaseは実施しない。
