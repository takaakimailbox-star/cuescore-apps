# Android Emulator 実動作 Evidence（GitHub Actions / 2026-11-05）

対象: `feature/cuescore-android-v1`、Debug APK（CI 内で生成、`webContentsDebuggingEnabled` のみ CI 生成物上で true。コミット済みの製品設定は不変）。
本書は「実際に画面を操作して確認した事項」と「コードだけで確認した事項」を区別する。Emulator は実機の代替ではない。

## 1. 実施環境（Gate G6）
| 項目 | 内容 |
|---|---|
| 実行基盤 | GitHub Actions 標準 Linux Runner `ubuntu-24.04`（public repo のため標準 Runner は追加課金なし）、KVM 有効（`/dev/kvm` crw-rw-rw-） |
| ワークフロー | `.github/workflows/android-emulator-verify.yml`（一時的）。権限 `contents: read` のみ、秘密情報なし、schedule なし、起動条件は **このファイル自身の変更を `feature/cuescore-android-v1` に push した時のみ**、配布・公開なし、artifact 保持 7 日 |
| 第三者 Action（commit SHA 固定） | actions/checkout 11bd719…（v4.2.2）、actions/setup-java c5195ef…（v4.7.1）、actions/setup-node 49933ea…（v4.4.0）、actions/upload-artifact ea165f8…（v4.6.2）、actions/download-artifact d3f86a1…（v4.3.0）、reactivecircus/android-emulator-runner b530d96…（v2.35.0） |
| 検証対象 | API 26（default x86_64）、API 35（google_apis）、API 36（google_apis）、API 35 16 KB image（`google_apis_ps16k`、`PAGE_SIZE=16384`、`sdk_gphone16k_x86_64`） |
| WebView | API35 image: Chrome 124.0.6367.219／API36 image: Chrome 133.0.6943.137（いずれも Capacitor の「WebView ≤139」経路に該当） |
| 操作方法 | 実 OS 入力: `adb shell input swipe`（120 ms 押下＝タップ）、`KEYCODE_BACK`、`KEYCODE_HOME`、回転設定、`am force-stop`／`pm clear`。座標は 1 回の校正押下で CSS→画面座標を算出し、各押下後に **ページが受け取った pointer/touch/click（isTrusted）を記録**して整合を確認 |
| 読み取り | Chrome DevTools Protocol（localhost の adb forward のみ）で DOM を読むだけ。JS による擬似クリックは合否に使っていない（切り分け診断のみ） |
| ドライバ | `android/ci/emulator-verify.mjs` |

## 2. 結果（実 OS 操作で確認できたもの）
| 項目 | API26 | API35 | API36 | 16KB(API35) | 区分 |
|---|---|---|---|---|---|
| APK インストール／起動／WebView 接続 | ※1 | PASS | PASS | PASS（初回起動は ※2） | 実操作 |
| アプリプロセスのクラッシュ／ANR | ※1 | 0 件 | 0 件 | 0 件 | 実機能 |
| 6 競技のタイル選択（実押下）＋D2 左右カード整列 | ※1 | **6/6 PASS** | **6/6 PASS** | **6/6 PASS** | 実操作 |
| 日本語／English／简体中文 切替（言語キー＋再読込） | ※1 | PASS | PASS(run15) | PASS | 実操作＋DOM |
| 下部タブ 4 種（Home／Players／History／Settings）の実押下で画面が切替わる | ※1 | PASS | PASS(run15一部) | PASS | 実操作 |
| 新規インストール → 9-Ball 選択 → Start（実押下）→ 試合画面表示 | ※1 | **PASS** | 未確認※3 | **PASS** | 実操作 |
| ルートで Android Back → 最小化（プロセス生存） | ※1 | PASS | PASS | PASS | 実操作 |
| HOME→再起動で状態維持／プロセス kill 後のデータ保持 | ※1 | PASS(run14,15) | PASS(run15) | PASS(run14) | 実操作 |
| 回転（横→縦）でクラッシュしない | ※1 | PASS(run14,15) | PASS(run15) | PASS(run14) | 実操作 |
| Free/Pro：`CueScoreEntitlement`／`CueScorePro` 存在、Pro オーバーレイ開閉 | ※1 | PASS | PASS | PASS | DOM＋実 Back |
| ネイティブ Plugin 登録（CueScoreStoreKit／CueScoreQRScanner／Filesystem／Share／SystemBars） | ※1 | PASS | PASS | PASS | DOM |
| 16 KB ページサイズでの実起動（`PAGE_SIZE=16384`） | – | – | – | **PASS（起動・主要操作とも 4 KB と同等）** | 実機能 |

