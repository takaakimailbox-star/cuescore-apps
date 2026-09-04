# CueScore Build 60 Free / Pro課金境界 実装記録

## 実装

- Free Eligible Recordsを全保存recordの新しい順・全競技共通最新20件に統一した。Freeの履歴、基本成績、Match Detail可否は同じSSOTを参照し、21件目以降も保存データから削除しない。
- 自己ベスト、詳細分析・推移、対戦相手別、20件より前の履歴、Backup、RestoreをPro入口に統一した。試合開始・進行・結果保存、6競技、プレーヤー管理はFreeのまま維持した。
- 入口別modalを作らず、1種類のCueScore Pro画面へ統合。購入後はsourceを保った元操作を再開する。
- StoreKit 2 native bridgeを追加。Product取得、localized `displayPrice`、purchase、verified transaction、current entitlements、transaction updates、Restore、cancel／pending／failureを扱う。
- 永続local booleanを権限判定に使わず、Apple verified entitlementだけをPro判定とした。

## 正式商品識別子

- Type: Non-Consumable
- Product ID: `com.takaakimailboxstar.cuescoreapps.pro`
- ソース／StoreKit Configuration／App Store Connectの完全一致を必須とする。

## 画面確認

- `build60-free-pro-screenshots/01_pro_screen_390x844.png`
- `build60-free-pro-screenshots/02_player_results_free_390x844.png`
- `build60-free-pro-screenshots/03_settings_free_390x844.png`

## 配布結果

- 全自動test：371 pass / 0 fail / 0 skipped
- Simulator Debug：BUILD SUCCEEDED
- App Store Connect IAP：CueScore Pro／Apple ID `6808464490`
- Product ID：`com.takaakimailboxstar.cuescoreapps.pro`（ソース、StoreKit Configuration、App Store Connect完全一致）
- Build、commit、App Store Connect Build ID、Internal TestFlight状態は配布完了後に追記する。
- External TestFlight、App Review、審査用追加、一般公開は実施しない。
