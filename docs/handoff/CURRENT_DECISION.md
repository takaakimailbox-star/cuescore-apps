# CueScore Current Decision

- Decision ID: `CUESCORE-V1-FINAL-PRICE-PRIVACY-DECISION-20260920`
- Date: 2026-09-20
- Product Owner Decision: `ACCEPT FOR APP REVIEW PREPARATION`
- Gate state: `READY FOR PRODUCT OWNER APP REVIEW SUBMISSION`

## Price Decision

- B-04を`BLOCKER`から`ACCEPTED RISK — TESTFLIGHT-SPECIFIC SANDBOX METADATA ISSUE`へ再分類する。
- TestFlight Build 77: Fresh `Product.displayPrice=$5.99`。
- Xcode direct install／同一製品source: `Product.displayPrice=¥980`。
- TestFlight Apple purchase sheet: `¥980`。
- Product source、Product ID、StoreKit `Product.displayPrice` authorityは不変。価格hard-code、独自通貨換算、Build 78は作成しない。
- A/B Evidence: `docs/release/evidence/CueScore_v1.0_StoreKit_Price_AB_Diagnostic_2026-09-20.md`。

## Privacy Decision

- 空白のXcode Privacy Reportはwarning 0の明示Evidenceではなく、Privacy validationは`NOT VERIFIED`を維持する。
- Build 77は`VALID`／`APP_STORE_ELIGIBLE`。App Privacy回答は現行実装と整合する。
- Capacitor／Cordovaの`PrivacyInfo.xcprivacy`は存在し、tracking false。analytics／advertising SDKはなく、Required Reason API declaration欠落の確認Evidenceもない。
- Evidence gapは`NON-BLOCKING FOR APP REVIEW SUBMISSION`。根拠なしにapp-level privacy manifestを追加しない。

## Submission Baseline

- Version 1.0はBuild 77を選択済み。
- screenshots 6枚は全件`COMPLETE`。
- App／CueScore ProはJapan-only。
- review draftはiOS App Version 1.0とCueScore Proの2項目のみで`READY_FOR_REVIEW`。

## Boundary / STOP

- Product source変更、Build 78、External TestFlight、App Review提出、Releaseは禁止。
- Submit for Reviewは押していない。Product OwnerがApp Review submissionを実行または別途明示承認する直前でSTOPする。
