# CueScore Current Decision

- Decision ID: `CUESCORE-V1-FINAL-SUBMISSION-FIX-JP-20260920`
- Date: 2026-09-20
- Product Owner Decision: GO（Japan-only）
- Gate state: `READY FOR PRODUCT OWNER FINAL SUBMISSION REVIEW`

## Completed Scope

- App availabilityをJapan-onlyへ固定し、`availableInNewTerritories=false`を保存・API再読取。
- App Store Version 1.0はBuild 77を選択済み。
- App Review Notes、Description、Promotional Text、Official／public Privacy・Terms・SupportをBuild 77 Free／Pro仕様へ整合。
- App Store screenshotsを現行Build 77 UIへ更新。6枚すべて`COMPLETE`、1242×2688。
- review draftの削除前Evidenceを保存後、draft内の2項目だけを一時解除。Version 1.0、Build 77、CueScore Pro IAP本体は削除していない。
- 同じreview draftへiOS App Version 1.0とCueScore Proを再追加し、2項目だけであることを再読取。
- App Privacy実画面は「データの収集なし」で、現行local-first／trackingなし実装と整合。
- Xcode OrganizerからBuild 77 Privacy Reportを生成・保存。

## Final Review Items

1. Japan SandboxではPro画面のFresh `Product.displayPrice`が`$5.99`、Apple購入sheetが`¥980`。購入lifecycleはPASSしているが、Production非再現は証明されていない。
2. Xcode生成Privacy Reportは空白1ページで、privacy／Required Reason API／missing manifest warningが0件であることを明示的に証明しない。Archiveにはapp-level `PrivacyInfo.xcprivacy`がなく、組込みCapacitor／Cordova manifestsはtracking false／収集dataなし。

## Boundary / STOP

- Product source変更、Build 78、External TestFlight、App Review提出、Releaseは禁止。
- Product Ownerの最終提出判断までSTOPする。
