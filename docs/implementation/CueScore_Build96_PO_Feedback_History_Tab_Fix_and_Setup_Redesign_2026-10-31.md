# Build 96 PO 実機フィードバック: 履歴タブ修正（B）と試合設定画面再デザイン案（A）— 2026-10-31

状態: **B は最小修正を実装・検証済み（main に反映）。A は隔離 Prototype のみ（製品コード未変更、PO のデザイン承認待ち）。** Build 96（Archive・内部 TestFlight）は不変。Build 採番・Archive・Upload・ASC・App Review・一般公開は未実施。Decision 049／Official 140〜142 は候補のまま。

## B. 履歴タブ不具合
- 再現（実 Chrome・実座標タップ）: ホーム・プレーヤー・設定からは正常。**開いた試合設定画面（6 種目すべて）から「履歴」を押すと開かない**（記録: before 30 件中 6 件 FAIL）。
- 追跡: タブのクリックは `openRoot("history")`→`recordsBtn` まで到達し、`#recordsScreen` の class／aria-hidden も「開いた」状態になるが、`#recordsScreen` の高さが 0（y=844）で見えない。`#cueHomeV1.match-setup-active-v3` が画面全体（390×844）を占有したままだった。例外・データ変更なし。
- 原因（製品側）: Build 95 の試合設定 CSS `body.cue-phase1-normal-mode #cueHomeV1.match-setup-active-v3{display:flex!important}` が ID を含み、共通の `.app.records-mode>.cue-home-v1{display:none!important}`（index.html）より詳細度が高いため、記録モードでもホームが隠れず、履歴画面を押し下げた。WKWebView 固有ではなく、Chrome でも同一に再現。
- 修正（1 ルール、`match-setup-ux-v1.css`）: `body.cue-phase1-normal-mode .app.records-mode>#cueHomeV1.match-setup-active-v3{display:none!important}`。記録モードのみ。ナビゲーション JS・共通規則・保存データは未変更。
- 検証: Node 1244/1244（新規静的 2 件）。実 Chrome 実座標: 履歴あり 3 言語×4 幅（ホーム／6 種目の設定／プレーヤー／設定 → 履歴）360/360、履歴 0 件 3 言語×2 幅 180/180、home-tab-exits-match-setup PASS。localStorage 件数はタップ前後で不変（試合設定からは何も保存されない）。
- NOT VERIFIED: 実機 WKWebView での再現・修正確認（Chrome の CSS 詳細度が原因として特定できているが、実機は PO の次 Build で確認）。

## A. 試合設定の再デザイン（Prototype 3、隔離）
- Prototype: `/Users/Ludique/Documents/Codex/2026-10-31/cuescore-build95-ui/proto3/index.html`（種目・言語・幅・選択状態・時計・案内の色 A/B・数値メニューを切替）。Before（実機）／After 比較: `compare/cmp3_9ball_390_before_after.png`、`cmp3_states.png`、`cmp3_lang_320.png`。
- 縦配置: 見出しをスクロール領域内に置いてスペーサーを見出しの上に配置（旧: 見出し〜カード間に空白）。余白は 390×844 で上 ≈73pt／下 ≈77pt に分配、カード最小高と時計カード上余白を画面高に比例。小画面は本文のみスクロール、開始フッター独立。
- 未選択カード: 黄色の点線外枠・アバターの点線・黄色下線を撤去 → 薄いグレーの実線枠＋既存アバター＋黒い＋マーク。対象は未選択カードのみ（試合中の黄色状態は不変）。
- 案内: 既存承認キー `setupux.reason.p2` を再利用（新規翻訳キーなし）。対戦相手未選択の間だけカード内に表示（`aria-hidden`、VoiceOver はフッターの理由を 1 回だけ読む）。フッターの理由・開始条件・disabled は不変。色: **A（淡いブルーグレー）推奨**／B（薄いグレー）。文字コントラスト 7:1 以上（A 約 13:1）、アイコン併用。
- 検証（Prototype、実 Chrome 実座標）: 3 言語×4 幅×6 種目×時計 ON/OFF×選択 3 状態、2131 チェック／0 FAIL（横はみ出しなし、操作領域 44pt 以上、案内がカード内で重ならない、開始ボタンがタブ上、数値メニューが干渉しない）。
- 注意点: 日本語の案内は 2 行折返し（ja は「と」の後に改行候補を挿入、320 幅ではアイコンを省いて折返しを緩和）。製品実装時は表示上の改行ヒントのみで文言・ハッシュは不変。
- 製品への反映は PO のデザイン承認後の別 Implementation Gate。
