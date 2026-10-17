# 119 — CueScore Localization P4 PO Approval Decision（Decision 037）

**状態: Adopted / Official。** 2026年10月17日発行（Decision 037、Official Design Decision Log v2.13）。Product Owner の承認（2026-10-17、明示。「P4 PO Final Decision Package」の推奨案の一括承認）に基づく。
**Scope:** (1) P4 の翻訳 1,331 キーの承認範囲と記録方法、(2) 競技用語の承認記録、(3) U3（法務導線の注記）、U8（Backup Share Sheet の表示文言）、Main バッジの 3 件の方針。**U4・U11 は解決しない。**

## 1. 番号（fresh 確認、GitHub main `54a921d5980ff091e8b9242e45b8598a821c3644`）
- Decision Log は v2.12（Decision 001〜036）。本書 = **Decision 037**、Decision Log = **v2.13**（001〜036 は改変しない）。
- Official 文書: 発行前の最大番号は 118。**109 は Glossary 用に予約済みで、本書でも使用しない**。本書 = **Official 119**（Decision）、付随の Spec = **Official 120**（`120_CueScore_Localization_P4_PO_Approval_Spec.md`）。
- Official 107／108／113〜118 は改変しない。Glossary（Official 109）の発行条件は §4。

## 2. Product Owner 承認（2026-10-17、明示）
| ID | 承認内容 |
|---|---|
| PD-P4A-A | `P4-AI-VERIFIED` 1,322 キーを、**残余リスク（R0／R1／R2）付き**で一括採用する |
| PD-P4A-B | R3 の 9 キー（持ち点 5、JPA デッド 3、14-1 初回ブレイクファール 1）を**推奨訳**へ修正する |
| PD-P4A-C | 競技用語は原則維持し、指定 2 項目（3 Fouls、Foul (break changes)）を明確化する。表記ゆれのみ最小限に統一する |
| PD-P4A-D | **U3**: 法務ページが未翻訳である旨の注記を追加する |
| PD-P4A-E | **U8**: Backup Share Sheet の**表示文言のみ**を翻訳する |
| PD-P4A-F | **Main バッジ**: バッジを維持し、長い Player 名だけを省略する |
| PD-P4A-G | **U4**: Apple 要件を調査してから最終判断する（購入条件の翻訳は未承認） |
| PD-P4A-H | **U11**: P6 で検証してから最終判断する（Native 設定変更は未承認） |
本承認を U4／U11 の最終承認、または P5／P6／P7 の完成承認へ拡大しない。人間の独立レビューは実施されていない。

## 3. 決定

### D037-1 P4 翻訳の承認範囲
1. `P4-APPROVED` の対象は、承認日（2026-10-17）時点で PO が承認した**キーと訳文**である。承認記録は各キーに日付・範囲・残余リスク等級・訳文のハッシュを対応付け、**承認後に訳文が変わったキーは承認が無効**になる（再承認が必要）。
2. `P4-AI-VERIFIED` 1,322 キーは、残余リスク（R0／R1／R2）を承認したうえで `P4-APPROVED`。R2 の残余リスクの記録は削除しない。
3. R3 の 9 キーは、PD-P4A-B の訳へ修正し、**修正内容が承認範囲と一致することを検証した後**に `P4-APPROVED` とする。一致しない・根拠不足のキーは未承認に戻す。
4. `P4-REVIEWED`（指名された人間レビュアーの確認）は付与しない。人間の独立レビューは未実施であり、誤訳の可能性が残る。
5. U3 の注記（1 キー）と U8 の表示文言（3 キー）は、PO 承認（PD-P4A-D／E）に基づく新規キーで、Official 120 に記載の文言を承認対象とする（残余リスク R2）。PO が承認していない追加の翻訳変更は行わない。承認後の誤訳指摘は Official 117 D036-7 の手順で扱う。

### D037-2 用語（L-GLOS-5）
PO 承認記録（Official 117 D036-4 の (ii)）により、次の用語を **CONFIRMED（PO 承認記録、残余リスクあり）** とする: マス割／Break and run、Rack、High Run、先攻・後攻（First／Second）、Push Out、Inning、3 consecutive fouls、Foul (break passes to opponent)、Dead（JPA デッド）、Target points（持ち点）、Opening break foul（14-1 初回ブレイクファール）。一次資料の確認状況（WPA は英語の一部のみ。中国語・JPA は未取得）は Evidence に記録済みで、根拠不足は **NOT VERIFIED のまま**残す。上記以外の用語（Break、Foul、Scratch、Safety、Spot、Ball in hand、マッチポイント等）は PENDING のまま。**Official 109（Glossary）は発行しない**。

### D037-3 U3 法務導線の注記
英語・中国語の UI でのみ、法務導線（Settings の利用規約・プライバシーポリシー、法務表示画面）に「法務ページ本文は日本語である」旨の注記を表示する。日本語 UI の表示は変更しない。法務ページ本体の翻訳・改変、リンク先・戻る動作、法的効力・同意方式は変更しない。

### D037-4 U8 Backup Share Sheet
共有シートへ渡す `title`／`text`／`dialogTitle` の**表示文言のみ**を ja／en／zh-Hans で切り替える。Backup の schema・key・JSON payload・ファイル名規則・保存先・復元処理・QR 共有契約は変更しない。ja の文言は現行と完全一致。

### D037-5 Main バッジ
バッジ（`Main`／`メイン` 等）を維持し、長い Player 名だけを省略（…）して、バッジが画面外へ出ないようにする。バッジのサイズ・色・位置、Physical Accepted の Player UI、Design System は変更しない。通常の名前のレイアウトは不変。

### D037-6 状態を変更しないもの
**U4（Paywall の法的／Apple 要件）と U11（`CFBundleDevelopmentRegion`）は DECISION PENDING のまま**。U4 は Apple 要件の調査後に最終判断し、購入条件の翻訳は未承認のまま日本語を維持。U11 は P6 の検証後に判断し、Native 設定を変更しない。

## 4. Official 109（Glossary）の発行条件
Official 108 §P4（移行条件「用語集確定、PO 承認」）と L-GLOS-4 により、Glossary の発行は、用語集の `PENDING`／`CANDIDATE` が解消された時点で行う。現時点は D037-2 の 11 用語のみ CONFIRMED で、残りの用語が PENDING のため**未発行**。docs/proposals の Glossary Draft は Draft のまま。

## 5. 本 Decision が変更しないもの
Official 107／108／113〜118、Decision 001〜036、言語解決アルゴリズム、S-A／S-B（`LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false`）、言語キー、保存データ（Match／Snapshot schema、Player ID、`registeredPlayerId`、`sharedMatchId`）、`resultLabel` の日本語 canonical、QR／Backup／CSV 契約、Analytics 数値、IAP Product ID、Free／Pro 契約、日本語 UI、Version／Build、Apple 配布状態。

## 6. 承認・発行
PO の承認（2026-10-17）に基づき 2026-10-17 に Official 発行（Documentation-only）。実装（翻訳修正、U3／U8、Main バッジ）と承認記録の反映は、別 commit で行う。
