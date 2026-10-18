# 126 — CueScore Localization Native Camera Permission Spec（Decision 040 付随 Spec）

**状態: Adopted / Official。** Official 125 の付随 Spec。Official 107／108／121〜124 は履歴として保持し、改変しない。

## 1. 適用要件

- Official 108 L-NAT-1: Native設定を ja／en／zh-Hans に対応させる。
- Official 108 L-NAT-2: `NSCameraUsageDescription` を3言語で用意する。
- Official 108 AC-14: Native設定と権限文言の3言語対応を確認する。
- Official 123／124: U11の4設定値と日本語fallbackを維持する。
- Official 124 U11-R4: Decision 040より前のU11訂正Gateでは `lproj`／`InfoPlist.strings` を追加しない規則だった。本Specは、カメラ許可文言の3言語化だけを後続の限定例外として定義する。

## 2. 資産と値

| 資産 | キー | 値 |
|---|---|---|
| `ios/App/App/ja.lproj/InfoPlist.strings` | `NSCameraUsageDescription` | プレーヤーのプロフィール写真の撮影と、試合共有QRコードの読み取りにカメラを使用します。 |
| `ios/App/App/en.lproj/InfoPlist.strings` | `NSCameraUsageDescription` | The camera is used to take player profile photos and scan match-sharing QR codes. |
| `ios/App/App/zh-Hans.lproj/InfoPlist.strings` | `NSCameraUsageDescription` | 相机用于拍摄球员个人资料照片和扫描比赛分享二维码。 |

`Info.plist` と `Info-ScoreRC.plist` の `NSCameraUsageDescription` は既存日本語文言をそのまま保持し、Base／fallbackの意味を一致させる。3ファイルは UTF-8 の strings 構文とする。

## 3. Resource登録

- Xcode projectに `InfoPlist.strings` の localized variant groupを登録する。
- App targetの Copy Bundle Resources に1つのlocalized resourceとして登録し、本番と `ScoreRC.xcconfig` を使用するRC構成の両方へ収録する。
- build productで `ja.lproj`、`en.lproj`、`zh-Hans.lproj` の各 `InfoPlist.strings` を確認する。

## 4. 言語解決とfallback

| OS解決言語 | 期待するpermission文言 |
|---|---|
| ja | ja |
| en | en |
| zh-Hans | zh-Hans |
| 未対応言語 | ja |

開発言語は `ja`、宣言言語は ja／en／zh-Hans のまま。アプリ内の手動言語設定はWeb層に閉じ、OS permission文言の選択には使用しない。

## 5. 不変条件

- U11の4値: `CFBundleDevelopmentRegion=ja`、`CFBundleLocalizations=[ja,en,zh-Hans]`、`developmentRegion=ja`、`knownRegions=(ja,en,zh-Hans,Base)`。
- 本番／RC／testの Bundle ID、Product ID、Team、署名方式、Version／Build、Display Name、アイコン。
- カメラ／QRの処理、QR形式、Match／Snapshot schema、Backup形式、保存データ、Free／Pro、IAP、S-B。

## 6. 受入条件

- AC-NCAM-1: Official 125／126とDecision Log v2.16が発行され、Decision 001〜039とOfficial 107／108／121〜124が保持される。
- AC-NCAM-2: 3つの `InfoPlist.strings` が §2 と完全一致し、日本語は既存plistの文言と完全一致する。
- AC-NCAM-3: 本番／RCのbuild productに3言語resourceが含まれる。
- AC-NCAM-4: 未対応言語のfallbackがjaであり、U11の4値が変更されない。
- AC-NCAM-5: Bundle ID等の識別子、署名方式、Version／Buildが変更前後で一致する。
- AC-NCAM-6: カメラ／QR、Native parity、Data／QR golden、Full Node、P2／P3／P4回帰がPASSする。既存テストを削除・skip・弱体化しない。
- AC-NCAM-7: Simulatorのresource確認と実際のpermissionダイアログ目視を分け、実機未確認をPASSにしない。
- AC-NCAM-8: 実機Build/install、Build 84上書き、Apple Developer／ASC／TestFlight／Releaseを行わない。

## 7. NOT VERIFIED

実機における3言語のOSカメラ許可ダイアログ、Build 84上書き更新、App Storeの対応言語表示は本Gateでは確認しない。権限状態またはSimulator制限により実ダイアログを目視できない言語は、その言語のresource収録がPASSでも表示結果は NOT VERIFIED とする。
