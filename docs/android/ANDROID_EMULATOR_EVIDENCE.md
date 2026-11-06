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

## 8. 品質改善Gate（F1／F3／F6／F2）結果
**区分の凡例**: 実操作＝実 OS 入力、DOM／幾何＝CDP 読み取り＋スクリーンショットのピクセル採取。**スクリーンショットを人が目視していない（Cloud から artifact を閲覧できない）ため、視覚 PASS とは報告しない。** 数値は幾何・ピクセル採取による。

### 8.1 F1 Safe Area（修正済み・Android バンドルのみ）
- **原因**: Capacitor 8.0.2 SystemBars は `--safe-area-inset-*` を注入するが、WebView ≤139 では `hasBrokenWebViewVersion` 経路で WindowInsets を消費するため、ネイティブ `env(safe-area-inset-*)` が起動ごとに 0 になる／下端が欠落する。実測では API35(WebView124)・API36(WebView133) の双方で、下部ナビバー分（65px）が `env(safe-area-inset-bottom)` に反映されず、下部タブがシステムナビゲーションバーと重なる。
- **修正**: `scripts/android-safe-area-bridge.mjs`。Android 用 `native-web` 出力のみ、`env(safe-area-inset-X, fb)` を `var(--safe-area-inset-X, env(safe-area-inset-X, fb))` に機械置換（331 箇所。`index.html` ソース、iOS／PWA、保存データは無変更。`CUESCORE_ANDROID_SAFE_AREA_BRIDGE=0` で無効化可）。値の供給元は SystemBars の CSS 変数 1 本で、ネイティブ padding は追加していない＝**二重適用なし**。
- **A/B（各 4 回コールド起動、実 OS 起動、DOM／幾何）**
| 項目 | BEFORE（bridge 無） API35／API36 | AFTER（bridge 有） API35／API36 |
|---|---|---|
| 下部タブボタン下端 vs ナビバー上端 | 2402px vs 2337px（**65px 重なり**、8/8 起動） | 2339px vs 2337px（重なり無し、8/8 起動） |
| 競技タイル上端（CSS px） | 231（env 取得失敗時は 182 に移動する事象あり） | 230、4 回で振れ幅 0 |
| 画面幅 | 変化なし | 変化なし（横方向のはみ出し無し） |
- 区分: 実起動＋DOM／幾何。**視覚 PASS ではない**（目視未実施）。実機（折りたたみ・ノッチ）は未確認。

### 8.2 F3 16 KB 初回コールド起動遅延（原因未確定・環境要因の可能性が高い）
- run 8・run 14 の失敗はいずれも、エミュレータ起動直後（Play services／webview_service 再起動が多発し CPU・メモリ飽和）に発生。起動後 120 秒待機してからの起動では再現せず、4 KB image の対照も正常。プロセス生存・クラッシュ・ANR なし、再起動後は正常。
- 分類: **エミュレータ（ソフトウェア GPU＋起動直後の負荷）起因の可能性が高いが、16 KB 固有か否かは未確定**。製品側の欠陥を示す証拠はない。Pixel 8 以降の 16 KB 対応実機での確認が必要。

### 8.3 F6 API 26（原因分類: 検証環境／WebView 版数）
- AOSP default image の API 26 の WebView は版数 58 で、Capacitor 8 の既定最小 60（ハード下限 55）を下回り、有効なプロバイダーが無い（current package null）ため起動時に例外。Google APIs image の API 26 は Chrome 69 を同梱しており、同一 APK が起動する（Capacitor 要件を満たす）。
- minSdk 26 は**変更していない**。非公式 APK 導入・追加課金は無し。**実機で必要な条件**: Android 8.0（API 26）以上、Android System WebView／Chrome が 60 以上（Play で更新済み）。実機 API26 での起動確認は未実施。

### 8.4 F2 Android Back（Prototype）
`ANDROID_BACK_UX_PROPOSAL.md` を参照。既定は `current` のまま。Back 結果は下記 §8.5。

