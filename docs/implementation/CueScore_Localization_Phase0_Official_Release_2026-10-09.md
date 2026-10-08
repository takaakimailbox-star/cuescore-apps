# CueScore Localization Phase 0 — Official Release Evidence（2026-10-09）

- Gate: `CUESCORE I18N PHASE 0 — OFFICIAL RELEASE PUBLISHED`
- Decision ID: `CUESCORE-I18N-PHASE0-OFFICIAL-RELEASE-20261009`
- 対象: Decision 031 ／ Official 107 ／ Official 108 ／ Official Design Decision Log v2.7
- Product Owner 承認: 2026-10-08（D1〜D10・U10）、2026-10-09（Official 正式発行）。ChatGPTりおんの最終 RC レビュー: PASS。
- 範囲: **Documentation／Evidence のみ。** production source、Match schema、QR／Backup format、IAP、Free／Pro、Version／Build、Score RC、Apple 操作は変更・実施していない。

## 1. External GitHub baseline

| 項目 | 値 |
|---|---|
| Repository | `takaakimailbox-star/cuescore-apps`（`https://github.com/takaakimailbox-star/cuescore-apps.git`） |
| Expected / fresh fetch main | `117feddc802b9c0d7eccbdced0d96de84f728bf7`（`git ls-remote`・`origin/main`・`HEAD` が一致。branch `main`、working tree clean） |
| 作業環境 | Claude 専用の使い捨て clone。Codex の worktree は未接触。同一 repo の他 Writer: fetch 時点で main の進行なし |

## 2. 採番監査（fresh main）

| 検査 | 結果 |
|---|---|
| Decision 031 | 未使用（Decision Log v2.6 の番号付き Decision は 001〜030 が連続。repo 全体に `Decision 031` の記載 0） |
| Official 107 / 108 | 未使用（`docs/official/` の md 最大は 106。README 登録簿も 106 まで） |
| Decision Log v2.7 | 未発行（`docs/official/` に `*v2.7*` なし） |
| 既存 Official 001〜106 | 変更 0（`git diff --name-only -- docs/official` = 0 件） |
| Official 文書番号 103〜106 と Decision 番号 | 別体系として扱った |
| 衝突 | **0**。採番は変更していない |

## 3. 発行した文書

| 文書 | 配置 | sha256（先頭 16 桁） |
|---|---|---|
| Official 107（Decision 031） | `docs/official/107_CueScore_Localization_Decision.md` | `e274cec70e3f9789` |
| Official 108（Specification v1.0。Part I〜IV） | `docs/official/108_CueScore_Localization_Spec.md` | `c86a48331d4780e0` |
| Official Design Decision Log v2.7 | `docs/official/07_CueScore_Official_Design_Decision_Log_v2.7_Official_Release.docx` | `07a6ce0975265409` |
| （保全）Decision Log v2.6 | `docs/official/07_CueScore_Official_Design_Decision_Log_v2.6_Official_Release.docx` | `f16e45467ae3d67e`（変更なし） |
| Glossary（**Draft**。Official 109 は未作成） | `docs/proposals/CueScore_Localization_Glossary_DRAFT_2026-10-08.md` | `fccb7a02cc231178`（Phase 0 Rev.2 C と同一） |

**入力（最終 RC、`CueScore_i18n_Official_RC_031_107_108_v2.7_Final.zip`、作業領域の RC 9 ファイルと同一を確認）:** 107 RC `c3280de39537c775`、108 RC `c6b262ec8cc3a59e`、Log v2.7 RC `5202f829a1e44ef2`。古い Rev.1 / Rev.2 / 旧 RC は登録していない。

**RC → Official の編集（状態表記のみ。仕様内容は変更なし）:**
- 107（9 行差）: Status を「Adopted…Implementation NOT STARTED」、発行日、Decision 031 の収録先（v2.7）、`108_…_RC.md`→`108_…Spec.md`、§14 状態。**§3.2 の条件付き事項・未検証は維持**。
- 108（24 行差）: Status／仕様日、§17 の状態文言と付随行（採番確認済み・U1 の効力は P1 の runtime 証明）、§18、Part III 注意書き・AC-S7、Part IV P0 の Evidence／移行条件、末尾の状態。U3〜U11 の DECISION PENDING・S-A/S-B/S-C・C1〜C6・T-SW-1〜10・V1〜V7・3×3・Build 84 双方向互換は**変更なし**。
- Log v2.7: 表紙・文書管理表・Version 行・制定日・Index 031「有効」・Decision 031 の「採用時の最終決定」「Current Implementation Status」「直接資料」・Revision History 2.7 行（Official Release、2026-10-09）・RC 注記の削除・フッター・メタデータ。

