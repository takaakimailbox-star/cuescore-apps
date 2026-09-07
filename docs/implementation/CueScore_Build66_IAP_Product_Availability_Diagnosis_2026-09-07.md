# CueScore Build 66 IAP商品取得・購入・Pro解放 原因調査記録

**調査日:** 2026-09-07  
**調査基準:** main `9d1f06b00d48f7e0992d3bd8d9707cc0783fd5ef` / Version 1.0 / Build 65

## 修正前に確定した原因

- App Store Connect IAP Apple ID `6808464490`は、Product ID `com.takaakimailboxstar.cuescoreapps.pro`、種別`NON_CONSUMABLE`でソースおよびStoreKit Configurationと一致している。
- 日本をbase territoryとする価格scheduleは存在し、手動価格は1件、開始日・終了日はともに未指定で即時適用状態。2026-09-14の将来開始日は現状態に残っておらず、今回の商品0件の原因ではない。
- App Store Connectの商品状態は`MISSING_METADATA`。IAP localizationは0件で、availability resourceも未作成だった。
- Apple公式仕様では、IAPには少なくとも1言語のDisplay Name／Descriptionと販売地域の設定が必要で、metadata変更のSandbox反映には最大1時間かかる場合がある。
- したがってTestFlightで`Product.products(for:)`が商品0件となり、Web側が`価格を取得できません`と表示して購入buttonをdisabledにしていた直接原因は、App Store Connect側の商品metadata／availability未完了である。

## コード側の確認

- `CueScoreStoreKitPlugin`は正式Product IDで`Product.products(for:)`を実行し、取得成功時にStoreKit `displayPrice`を返す。
- `purchase()`はverified success／userCancelled／pending／failureを分離し、verified transactionをfinishする。
- `Transaction.currentEntitlements`、`Transaction.updates`、`AppStore.sync()`があり、verified CueScore Pro entitlementだけをPro SSOTにする。
- `CueScoreBridgeViewController`は実際のMain storyboard rootで、plugin instance登録も有効。
- Free最新20件とPro全件のrecord policy、Pro解放対象、Product ID、価格表示UIの設計変更は不要。

## 実施した最小変更

1. App Store Connectに日本語IAP localization（Display Name `CueScore Pro`／Description）を追加した。
2. 日本だけを販売対象としてavailabilityを作成し、JPN基準の即時価格schedule `¥980`を維持した。
3. 1170×2532のIAP審査用スクリーンショットを登録し、Apple側の画像処理`COMPLETE`を確認した。IAPの審査提出は行っていない。
4. Review Notesへ解放機能と購入画面への入口を登録した。API上の必須商品情報は揃ったが、直後の状態表示は反映待ちの`MISSING_METADATA`である。
5. Pro画面を開いた時とアプリがforegroundへ戻った時に商品・entitlementを再取得する。商品取得が一時失敗してもverified entitlementをFreeへ降格しない。
6. Product ID、商品取得、StoreKit価格、購入結果、verified entitlement、再取得、Restore、Pro範囲、Free最新20件を回帰テストへ固定した。

## 検証

- 全自動テスト: `382 pass / 0 fail / 0 skipped`
- Release iOS Simulator: `BUILD SUCCEEDED`
- Release device archive／IPA export: PASS
- 実装commit: `db682d1`（main反映済み）
- App Store Connect Build ID: `cb98d62a-3a43-45c6-8c45-b8f5a72c2486`。`processingState=VALID`、`usesNonExemptEncryption=false`、Internal group `CueScore Internal Testers`の一覧先頭にBuild 66があることを確認した。
- App Store Connect metadata変更はSandboxへ反映されるまで最大1時間かかる場合があるため、TestFlight実機での`¥980`表示・購入sheet・購入後解放・再起動維持・復元はProduct Owner確認待ち。
- External TestFlight、App Review提出、一般公開は実施しない。

## App Store Connect契約・銀行・税務の追確認と調査停止（2026年9月7日）

- 有料アプリ契約は同意済みだが、App Store Connect上のステータスは「ユーザ情報を保留中」で、まだActiveではない。
- 銀行口座は登録完了し、Apple側の更新処理中。画面上では変更内容が最大24時間後に反映されると案内されている。
- 米国税務フォームはW-8BENの入力途中。税務判断が必要な項目は推測入力せず、Product Owner判断まで保留する。
- このため、TestFlightでの価格未取得を現時点でCueScore側のStoreKit 2／bridge不具合とは確定しない。Apple側の契約・銀行・税務情報がActiveになるまで、IAP原因調査と実装変更を停止する。
- Active確認後、現行TestFlight Buildで`CueScore Pro`の商品価格取得を再確認する。その時点でも価格を取得できない場合のみ、`Product.products(for:)`、native plugin登録、Capacitor bridge、entitlement同期の順で原因調査を再開する。
- 本追記ではソースコード、IAP metadata、価格schedule、Product ID、Free / Pro仕様を変更していない。新Build作成、TestFlight Upload、External TestFlight、App Review、一般公開も行っていない。
