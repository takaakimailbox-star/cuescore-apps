# CueScore Version 1.4 / Build 94 内部TestFlight配布記録（2026年10月30日）

状態: Build 94 を内部TestFlightへ1回Uploadし、VALID／IN_BETA_TESTING を確認した。外部TestFlight・App Review提出・一般公開は行っていない。公開版 1.3／Build 88 は不変。

## 1. 基準と採番
- 基準 main b888c6d → 採番commit e745bcd（Version 1.4／Build 94、キャッシュ版 `2.0-build94-sc21-v1`）。他Writerなし、dirty 0。
- ASC で Build 94 が未使用であることを確認（最新は 93）後に採番。重複なし。
- 採番に伴う固定値（ビルド番号・キャッシュ版・index.html／sw.js／project.pbxproj のsha256）のみ17テストファイルで更新。変更マップ `tests/fixtures/p2/version-build94-test-change-map.json`。

## 2. 検証（区別して記録）
- Node 全回帰: 1225／1225 PASS。
- 実Chrome（Browser）: 開始ボタン 48×3言語 PASS、言語切替の時計 5/5 PASS、既存操作回帰（ja、Free／Pro）PASS。既存の統合141×3言語・レイアウト128×2言語は変更なし（コード不変）のため再利用。
- Native Simulator（iPhone 17、実タッチ）: 9-Ball 設定で時計ONでも「試合開始」が見える／P1比較スイッチなし／開始→ブレイク入力→試合画面→時計 開始・延長（+60）・一時停止・再開・リセット（45へ）が動作。Simulator 内の保存済みプレーヤー4名を保持。
- 実機: 未実施（PO確認待ち）。

## 3. Archive／署名
- Release Archive: 生成済み。Bundle ID com.takaakimailboxstar.cuescoreapps、Version 1.4、Build 94、Team U26DF88PRW、Apple Distribution 署名。
- Archive 内 Info.plist: ITSAppUsesNonExemptEncryption=false。P1ファイル（ui-pilot*, i18n-catalog-uipilot, i18n-catalog-shotclock）なし。index.html は main と同一。
- Upload は `xcodebuild -exportArchive`（destination upload）で1回のみ。

## 4. Export Compliance
- ASC は Build 94 の usesNonExemptEncryption=false を自動認識した。追加の PATCH は実行していない（条件付き承認は未使用）。

## 5. TestFlight read-back
- Build ID 2c887b72-3f12-4bf5-9ac1-da8f7a9245a1／Build 94／processingState VALID／internalBuildState IN_BETA_TESTING／externalBuildState READY_FOR_BETA_SUBMISSION（外部配布は未実施）。
- 内部グループ「CueScore Internal Testers」（全Build自動アクセス）のBuild一覧に 94 を確認。テスター1名 INSTALLED。

## 5b. 既知の制約
- 旧形式の時計識別子で保存された中断中の時計は、更新後の最初の再開で待機に戻る場合がある（得点・履歴・保存データは不変）。

## 6. 残存 NOT VERIFIED
実機 VoiceOver／Dynamic Type／実機での 1.3→1.4 App Store 更新、人間の独立翻訳レビュー、zh-Hans 競技一次資料、Native 英語・中国語の新文言画面。

## 7. Evidence
/Users/Ludique/Documents/Codex/2026-10-30/cuescore-build94/（data/: ログ・ASC read-back、archive/、export/）。
