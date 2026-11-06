# CueScore Android — Google Play 公開準備（書込みなし・案）

状態: 下書き。Play Console への書込み（アプリ作成・AAB upload・商品登録・課金・配布・公開）は未実施・別承認。

## 1. ストア説明文（日本向け案・未承認）
- タイトル案: CueScore Apps
- 短い説明案（80字以内）: ビリヤードのスコアを記録・分析。Rotation／9-Ball／10-Ball／14-1／JPA 9-Ball／3 Cushion 対応。
- 詳細説明は iOS App Store 掲載文（docs/official/app-store-v1.0/）を正本として流用し、Android 固有の表現のみ差し替える。新機能を謳わない。

## 2. 提出物要件（要確認）
- アプリアイコン 512×512 PNG: icons/cuescore-app-icon-512.png を流用可（Adaptive Icon は実装済み）。
- フィーチャーグラフィック 1024×500: 未作成（PO デザイン判断が必要）。
- スクリーンショット: Emulator 取得後に採用候補化（現状は Emulator 未起動のため未取得）。docs/assets/adopted-ui/ の採用 UI と一致するもののみ。
- ターゲットAPI: targetSdk 36 設定済み。Play の最新要件は提出時に再確認。

## 3. Data Safety 申告案（要 PO・法務確認）
- 収集: アプリ作者のサーバーへ送信するデータは無し（端末内保存・バックアップはユーザー操作の JSON 書出し）。
- カメラ: Match Sharing QR 受信時のみ使用、画像は保存・送信しない。
- 購入情報: Google Play Billing が処理（アプリは購入トークンを外部送信しない）。
- 第三者 SDK: Play Billing、CameraX、ZXing（端末内処理）。広告 SDK・分析 SDK は無し。
- privacy.html の記述との照合は Android 固有項目（Play Billing、camera）が未記載なら追記が必要 → PO 判断。

## 4. コンテンツレーティング確認事項
暴力・性的内容・ギャンブル（賭け機能なし）・ユーザー生成コンテンツ共有（QR ローカル共有のみ）なし。IARC 質問票は PO が Play Console で回答。

## 5. Billing 設定手順（PO 操作・未実施）
1. Payments profile を設定（要契約情報）。
2. Play Console › 収益化 › アプリ内アイテム › 管理対象商品で非消費型 Pro 商品を作成。商品ID は未確定（コードは iOS ID `com.takaakimailboxstar.cuescoreapps.pro` を暫定値として使用。変更する場合は CueScoreStoreKitPlugin.PRO_PRODUCT_ID と monetization-v1.js の PRO_PRODUCT_ID を同時変更）。
3. 価格・地域は iOS の Pro 価格方針に合わせる（製品仕様は PO 判断）。
4. ライセンステスターを登録し、内部テストトラックで実購入フローを検証（pending／cancel／返金／再インストール）。

## 6. Play App Signing
Google 管理の App Signing を有効化し、アップロード鍵は PO が生成・保管（秘密情報はリポジトリ・チャットに出さない）。署名なし／デバッグ署名の AAB は公開物ではない。

## 7. テスト計画
- 内部テスト（最大100名）→ 必要に応じ Closed Test。個人開発者アカウントの場合、本番公開前に Closed Test 要件（テスター数・期間）があるため、アカウント種別を PO が確認。
- 内部テスト合格基準: docs/android/ANDROID_IMPLEMENTATION_REPORT.md の「実機・Emulator 未検証項目」が全て PASS。

## 8. 本番公開前チェックリスト
- [ ] Emulator／実機で全6競技・D2画面・3言語・バックアップ往復・QR・Pro 購入が PASS
- [ ] API 26／35／36 で起動確認
- [ ] 16KB page-size: `zipalign -c -P 16 4` と Android 15+ 16KB Emulator で確認
- [ ] 署名済み Release AAB 生成（Play App Signing）
- [ ] Data Safety／プライバシーポリシー／レーティング完了
- [ ] サーバー側購入検証の要否を PO 判断（現状クライアント側のみ）
- [ ] PO の公開承認（別Gate）

