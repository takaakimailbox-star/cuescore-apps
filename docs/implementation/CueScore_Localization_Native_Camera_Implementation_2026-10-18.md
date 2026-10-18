# CueScore Localization Native Camera Implementation

- Date: 2026-10-18
- Baseline: `4f2c0c13f18602963e9618062c1aa717846ce7fb`
- Decision publication: `ab3684009ccd6ac2124ed39749a55315d93e8c3c`
- Native implementation: `53bbcc361b01e23284d0a4086fd498323ccf35e9`
- Decision: 040
- Official: 125 / 126

## Result

Decision 040で許可された範囲だけを実装した。App targetへ`InfoPlist.strings`のlocalized variant groupを1件登録し、ja／en／zh-Hansを本番・Score RCの双方へ同一resourceとして含めた。`NSCameraUsageDescription`以外のpermission key、カメラ／QR処理、保存データ、識別子、署名設定、Version／Build、U11の4設定値は変更していない。

## Permission text

- ja: `プレーヤーのプロフィール写真の撮影と、試合共有QRコードの読み取りにカメラを使用します。`
- en: `The camera is used to take player profile photos and scan match-sharing QR codes.`
- zh-Hans: `相机用于拍摄球员个人资料照片和扫描比赛分享二维码。`

## Changed native files

- `ios/App/App/ja.lproj/InfoPlist.strings`
- `ios/App/App/en.lproj/InfoPlist.strings`
- `ios/App/App/zh-Hans.lproj/InfoPlist.strings`
- `ios/App/App.xcodeproj/project.pbxproj`

## Automated verification

- Full Node: 1,145 passed / 0 failed / 0 skipped.
- Camera localization focused tests: exact strings、1 key per file、variant group/resource inclusion、U11/identity/version/signing invariants、camera/QR/data-source byte preservationをPASS。
- Release Simulator Build: Production / Score RCともにPASS（`CODE_SIGNING_ALLOWED=NO`、Apple側操作なし）。両Build productへja／en／zh-Hansの`InfoPlist.strings`が含まれ、内容一致。
- Build Settings: Product Bundle ID、RC Bundle ID、Development Team、Code Sign Style、Version 1.2、Build 84、Info.plist選択は変更前後一致。
- Data / QR: P2/P3/P4 regression、Data/QR golden、Match Sharing、Backup/Data、Free/Pro、PWA/Native parityを含むFull NodeでPASS。
- `git diff --check`: PASS。

## Isolated Simulator UI verification

- Device: newly created isolated `CueScore-Camera-P6-20261018` / iPhone 16e / iOS 26.5 (`92FD1737-173A-408C-9DF5-180C189AC364`)。既存Simulatorは変更していない。
- OS Japanese: exact Japanese purpose text PASS.
- OS English: exact English purpose text PASS.
- OS Simplified Chinese: exact Simplified Chinese purpose text PASS.
- Unsupported OS language (French): Japanese purpose-text fallback PASS.
- App launch languageだけをEnglishへ変更しOSをJapaneseのままにしたprobeでは、OS permission dialogはJapaneseのまま。OS言語とアプリ手動言語の分離を確認。
- 各検証はpermission stateをresetし、署名なしの隔離Simulator Buildと一時UI probeだけを使用。検証用SimulatorはJapaneseへ戻してShutdownした。

## Protected boundaries

- U11 values unchanged: `CFBundleDevelopmentRegion=ja`、`CFBundleLocalizations=[ja,en,zh-Hans]`、`developmentRegion=ja`、`knownRegions=[ja,en,zh-Hans,Base]`。
- Production Bundle ID `com.takaakimailboxstar.cuescoreapps`、Score RC Bundle ID `com.takaakimailboxstar.cuescoreapps.rc12`、Team `U26DF88PRW`、Automatic setting、Version `1.2`、Build `84`は不変。
- Camera/QR implementation、Match/Snapshot schema、QR/Backup format、Free/Pro、IAP Product ID、S-B=falseは不変。
- iPhoneのCueScore Apps／Score RC／Score P1／LRES10Diag／p6isoへBuild・install・削除・データ操作を行っていない。
- Apple Developer、App Store Connect、TestFlight、Release操作なし。

## NOT VERIFIED / next gate

- Physical iPhoneのja／en／zh-Hans permission dialogはNOT VERIFIED。
- Build 84からの実機上書き更新はBLOCKED継続。
- App Store表示言語、P7、Glossary 27語は本Gateの対象外。
- 次Gateは司令塔レビュー後の実機Camera permission確認。自動移行しない。
