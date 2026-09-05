# CueScore Build 63｜Build 62実機QA Follow-up修正

**日付:** 2026-09-05  
**対象:** Version 1.0 / Build 63  
**範囲:** Internal TestFlightまで

## 実装

- HistoryのFree 20件CTAからCueScore Proを開く際、`recordsScreen`、選択中の競技filter、`recordsList`のscroll位置を専用snapshotとして保持する。
- Pro Backではfocus復帰後、即時・2段の`requestAnimationFrame`・80ms後に同一scroll ownerへ復元し、DOM描画後のtop戻りを防ぐ。
- Terms／Privacy／Supportのheader高を`60px + safe-area-inset-top`へ変更し、48×48pxのアプリ側Backをsafe area内に置く。
- 法務ページ間のWeb navigation後でも、アプリ側BackはHome URLへ直接戻し、既存のSettings復帰flagでSettingsを再表示する。
- 更新資産へBuild 63のcache busterを付与し、PWA cacheとnative同梱資産を同期する。

## License調査

`docs/official/`、`docs/CURRENT_STATE.md`、adopted UI、現行実装、依存resourceを確認した。正式License画面、文書、OSS一覧、URLは存在せず、現行のdisabled状態を維持した。新規destinationや本文は作成していない。

## 検証

- 全自動test: 373 pass / 0 fail / 0 skipped
- 390×844 Browser: `すべて` filter、`recordsList.scrollTop=758`（最下部）→ Pro → Back → `scrollTop=758`、filter=`all`、差分0px
- 390×844 Browser: Terms → Privacy（Web navigation）→ アプリ側Back → Settingsを確認
- 法務Back: 48×48px tap target、headerは`safe-area-inset-top`を除いた60pxのcontent領域を確保
- Release iOS Simulator build: BUILD SUCCEEDED

## 非対象

IAP価格取得・購入不可、StoreKit／App Store Connect設定、Free／Pro境界、Swipe、External TestFlight、App Review、一般公開は変更していない。

