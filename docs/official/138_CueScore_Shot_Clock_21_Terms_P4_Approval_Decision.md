# 138 CueScore Shot Clock — 21 Terms P4 Approval Decision

**状態: Adopted / Official（Product Ownerの承認委任に基づく、りおんとClaudeのあの最終翻訳QA、2026-10-29）。** Decision 048、Official 138（本書）・139（仕様／Glossary後継）。
**Scope:** ショットクロックの21キー（Decision 046の20語＋Decision 047の`shotclock.extTime`）の翻訳（ja／en／zh-Hans）の最終QAと、`P4-APPROVED`への正式承認、主カタログへの移動。**P1比較UI、人間の独立レビュー、U4／U11、保存データ、QR、Backup、IAP、価格、地域には関与しない。**

## 1 番号（fresh確認）

- 直前はDecision 047／Official 136・137／Decision Log v2.23（main `f9df654`で確認）。本決定は未使用の**Decision 048**、本書は**Official 138**、仕様は**Official 139**。
- Decision 001〜047、Official 107〜137（Official 109 Glossaryを含む）は**改変しない**。Official 109は保護し、本決定の用語はOfficial 139が**後継の追補**として追加する（109と139を併せて現行Glossary）。
- Decision Log v2.24（docx）を本決定で発行する（Decision 001〜047は変更なし）。

## 2 Product Ownerの承認意思（条件付き委任）

2026-10-29、POの意思表示（司令塔経由）:「りおんとのあが判断してOKなら、貴章もOKだよ」。これを、21キーについて**品質判断を条件とするP4承認の委任**として記録する。候補の**無条件承認ではない**。

## 3 Decision

### D048-1 最終翻訳QAの実施と結果
21キーをja／en／zh-Hansで、動作との意味一致、Glossary 109・主カタログとの整合、競技用語（World Nineball Tour §5、中国の台球規程の語）、自然さ、ボタンと状態語の使い分け、VoiceOver文言と変数置換、表示幅、誤訳・漏れ・意味の逆転の観点で照合した。結果は`docs/implementation/CueScore_ShotClock_21_Terms_Final_QA_and_Approval_2026-10-29.md`。**重大な誤訳・未解消の意味不一致なし。**

### D048-2 修正した6キー
- en `shotclock.supplement`: 「Count the time manually」→「Time each shot manually」。
- zh-Hans「延长」系を競技規程の語「延时」へ: `shotclock.extend`（延时）、`shotclock.extTime`（延时时间）、`shotclock.aria.extend`（延时，增加{sec}秒）、`shotclock.aria.undo`（撤销延时）、`shotclock.aria.extCount`（已延时{count}次）。
- 他の15キーは候補のまま承認（出杆计时器、已暂停、Undo、Time up を含む）。

### D048-3 正式承認
21キーを**`P4-APPROVED`**（PO委任に基づく条件付き）とする。承認記録は`tests/fixtures/p4/po-approval-shotclock.json`（日付、承認者、委任の根拠、キーごとの残余リスクR0／R1／R2、[ja, en, zh-Hans]のハッシュ）。承認後に訳文が変わった場合は、記録とハッシュの整合が崩れ、再承認が必要になる（既存P4と同方式）。

### D048-4 残余リスク（偽らない）
- **人間の独立レビューは未実施**。`P4-REVIEWED`は付与しない。`P4-APPROVED`と`P4-REVIEWED`は別である。
- 中国語の競技一次資料（中国台球協会の競技総則の原文）は**NOT VERIFIED**（二次資料のみ）。R2: zh-Hansの出杆计时器、延时、延时时间、时间到。
- VoiceOverの実機での聴取は未検証（Decision 043により非ブロッキングの推奨確認）。

### D048-5 主カタログへの移動
21キーを主カタログ（ja／en／zh-Hans）へ移し、暫定カタログ`i18n-catalog-shotclock-v1.js`（CANDIDATE）を退役する。`shotclock-v1.js`は主カタログを`cueT`で読む。表示の語は承認訳のとおり。時計の計算、保存schema、QR、Backupは変更しない。

### D048-6 Glossaryの後継
Official 139に、ショットクロック用語（S01〜S12）の対応表を追補する。Official 109の38語（CONFIRMED）は変更しない。

## 4 本Decisionが変更しないもの
ショットクロックの仕様（Decision 046／047）、保存データ（Match／Snapshot schema、`cueScore.shotClock.v1`）、QR、Backup、Free／Pro、IAP、価格、販売地域、言語解決、S-A／S-B、U4／U11、Official 109、P1比較UI（正式採用していない）、セット方式、Build 83 RCA。

## 5 承認・発行
PO委任に基づき2026-10-29に発行。製品への反映は、主カタログへの移動（上記D048-5）と承認記録の追加。Version／Build番号、TestFlight、App Storeの操作は別Gate。
