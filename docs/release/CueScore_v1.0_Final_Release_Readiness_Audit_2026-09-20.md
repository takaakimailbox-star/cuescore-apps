# CueScore v1.0 Final Release Readiness Re-Audit

- Audit Decision ID: `CUESCORE-V1-FINAL-SUBMISSION-FIX-JP-20260920`
- Final Decision ID: `CUESCORE-V1-FINAL-PRICE-PRIVACY-DECISION-20260920`
- Re-audit date: 2026-09-20
- Repository: `takaakimailbox-star/cuescore-apps`
- GitHub main at re-audit start: `e27906b0c2d541d2e16d4df3e934af82c1855c6f`
- Build source: `9828a8499f514d239b717d248a9a99976db23944`
- Candidate: `1.0 (77)`
- App Store Connect Build ID: `a1ebcb96-b6a4-4e88-b5e5-f79e149e15dd`

## Executive Summary

**APP REVIEW SUBMITTED — WAITING FOR REVIEW**

旧監査のB-01、B-02、B-03、B-05と提出準備項目は解消した。App Store Connect上でVersion 1.0はBuild 77を選択し、現行metadata、Build 77 screenshots、Japan-only availability、CueScore Proを含む2項目review draftが一致した状態でApp Reviewへ提出した。External TestFlightと自動Releaseは行っていない。

Product Ownerは残っていた2件を次のとおり最終判断した。

1. B-04: `ACCEPTED RISK — TESTFLIGHT-SPECIFIC SANDBOX METADATA ISSUE`。
2. Privacy Report: `NOT VERIFIED EVIDENCE GAP — NON-BLOCKING FOR APP REVIEW SUBMISSION`。

製品source変更、価格hard-code、app-level privacy manifest追加、Build 78は行わず、承認された2項目だけを提出した。

## B-01 — Version 1.0 Build relationship: RESOLVED

- Version ID: `deb842d0-c7f5-4bcf-9248-443bcb090cdf`
- Version: iOS `1.0`
- Selected Build: `77`
- Build ID: `a1ebcb96-b6a4-4e88-b5e5-f79e149e15dd`
- Processing: `VALID`
- Audience: `APP_STORE_ELIGIBLE`
- `usesNonExemptEncryption=false`

## B-02 — Review Notes / metadata: RESOLVED

- Review NotesはBuild 77、CueScore Pro、Free／Pro境界、購入／復元review pathへ更新済み。
- Description／Promotional TextはFree最新20件、21件目以降も保持、Proの全履歴／分析／Backup／Restoreを明示。
- 固定価格はmetadata本文へ記載していない。
- Officialおよびpublic Privacy／Terms／SupportはStoreKit、Non-Consumable、復元、local-first仕様へ整合し、HTTPS到達と本文一致を確認済み。

## B-03 — App Store screenshots: RESOLVED

最終iPhone 6.5-inch setは次の6枚。全件`COMPLETE`、1242×2688。

1. `01_Home_Build77.png`
2. `02_Player_List_Build77.png`
3. `03_Player_Detail_Build77.png`
4. `05_History_Build77.png`
5. `06_Match_Detail_Build77.png`
6. `07_Settings_Pro.png`

旧5枚をBuild 77現行UIへ差し替え、Settings Pro画像を維持した。diagnostic UI、旧Backup単独画面、unsupported featureは含まない。

## B-04 — `$5.99` / `¥980`: ACCEPTED RISK — TESTFLIGHT-SPECIFIC SANDBOX METADATA ISSUE

- Build 77はPro画面open時にFresh `Product.products(for:)`を実行し、表示authorityは`Product.displayPrice`。
- stale price fallback、`¥980` hard-code、独自通貨変換はない。
- Japan Sandbox実機: Pro画面`$5.99`、Apple購入sheet`¥980`。
- Sandbox購入成功、verified entitlement、即時Pro解放、badge消滅、再起動後Pro維持をPASS。
- App Store ConnectのJPN IAP価格は`¥980`、IAP availabilityはJPNのみ。
- 同一Product ID／同一製品sourceのXcode direct installではFresh `Product.displayPrice=¥980`。
- TestFlightとXcode directの製品source、native asset hash、Product IDは同一。Build 78は作成していない。

Apple購入sheetの最終価格とXcode direct installの`Product.displayPrice`はいずれも`¥980`であり、誤ったUSD metadataはTestFlight／Sandbox distribution pathへ強く分離された。Product Ownerはv1.0の既知TestFlight／Sandbox validation anomalyとしてaccepted riskに再分類した。製品コードを変更せず、`¥980` hard-codeや独自currency conversionを追加しない。