## 4. Decision Log v2.7 の表示品質（全ページレンダリング）

| 検証 | 結果 |
|---|---|
| 構造 | zip 整合 OK、18 XML パーツすべて well-formed。サムネイル（v2.6 の表紙画像）は stale 回避のため含めない |
| **既存 Decision の保持** | v2.6 の `document.xml` と要素単位で比較し、**Decision 001〜030 の 678 要素はバイト同一**（挿入は Decision 031 の 32 要素のみ）。Decision Index の旧 31 行・Revision History の旧 15 行も同一（各 1 行追加のみ） |
| レンダリング方法 | **macOS Pages**（既に起動中のアプリを AppleScript で操作し、docx を開いて PDF へ書出し、保存せず閉じた）→ PDFKit で全ページを画像化・本文抽出。v2.6 も同条件で書出して比較 |
| ページ数 | v2.7: **37 ページ**／v2.6: 35 ページ（増分は Index 1 行・Decision 031・Revision 行・Pages の再フロー） |
| 本文差分（v2.6 と v2.7 のレンダリング本文。ヘッダー／フッターを除外） | 発生した差分は 8 か所のみで、すべて意図した変更: 表紙・文書管理表の版数／日付、Index の 031 行、**Decision 031 セクション（86 行）**、Revision History の 2.7 行、正式採用宣言の v2.7 化。**既存 Decision の本文差分 0**。RC 注記は削除済み・「Release Candidate」の語は 0 |
| ヘッダー／フッター | 37／37 ページで「CUESCORE APPS \| Official Design Decision Log v2.7」と「Official Release \| 2026-10-09」を確認。v2.6 のフッターは固定文言で、**ページ番号フィールドは v2.6・v2.7 とも無い**（仕様どおり。追加していない） |
| 目視確認したページ | 表紙（p1）、文書管理表（p2）、Decision Index（p3 ほか）、Decision 030 末尾〜Decision 031（p29–30）、Revision History と正式採用宣言（p35、p37）。文字切れ・表の欠落・レイアウト崩れなし。Decision 031 の欠落なし |
| 近空白ページ | v2.7 の p34（「Revision History」見出しのみ）は v2.6 の p32 と**同じ挙動**（見出し直後に表が次ページへ送られる）。v2.6 から継承した既存のレイアウトで、今回の変更による新規の空白ページではない |
| **NOT VERIFIED** | **Microsoft Word 実機での表示**（Word はレンダリングに使っていない。Pages での全ページ検証と XML 要素比較のみ）。QuickLook は表紙のみ |

## 5. D1〜D10 / U10 / 契約の反映

- 107（D1〜D10 全件）、108（各 D を 2〜13 箇所で参照）、Log Decision 031（D1〜D10 全件）で反映漏れ 0。U10（繁体字が第一優先なら ja。8 例）は 107 §2.3、108 §3、Log で一致し矛盾 0。
- **Data Compatibility:** Match schema、Player ID、`registeredPlayerId`、`sharedMatchId`、Match events、`break_result.resultLabel` 日本語 canonical、scoring、analytics、Backup format、QR format、IAP Product ID、Free／Pro は変更しない（クラス A/B/C）。
- **QR Compatibility:** V1〜V7、3×3 言語組合せ、Build 84 双方向互換、atomic import、duplicate protection。**設計文書の登録のみで、runtime PASS ではない。**

## 6. Glossary 状態（Draft 維持）
Official 109 は作成していない。中国語競技用語、マス割、JPA 正式名称、Dead Ball、Rack、Inning、Run、Rotation、Push Out の未確認訳語は **PENDING**。P3＝暫定翻訳、P4＝正式レビュー・承認。`docs/proposals/` に Draft として保管し、README の「Drafts … are not official」運用と整合。

## 7. 条件付き仕様・未解決・NOT VERIFIED

