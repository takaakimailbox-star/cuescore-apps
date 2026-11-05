# CueScore Android 実装報告（Cloud / 2026-11-05）

## 1. 結論
**Android版は「実装済み・未ビルド・未実機検証」。製品完成ではない。**
Cloud 環境のネットワーク方針が `dl.google.com`（Android SDK／Google Maven）を拒否するため、AGP・AndroidX・Play Billing・CameraX が取得できず、**Gradle ビルド／APK／AAB／Emulator／Instrumentation は全て BLOCKED（環境起因）**。製品 FAIL ではない。SDK なしで可能な範囲（プロジェクト基盤・ネイティブAdapter・JS側・JVM単体テスト・契約テスト・Play準備文書）は完了。

## 2. 基準
- main HEAD: fd5f0cd48bf994bc2f2bc8668383eac73beb38f8（fresh clone で確認、参考SHAと一致）
- 作業ブランチ: feature/cuescore-android-v1（main へは未 merge／未 push）
- Build 99 保全 e755612 との差分は **バージョン表記（1.4/99、cache identity、byte-pin テスト更新）のみ**だったため、そのコミットのみ cherry-pick（ios pbxproj の CURRENT_PROJECT_VERSION 96→99 を含む。公開済み Build 99 と一致させる変更）。

## 3. 実装済み（コード上）
| 領域 | 内容 |
|---|---|
| 基盤 | Capacitor 8.0.2 Android、applicationId 維持、versionName 1.4／versionCode 99、minSdk 26(暫定)、compile/targetSdk 36、AGP 8.13.0／Gradle 8.14.3(Capacitor 8 標準) |
| 共有Web再利用 | 既存 build-native-web を無改変で実行し、`scripts/build-android-web.mjs` が Android 専用 `android-native-v1.js` を native-web にのみ注入（iOS/PWA の index.html は不変） |
| システム | Predictive Back 対応（既存の各画面 Back ボタンへ委譲、ルートでは最小化）、resizeableActivity、configChanges（回転・分割で再生成しない）、locales_config（ja/en/zh-Hans）、Adaptive Icon（既存アイコン由来）、スプラッシュ、allowBackup=false |
| QR | `CueScoreQRScanner` Adapter（CameraX＋ZXing）。iOS と同一 JS 契約：authorizationStatus／requestPermission／startScan／stopScan／openSettings、scanResult／scannerError／scannerLifecycle。拒否後は再プロンプト可なら `notDetermined`、恒久拒否は `denied`（設定誘導）。background で停止、復帰で再開、Activity destroy で解放。Match Sharing の payload／検証は不変 |
| 課金 | `CueScoreStoreKit` Adapter（Play Billing 8.0.0 買い切り INAPP）。monetization-v1.js は **無改変**。商品取得／購入／再照会(restore)／acknowledge／pending／cancelled／失敗／返金(再照会で権利消滅)／未確認は Fail Closed。権利は端末に保存せず毎回 Play に再照会 |
| バックアップ | 既存 JSON（cuescore-apps-backup, schemaVersion 2）は無改変。書出しは Filesystem(CACHE)+Share（FileProvider/共有シート）、復元は WebView の標準ファイル選択（SAF）。**実機往復は未確認** |

## 4. iOS互換性と差分
- iOS ソース変更: pbxproj の Build 99 反映（cherry-pick）のみ。iOS 用 build script・index.html・monetization-v1.js・Swift は無変更。
- package.json: `@capacitor/android` 追加、スクリプト2件追加。capacitor.config.json: `android` セクション追加（ios セクション不変）。
- 注意: 商品ID は iOS ID を暫定流用（未承認）。Android Pro は iOS 購入を引き継がない（Play 購入のみ）。

## 5. テスト結果
- Node 全体: 1256 件中 **1253 PASS／3 FAIL**。3 FAIL（native-ios-foundation の `public` 未生成2件、P2L TZ=UTC golden 1件）は **clean main（origin/main）でも同一に失敗する既存分**で、本変更起因ではない。
- 新規 `tests/native-android-foundation.test.mjs`: 7/7 PASS（application id・SDK・16KB設定・iOS契約との一致・Manifest・注入の独立性・Back 挙動・JSON契約）。
- JVM 単体テスト（`EntitlementPolicyTest`、javac+JUnit 4.13.2 で実行）: 10/10 PASS（購入/pending/不明状態/他商品/返金/null の Fail Closed、権限状態マッピング）。
- `npm run android:sync`: 成功（native-web→android assets、plugin 2件検出）。
- `gradle :app:assembleDebug`: **BLOCKED**（`dl.google.com` 403、AGP 8.13.0 pom 取得不可）。

## 6. FAIL／BLOCKED 理由
| 項目 | 区分 | 理由 |
|---|---|---|
| Debug APK／Release AAB／16KB 検査／Lint／Instrumentation／Emulator／API 26・35・36 | 環境 BLOCKED | dl.google.com 拒否。Emulator は /dev/kvm も無し（Cloud VM）。**同一理由で2回以上確認済み**（curl・gradle）。代替: SDK を許可するネットワーク設定、または Mac/CI での検証工程を分離 |
| Java プラグインのコンパイル | 未検証 | android.jar／androidx／Billing／CameraX 不在。構文・API シグネチャは未コンパイル（Billing 8.0.0 の `QueryProductDetailsResult` 等は実ビルドで要確認） |
| 画面サイズ・システムUI・background 復帰・実カメラ・実購入 | 未検証 | 実行環境なし |

## 7. 成果物
Debug APK／AAB: **なし**。署名なし成果物も無し。

## 8. Google Play 公開までの残課題
1. dl.google.com を許可した環境で `gradle assembleDebug` を通し、コンパイルエラーを修正
2. Emulator（API 26/35/36、16KB 含む）と実機で全フロー検証（特にバックアップの iOS⇔Android 往復、QR、Back 操作の網羅）
3. Pro 商品ID・価格・購入検証方式（サーバー検証の要否）の PO 決定。現状はクライアント側 Play 照会のみ＝本番認証情報なしでは保証できない項目
4. privacy.html の Android 項目追記、Data Safety、レーティング（docs/android/GOOGLE_PLAY_PREP.md）
5. 署名・Play App Signing（PO 操作）、内部テスト計画
6. minSdk 26 の確定（互換性ビルド後）、Back 対象画面の網羅確認、allowBackup=false 方針の PO 確認

## 9. 次の PO 承認事項
(a) Cloud ネットワークで dl.google.com（と maven.google.com）を許可するか、Mac/CI でのビルド工程を別 Gate で行うか。(b) Pro 商品ID／購入検証方針。(c) ブランチ push の確認（本報告時点で push 済みか否かは最終報告参照）。

## 10. Mac 使用
なし（Cloud のみ）。Remote Control 不使用。

## 11. クリーンアップ
自分が作成した一時 git worktree（/tmp/claude-0/sdk/base）を削除。ブラウザ・サーバー・常駐プロセスは未起動。
