# Version 1.4 / Build 95 内部 TestFlight 配布記録（Xcode 27.1 経由）2026-10-30

- 経緯: Xcode 27.2（27B52）で作成した Archive は Upload が error 90534（Unsupported SDK or Xcode version）で拒否された。原因は Apple 側の受付未対応が最有力（確度は中、未確定）。Build 94 で成功実績のある Xcode 27.1（27A9275）を別環境として導入し、同一ソースで再 Archive した。
- Xcode 27.1: Apple 公式配布元（download.developer.apple.com/Developer_Tools/Xcode_27.1/Xcode_27.1.xip、PO が取得）。xip は Apple 署名（pkgutil: signed Apple Software）、sha256 038ad29c…d660。`/Users/Ludique/Documents/Codex/2026-10-30/xcode271/Xcode_27.1.app` に別名展開（codesign 検証 OK、spctl accepted）。/Applications/Xcode.app（27.2 / 27B52）は未変更、グローバル xcode-select も未変更。ビルドは DEVELOPER_DIR 指定のみ。
- 再 Archive: main の製品コードは f6e7f8d から不変（以降は資料のみ）。1.4 / Build 95、別名 `CueScore_1.4_95_xcode271.xcarchive`、独立 DerivedData。DTXcode 2710 / DTXcodeBuild 27A9275 / DTSDKName iphoneos27.1 (24A94232)、Bundle ID 一致、Team U26DF88PRW、署名検証 OK、ITSAppUsesNonExemptEncryption=false、public/ は旧 27B52 Archive と完全同一、新 3 ファイル同梱、P1 試験ファイルなし。
- Upload: 事前に ASC で Build 95 未登録（0 件）を確認し、1 回のみ実行 → Upload succeeded（90534 なし）。
- ASC read-back: Build 95 VALID（id b0803c67-0a28-4879-bdcc-61506f3d26d1）、usesNonExemptEncryption=false、minOs 15.0、internalBuildState IN_BETA_TESTING、externalBuildState READY_FOR_BETA_SUBMISSION（外部は未使用）、内部グループ「CueScore Internal Testers」（全ビルドアクセス）。
- 不変: 製品機能・翻訳・schema は変更なし。旧 27B52 Archive は保護。Build 94 / 公開 1.3(88) は保護。外部 TestFlight・App Review・一般公開は未実施。
- 試験実装のまま。新レイアウトの正式採用は PO の実機評価後。翻訳案A は未反映（P3-PROVISIONAL）。Decision 049 / Official 140・141 は候補。