※1 API26（default=AOSP image、Launcher3）: 初回2回の実行はドライバ不具合で無効。修正後の run 16 では **アプリが起動直後に例外終了**（`MainActivity.onCreate`→`CapacitorWebView.<init>`→`WebView.getFactory`→`WebViewFactory` の例外、`Process: com.takaakimailboxstar.cuescoreapps` が AndroidRuntime に記録）。WebView を生成できないため以降の操作は全て未実施（4/24 は『ルート Back でプロセス生存』等の副次項目）。§4 F6 参照。
※2 16 KB image: 初回コールド起動で WebView の DevTools ソケットが 70 秒以内に現れない事象が **2 回**（run 8・run 14）発生。プロセスは生存、クラッシュなし、再起動後は正常。4 KB image（API26/35/36）では未発生。原因未特定（§4 F3）。
※3 API36 の Start 操作は最終 run では未取得（run 15 の読取分に含まず）。

## 3. 実動作で確認していないもの（Emulator のみで PASS 扱いにしない）
実カメラ／QR スキャン、カメラ権限ダイアログの実運用、実 Play 購入・pending・返金・再インストール後の権利復元、バックアップ書出し／復元の端末往復（ファイル共有シート・SAF）、ショットクロック（試合画面内の要素 ID が特定できず未確認）、プレーヤー管理・履歴・分析の中身の操作、安全領域の目視（スクリーンショットは Actions artifact に保存済みだが、artifact の保存先ホストが Cloud の許可リスト外のため本セッションでは閲覧していない）、背景からの長時間復帰、実機固有の挙動（ノッチ・折りたたみ・メーカー独自 WebView）。

