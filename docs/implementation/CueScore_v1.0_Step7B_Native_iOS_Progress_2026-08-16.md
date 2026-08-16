# CueScore v1.0 Step 7B — Native iOS Progress

Date: 2026-08-16  
Status: Native foundation verified / final device gates remain

## Completed

- Capacitor 8.0.2のiPhone専用・縦画面native containerを構築した。
- 完成済みWeb assets、Legal、Supportをアプリbundleへ同梱した。
- native runtimeではService Workerを停止し、bundle assetsから起動する。
- Apple Developer登録、Team、実機、署名を設定した。
- iPhone実機でインストール、オフライン起動、Player写真表示を確認した。
- JSON Backup exportをCapacitor Filesystem／Shareへ接続し、iPhone実機で共有画面とファイル保存の成功を確認した。
- Backup RestoreはSettings Suiteから正式validator／transaction処理を直接呼び出す形へ統一した。
- 保存済みJSONの選択からBackup Restore完了まで、iPhone実機で成功を確認した。
- 機内モードでのcold launchと主要機能の動作をiPhone実機で確認した。
- quota超過、途中失敗、rollback検証失敗、破損JSON、不正形式、重複IDを保存前またはtransaction内で処理する。
- Debug／Release simulator buildが成功した。
- App iconは1024×1024、alphaなしを確認した。
- Release app bundle内にCapacitor／CordovaのPrivacyInfo.xcprivacyが含まれることを確認した。

## Verification

- Automated tests: 146 pass / 0 fail（2026-08-16時点）
- Debug iOS Simulator build: PASS
- Release iOS Simulator build: PASS
- Native Backup export on physical iPhone: PASS
- Native Backup restore on physical iPhone: PASS
- Native offline cold launch and primary flows on physical iPhone: PASS
- Web Backup schema and browser download compatibility: maintained

## Warning assessment

- Release buildにアプリコード由来のcompiler warningはない。
- command-line buildの「複数のSimulator候補」はdestination未指定による検証コマンド上の警告で、提出物の不具合ではない。
- 実機debug中の`UIScene lifecycle will soon be required`は将来SDK向けの移行予告。現行build／実行の阻害要因ではないが、SDK更新時に再監査する。
- iPhone切断時の`debug session ended ... disconnected`はXcodeとのdebug接続終了通知で、端末上のアプリや保存データの故障ではない。

## Remaining device gates

1. 追加／置換Restoreのうち未確認の方式があれば、別データで1回確認する。
2. Player写真の選択取消、HEIC入力、再起動後表示、Backup→Restore後表示を確認する。
3. background／foreground、強制終了、通常updateで保存データが維持されることを確認する。
4. 小型／大型iPhoneでsafe-area、keyboard、modal、Game Resultを確認する。

## Remaining submission gates

- App Store Connect app record、SKU、primary／secondary categoryの最終確認
- App Review連絡先（氏名、メール、電話番号）
- App Privacy回答と実build／Privacy Policyの最終一致確認
- device screenshotsの取得
- Archive validation、TestFlight internal test
- export compliance、content rights、age rating
- Product Ownerの明示承認後にのみTestFlight／提出へ進む

現時点の結論：native foundationとBackup exportはPASS。TestFlightは、Remaining device gatesとsubmission metadata確認後にGO判定する。
