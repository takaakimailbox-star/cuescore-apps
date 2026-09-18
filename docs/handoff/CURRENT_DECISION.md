# CueScore Current Decision

- Decision ID: `CUESCORE-B73-COMPACT-SETTINGS-20260918`
- Date: 2026-09-18
- Product Owner Decision: GO
- Gate state: Archive PASS／distribution pending

## Objective

Build 72で実機PASSした現在プラン表示と`CueScoreEntitlement` SSOTを維持し、Settingsの全主要項目を390×844の小型iPhone縦画面でスクロールなしに確認できるcompact layoutをBuild 73へ正式反映する。課金、Free／Pro境界、保存dataは変更しない。

## Completed before upload

- baseline `4448564cb080b0f8ad61241aab245533ade4f095`から、保全済みcompact Settings候補をBuild 73へ反映した。
- 390×844でUnknown／Free／Proとも縦横overflowなし、Privacyとcopyrightまで初期scroll位置で表示した。
- Data row 63px、legal row 44px、plan action 44pxを維持した。
- About／Terms／Privacyの各rowから既存画面へ遷移できることを確認した。
- Settings focused `8 pass / 0 fail`、Full Node `419 pass / 0 fail / 0 skipped`。
- Release Simulator buildとdevice ArchiveをPASS。Archiveは`com.takaakimailboxstar.cuescoreapps` / `1.0 (73)`、`.storekit` 0件。
- 固定3オプションでArchive checkoutがrepositoryと同じ`ion-ios-filesystem 1.1.2` / `0d81e26…`、`capacitor-swift-pm 8.0.2`を使用した。

## Boundary

すべてPASSしたBuild 73をGitHub mainとInternal TestFlightへ反映し、`READY FOR PRODUCT OWNER BUILD 73 COMPACT SETTINGS TEST`でSTOPする。Build 74、External TestFlight、App Review、Releaseへ進まない。
