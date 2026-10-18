# 125 — CueScore Localization Native Camera Permission Decision（Decision 040）

**状態: Adopted / Official。** 2026年10月18日発行（Decision 040、Official Design Decision Log v2.16）。Product Owner の明示承認（2026-10-18）に基づく。
**Scope:** iOS の `NSCameraUsageDescription` の ja／en／zh-Hans ローカライズだけ。WebView 内の表示言語、カメラ／QR の処理、保存データ、Free／Pro、U11 の4設定値には一般化しない。

## 1. 番号（fresh 確認、GitHub main `4f2c0c13f18602963e9618062c1aa717846ce7fb`）

- Decision Log は v2.15（Decision 001〜039）。本書 = **Decision 040**（未使用を確認）、Decision Log = **v2.16**（001〜039 は改変しない）。
- Official 文書の最大番号は 124。本書 = **Official 125**（Decision）、付随の Spec = **Official 126**（`126_CueScore_Localization_Native_Camera_Spec.md`）。**109 は Glossary 用に予約済みで使用しない。**
- Official 107／108／121〜124 は履歴として保持し、改変しない。

## 2. Product Owner 承認（2026-10-18、明示）

| ID | 承認内容 |
|---|---|
| PD-NCAM-1 | 日本語OSでは日本語、英語OSでは英語、簡体字中国語OSでは簡体字中国語のカメラ許可説明を表示する |
| PD-NCAM-2 | 未対応OS言語の fallback は日本語とする |
| PD-NCAM-3 | OSの許可説明と言語解決は、アプリ内の手動言語設定から独立させる |
| PD-NCAM-4 | 既存の日本語説明文、カメラ／QR機能、保存データ、U11の4設定値を変更しない |
| PD-NCAM-5 | Simulator と実機の Evidence を分離し、実表示前に PASS と断定しない |

## 3. 決定

### D040-1 対象

対象は `NSCameraUsageDescription` のみ。`ios/App/App/ja.lproj/InfoPlist.strings`、`en.lproj/InfoPlist.strings`、`zh-Hans.lproj/InfoPlist.strings` と、その Xcode resource 登録を追加する。本番構成と Score RC 構成の双方が同一の3言語資産を収録する。

### D040-2 正式文言

| 言語 | 文言 |
|---|---|
| ja | プレーヤーのプロフィール写真の撮影と、試合共有QRコードの読み取りにカメラを使用します。 |
| en | The camera is used to take player profile photos and scan match-sharing QR codes. |
| zh-Hans | 相机用于拍摄球员个人资料照片和扫描比赛分享二维码。 |

日本語は `Info.plist`／`Info-ScoreRC.plist` の既存説明文と完全一致させ、Base 文言としても維持する。目的外の用途や誇張表現は追加しない。

### D040-3 言語解決

iOS がOS優先言語とBundle資産から許可説明を解決する。日本語OS→ja、英語OS→en、簡体字中国語OS→zh-Hans、未対応OS言語→開発言語ja。WebViewの手動言語設定はこの解決に使わず、両者が異なる場合もOS許可説明はOS側の解決に従う。

### D040-4 Decision 039／Official 124 との適用関係

Decision 039 D039-1 の4設定値（`CFBundleDevelopmentRegion`、`CFBundleLocalizations`、`developmentRegion`、`knownRegions`）は変更しない。D039-2 と Official 124 U11-R4 の `lproj`／`InfoPlist.strings` 追加禁止は、本 Decision の発行以後、**`NSCameraUsageDescription` の3言語資産とそのresource登録に限って**本 Decision が後続の限定例外として優先する。その他の `lproj`、権限文言、Native設定には拡張しない。

Official 123に記録された過去の Official 整合性 FAIL、訂正経緯、実機 NOT VERIFIED は削除・上書きしない。これはU11の再判定ではなく、Official 108 L-NAT-1／L-NAT-2／AC-14を満たすための独立Decisionである。

### D040-5 不変条件

Bundle ID、Product ID、Team、署名、Version／Build、Display Name、アイコン、StoreKit、Entitlements、カメラ処理、QR処理、Match／Snapshot schema、Backup形式、Free／Pro契約、S-B（`false`）を変更しない。Apple Developer、App Store Connect、TestFlightへの操作も行わない。

### D040-6 Evidence境界

文字列資産とbuild収録の自動確認、Simulatorでの表示確認、実機での表示確認を別々に記録する。Simulatorで確認できた内容を実機 PASS とせず、権限ダイアログを再表示できない場合は NOT VERIFIED とする。

## 4. 承認・発行

PO の承認（2026-10-18）に基づき 2026-10-18 に Official 発行する。発行commitはDocumentation-onlyとし、Native実装はread-back PASS後の独立commitで行う。Glossary 27語、Official 109、Build 84上書き更新、実機Build/install、P7は本 Decision の対象外である。
