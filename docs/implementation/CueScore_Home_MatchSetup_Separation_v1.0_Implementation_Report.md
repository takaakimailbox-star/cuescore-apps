# CueScore Home / Match Setup Separation v1.0 — Implementation Report

## 1. 変更概要

- Homeを公式横組みロゴ、6種目、プレーヤー／履歴／設定のみに整理
- 種目タップ後に、既存状態と既存開始処理を再利用するMatch Setupを表示
- Home下部ナビをHome／プレーヤー／履歴／設定の4項目へ変更
- 分析機能は削除せず、Homeの導線のみ非表示
- 開始操作へ1.2秒の重複入力ガードを追加

## 2. 変更ファイル

- `index.html`
- `sw.js`
- 本実装レポート
- Adopted UI README

## 3. 新規ファイル

- `docs/assets/adopted-ui/home-v3.png`
- `docs/assets/adopted-ui/match-setup-v3.png`
- `docs/implementation/CueScore_Home_MatchSetup_Separation_v1.0_Implementation_Report.md`

## 4. 画面遷移

Homeの各種目カードで既存のselected disciplineを更新し、同一DOM内のMatch Setupへ遷移する。Match Setupの戻る操作とブラウザBackはHomeへ戻る。試合開始は既存`startProGame()`へ接続し、開始成功後は従来のGame画面へ遷移する。

## 5. 各種目への影響

9-Ball、10-Ball、Rotation、14-1、JPA 9、3 Cushionの選択値、Race／目標点、種目別ルール、Game、Result、履歴、統計の処理は既存実装を再利用した。競技ロジックと記録形式は変更していない。Home非表示種目や分析機能も削除していない。

## 6. 保存・データ移行

保存キーとデータ構造の変更、データ移行はない。既存プレーヤー、アバター、写真Data URL、履歴、統計、設定、進行中試合を維持する。Homeへ戻ってもMatch Setupの入力DOMを再生成しないため、一時設定値も保持される。

## 7. 実施テスト

- 23/23インラインJavaScript構文
- Service Worker構文とキャッシュ版更新
- Homeの6種目順序
- Homeのプレーヤー／履歴／設定導線
- Match Setupの表示、戻る／ブラウザBack配線
- 既存種目選択、Race、ルール、プレーヤー、入れ替え、開始ハンドラの再利用確認
- 分析ボタンをDOMへ保持しつつHomeでは非表示であること
- 開始二重押下ガード
- 保存キー不変
- GitHub Pages上の新HTMLとService Worker配信

## 8. 未実施テスト

- 管理ポリシーにより自動ブラウザがGitHub Pagesへ接続できず、実機相当のタップ操作と公開画面スクリーンショット取得は未実施
- iPhone実機でのSafe Area、PWAオフライン再起動、6種目の試合完走は未実施

## 9. 残課題

- iPhone実機でHomeと各Match Setupの最終目視確認を行う
- 公開画面スクリーンショットを取得できる環境で実装結果を記録する

## 10. 正式参考画像

- `docs/assets/adopted-ui/home-v3.png`
- `docs/assets/adopted-ui/match-setup-v3.png`

## 11. コミット

- UI実装: `157fdc3`
