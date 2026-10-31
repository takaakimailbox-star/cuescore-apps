# Build 95 試合設定UI改善 — 製品実装記録（2026-10-31）

状態: 製品コード実装・テスト済み。**新Build採番・Archive・TestFlight・ASC・App Review・一般公開は未実施**。Decision／Official の正式発行なし（Decision 049 追補・Official 142 は候補のまま）。

## 範囲（PO承認 3項目）
1. 縦方向バランス（match-setup-ux-v1.css）: 設定本文の `::before`／`::after` スペーサーで余白を上 1 : 下 1.25 に配分（上は max 9vh/84px）。内容が高い場合は 0 に潰れ、スクロールと独立フッターはそのまま。カード min-height と時計カードの上余白を vh で適応。
2. 数値選択（index.html, match-setup-ux-v1.js/css）: 9/10-Ball = 1〜10＋その他、3 Cushion = 7〜40（連続）＋その他。全リストをメニュー化（MENU_MAX_ROWS 廃止）、高さ上限 ≈6.5 行＋「その他」下端固定（sticky）、選択中を中央へスクロール。現在値が候補外なら行を挿入して選択表示（JPA9 の SL は対象外）。有効範囲 1〜100／1〜1000、初期値、検証は不変。
3. 外側タップ: 原因は背景幕の `aria-hidden="true"` ＋ 共通 `[aria-hidden="true"]{pointer-events:none!important}`（index.html の共通規則は**変更せず**）。背景幕を `role="presentation"` に変更。キャンセルは既存の閉じる処理（値は反映せず、呼び出し元へフォーカス復帰）。Escape／✕／「その他」入力中の外側タップも同じ。

## 黄色表示の保護（変更なし）
共通フォーカス（#ffd54a 3px）、未選択カードの黄色表現、試合中の手番・選択・勝者、9-Ball アイコン、ショットクロック色はすべて不変。「その他」数値入力の中立フォーカス（9e37a0b）は維持。静的テスト＋focus-ring 実Chromeテストで固定。

## 変更ファイル
index.html（+12/-2）、match-setup-ux-v1.js、match-setup-ux-v1.css、テスト（新規 setup-numeric-menu.test.mjs、tests/browser/setup-numeric-menu-outside-tap.mjs；更新 SU-4/SU-5・upper-limits・race-picker inset・localization 4 件の index.html ハッシュ・func／focus-ring ブラウザテスト）、baseline fixture、`tests/fixtures/p2/version-build95-numeric-menu-test-change-map.json`。AC-S3（MutationObserver 追加禁止）維持。ショットクロック・得点・保存 schema・QR・Backup・Free/Pro・IAP は未変更。

## 検証
- Node: 1241/1241 PASS。
- 実Chrome・実座標（CDP Input）: 新規マトリクス 3言語×4幅（320/375/390/430）×5種目 1050/1050 PASS（メニュー件数・範囲、行44px以上、その他到達、外側タップ／Escape、値不変、背景ボタン非反応、フォーカス復帰、その他入力中キャンセル、候補外の値=45、横はみ出しなし、縦バランス、開始ボタン）。
- 既存ブラウザ: match-setup-ux-func PASS、numeric-input-focus-ring 8/8、shotclock-b4 PASS、shotclock-integrated 423/423、home-tab-exits PASS、match-setup-ux-layout 576/576、start-button-reach 144/144（3言語を個別実行）。
- Evidence: `/Users/Ludique/Documents/Codex/2026-10-31/cuescore-build95-impl/`（matrix json/log、shots/、各ログ）。

## NOT VERIFIED
iPhone 実機（キーボード表示中の外側タップ、慣性スクロール）、物理キーボード、VoiceOver 実音声（listbox 読み上げ）、Dynamic Type、WKWebView ネイティブでの実タッチ。
