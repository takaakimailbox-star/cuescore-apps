# 113 — CueScore Localization P1 Formalization Decision（Decision 034）

**状態: Adopted / Official。** 2026年10月13日発行（Decision 034、Official Design Decision Log v2.10）。Product Owner の 2026-10-13 の 3 項目承認（PD-1〜3）に基づく。
**Scope:** 多言語化（Official 107／108）の **P1 の正式固定に関する判断のみ**。他の Phase・他の画面へ一般化しない。

## 1. 番号（fresh 確認、GitHub main `52c4b7f85a57072983109dd47077e1de2ffb6b39`）
- Decision Log は v2.9（Decision 001〜033）。本書 = **Decision 034**、Decision Log = **v2.10**（Decision 001〜033 は改変しない）。
- Official 文書: 発行前の最大番号は 112。**109 は Glossary 用に予約済み（使用しない）**。本書 = **Official 113**（Decision）、付随の Spec = **Official 114**（`114_CueScore_Localization_P1_Acceptance_Spec.md`）。113・114 は発行前に main に存在しないことを確認済み（衝突なし）。
- Official 107／108 は**改変しない**。本書・114 は 108 に対する「P1 正式固定の適用規則」を定める後続文書であり、108 が規範であり続ける。

## 2. Product Owner 承認（2026-10-13、明示）
| ID | 承認内容 |
|---|---|
| PD-1（U9） | 過去の実機 Visual Acceptance を採用する。同一画面の重複確認は不要。ただし既存 Evidence と承認範囲を照合し、**未確認画面を PASS にしない** |
| PD-2（S-B） | P1 では保存済み中断試合がある間の言語切替を許可しない。`LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false` を維持。S-B 有効化は Later／別 Gate。既存 T-SW の未検証項目を FAIL にも PASS にも変更しない |
| PD-3（L-RES-10） | P1 では確認済み範囲を受け入れる。実機 PWA・複数言語構成・Score P1 本体での直接測定等は NOT VERIFIED として後工程へ引き継ぐ。Official 108 の既存要件を無断で緩和しない |

## 3. 決定

### D034-1 U9（言語行の最終ラベル・選択 UI）— P1 としてクローズ
1. **P1 の言語 UI（U9）の形式を採用する**: 言語行 `言語 / Language`（固定の 2 言語ラベル、Chevron、既存 Settings 行の再利用、Settings「アプリ情報」カードの先頭、Decision 032）、言語選択画面（自動／日本語／English／简体中文、説明文、「適用して再読み込み」ボタン。ボタン縦位置は 3 言語で同一）。Official 108 の U9「DECISION PENDING」は **RESOLVED（P1 形式を PO が採用）**とする。Official 110 CF-4（U9 のクローズは Localization 側の別 Gate）は本 Decision が担う。
2. **採用の根拠は、Product Owner が明示した実機 Visual Acceptance 記録。** 記録の照合結果（詳細は `docs/implementation/CueScore_Localization_Decision_034_Official_Release_2026-10-13.md`）:
   - **A. Product Owner が明示確認した項目**（記録の原本は ChatGPTりおん＝司令塔が保持）: 2026-10-12 — English Settings OK／简体中文 Settings OK／About Version 1.2 OK／利用規約・プライバシーポリシー OK／Back OK。それ以前 — ja／en／zh-Hans の言語切替 OK、Home／Player／Settings OK、言語選択 UI は確認報告あり。Claude 側が直接保持する PO の記録: 2026-10-12 12:34 JST の Settings（日本語）Screenshot への「確認したよ。ok」。
   - **B. 画像・ログ・自動検証で独立に確認した項目**: Settings（ja）実機 Screenshot の行高さ実測（3 カード 1 画面、Bottom Navigation と重ならない）、Settings／言語選択画面の ja／en／zh-Hans Visual Evidence（375×812・390×844）とボタン縦位置の 3 言語同一、About の Version 単一定義と Native `MARKETING_VERSION` の一致検査、法務画面の導線・戻る・スクロールの自動検証、言語切替（手動優先・再起動後の保持）の Simulator PWA 実走。
   - **C. 未確認として残す項目**: 言語選択 UI は「確認報告あり」であり、PO の明示 OK の文言原本は Claude 側では未確認（りおん側の記録を参照）。U9 の対象外として、実機 PWA・他 iOS・他端末での UI、実際の iOS Dynamic Type（AC-SU-10。Decision 033 により Deferred）は NOT VERIFIED。
