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
