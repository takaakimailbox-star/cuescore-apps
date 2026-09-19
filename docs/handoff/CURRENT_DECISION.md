# CueScore Current Decision

- Decision ID: `CUESCORE-B75-SETTINGS-SPACING-POLISH-20260919`
- Date: 2026-09-19
- Product Owner Decision: GO
- Gate state: `READY FOR PRODUCT OWNER BUILD 75 SETTINGS SPACING POLISH TEST`

## Objective

Build 74の全項目fitを維持し、余剰スペースの一部を4ブロック間へ固定／制限spacingとして再配分する。rowサイズ、fixed bottom navigation、課金、Pro、保存data、navigation contractは変更しない。

## Acceptance

- 390×844相当のnative layoutで`privacyRow.bottom <= bottomNav.top - 60px`、理想余白60–100px。
- Unknown／Free／Proの全状態でPrivacy Policyまで初期scroll位置に表示。
- Data row約63px、legal row約44px、plan action約44pxを維持。
- Backup／Restore／Data Delete／About／Terms／Privacyとbottom navigationが操作可能。
- Full Node regression fail 0、固定dependencyでRelease build／ArchiveをPASS。

## Boundary

Build `1.0 (75)`をGitHub mainとInternal TestFlightへ反映し、`READY FOR PRODUCT OWNER BUILD 75 SETTINGS SPACING POLISH TEST`でSTOPする。Build 76、External TestFlight、App Review、Releaseへ進まない。
