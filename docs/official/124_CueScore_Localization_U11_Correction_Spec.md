# 124 — CueScore Localization U11 Correction Spec（Decision 039 付随 Spec）

**状態: Adopted / Official。** Official 123 の付随 Spec。Official 121／122 は履歴として保持（改変しない）。

## 1. 規則（Official 122 U11-R1／R2／AC-U11-1 の訂正）
- U11-R1′: 対象は ja／en／zh-Hans の言語 fallback に必要な Native 設定に限る（`CFBundleDevelopmentRegion`、`CFBundleLocalizations`、`developmentRegion`、`knownRegions`）。Bundle ID、Product ID、署名、Team、アイコン、Display Name、Version／Build、StoreKit、Entitlements は不変。
- U11-R2′: `Info.plist` と `Info-ScoreRC.plist` の差分は R1′ のキーに限る。変更前後の `xcodebuild -showBuildSettings`（本番 Debug／Release、RC）で識別子の不変を確認する。
- U11-R3′: Simulator の結果を「実機 PASS」と記録しない。
- U11-R4: `lproj`／`InfoPlist.strings` を追加しない。

## 2. 値（実装 d3874f5 との一致）
| ファイル | キー | 値 |
|---|---|---|
| Info.plist／Info-ScoreRC.plist | CFBundleDevelopmentRegion | ja |
| Info.plist／Info-ScoreRC.plist | CFBundleLocalizations | [ja, en, zh-Hans] |
| project.pbxproj | developmentRegion | ja |
| project.pbxproj | knownRegions | (ja, en, "zh-Hans", Base) |

## 3. 期待される言語解決（隔離 Simulator probe、Evidence 67／73／74）
OS 解決言語: ja→ja、en→en、zh-Hans→zh-Hans、未対応（fr、de）→ja。変更前は常に en。

## 4. 受入条件
- AC-U11C-1: Native 設定の差分（fed8763→現在）が D039-1 の 4 キーと対象 3 ファイルに限られ、値が §2 と一致する。
- AC-U11C-2: `-showBuildSettings`（本番・RC）の前後で識別子が不変（Evidence に前後ファイル）。
- AC-U11C-3: 変更前後の言語解決の比較が Evidence にあり、実機は NOT VERIFIED と記録。
- AC-U11C-4: Official 121／122 が改変されていない（content hash）。
- AC-U11C-5: 過去の FAIL 記録（Evidence 73、Official 123 §2）が残っている。
- AC-U11C-6: `lproj`／strings が追加されていない。