## 9. 未承認事項の具体化（2026-11-06、調査・下書きのみ。Play Console への書込み・課金設定は未実施）
| # | 項目 | 現状（コード／文書で確認できる事実） | 未承認で PO 判断が必要な事項 |
|---|---|---|---|
| 1 | **Android Pro 商品 ID** | コードは iOS と同じ `com.takaakimailboxstar.cuescoreapps.pro`（`monetization-v1.js` と `CueScoreStoreKitPlugin.java`。39 文字で Play の上限 40 文字内、小文字・数字・ピリオドのみで形式 OK）。**Play の商品 ID は作成後に変更できない**ため、確定前に作らない | ①この ID を Android でも使うか（コード変更なし）②別 ID にする場合は両側のコードとテストを同時変更（`pro2` のような変更は既存テストが検知する） |
| 2 | **価格・地域** | iOS は「価格は StoreKit の `displayPrice` が正本で、公式文書に価格を固定記載しない」（`app-store-v1.0/README.md`）。Android も `ProductDetails` の表示価格を使う設計 | Android の価格・販売地域（iOS は Japan-only launch）を PO が決定。Play Console での価格入力は別承認 |
| 3 | **購入検証方式** | 現状はクライアント側のみ。`queryPurchasesAsync` で Play を正本として再照会し、未承認購入は `acknowledgePurchase` を実行（`pending` 対応あり、Billing 8.0.0）。購入トークンは外部送信しない | サーバー側検証（Google Play Developer API）の要否。サーバーを持たない方針ならクライアント側のみで公開するリスク（改ざん端末での Pro 解放）を PO が受容するか。3 日以内の承認漏れは Google が自動返金するため承認処理は必須（実装済み、実購入では未検証） |
| 4 | **Privacy／Data Safety** | 収集データ無し（端末内保存、ユーザー操作の JSON 書出し）。カメラは Match Sharing の QR 読取時のみで画像は保存・送信しない。購入は Google Play Billing が処理。第三者 SDK は Play Billing／CameraX／ZXing（広告・分析 SDK 無し）。**公式 Privacy Policy（`app-store-v1.0/public/`）には Android 固有（Play Billing、カメラ）の記載が見当たらない** | ①Data Safety 申告（収集なし／カメラ使用／購入情報）②Privacy Policy へ Android 固有の追記（公式文書のため PO・法務承認と SSOT 手続き）③公開 URL を Play 用にも使う |
| 5 | **署名と内部テスト** | Play App Signing（Google 管理）＋アップロード鍵は PO が生成・保管。署名なし／デバッグ署名の AAB は提出不可。現状は署名なし Release AAB まで（ローカル／CI でビルド確認済み） | アップロード鍵の生成と保管（秘密情報は git・チャットへ出さない）、内部テストトラック作成、ライセンステスター登録（別承認）。個人開発者アカウントは本番前に Closed Test の人数・期間要件がある場合があり、提出時点の Play ポリシーを再確認 |
| 6 | **ストア掲載資料** | 説明文は `app-store-v1.0/submission/` を正本として流用（新機能を謳わない）。アイコン 512×512 は流用可。フィーチャーグラフィック 1024×500 は未作成。スクリーンショットは採用 UI と一致するもののみ（人が目視して選定。Cloud の画像は視覚確認していない） | フィーチャーグラフィックのデザイン判断、スクリーンショットの採否（Pixel 実機で撮影するのが望ましい）、短い説明（80 字）の承認 |
- 追加の注意: 16 KB ページ対応は静的検証・Emulator で確認済み（`zipalign -P 16`、API35 16KB image）。実機（Pixel 8a は Android 15 QPR1 以降で開発者向け 16 KB モードに対応するとの公式情報。利用可否は到着後に確認）で再確認する。
- 本節は調査・下書きであり、いかなる Play Console 操作も含まない。