3. PO の確認記録を消去・縮小しない。ただし**証拠のない確認を追加記録しない**。PO が採用した形式を超える UI 変更は、新たな PO 確認を要する。U9 のクローズは、AC-SU-10（Dynamic Type）や実機 PWA の PASS を意味しない。

### D034-2 S-B — P1 は保守的規則（flag=false）で正式固定する
1. P1 は `LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false` のまま固定する。**保存済み中断試合がある間（S-B）および記録中（S-A）は、言語切替を許可しない**（S-A は従来どおり、S-B は保守的規則）。ユーザーへの表示: 「中断中の試合があるため、現在は言語を変更できません。」（3 言語の文言は catalog 済み）。中断試合が解消されれば変更可能。
2. S-B の許可・有効化（flag=true）は **Later／別 Gate**。本 Decision は有効化しない。Official 108 L-SW-8／L-SW-9 は**変更しない**（S-B の許可は P1 runtime 証明 PASS が効力発生条件、という規定のまま）。
3. T-SW の記録: **既存の Evidence を過大・過小に評価しない。** T-SW-1〜10 は隔離 headless Chrome の runtime で全 PASS（記録として保全）。WKWebView・実機 iOS ライフサイクル（pagehide／visibilitychange の順序）・PWA reload での S-B runtime は **NOT VERIFIED のまま**であり、FAIL にも PASS にも変更しない。S-B 有効化 Gate の入力として引き継ぐ。
4. S-B 有効化 Gate の最低条件（予告。本 Decision では決定しない）: WKWebView と実機での T-SW-2・5・7（S-B 許可に係る項目）と C1〜C6 の runtime PASS、C5 の D 項目（Spot・Pre-break Foul）の扱い、PO の最終承認、回帰条件。

### D034-3 L-RES-10 — P1 は確認済み範囲を条件付きで受け入れる
1. 受け入れ範囲（実測・突合済み、C=D 一致）: Simulator WKWebView／Safari 17 構成、Simulator PWA（standalone）2 構成、Simulator 診断アプリ WKWebView 4 構成、**実機 iPhone 16e の Safari（`["ja"]`→ja）**、**実機 iPhone 16e（iOS 26.6.2）の診断アプリ WKWebView（`["ja"]`→ja、deviceResolution・appPathResolved とも ja）**。詳細は `LRES10_Acceptance_Scope.md`。
2. **「PASS」と記録するのは上記の確認済み範囲のみ。** 実機のテスト対象外は **NOT VERIFIED として後工程へ引き継ぐ**: 実機 standalone PWA、実機で ja 以外／複数言語を設定した場合の値、他 iOS バージョン、Score P1 本体の WKWebView での直接測定（診断アプリは同一端末・同一 WebKit・同一設定・同一コアの別インスタンス）、iOS が 2 要素目以降の言語を公開するかの実機観測。
3. これは PO が承認した**範囲限定の受入**であり、Official 108 L-RES-10 の要件（Simulator の言語切替＋実機＋PWA での実測採取と表の突合）や言語解決アルゴリズム（L-RES-1〜11）を**緩和・改変しない**。未確認範囲は P6（Native／Regression）等の後工程で再実施し、完了まで L-RES-10 は「条件付き」とする。
4. 観測の記録（仕様変更ではない）: iOS Simulator（iOS 18.7）の WKWebView／Safari／PWA は、複数言語を設定しても `navigator.languages` の先頭 1 要素のみを返した。Official 108 L-RES-1 は `navigator.languages` を入力とするため、アルゴリズムは変更しない。
5. 再測定の要件: Native のローカライズ設定（`CFBundleDevelopmentRegion`／`knownRegions`、U11／P6）を変更する場合は、診断アプリの plist も合わせて再測定する。

