# Version 1.4 / Build 96 内部 TestFlight 配布記録（2026-10-31）

- 対象: 製品 commit `d0993552989348bb5940e14051dbfa0d6fed7725`（main `0596306…` 時点で配布）。Archive `…/2026-10-31/cuescore-build96/archive/CueScore_1.4_96_xcode271.xcarchive`（Xcode 27.1／27A9275、iphoneos27.1）。
- Archive 照合: Version 1.4／Build 96、Bundle ID `com.takaakimailboxstar.cuescoreapps`、Team U26DF88PRW、codesign 検証 OK、ツリー sha256 が作成時記録と一致、Archive 内 public は native-web と一致、廃止済み暫定カタログなし。SUPERSEDED 旧 Archive は使用せず。Build 95 の Archive は不変。
- 事前確認: ASC で Build 96 は 0 件（最新 95 VALID）。ITSAppUsesNonExemptEncryption=false で Build 95 と同一（暗号化の変更なし）。ExportOptions は Build 95 と同一（app-store-connect／upload／自動署名／Apple Distribution）。
- Upload: **1 回のみ**、Upload succeeded（90534 なし）。
- ASC read-back（読取専用 GET）: Build 96 VALID（Build ID `d1af66ed-4bdd-4c8d-900e-67449c685a7d`）、usesNonExemptEncryption=false、minOs 15.0、expired=false、internalBuildState `IN_BETA_TESTING`、externalBuildState `READY_FOR_BETA_SUBMISSION`（外部は未使用）、ベータグループは「CueScore Internal Testers」（内部・全ビルドアクセス）のみ。外部グループなし。appStoreVersion 関連なし（App Review 提出なし）。
- 一時的な ASC API 接続タイムアウトが読取中に発生（GET のみ、再試行で成功）。Upload とは無関係。
- 不変: 製品コード、翻訳（P4-APPROVED＝PO承認、独立した人間レビューは未実施、P4-REVIEWED ではない）、schema、Official／Decision（候補のまま）。外部 TestFlight、App Review、一般公開は未実施。
- 次: PO 実機評価（キーボード表示中の外側タップ、慣性スクロール、VoiceOver 実音声、Dynamic Type）。実機は NOT VERIFIED。
