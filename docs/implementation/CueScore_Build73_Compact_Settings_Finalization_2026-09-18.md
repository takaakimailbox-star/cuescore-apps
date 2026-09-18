# CueScore Build 73 Compact Settings Finalization

- Decision ID: `CUESCORE-B73-COMPACT-SETTINGS-20260918`
- Date: 2026-09-18
- Baseline: `4448564cb080b0f8ad61241aab245533ade4f095`
- Version / Build: `1.0 (73)`

## Implementation

Build 72でProduct Owner実機PASSした現在プランcardと`CueScoreEntitlement` SSOTを変更せず、390×844以下のiPhone縦画面に限定してSettingsのvertical spacing、card padding、row height、footer spacingをcompact化した。既存の後段Settings CSSに上書きされないよう、Data row 63pxとspacer解除だけを必要な優先度で固定した。

Free／Pro／Unknownの表示、購入導線、Backup／Restore、About、Terms、Privacy、Delete、copyrightを削除していない。StoreKit、purchase、verified entitlement、Restore contract、Free最新20件、21件目以降保存、Backup／Restore format、Match／Player data、6競技は変更していない。

## Verification

- Settings focused: `8 pass / 0 fail`
- Full Node: `419 pass / 0 fail / 0 skipped`
- 390×844 Unknown／Free／Pro: vertical overflowなし、horizontal overflowなし
- Privacy／copyright: `scrollTop=0`のまま表示
- Tap sizes: Data row 63px、legal row 44px、plan action 44px
- About／Terms／Privacy: 既存画面への遷移PASS
- Pro: `CueScore Pro ✓`、`🔒 Pro` badge 0件
- Native parity: source／native-web／iOS copied asset一致
- Release Simulator build: `BUILD SUCCEEDED`
- Device Archive: `ARCHIVE SUCCEEDED`
- Archive: `com.takaakimailboxstar.cuescoreapps` / `1.0 (73)` / `.storekit` 0件

## Dependency reproducibility

- `ion-ios-filesystem 1.1.2`
- revision `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm 8.0.2`
- revision `13a39179b3df796f3bb2e70c47ccdd92593f34d2`
- Repository `Package.resolved`とArchive専用checkout一致
- Fixed flags: `-onlyUsePackageVersionsFromResolvedFile`、`-disableAutomaticPackageResolution`、`-skipPackageUpdates`

## Distribution Evidence

- Build source commit: `50db6291a12222f31e708c86ce3f68af3123edd3`
- GitHub push: `main`へ成功
- App Store Connect upload: `Upload succeeded`
- Build ID: `c494bb28-686a-4dbd-a0cb-60555a4b90db`
- Processing state: `VALID`
- Encryption: `usesNonExemptEncryption=false`
- Internal group: `CueScore Internal Testers`（Build 73 membership確認済み）

`READY FOR PRODUCT OWNER BUILD 73 COMPACT SETTINGS TEST`でSTOPした。Build 74、External TestFlight、App Review、Releaseへ進まない。
