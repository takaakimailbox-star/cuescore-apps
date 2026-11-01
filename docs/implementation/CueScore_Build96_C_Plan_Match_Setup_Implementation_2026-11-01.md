# C案（コンパクトなプレーヤーカード＋画面全体にゆとり）製品実装記録 — 2026-11-01

状態: 製品実装・検証済み（main に反映）。**新Build採番・Archive・Upload・TestFlight・ASC・App Review・一般公開は未実施。** Build 96（Archive・内部 TestFlight）は不変。Decision 049／Official 140〜142 は候補のまま（正式発行なし）。PO は 2026-11-01 に C 案を採用（Prototype 3 の A／B 案は不採用）。

## 変更（match-setup-ux-v1.css／.js のみ。index.html・翻訳・保存は不変）
1. プレーヤーカード（1・2 共通）: アバター・名前・Race to を一つの情報グループに。Race to を下端へ押し付ける `margin:auto 0 0` を `margin:10px 0 0!important` で上書き、選択ボタン下パディング 0、カードの強制 `min-height` を撤去。
2. 画面全体: スペーサー上限 7vh／下 1.2、見出し下 `clamp(6px,1.8vh,18px)`、ショットクロック上 `clamp(14px,3.4vh,36px)`。入替ボタンは新しいグループに合わせてアバター高さへ（top 22px）。
3. 開始フッター: 独立フッターの下パディング `clamp(10px,2.8vh,26px)`（フッターは下部タブバーの上の通常 flex 子要素のため Safe Area を二重計上しない）。
4. 対戦相手未選択カード: 黄色の点線外枠・アバターの点線・黄色下線を撤去 → 薄いグレー（#d9d9d6）の実線枠。既存アバター・黒い＋・「対戦相手を選択」は維持。
5. 案内: 対戦相手カード直下（グリッド 2 列目）に `#cueSetupOppNoteV1`。文言は承認済み `setupux.reason.p2` の再利用（新規キー・文言変更なし）。淡いブルーグレー（#e9eff5）＋濃い文字（#1c2a3a）＋情報アイコン。対戦相手を選ぶと非表示（付随余白も消える）。`aria-hidden`（フッターの理由 role=status が唯一の読み上げ）。登録人数不足で既存案内カードが出ている間は出さない。日本語は「と」の後に改行候補（`<wbr>`、表示のみ・文字列は不変、AC-S1 配慮で Unicode エスケープ）。320 幅ではアイコンを省いて折返しを緩和。

## 実測（実 Chrome、DOM 矩形距離。ja／en／zh-Hans × 320／375／390／430 × 6 種目）
| 項目 | Before（Build 96, 390×844 ja 9-Ball） | After |
|---|---|---|
| アバター下端→名前上端 | 4 | 4（全 432 計測で 4pt） |
| 名前下端→Race to 上端（プレーヤー1・2） | 23.8／23.8 | 10／10（全 432 計測で 10pt） |
| 開始ボタン下端→タブバー上端 | 10 | 23.6（高さ ≥800 の画面で 23.6〜26、短い画面 667/568 で 18.7／15.9） |
| 開始ボタン高さ | 54 | 54以上 |
- 長い名前（1 行省略／折返し 2 行）でも名前→Race to は 10pt、横はみ出し・見切れなし。操作領域 44pt 以上、横はみ出しなし。
- 画面全体の余白: 390×844 時計 OFF で上 59／見出し→カード 16／カード→時計 29／時計→フッター 131（Before は上 76 と下の空白 205 に偏在）。
- 比較画像（実際の Before／After）: `/Users/Ludique/Documents/Codex/2026-11-01/cuescore-build96-c/compare/cmp_c_9ball_390.png`、`cmp_c_langs_sizes.png`。

## テスト
- Node 全体 1248/1248 PASS（新規 `setup-card-layout.test.mjs` 4 件、既存の未選択カード・スペーサー値のアサーションを新仕様へ更新、baseline／change-map `version-build96-c-plan-test-change-map.json`）。
- 実 Chrome: 新規レイアウト 1512/1512、長い名前 12/12、履歴タブ（設定→履歴、履歴あり）180/180、数値メニュー・外側タップ 525/525、match-setup-ux-func PASS、numeric-input-focus-ring PASS、home-tab-exits PASS、shotclock-setup-reach PASS、既存 match-setup-ux-layout 576/576。
- 保護: 9/10-Ball 1〜10＋その他、3 Cushion 7〜40＋その他、外側タップ、数字入力の中立フォーカス、全画面共通黄色フォーカス、試合中の状態表示、競技アイコン、ショットクロック、得点・勝敗・ファール、保存、QR/Backup、Free/Pro、翻訳 P4-APPROVED（人間レビュー未実施）、履歴タブ修正（1b1d8cc）。

## 観察（今回の範囲外・未修正）
対戦相手をプレーヤー選択ライブラリから選んだ直後、下部タブのハイライトが「プレーヤー」のまま残る（Build 96 の HEAD でも同一に再現＝既存挙動）。今回は変更していない。

## NOT VERIFIED
iPhone 実機の見た目、VoiceOver 実音声、Dynamic Type、実機でのキーボード表示中の挙動。
