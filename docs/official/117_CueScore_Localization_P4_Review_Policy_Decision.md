# 117 — CueScore Localization P4 Review Policy Decision（Decision 036）

**状態: Adopted / Official。** 2026年10月17日発行（Decision 036、Official Design Decision Log v2.12）。Product Owner の P4 レビュー方式承認（2026-10-17、明示）に基づく。
**Scope:** 多言語化（Official 107／108）の **P4（翻訳・競技用語レビュー）をどの方式で実施し、どの状態語で記録するか**のみ。他の未決事項・他の Phase へ一般化しない。

## 1. 番号（fresh 確認、GitHub main `e9bc96167b03459386d6a0b30584bb8eff2a009b`）
- Decision Log は v2.11（Decision 001〜035）。本書 = **Decision 036**、Decision Log = **v2.12**（Decision 001〜035 は改変しない）。
- Official 文書: 発行前の最大番号は 116。**109 は Glossary 用に予約済み（使用しない）**。本書 = **Official 117**（Decision）、付随の Spec = **Official 118**（`118_CueScore_Localization_P4_Review_Policy_Spec.md`）。
- Official 107／108／110〜116 は**改変しない**。108 の L-GLOS-2〜5 と AC-1 は条文のまま有効で、本書は「どの根拠でその状態へ進めるか」を追加定義する（108 と食い違う場合は、108 の語義を変えず、本書の新状態を別語として扱う）。

## 2. Product Owner 承認（2026-10-17、明示）
| ID | 承認内容 |
|---|---|
| PD-P4R-1 | 外部の人間レビュアーを**必須としない** |
| PD-P4R-2 | ChatGPT りおんによる公式資料（競技団体の規則等）の調査を行う |
| PD-P4R-3 | AI による英語／簡体字中国語の翻訳検証を行う |
| PD-P4R-4 | 競技用語と重要警告を重点検証する |
| PD-P4R-5 | 3 言語の実画面表示を検証する |
| PD-P4R-6 | 残余リスクを明記する |
| PD-P4R-7 | 最終承認は Product Owner が行う |
| PD-P4R-8 | 公開後の誤訳指摘は検証して改善する |

上記は**品質検証や既存の安全要件の省略を意味しない**。AI の検証を人間の独立レビューと表記してはならない。翻訳の正しさを根拠なく保証してはならない。

## 3. 決定

### D036-1 レビュー方式
P4 は、(a) 従来の「指名された人間レビュアー」経路、(b) 本書の **AI 検証＋PO 最終承認**経路、のいずれでも進められる。(b) では外部の人間レビュアーを要しない。いずれの経路でも、P4-APPROVED は Product Owner の承認記録を必要とする。

### D036-2 状態モデルの追加（既存状態の意味は不変）
| 状態 | 意味 |
|---|---|
| `P3-PROVISIONAL` | 既存。P3 で投入した暫定訳 |
| `P4-REVIEWED` | **既存・意味不変**: 指名された人間のレビュアーが確認した。**AI の結果を `P4-REVIEWED` と読み替えない** |
| **`P4-AI-VERIFIED`（新設）** | AI が、一次資料・アプリ内 Official 定義・実画面に照らして検証し、**キー単位の Evidence と残余リスクを記録した**。人間の独立レビューではない |
| `P4-APPROVED` | 既存: Product Owner が承認した（承認記録必須） |
遷移: `P3-PROVISIONAL → P4-AI-VERIFIED → P4-APPROVED`、または従来の `P3-PROVISIONAL → P4-REVIEWED → P4-APPROVED`。Product Owner の判断が必要な文言は `P3-PROVISIONAL` のまま保持し、`P4-AI-VERIFIED` にしない。既存 1,331 キーのレビュー履歴は維持する（履歴は消さず追記）。

### D036-3 Official 108 AC-1 との関係
AC-1「全キー `P4-APPROVED`」は変更しない。本書の経路でも、PO の承認記録がない限り `P4-APPROVED` を付与しない。`P4-AI-VERIFIED` は**承認ではなく**、リリース候補の条件を満たさない。

### D036-4 用語（L-GLOS-5）
用語を `CONFIRMED` にできるのは、(i) 一次資料の逐語確認、または (ii) Product Owner／競技者の承認記録、のいずれか（108 のまま）。AI の調査は**根拠の収集と照合**であり、それ単独では `CONFIRMED` の根拠にならない。PO が残余リスクを承認した記録は (ii) として扱える。資料間で版・意味が食い違う場合は統合せず、食い違いを記録する。アプリ内 Official の意味と一般の国際競技規則は区別して記録する。

### D036-5 重点検証
優先順位: A 競技ルール・記録操作、B ファール・勝敗・得点、C Match Result／Analytics、D Backup／Restore、E 削除確認・警告・エラー、F Free／Pro、G 一般 UI。A〜F は、根拠・照合した一次資料または Official の節・残余リスクをキー単位で記録する。

### D036-6 残余リスクの明示
AI 検証キーの Evidence とリリース資料に、「**人間の独立レビューは実施されていない**」「誤訳の可能性が残る」ことを明記する。

### D036-7 公開後の修正手順
誤訳の指摘を受けた場合: 指摘の記録 → 一次資料／Official／実画面での検証 → catalog のみを変更する修正 → ja 表示不変・Full Node・Data／QR 保護の検証 → Review Ledger／manifest の履歴更新。製品ロジック・保存データには触れない。

### D036-8 状態を変更しないもの
U3（法務ページ注記）、U4（Paywall の法的／Apple 要件）、U8（Backup Share Sheet）、U11 は **DECISION PENDING のまま**。

## 4. 本 Decision が変更しないもの
Official 107／108／110〜116 の本文、Decision 001〜035、言語解決アルゴリズム、S-A、S-B（`LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false`）、言語キー、保存データ（Match／Snapshot schema、Player ID、`registeredPlayerId`、`sharedMatchId`）、`resultLabel` の日本語 canonical、QR／Backup／CSV 契約、Analytics 数値、IAP Product ID、Free／Pro 契約、日本語 UI、Version／Build、Apple 配布状態。本 Decision 自体は Documentation-only。

## 5. 発行内容
Decision Log v2.12（Decision 036 を追加、001〜035 は byte 単位で維持）、本書、Official 118、`docs/README.md`、`CURRENT_STATE.md`／`CURRENT_STATUS.md`、番号ガードのテスト更新（最大 Official 番号 116→118、Log v2.11→v2.12）。

## 6. 承認・発行
Product Owner の承認（2026-10-17）に基づき、2026-10-17 に Official 発行（Documentation-only）。P4 の翻訳 QA、P5、P3-⑥ の各実装は本書の範囲外で、別の Gate で行う。
