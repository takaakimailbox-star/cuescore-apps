# 114 — CueScore Localization P1 Acceptance Spec（Decision 034 付随 Spec）

**状態: Adopted / Official（2026-10-13 発行）。** Official 108 を改変せず、P1 正式固定の適用規則・受入マトリクス・引継ぎ台帳を定める。作成: △ Claudeのあ ／ 日付: 2026-10-13 ／ 基準: GitHub main `52c4b7f85a57072983109dd47077e1de2ffb6b39`、親: Official 113（Decision 034）

## 1. 目的と優先関係
P1（i18n 基盤＋日本語不変 Prototype＋Settings R）を、S-B=false の保守的規則で GitHub に正式固定する際の**受入条件・分類・引継ぎ**を一意に定める。**Official 108 が規範**であり、本書は 108 の P1 移行条件の「適用規則」である。108 と食い違う場合は 108 が優先し、食い違いは Decision で解消する（本書は 108 の条文を改変しない）。

## 2. 分類の定義
A 完全 PASS／B 条件付き PASS（条件・未検証部分を併記）／C NOT VERIFIED（PASS でも FAIL でもない）／D FAIL・BLOCKED。**C を PASS に、B を A に読み替えない。**

## 3. P1 受入マトリクス（P1F-ACC。既存 Evidence ＋ 2026-10-13 時点の fresh 確認）
| ID | 項目 | 分類 | 根拠・条件 |
|---|---|---|---|
| P1F-1 | Full Node | A | 最新 main＋P1: 685/685、＋Settings R: 695/695（fail 0、skip 0、テスト削除・弱体化 0） |
| P1F-2 | 日本語 UI 不変（P1） | A | ja DOM 比較 6 状態＋Restore 5 状態、差は言語行のみ。Settings R の ja Settings 変更は Decision 032 の意図的変更（対象外）。PO が実機 ja Settings を確認 |
| P1F-3 | 言語解決表（AC-2、U10 含む） | A | 単体テスト全ケース、診断アプリ focused 33/33 |
| P1F-4 | L-RES-10 | B | Decision 034 D034-3 の確認済み範囲のみ PASS。未確認範囲は §5 の引継ぎ台帳 |
| P1F-5 | 3 言語切替（S-A 拒否、書込みは言語キーのみ、reload 1 回、失敗時ロールバック、TOCTOU） | A | 単体＋隔離 runtime＋Simulator PWA（手動 English 優先・再起動後保持）。実機: PO が言語切替（ja／en／zh-Hans）OK を明示確認（記録の原本は りおん） |
| P1F-6 | 言語永続化（AC-3） | A | 独立キー、不正値は auto、Backup／QR／CSV に出ない |
| P1F-7 | Settings R（Decision 032、Official 110／111） | A（PO 実機確認）／AC-SU-10 は Deferred | PO 明示確認: Settings（ja／English／简体中文）、About Version 1.2、利用規約・プライバシーポリシー、Back（2026-10-12、記録の原本は りおん）。ja は Screenshot の実測で独立確認。AC-SU-10（Dynamic Type）は Decision 033 により Deferred（PASS ではない）。Official 111 の AC 表は改変しない |
| P1F-8 | U9 | A（D034-1。PO 採用） | PO が実機 Visual Acceptance 記録を採用（RESOLVED）。A: PO 明示確認（Settings 3 言語、言語切替 ja／en／zh-Hans、Home／Player／Settings）／B: 画像・自動検証・Simulator PWA 実走／C: 言語選択 UI は「確認報告あり」（PO 明示 OK の文言原本は りおん側）。AC-SU-10・実機 PWA は C |
| P1F-9 | Restore Fix B | A（自動）／実機 Physical は C | Restore 41、異常終了 65、Back UX B 21、未確定入力 14、Undo 4、旧 snapshot 19。Back UX B は PO が Visual Accepted（2026-10-10） |
| P1F-10 | C3／C4／C6／T-SW-4 | A | C3 60 run、C4 8 ケース、C6 9 run、T-SW-4 7 run |
| P1F-11 | C5 | B | 現行機能範囲の条件付き PASS（A 本番 runtime／B 隔離／C 本番到達不能／D Spot runtime NOT VERIFIED、Pre-break Foul は crafted proof のみ）。生成経路が有効化されたら再検証 |
| P1F-12 | T-SW-1〜10 | B | 全 PASS は隔離 headless Chrome の runtime。WKWebView・実機ライフサイクル・PWA reload は C（FAIL でも PASS でもない） |
| P1F-13 | PWA／Offline（AC-15） | B | 隔離 Chrome（SW install・3 言語 offline 起動・更新経路）、登録漏れ検知テスト、Simulator PWA。実機 PWA・WKWebView の SW 挙動は C |
| P1F-14 | 保存データ不変（AC-16、クラス A/B/C） | A | Control 比較・Write-trap・Match 正規化値の 3 言語一致、`resultLabel` は日本語 canonical |
| P1F-15 | QR／Backup 互換 | B | Match Sharing 122、Backup/Restore 35 PASS。match-sharing 系は未変更（最終変更は Build 84 以前）。Build 84 出荷物との hash 照合、QR 3×3 言語、双方向の実機互換は C |
| P1F-16 | Free/Pro（AC-17）／Cloud 非表示（AC-18） | A | Full Node |
| P1F-17 | Native（AC-19、parity） | A | `ios/` 差分 0、Score P1 ビルドの `public/` = native-web、`index.html` sha256 一致（`936f5d10…3df1`）。Native のローカライズ設定は P6 |
| P1F-18 | PO Physical Acceptance（P1 全体） | B | PO 実機確認済みの画面: Home／Player／Settings（3 言語）／言語切替／法務（利用規約・プライバシーポリシー）／Back／About Version、Back UX B（Visual Accepted）。確認していない画面・状態と、P1 全体の「Physical PASS」の PO 明示宣言は未記録（自動記録しない） |
| P1F-19 | S-B | — | P1 の挙動は保守的規則（flag=false）。有効化は Later（D034-2） |
D（FAIL／BLOCKED）: 0 件。