- **S-B（保存済み中断試合での言語切替）:** 効力は P1 の runtime 証明（C1〜C6、T-SW-1〜T-SW-10）PASS が条件。**未実施。** 失敗時は S-B も切替不可（保守的制限）として STOP。
- **Decision Pending（独自に解決していない）:** U3（法務未翻訳期間の注記）、U4（Paywall 法的／Apple 要件文言）、U6（`alert/confirm/prompt` の OS ボタン言語）、U8（Backup Share Sheet 文言）、U9（言語行 UI。P1 Prototype の PO 確認）、U11（`CFBundleDevelopmentRegion`。P6 前の Native 確認）。決定時期と STOP 条件は Official 108 §17。
- **NOT VERIFIED:** iOS WKWebView／PWA の実際の `navigator.languages` 形式・CLDR 写像、進行中試合 snapshot の表示言語依存の不在、Word 実機表示、既存 Official（UI Kit／UI Components 等）docx 全文の意味的通読（語句検索のみ）、WPA 規則本文・中国側用語の一次資料。

## 8. SSOT 同期
`docs/README.md`（SSOT 一覧 7 を v2.7、現行 Decision Log 段落、登録簿へ 107／108、Localization 状態、Glossary Draft の所在）、`docs/CURRENT_STATE.md`（先頭に Localization 節を**追記**。既存記録は削除・変更なし）、`docs/CURRENT_STATUS.md`（Updated、Localization Gate 行。Version 1.2 Build 84 の Gate 行は維持）、`docs/handoff/CURRENT_DECISION.md`／`CURRENT_REPORT.md`（本 Gate）。状態: Phase 0 Official Specification Published／P1 NOT STARTED／Localization Implementation NOT STARTED／Glossary DRAFT・PENDING／Product source UNCHANGED／Version 1.2 Build 84 の Release 状態は不変。

## 9. Documentation tests

実行環境: Node `v24.21.0`（ChatGPT.app 同梱の既存バイナリを**読み取り実行**。インストール・環境変更なし）。

| テスト | 結果 |
|---|---|
| `tests/localization-official-docs.test.mjs`（新規。8 テスト: 107／108 の採番・109 不在・既存 Decision 001〜030 のバイト保持・Decision 番号 001〜031 の連続・v2.7 が Official かつ RC 表記なし・D1〜D10・U10・Part I〜IV・Pending 維持・要件 ID 参照・README 索引・Glossary Draft 状態・SSOT 同期・Build 84 記録の保持） | **8／8 PASS** |
| 既存の Documentation 関連: `cue-series-web`、`match-sharing-later-decision`（`CURRENT_STATE.md` の既存文言を assert。維持を確認）、`official-website-v1`、`settings-legal-links` | **PASS**（上記と合わせ 26／26 PASS） |
| Full Node（`node --test tests/*.test.mjs`） | **621 件中 619 PASS／2 FAIL**。FAIL は `native v1 remains local-first and bundles every offline legal page`、`generated and copied native index use the current source implementation`。**原因は環境:** `native-web/`（gitignored の生成物）および `ios/App/App/public/index.html`（`cap sync` の生成物）が fresh clone に存在しないこと（ENOENT）。**変更前の pristine `HEAD` でも同じ 2 件が同じ理由で FAIL**（`git archive HEAD` で確認）。今回の変更（docs・tests の追加のみ）とは無関係で、製品 FAIL ではない。Capacitor の `cap sync` は `npm install` 等の環境変更を要するため実施していない（`scripts/build-native-web.mjs` による gitignored の `native-web/` の一時生成は試し、削除済み）。**2 件は未解消のまま NOT VERIFIED（Release 構成の native parity は本 Gate の範囲外）** |
| `git diff --check` | PASS（tracked 変更・untracked を含む） |
| Product source 変更 | 0（tracked の非 docs 変更 = 0） |

## 10. Commit scope audit
A Official 107、B Official 108、C Decision Log v2.7、D SSOT（README／CURRENT_STATE／CURRENT_STATUS／handoff 2）、E 本 Evidence、F `tests/localization-official-docs.test.mjs`、G Glossary Draft。H Generated／local-only = 0（`native-web/` は削除）、I Unknown／unrelated = 0。credential／token／secret／個人データ／ローカル絶対パスの混入 0。

## 11. 禁止事項の確認
production source、Match schema、QR／Backup format、IAP、Build 85、Archive、Upload、TestFlight、App Store Connect、Release、Score RC、P1 Implementation、3 言語 UI 実装、未承認 Glossary の正式採用: すべて 0。
