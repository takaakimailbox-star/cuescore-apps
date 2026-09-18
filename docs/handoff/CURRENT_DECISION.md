# CueScore Current Decision

- Decision ID: `CUESCORE-B74-SETTINGS-REAL-DEVICE-FIT-20260919`
- Date: 2026-09-19
- Product Owner Decision: GO
- Gate state: Archive PASS／distribution pending

## Objective

Build 73の実機TestFlightでPrivacy Policy rowをbottom tab barの下へ押し出した、Data Management cardとfooter間の可変spacerだけを除去する。rowサイズ、fixed bottom navigation、課金、Pro、保存data、navigation contractは変更しない。

## Acceptance

- 390×844相当のnative layoutで`privacyRow.bottom <= bottomNav.top`。
- Unknown／Free／Proの全状態でPrivacy Policyまで初期scroll位置に表示。
- Data row約63px、legal row約44px、plan action約44pxを維持。
- Backup／Restore／Data Delete／About／Terms／Privacyとbottom navigationが操作可能。
- Full Node regression fail 0、固定dependencyでRelease build／ArchiveをPASS。

## Boundary

全PASS時だけBuild `1.0 (74)`をGitHub mainとInternal TestFlightへ反映し、`READY FOR PRODUCT OWNER BUILD 74 SETTINGS REAL-DEVICE FIT TEST`でSTOPする。Build 75、External TestFlight、App Review、Releaseへ進まない。