## 4. S-B 保守的規則の仕様（P1 の挙動）
- P1F-S1: `LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false`（正式固定時に静的検査で確認する）。
- P1F-S2: 記録中（S-A）は拒否（`BLOCKED_ACTIVE_MATCH`）、保存済み中断試合あり（S-B）は拒否（`BLOCKED_SAVED_INTERRUPTED_MATCH`）、状態を判定できない場合は拒否（`GUARD_UNAVAILABLE`）。拒否時に保存データ・言語キーを変更せず、reload しない。
- P1F-S3: 拒否の理由を言語行に表示する（3 言語、catalog 済み）。
- P1F-S4: S-C（中断試合なし）では切替を許可（書込みは言語キー 1 件、reload 1 回、失敗時はロールバック）。
- P1F-S5: S-B 許可に係る T-SW（2・5・7 の flag=true 側）と C1〜C6 の S-B 許可証明は、S-B 有効化 Gate の条件とする。隔離 Chrome の PASS は Evidence として保全し、WKWebView・実機ライフサイクル・PWA reload の追加証明を求める。

## 5. 引継ぎ台帳（NOT VERIFIED の後工程への引継ぎ）
| 項目 | 引継ぎ先 | 備考 |
|---|---|---|
| 実機 standalone PWA の `navigator.languages`・offline | 実機 PWA Gate（P6 前）／P6 | 手順は `05_design/pwa_diag_lan/PROCEDURE.md` |
| 実機で ja 以外／複数言語を設定した値、他 iOS | P6（Native／Regression）／任意の実機 Gate | 端末設定の変更は PO 判断 |
| Score P1 本体 WKWebView での直接測定 | P6（Release 構成。検査不可のため診断アプリ等で代替継続） | 診断アプリは別インスタンスと明記 |
| iOS が 2 要素目以降を公開するかの実機観測 | 同上 | アルゴリズムは不変 |
| S-B の WKWebView・実機ライフサイクル・PWA reload、C5 の D 項目 | S-B 有効化 Gate | flag=false 維持 |
| 言語選択 UI の PO 明示 OK 文言の原本確認（「確認報告あり」の裏付け） | 記録管理（りおん側の原本を参照） | U9 のクローズには影響しない |
| P1 全体の PO Physical Acceptance（確認していない画面・状態） | P5／P6 | PO の明示宣言なしに自動記録しない |
| QR 3×3 言語、Build 84 出荷物との hash 照合、双方向の実機互換 | P6 | Official の再利用規定は hash 一致時のみ |
| AC-SU-10（Dynamic Type） | Decision 033（Later） | |
| 診断アプリ LRES10Diag の削除 | 別 Gate（PO 承認） | 今回は削除しない |

## 6. 正式固定の順序と手順（commit／push は別途の明示承認）
1. **Decision の発行**（docs のみ。2026-10-13 に実施）: Official 113／114、Decision Log v2.10、`docs/README.md`、SSOT、番号ガードテスト更新（最大 Official 番号 112→114。109 予約の検査は維持）。→ docs 系テスト＋Full Node。
2. **source commit A**: P1 最終差分（tracked 13＋untracked 9）。→ Full Node 685（発行後の docs テスト分を加算した数が期待値）。
3. **source commit B**: Settings R 増分。→ Full Node 695（同）。
4. **docs commit C**: P1 の状態（S-B=false、受入マトリクス、引継ぎ台帳、Evidence 永続保存先）を CURRENT_STATE／STATUS／handoff に記録。
※ 発行（1）を source（2・3）より先にする理由: source の正式固定時に、S-B=false・U9・L-RES-10 の根拠（Decision 034）が main に存在し、番号ガード・SSOT と整合するため。ただし 1 を終えた main に対して 2・3 を適用するので、**各ステップ前に main の hash を再確認し、期待 identity（A＋B の tree 差分 sha、`index.html` sha256）と照合**する。
- 同一 repo の同時 Writer 禁止、既存 dirty worktree・Codex worktree・Score RC は触れない。
- 各 commit 後と最終に Regression（§3 P1F-1）、`ios/` 差分 0、flag=false、native-web parity、`index.html` 同一性。
- Rollback: push 前は隔離 clone 破棄のみ。push 後は force push なしで commit を逆順に revert。
- STOP: main の変化／conflict／期待 identity 不一致／テスト fail・skip・削減／`ios/` 差分／flag が false 以外／ja DOM の予期しない差／保存データ差分／秘密情報の混入。

## 7. P1 から P2 への移行条件
Decision 034 D034-4 のとおり。P2 の read-only 調査は先行可、production 実装は別 Gate。

## 8. 受入基準（本 Spec 自身の AC）
- AC-P1F-1: 113／114 の番号が main に存在せず、109 が使われていない。
- AC-P1F-2: Official 107／108／110／111／112 の本文差分 0。
- AC-P1F-3: 受入マトリクスの C 項目が PASS として SSOT に記録されていない。
- AC-P1F-4: 正式固定後の source が §6 の identity と一致し、flag=false。