## 4. 発見事項（Android 固有・要 PO 判断）
| ID | 重要度 | 内容 | 根拠 | 対応 |
|---|---|---|---|---|
| F1 | P1 候補 | **`env(safe-area-inset-top)` が API35＋WebView 124 で間欠的に 0** になる。`--safe-area-inset-top`=48px・ステータスバー 128px(≈48.8 CSS px) は正常に取得できているのに、`env()` が 0 の回があり、ホームのタイル上端が 231→182 CSS px に移る（上部の安全余白が 49px 失われる）。API36(WebView133) では未観測 | API35 image で 0px を 3 回、49px を約 7 回観測（回ごとに変動。0px の回は 8 秒待っても 0 のまま）。Capacitor SystemBars は WebView≤139 では WindowInsets を消費する実装（`SystemBars.java` の `hasBrokenWebViewVersion`）。アプリは `env(safe-area-inset-*)` を 124 箇所で使用 | **未修正（見た目の仕様に関わるため PO 判断）**。選択肢: A) `SystemBars` の `insetsHandling` 変更、B) MainActivity で WebView 親に system bar の padding を付与、C) 現状許容（最新 WebView 前提）。実機の WebView 版数での再確認を推奨 |
| F2 | P2 | **Android Back の到達先**：種目選択後（セットアップ状態）、および Players／History／Settings タブ画面で Back を押すとアプリが**最小化**される（ホーム／種目一覧には戻らない）。Back アダプタは「表示中の画面内 Back ボタンをクリック」する仕様で、Decision 045 後のホーム（`cueMatchSetupBackV3` 削除）とタブ画面には対象ボタンがない | 6 競技×3 構成すべてで `backReturnsToHomeTiles:false`、`appInForegroundAfterBack:false`、プロセス生存 | **未修正**（Back ポリシーは UX 仕様。「タブ→Home タブ→終了」にするか PO 判断） |
| F3 | P2 | 16 KB image の初回コールド起動で WebView が 70 秒以内に立ち上がらない（再起動で正常） | run 8・run 14 の `first-launch-diag`。同時刻に Google Play services／webview_service 等の他プロセス再起動が多発 | 要追加調査。実機（Pixel 8 以降の 16 KB 対応端末）で再確認 |
| F4 | 情報 | 16 KB image で Google Play services が NPE（`ReferenceQueueDaemon`）。アプリのプロセスではない | `otherProcessFatalExceptions` | 対応不要（テスト基盤側） |
| F6 | **P1 候補（環境要因の可能性大・要実機確認）** | **API 26（AOSP default image）でアプリが起動できない**。WebView プロバイダーの生成で例外（Capacitor は WebView 60 以上が前提。AOSP の API26 image 同梱 WebView は古く、実機のように Play 経由で更新されない）。アプリ側に WebView 非対応時の案内はない（Capacitor 標準の挙動に依存） | run 16 の API26 ジョブ（`WebViewFactory` スタック、`E17`）。API35/36 では同一 APK が起動するため APK 破損ではない | **未修正・minSdk 26 の確定は保留**。実機 API26 相当（WebView 更新済み）での起動確認が必要。環境側で WebView を更新する手段（Play／外部 APK 取得）は許可範囲外のため BLOCKED。対応案: minSdk を 27–28 に上げる、または最小 WebView 版の案内を設ける（PO 判断） |
| F5 | 情報 | 試合画面で操作後、DevTools の評価が長時間応答しない場面（`page busy`）。ソフトウェア GPU 上の描画負荷の可能性が高く、アプリ側 ANR は検出されていない | `ANR in` なし、`appCrashes:0` | 実機でフレーム／ANR を確認 |

## 5. 切り分けの記録（無駄な再試行の防止）
- 初期の失敗は**テスト側の前提誤り**だった（非表示の同名要素を押下、Decision 045 でホームが種目選択＋セットアップ統合に変更済み、`adb input tap` の瞬間押下が取りこぼされる、Back 後に最小化したまま押下、API26 での `logcat -c`／`getconf` 非対応）。いずれもドライバを修正し、製品 FAIL とは扱っていない。
- 「JS click では動くが OS タップでは動かない」は、押下が**非表示の同名要素**に向いていたことが原因と判明（`rect:[0,0,0,0]`）。

## 6. Run と成果物（保持期間 7 日）
| Run | 結論 |
|---|---|
| run 7–8（4 KB+16 KB 初回完走） | 16 KB で PAGE_SIZE=16384 を確認（run 7 の AVD パス誤りは run 8 で解消） |
| run 15 | API36 の 6 競技 6/6、API35 の straightPool／threeCushion、16 KB の jpa9 等を実押下で確認 |
| run 16（最終） | API35：24 項目中 21 PASS（6 競技 6/6、言語、タブ 4/4、Start→試合画面、Back 最小化）。残る FAIL は E05（nav 要素の位置判定がテスト不備）と E11/E12（タブ画面で停止した状態からの再開判定のテスト不備）。16 KB：18/24（同じ項目が PASS、E11 以降は前段の状態に連鎖して FAIL／E14–E16 は run 14 で PASS） |
| artifact | `emulator-evidence-{api26,api35,api36,api35-16k}`（スクリーンショット・logcat・results.json）。Cloud からは閲覧不可のため、PO は Actions 画面から取得 |

> 合否の最終的な機械可読データは各 artifact の `*-results.json`。本書の数値はジョブログからの転記。

## 7. 再実行手順
`.github/workflows/android-emulator-verify.yml` の `# rev: N` を 1 つ上げて Android ブランチへ push（約 12–25 分）。不要になったらこのファイルと `android/ci/` を削除する（本番ビルド・配布には無関係）。
