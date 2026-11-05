# Android Build Evidence（Cloud, 2026-11-05）

開始HEAD 146f3f4 / Branch feature/cuescore-android-v1 / JDK 21.0.12 / Gradle 8.14.3 / AGP 8.13.0 / SDK platform-36, build-tools 36.0.0 (+35.0.0 自動導入)

## Network
- repo.maven.apache.org 200、registry.npmjs.org 200（プロキシ経由）、dl.google.com 200/302。
- 注意: 環境の NO_PROXY に registry.npmjs.org が含まれ npm が直接接続（DNS不可）になり ENOTFOUND となった。`NO_PROXY=` を解除し `--proxy $HTTPS_PROXY` で実行すると成功（許可範囲の拡大なし）。
- JUnit 取得で一度 HTTP 429（レート制限）。60秒待機後に成功（403とは別原因）。

## 実行結果
| 項目 | コマンド | 結果 |
|---|---|---|
| npm | `npm ci --no-audit --no-fund`（proxy指定） | 96 packages |
| Sync | `npm run android:sync` | 成功（plugin: filesystem 8.0.0, share 8.0.1） |
| Compile + Debug APK | `gradle :app:assembleDebug` | **PASS**（Java 警告は unchecked note のみ） |
| Release AAB（署名不要） | `gradle :app:bundleRelease` | **PASS** |
| Android Unit Test | `gradle :app:testDebugUnitTest` | **11/11 PASS**（EntitlementPolicyTest 10 + ExampleUnitTest 1） |
| Lint | `gradle :app:lintDebug` | 初回 2 errors（MissingTranslation: package_name, custom_url_scheme）→ 修正後 **0 errors / 29 warnings** |
| 16KB | `zipalign -c -P 16 -v 4` | Verification successful。.so は arm64-v8a / x86_64 全 LOAD align 0x4000 |
| Node 全回帰 | `npm test` | 1263 件: 1260 PASS / 3 FAIL（既存同一: #620,#621 native-ios public 未生成、#859 TZ=UTC golden） |
| Android 新規 | `node --test tests/native-android-foundation.test.mjs` | 7/7 PASS |

## 成果物（git管理外・ビルド生成物）
- android/app/build/outputs/apk/debug/app-debug.apk 19,111,095 B sha256 f80fc759731d60b6d02b64372024bcfb7cc8c21f27dd597919bd908c950fdccb
- android/app/build/outputs/bundle/release/app-release.aab 17,083,995 B sha256 d432ccd7571b7ed5c78dce18f4e026c2f5da673d75fa3ccc0fed44025dc50cad（未署名・未配布）

## 修正内容
1. `android/app/src/main/res/values/strings.xml`: `package_name` / `custom_url_scheme` に `translatable="false"`（Lint error 解消）。
2. `tests/fixtures/p2/existing-tests-baseline.json`: `native-android-foundation.test.mjs` を登録（P2L-128..134 の byte-pin が追加テストファイルを検知して FAIL していたため。既存テストの変更なし）。

## 未確認（環境 BLOCKED / 未実施）
Emulator・実機（/dev/kvm なし）、Instrumentation、実カメラ/QR、実購入・pending・返金、background 復帰、画面サイズ/safe-area、署名済み Release、Play Billing 8 の実機契約検証。