### D034-4 P1 から P2 への移行条件
1. P1 が GitHub に正式固定されている（114 §6 の手順と Regression を満たす）。
2. 本 Decision（Official 113／114、Decision Log v2.10）が発行され、S-B=false・U9 クローズ・L-RES-10 条件付き受入が SSOT に記録されている（2026-10-13 に発行済み）。
3. P2 は「特性テストで挙動固定 → 移行」。**P2 の read-only 調査（日本語依存ロジックの台帳、`recordAnalysisEventV60(...)` の再監査、MutationObserver の分類）は先行可能だが、production 実装は別 Gate で PO 承認**。
4. P1 の source 正式固定は本 Decision の発行後の別 Gate（計画: `09_final_decision_rc/P1_Formalization_Plan_v2` の順序 2〜4）。
5. P2 の STOP: 分析数値が 1 つでも変化／保存値の変化／Observer 統合で ja 表示が変化／分類不能な依存（BLOCKED）。

## 4. 本 Decision が変更しないもの
Official 107／108／110／111／112 の本文、Decision 001〜033、言語解決アルゴリズム、S-A、言語キー `cueScore.language.v1`、保存データ（Match／Snapshot schema、Player ID、`registeredPlayerId`、`sharedMatchId`、QR、Backup、CSV、IAP、Free/Pro）、D1〜D10、U10、Dynamic Type の Deferred 判断（Decision 033）、Glossary PENDING、U3／U4／U6／U8／U11 の未解決状態、Native 設定（P6 以降）。

## 5. Official 108 との関係
| Official 108 | 本 Decision での扱い |
|---|---|
| Part IV P1「移行条件」: ja 差分 0 | **適用**（充足） |
| 同: Prototype の PO 確認（U9） | **D034-1 により充足**（PO の明示した実機 Visual Acceptance 記録の採用。照合は A／B／C に分離し、C は NOT VERIFIED のまま） |
| 同: T-SW 全 PASS（S-B の許可が確定。FAIL なら保守的規則） | **S-B の許可は確定しない（Later）。保守的規則（flag=false）で固定**。T-SW の未検証項目は PASS／FAIL にせず NOT VERIFIED。**108 の条文は不変**（適用規則は 114 §3） |
| 同: 言語解決表の実測突合 | **D034-3: 確認済み範囲を条件付きで受入**。未確認範囲は NOT VERIFIED として引継ぎ（要件は不変） |
| 同: Full Node 退行 0 | **適用**（充足: A 685／A＋B 695） |
| L-SW-8／L-SW-9、C1〜C6 | **不変**。S-B 有効化 Gate で適用 |
| L-RES-1〜11 | **不変** |
| U9 | RESOLVED（P1 形式の採用）。108 の U9 行は本 Decision を参照して閉じる |

## 6. 発行内容
Decision Log v2.10（Decision 034 を追加、001〜033 は byte 単位で維持）、`docs/official/113_…Decision.md`、`114_…Spec.md`、`docs/README.md`、`CURRENT_STATE.md`／`CURRENT_STATUS.md`／`handoff/CURRENT_DECISION.md`・`CURRENT_REPORT.md`、`docs/implementation/CueScore_Localization_Decision_034_Official_Release_2026-10-13.md`、番号ガードのテスト更新（最大 Official 番号 112→114、109 予約の検査は維持）と 113／114 用の docs テスト。Official 107／108／110／111／112 の本文は改変しない。Product source・P1／P2 source は変更しない。

## 7. 承認・発行
Product Owner の 3 項目承認（PD-1〜3、2026-10-13）に基づき、2026-10-13 に Official 発行（Documentation-only）。P1 の source の正式固定（commit／push）は別 Gate。