Evidence: `docs/release/evidence/CueScore_v1.0_StoreKit_Price_AB_Diagnostic_2026-09-20.md`。

## B-05 — Japan-only availability: RESOLVED

- App available territories: 1
- Japan: available
- Other territories: unavailable 174
- `availableInNewTerritories=false`
- CueScore Pro IAP available territories: `JPN`のみ

## Initial IAP Submission Draft: RESOLVED / SUBMITTED

- Review submission ID: `7fd64b66-fe2e-424e-9038-a37cbddf8e87`
- Pre-submit state: `READY_FOR_REVIEW`
- Item count: 2
- Item 1: iOS App Version 1.0
- Item 2: CueScore Pro／Product ID `com.takaakimailboxstar.cuescoreapps.pro`

Screenshot差し替え前に2項目をAPIで保存し、draft内の2項目だけを一時解除した。Version 1.0、Build 77、CueScore Pro IAP本体は削除していない。差し替え後に同じdraftへ2項目を再追加し、関係を再読取した。

Evidence:

- `docs/release/evidence/CueScore_v1.0_Review_Draft_Before_Screenshot_Replacement_2026-09-20.json`
- `docs/release/evidence/CueScore_v1.0_Review_Draft_After_Screenshot_Replacement_2026-09-20.json`

## App Privacy: CONSISTENT

App Store Connect実画面は次を表示した。

- Privacy Policy URL: official public page
- `データの収集なし`
- `このアプリからデータは収集されません`

現行source／policyのtrackingなし、advertisingなし、analytics SDKなし、user-created data local-first、player photo optional、CueScore accountなし、StoreKit entitlement利用と矛盾しない。推測による回答変更は行っていない。

## Xcode Privacy Report: NOT VERIFIED EVIDENCE GAP — NON-BLOCKING

- Xcode OrganizerからBuild 77 ArchiveのPrivacy Reportを生成。
- PDF: 807 bytes、1ページ、抽出textなし、visualは空白。
- Archive内app-level `PrivacyInfo.xcprivacy`: 0件。
- Capacitor／Cordova framework manifests: tracking false、収集dataなし、accessed API typesなし。
- Build 77: `VALID`／`APP_STORE_ELIGIBLE`。
- App Privacy回答: 現行実装と整合。
- analytics／advertising SDK: なし。
- confirmed missing Required Reason API declaration: なし。

空白PDFはwarning 0を明示しないため、Privacy／Required Reason API／missing manifest warningを0件としてPASS判定せず、`NOT VERIFIED`を維持する。一方、上記のBuild／manifest／実装EvidenceからProduct OwnerはApp Review submissionに対してnon-blockingと判断した。根拠のないapp-level privacy manifestは追加しない。Evidence: `docs/release/evidence/CueScore_v1.0_Build77_Privacy_Report.pdf`。

## Product / Artifact Baseline: PASS

- Full Node regression: `432 pass / 0 fail / 0 skipped`
- Archive identity: `com.takaakimailboxstar.cuescoreapps` / `1.0 (77)`
- Archive内`.storekit`: 0件
- Product source change during submission fix: なし
- `ion-ios-filesystem`: `1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm`: `8.0.2` / `13a39179b3df796f3bb2e70c47ccdd92593f34d2`
- source／native copied web assets／Archive dependency: 一致

## STOP State

- Build 78: not created
- External TestFlight: not performed
- App Review submission: performed
- Release: not performed

B-04とPrivacy Report EvidenceのProduct Owner最終判断後、明示承認に基づきApp Review submissionを実施した。審査結果待ちでSTOPし、自動Releaseへ進まない。

## App Review Submission Result

- Review submission ID: `7fd64b66-fe2e-424e-9038-a37cbddf8e87`
- Submitted: `2026-09-20T08:22:32.348Z`（2026-09-20 17:22:32 JST）
- Submission state: `WAITING_FOR_REVIEW`
- App Version 1.0 state: `WAITING_FOR_REVIEW`
- CueScore Pro state: `WAITING_FOR_REVIEW`
- Submitted items: 2（iOS App Version 1.0／CueScore Pro）
- Version release type: `MANUAL`
- External TestFlight／automatic Release: not performed

Evidence: `docs/release/evidence/CueScore_v1.0_App_Review_Submission_2026-09-20.json`。

**APP REVIEW SUBMITTED — WAITING FOR REVIEW**
