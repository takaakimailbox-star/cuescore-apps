# 123 — CueScore Localization U11 Correction Decision（Decision 039）

**状態: Adopted / Official。** 2026年10月17日発行（Decision 039、Official Design Decision Log v2.15）。Product Owner の承認（2026-10-17、明示。P6 Preflight Safety Report〔Evidence 73〕の案 P）に基づく。
**Scope:** Official 121（Decision 038）D038-2 と Official 122 U11-R1／R2／AC-U11-1 の**許可範囲の訂正**のみ。他の事項へ一般化しない。

## 1. 番号（fresh 確認、GitHub main `bee014a6b91ae5b64c367a4cfba33cbc652a49bd`）
- Decision Log は v2.14（Decision 001〜038）。本書 = **Decision 039**（未使用を確認）、Decision Log = **v2.15**（001〜038 は改変しない）。
- Official 文書の最大番号は 122。本書 = **Official 123**（Decision）、付随の Spec = **Official 124**（`124_CueScore_Localization_U11_Correction_Spec.md`）。**109 は Glossary 用に予約済みで使用しない。**
- **Official 121／122 は履歴として保持し、改変しない。** 本書が U11 の許可範囲について 121／122 を**訂正（上書き優先）**する。

## 2. 訂正の経緯（記録・削除しない）
1. Decision 038（Official 121／122）は U11 を「開発言語の fallback のみ」とし、Native 設定の差分を開発言語キーに限定した（U11-R1／R2、AC-U11-1）。
2. P6 前の実装（commit d3874f5、2026-10-17）は `CFBundleDevelopmentRegion` を `ja` にするだけでは en／zh 端末の OS 解決言語まで ja になる退行が隔離 Simulator の probe で判明したため、`CFBundleLocalizations`（ja, en, zh-Hans）を併記した。これは U11-R1／R2 の許可リストにない追加だった。
3. 実装報告は当初 U11 を「PASS」としたが、U11-R2 の `xcodebuild -showBuildSettings` 前後比較を実施しておらず、許可範囲の逸脱を認識していなかった。P6 Preflight（Evidence 73）で逸脱を検出し、**U11 の Official 整合性を FAIL（逸脱）と記録した。この FAIL 記録は削除せず、本 Decision で許可範囲を訂正して解消する。**
4. Product Owner は 2026-10-17 に訂正案 P（`CFBundleLocalizations`〔ja, en, zh-Hans〕を U11 の正式な許可範囲に含める。既存の 3 言語解決動作を維持する）を承認した。

## 3. Product Owner 承認（2026-10-17、明示）
| ID | 承認内容 |
|---|---|
| PD-U11C-1 | `CFBundleLocalizations`（ja, en, zh-Hans）を U11 の正式な許可範囲に含める（案 P）。既存の 3 言語解決動作を維持する |
| PD-U11C-2 | Free データの保全は Mac の暗号化フルバックアップを基本方針とする（端末全体のバックアップであり、単一アプリの復元保証ではない） |
| PD-U11C-3 | 実機テストは既存アプリと異なる Bundle ID の隔離テストアプリを優先する |
| PD-U11C-4 | Build 84 の既存データを伴う上書き更新は引き続き別 Gate。**本承認は既存アプリの上書き許可ではない** |
| PD-G-2 | Glossary G1〜G3 の推奨案を採用候補として進める（**自動 CONFIRMED ではない**。最終承認は PO） |

## 4. 決定
### D039-1 U11 の許可する Native 設定（訂正）
次の 4 つに限り、ja／en／zh-Hans の言語 fallback に必要な変更だけを許可する。
- `CFBundleDevelopmentRegion`（`ja`）
- `CFBundleLocalizations`（`ja`, `en`, `zh-Hans`）
- `developmentRegion`（`ja`）
- `knownRegions`（`ja`, `en`, `zh-Hans`, `Base`）
対象ファイル: `ios/App/App/Info.plist`、`ios/App/App/Info-ScoreRC.plist`、`ios/App/App.xcodeproj/project.pbxproj`。`Info.plist` と `Info-ScoreRC.plist` の差分は、上記キーの追加・変更に限る。
### D039-2 変更を禁止するもの
Bundle ID（本番・RC・テスト用）、Product ID、署名、Team、アイコン、Display Name、Version／Build、StoreKit 構成、Entitlements、`lproj`／`InfoPlist.strings` の追加（カメラ権限の説明文の翻訳は未承認）。
### D039-3 言語解決の維持（検証済みの動作）
OS が決める Native 解決言語: ja→ja、en→en、zh-Hans→zh-Hans、未対応言語→ja。iOS 優先言語リストと JS のアプリ解決言語は変更しない。Simulator の結果を実機 PASS と記録しない（実機は NOT VERIFIED）。
### D039-4 副作用の記録
`CFBundleLocalizations` は App Store の対応言語表示に反映され得る。確認は P7（別 Gate）。OS 表示（権限ダイアログ等）は端末言語に従う。
### D039-5 Free データ保全
Mac の暗号化フルバックアップを基本方針とする。CueScore 単独の復元は保証されない。アプリ内 Backup（Pro）を Free へ開放しない。Build 84 の上書き更新は引き続き BLOCKED（別 Gate）。
### D039-6 状態を変更しないもの
Official 121／122 の本文、U4、P5／P6／P7 の未完了状態、Official 109（未発行）、S-B（`false`）、Free／Pro 契約、保存データ。

## 5. 承認・発行
PO の承認（2026-10-17）に基づき 2026-10-17 に Official 発行（Documentation-only）。Native 設定・product source・catalog は本 Decision で変更しない（既存実装 d3874f5 の差分と本 Decision の一致を Spec で検証する）。
