# 121 — CueScore Localization U4／U11 Approval Decision（Decision 038）

**状態: Adopted / Official。** 2026年10月17日発行（Decision 038、Official Design Decision Log v2.14）。Product Owner の承認（2026-10-17、明示。Evidence 64 の「PO Decision Summary」の推奨案のうち U4・U11・P5／P6 検証・Glossary の 4 項目）に基づく。
**Scope:** U4（Paywall・購入画面の翻訳）、U11（Native の開発言語 fallback の方針）、P5／P6 検証の進め方、Glossary 完了資料の作成。他の未決事項・他の Phase へ一般化しない。

## 1. 番号（fresh 確認、GitHub main `fed87633ea5f6437c177389cb2d472ff6adb726c`）
- Decision Log は v2.13（Decision 001〜037）。本書 = **Decision 038**（未使用を確認）、Decision Log = **v2.14**（001〜037 は改変しない）。
- Official 文書: 発行前の最大番号は 120。**109 は Glossary 用に予約済みで、本書でも使用しない**。本書 = **Official 121**（Decision）、付随の Spec = **Official 122**（`122_CueScore_Localization_U4_U11_Approval_Spec.md`）。
- Official 107／108／113〜120 は改変しない。

## 2. Product Owner 承認（2026-10-17、明示）
| ID | 承認内容 |
|---|---|
| PD-U4-1 | 課金画面（Paywall）と Settings のプランカードを ja／en／zh-Hans に対応する |
| PD-U4-2 | 「一度の購入でずっと利用できます」は、事実に基づく**案 B**を採用する（誇張した継続保証は禁止） |
| PD-U4-3 | 価格は StoreKit の情報を使用する。Non-Consumable の買い切り仕様、Product ID、Free／Pro 契約は変更しない |
| PD-U4-4 | App Store Connect の IAP 商品情報は **P7 の別 Gate** で扱う |
| PD-U11-1 | P6 で、Native の開発言語 fallback を `en` から `ja` へ揃える**方針**を承認する（対象候補: `Info.plist`、`Info-ScoreRC.plist`、`project.pbxproj`。実際の変更箇所は最新 source と Official に基づき決定し、変更前後の言語解決を検証する。Bundle ID・製品識別子は変更しない） |
| PD-V-1 | P5／P6 の検証は、まず Simulator と隔離されたテスト環境で行う。既存 iPhone アプリの上書き・削除は禁止 |
| PD-V-2 | Build 84 の既存データを伴う上書き更新は、バックアップと復元可能性の確認後の**別 Gate**。自動で実機上書きしない |
| PD-G-1 | 残る PENDING／CANDIDATE の用語を一括で整理し、PO が判断できる承認資料を作る（**資料作成の承認であり、未判断用語の CONFIRMED 承認ではない**） |
本承認を P5／P6／P7 の完成承認、U11 の変更完了、Official 109 の発行へ拡大しない。人間の独立レビューは実施されていない。

## 3. 決定

### D038-1 U4（Paywall の翻訳）
1. 対象: 購入画面（`monetization-v1.js`）と Settings のプランカードの表示文言（Evidence 64 の Paywall Translation Proposal の 29 文言を正本とし、最新 source で実対象を再確認）。ja の現行表示は変更しない。
2. 買い切りの説明文は**事実のみ**の案 B: 英語 `A one-time purchase. No subscription.`、中国語 `一次性购买，无需订阅。`（ja は現行の「一度の購入でずっと利用できます」のまま）。**「永久」「for good」等の継続保証の表現は用いない**。広告表現の推測による追加は禁止。
3. 維持するもの: Non-Consumable の買い切り仕様、IAP Product ID、Free／Pro の権限、購入・復元・保留・失敗の処理、StoreKit の `displayPrice`（価格の取得元。文言に価格・通貨を固定しない）、購入キャンセル時の挙動、エラー処理。
4. **層の区別**: アプリ内 Paywall（本 Decision の対象）／StoreKit の決済シート（Apple が表示。変更不可）／App Store Connect の IAP 商品情報（**変更しない。P7 の別 Gate**。Official 108 AC-20）。
5. Apple 要件の確認手順: 実装時と P7 の前に、Apple の一次資料（App Review Guidelines 3.1.1／2.3.1、StoreKit `displayPrice`／`AppStore.sync()`、IAP 概要）を URL・版・確認日付きで再確認して Evidence に記録する（初回確認は Evidence 64）。実際の購入（IAP）は実行しない。

### D038-2 U11（Native の開発言語 fallback）
1. 方針: P6 で `CFBundleDevelopmentRegion` を `en` から `ja` へ揃える。**変更の実施と検証の完了は別**であり、検証が未完了の間は「完了」「PASS」と記録しない。
2. 変更は最小限（候補: `Info.plist`、`Info-ScoreRC.plist`、`project.pbxproj` の `developmentRegion`／`knownRegions`）。Bundle ID、Display Name、Version／Build、アイコン、Team、署名、StoreKit 構成、Product ID は変更しない。公開版 CueScore Apps、Score RC、Score P1 を上書き・再インストールしない。
3. 検証: 変更前後で、ja／en／zh-Hans／未対応言語、自動言語解決、手動選択の優先、Native fallback を比較する。iOS が返す言語リストと、アプリが解決した表示言語を区別して記録する。Simulator の結果を実機 PASS と混同しない。

### D038-3 P5／P6 の検証
Simulator と隔離環境を優先し、実機は別途確認する（Simulator と実機の Evidence を分ける）。既存 iPhone のアプリは上書き・削除しない。**Build 84 の公開済みデータを伴う上書き更新は別 Gate**（先に A 旧 Build の識別、B Bundle ID 一致条件、C 保存構造、D Backup 取得、E 復元可能性、F 上書き前後の同一性、G Rollback、H STOP 条件を調査・計画し、事前 Backup がない状態では実行しない）。Dynamic Type は Decision 033 の Deferred を維持する。

### D038-4 Glossary
残る `PENDING`／`CANDIDATE` を一括整理した承認資料を作る。PO 承認前に新たな `CONFIRMED` を付与しない。一次資料がない部分は NOT VERIFIED を維持。**Official 109 は条件未達のまま発行しない**。

### D038-5 状態を変更しないもの
U4 の購入条件の最終文言は Official 122 の対応表に従う。P5／P6／P7 は未完了。S-B は `false`。

## 4. 本 Decision が変更しないもの
Official 107／108／113〜120、Decision 001〜037、言語解決アルゴリズム、S-A／S-B（`LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false`）、保存データ、`resultLabel` canonical、QR／Backup／CSV 契約、Analytics 数値、IAP Product ID・価格・契約、日本語 UI、Version／Build、Apple 配布状態。本 Decision 自体は Documentation-only。

## 5. 承認・発行
PO の承認（2026-10-17）に基づき 2026-10-17 に Official 発行（Documentation-only）。U4 の実装、U11 の Native 変更、Simulator 検証、Glossary 資料は別 commit・別 Evidence で行う。
