# CueScore Current Decision

- Decision ID: `CUESCORE-B76-SETTINGS-SCROLL-LOCK-20260919`
- Date: 2026-09-19
- Product Owner Decision: GO
- Gate state: `READY FOR PRODUCT OWNER BUILD 76 SETTINGS SCROLL LOCK TEST`

## Objective

Build 75の全項目fitとspacingを維持し、1画面に収まるcompact Settingsで上下スワイプによる移動を止める。小さい端末のoverflow fallback、row、fixed bottom navigation、課金、Pro、保存data、navigation contractは変更しない。

## Acceptance

- 390×844相当のnative layoutでスワイプ前後の表示位置が不変。
- Unknown／Free／Proの全状態でPrivacy Policyまで初期scroll位置に表示。
- Data row約63px、legal row約44px、plan action約44pxを維持。
- Backup／Restore／Data Delete／About／Terms／Privacyとbottom navigationが操作可能。
- Full Node regression fail 0、固定dependencyでRelease build／ArchiveをPASS。

## Boundary

Build `1.0 (76)`をGitHub mainとInternal TestFlightへ反映し、`READY FOR PRODUCT OWNER BUILD 76 SETTINGS SCROLL LOCK TEST`でSTOPする。Build 77、External TestFlight、App Review、Releaseへ進まない。
