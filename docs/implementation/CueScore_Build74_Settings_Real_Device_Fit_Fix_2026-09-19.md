# CueScore Build 74 Settings Real-Device Fit Fix

- Decision ID: `CUESCORE-B74-SETTINGS-REAL-DEVICE-FIT-20260919`
- Date: 2026-09-19
- Baseline: `b33b8988c10a3f28c7e8d3c8ada86718d448d9e0`
- Version / Build: `1.0 (74)`

## Product Owner Evidence

TestFlight Build 73実機画像でVersion `1.0 (73)`、`CueScore Pro ✓`、Backup／Restore／Data Delete、About、Termsを確認した。Privacy Policyはfixed bottom tab barより下にあり、初期表示では見えなかったためBuild 73 GateはFAIL。

## Root cause and minimal fix

Build 73の`index.html`はcompact条件で`.settings-formal-spacer-v1`を0pxにしていたが、その後に読み込む`navigation-phase2-6.css`のBuild 33 overrideが`display:block !important`、`min-height:132px !important`を再適用していた。

Build 74は`navigation-phase2-6.css`の末尾で、390×844を含むcompact iPhone条件だけ同じspacerを`display:none`、height／min-height 0へ固定した。変更対象はspacer 1要素だけ。Data／legal／plan row、fixed bottom navigation、`CueScoreEntitlement`、StoreKit、purchase／restore、保存data、6競技は変更していない。

## Verification

- Settings focused: `25 pass / 0 fail`
- Full Node: `422 pass / 0 fail / 0 skipped`
- 390×844 Privacy bottom: `586.5px`
- fixed bottom nav top: `776px`
- Geometry acceptance: `586.5 <= 776`（余裕`189.5px`）
- Spacer: `display:none`／height 0px
- Data row 63px／legal row 44px
- horizontal overflowなし／initial scrollTop 0
- Release Simulator build: `BUILD SUCCEEDED`
- Device Archive: `ARCHIVE SUCCEEDED`
- Archive: `com.takaakimailboxstar.cuescoreapps` / `1.0 (74)` / `.storekit` 0件
- CSS SHA-256: `0446001b3d4d81229c271dd496a6e8c3881b764f26f276566f9263fabb549dd7`（source／native-web／iOS copied／Archive一致）

## Dependency reproducibility

- `ion-ios-filesystem 1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm 8.0.2` / `13a39179b3df796f3bb2e70c47ccdd92593f34d2`
- Repository `Package.resolved`とArchive build checkout一致
- Fixed flags: `-onlyUsePackageVersionsFromResolvedFile`、`-disableAutomaticPackageResolution`、`-skipPackageUpdates`

## Distribution Evidence

- Build source commit: `416bb4c6a0ba0f43d51ac8ba444edec894d34999`
- GitHub push: `main`へ成功
- App Store Connect upload: `Upload succeeded`
- Build ID: `602c7f3f-29bc-461a-ab29-e4f84337fe73`
- Processing state: `VALID`
- Encryption: `usesNonExemptEncryption=false`
- Internal group: `CueScore Internal Testers`（Build 74 membership確認済み）

`READY FOR PRODUCT OWNER BUILD 74 SETTINGS REAL-DEVICE FIT TEST`でSTOPした。Build 75、External TestFlight、App Review、Releaseへ進まない。
