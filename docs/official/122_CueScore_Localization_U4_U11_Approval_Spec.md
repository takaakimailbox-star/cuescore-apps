# 122 — CueScore Localization U4／U11 Approval Spec（Decision 038 付随 Spec）

**状態: Adopted / Official（2026-10-17 発行）。** Official 108・120 を改変せず、Decision 038（Official 121）の適用規則と受入条件を定める。

## 1. U4 規則
- U4-R1: 購入面の日本語リテラルを `cueT` 経由に置き換える。ja の表示は現行と**文字列完全一致**。購入・復元・保留・失敗・キャンセルの処理、`entitlement`、Product ID、StoreKit 呼び出し、`displayPrice` の取得元は変更しない。
- U4-R2: 買い切りの説明文: en `A one-time purchase. No subscription.`／zh-Hans `一次性购买，无需订阅。`（案 B）。「永久」「for good」等の保証表現を禁止。
- U4-R3: 価格・通貨・金額を文言に固定しない（価格欄は StoreKit の表示値のみ）。ASC の IAP 商品情報（表示名・説明）は変更しない（P7）。
- U4-R4: 復元の導線（「購入を復元」に相当する操作）が 3 言語で表示され、ユーザー操作でのみ復元を呼ぶ現行仕様を維持する（Apple Guideline 3.1.1。自動復元しない）。
- U4-R5: 翻訳は P4 の承認記録（`po-approval.json`）に追加キーとして記録し、残余リスクは R2（人間の独立レビュー未実施）とする。

## 2. U11 規則
- U11-R1: 実施は P6。対象は開発言語の fallback のみ（`CFBundleDevelopmentRegion` と対応する `developmentRegion`／`knownRegions`）。Bundle ID、Display Name、Version／Build、署名、アイコン、StoreKit、Product ID は不変。
- U11-R2: `Info.plist` と `Info-ScoreRC.plist` の差分は、変更する開発言語キーに限る。変更前後の `xcodebuild -showBuildSettings`（本番・RC）で識別子の不変を確認する。
- U11-R3: 変更後の Simulator 結果を「実機 PASS」と記録しない。

## 3. P5／P6 規則
- PV-R1: Simulator の Evidence と実機の Evidence を分けて保存する。
- PV-R2: 既存の iPhone アプリ（公開版 CueScore Apps、Score RC、Score P1）を上書き・削除しない。Build 84 データを伴う上書き更新は別 Gate（事前 Backup と復元可能性の確認が先）。

## 4. 受入基準
- AC-U4-1: 約 29 文言が 3 言語で表示され、ja は現行と完全一致、AC-S1 の許可リストから U4 が消える。
- AC-U4-2: 購入・復元・Entitlement・Product ID・価格取得のコードとテストが無変更で PASS。
- AC-U4-3: 案 B の文面が catalog に固定され、保証表現が catalog にない。
- AC-U11-1: Native 設定の差分が開発言語のみ。識別子が不変。
- AC-U11-2: 変更前後の言語解決の比較が Evidence にあり、実機の項目は NOT VERIFIED と記録。
- AC-PV-1: Simulator Evidence と実機 Evidence が分離されている。
- AC-PV-2: Build 84 上書き更新の安全計画（A〜H）が存在し、実行されていない。
- AC-G-1: Glossary の資料が PO 承認前に `CONFIRMED` を増やしていない。Official 109 が未発行。