### 8.5 F2 Back Prototype ＋ 追加機能プローブ（run 23、API35／WebView124、実 OS Back／押下）
`FINAL {"label":"back35","steps":"B0:P,B1:P,B2:P,B3:P,B4:P,B5:P,B6:P,F-startup:P,F-shot-clock:F"}`（8/9 PASS）
| ID | 内容 | 結果 |
|---|---|---|
| B0 | `proposal` を実行時のみ有効化（既定 `current` のまま） | PASS |
| B1 | 競技選択後 Back → 6 競技一覧、アプリ前面 | PASS（run 22 では初回押下の取りこぼしで FAIL→再押下で解消。テスト側の問題） |
| B2–B4 | Players／History／Settings で Back → Home（`cuePhase1Tab=home`）、アプリ前面 | PASS |
| B5 | Pro オーバーレイで Back → オーバーレイのみ閉じる | PASS |
| B6 | ホーム一覧で Back → 最小化、プロセス生存 | PASS |
| F-startup | コールド起動計測＋アプリ自身の ANR 検査 | PASS（アプリ ANR 0。run 22 の ANR はエミュレータの Launcher 側で、アプリ無関係） |
| F-shot-clock | 試合開始（Start）は成功したが、試合画面内でショットクロックを特定する要素を ID／class／文字列から見つけられなかった | **FAIL（テスト側の特定不備か未検証、製品 FAIL とは判断しない）→ 実機で要確認** |
- 16 KB（back16k）: run 22 は起動直後の WebView 未起動（F3 と同症状）、run 23 は待機 120 秒版。結果は §8.6。
- 未実施（実機／別 Gate）: プレーヤー管理・履歴／分析の中身の操作、バックアップ書出し／復元の端末往復、実購入。
- 保全: 本節の FINAL 行は run 22／23 のジョブログからの転記。artifact は 7 日で失効（Cloud から取得不可）。

### 8.6 16 KB image（run 23、PAGE_SIZE=16384、起動後 120 秒待機）
`FINAL {"label":"back16k","steps":"B0:P,B1:P,B2:P,B3:P,B4:P,B5:P,B6:P,F-startup:P,F-shot-clock:F"}`（8/9、4 KB と同一結果）。120 秒待機後の初回起動は成功（F3 の「起動直後負荷」仮説と整合、ただし因果は未確定）。F-shot-clock は §8.5 と同じ理由で実機確認へ。

## 9. 削除候補
`.github/workflows/android-emulator-verify.yml` と `android/ci/` は検証完了後に削除可能（PO 指示まで維持）。

## 10. A案 正式採用後の検証（run 24／25、2026-11-06、実 OS の Back キー／押下）
対象 HEAD: run 24 = `916aa30`、run 25 = `aa87b8c`（Back 既定値 `proposal` = A案）。
| 項目 | API35 | API36 | 16KB(API35) | 区分 |
|---|---|---|---|---|
| B0〜B6（既定値のまま：競技選択→一覧／Players・History・Settings→Home／Pro オーバーレイのみ閉じる／ホーム一覧→最小化・プロセス生存） | PASS | PASS | PASS（run 24） | 実操作 |
| F-startup（コールド起動 約 1.3〜3.0 秒、アプリ自身の ANR 0 件） | PASS | PASS | PASS | 実機能 |
| F-shot-clock：初期 OFF（`aria-checked=false`）→ 試合設定のスイッチを実押下で ON → 試合画面に時計バー・延長・リセットが表示 | PASS | PASS | PASS | 実操作＋DOM |
| B7：試合中の Back でアプリ前面維持・保存データ非破棄 | **未確認** | **未確認** | **未確認** | 下記 |
- run 24 の API35／36／16KB（3/3）と run 25 の API35／36（2/2）で、B0〜B6・F-startup・F-shot-clock はすべて PASS（run 25 の 16KB ジョブは本書作成時点で未読）。
- **B7（未確認）**: 試合開始後の画面が重く（ソフトウェア GPU。F5 と同症状）、Back 後 36 秒待っても DevTools 評価が応答せず保存データを読み出せない。アプリは前面を維持（`fg=true`）。Back 前の保存データは 10 キー・986 文字。**Back による保存データ破棄の有無は Emulator では確認できていない**。代替の担保: ①試合中の Back は従来の `#proGameBackBtn`（変更なし）、②A案の追加ルールは `#proGameScreen` 表示中は一切動作しない（Node テスト 5/5 PASS）。実機での確認が必要。
- 保全: FINAL 行はジョブログからの転記（artifact は 7 日で失効、Cloud から取得不可）。
