# CueScore Apps — Settings Unified Design Specification v1.0

**Status:** Adopted / Official（Decision 032 / Official 110 の仕様）。Implementation NOT STARTED。製品実装は別 Gate。

**Decision:** Decision 032（Official 110）／ **Official document number:** 111（本書）／ **Official 109 は Glossary 用に予約済み（使用しない）**
**Scope:** Settings、言語 / Language 行、About CueScore、利用規約、プライバシーポリシー。**他画面へ一般化しない。**
**Baseline:** main `8a40a2dac7505c6f9bdbc0b8a7e31fc3bc6d00f2`
**Reference:** Settings Unified Design Prototype（R案）、Prototype 追加実測（T案: 角丸 20pt、U案: 正式仕様の行高さ。830／831px の境界を含む）

要件の強さは SHALL / SHALL NOT（必須）、SHOULD（推奨）で示す。

---

## 1. 範囲と優先順位
- SU-001: 本仕様は Settings に限り、Official 84（Build 31 Settings）の該当節と Decision 014 の該当記述を後続置換する（Official 110 §3、§4.3）。置換対象外の記述は有効のまま。
- SU-002: Settings 以外の画面、Design System v2.1 の 52pt 規則（`card.minTouchRow`、Picker Row 52pt min、Text Field 52pt min ほか）は変更しない（SHALL NOT）。
- SU-003: 判断優先順位は 既存機能の保持 → 操作領域 44pt 以上 → 文字サイズの維持 → 余白の整理 → Bottom Navigation 固定 → Safe Area。画面を切り詰めて操作不能にしてはならない（SHALL NOT）。

## 2. 構成
- SU-010: Settings は次の順に3つのカードで構成する（SHALL）: ① プラン ② データ管理 ③ アプリ情報。各カードの前に見出しを置く。最下部に「© 年 CueScore Apps」を置く。
- SU-011: ①プラン: 現在のプラン状態行、購入情報行。②データ管理: バックアップ、データ復元、データ削除（クラウド同期行は非表示のまま。Official 71 / 72）。③アプリ情報: 言語 / Language、About CueScore、利用規約、プライバシーポリシー。
- SU-012: 独立した CueScore ロゴ、独立した Version 表示、プランの行ラベル「プラン」、中間スペーサーを置いてはならない（SHALL NOT）。
- SU-013: 3カードは同一のカード形状・外枠・区切り線・左右余白・矢印を用いる（SHALL）。

## 3. カード・行の寸法と形状
| 項目 | 要件 | 根拠 |
|---|---|---|
| カード角丸 | 20pt（SU-020） | DS v2.1 `card.radius` |
| 外枠 | 1px（`--settings-line`）。カード上枠は 1px のみで、先頭の表示行に上線を付けない（SU-021） | DS `card.border`。旧: 2.00px → 新 1.00px |
| 区切り線 | 表示行同士の間のみ 1px。非表示行（クラウド同期）に隣接して二重線にしない（SU-022） | Official 71 / 72 |
| 行の左右余白 | 16pt（SU-023） | `space.16` / `layout.margin.compact` |
| 見出し〜カード | 390×844 級は 8pt（`space.8`）、画面高さ 830px 以下は 6pt（SU-024。6pt は 1画面成立のための Review 理由付き任意値） | `space.8` / DS-REQ-014 |
| 矢印 | 3カードで同一の形状・色・サイズ・右端位置（SU-025） | 統一 |
| 影 | 既存 Settings の値を維持（`0 8px 24px rgba(30,25,20,.045)`）。他画面へ一般化しない（SU-026） | Official 110 §4.4（CF-3） |
| 行内余白・gap | 全行で同一（Pro 行専用ルールで行ごとに変えない）（SU-027） | 旧: Pro 行だけ余白が異なりデータ削除行がずれていた |

### 3.1 行高さ
| 行 | 最小高さ | 備考 |
|---|---|---|
| プラン状態行（非操作） | 52pt（SU-030） | 状態表示のみ |
| 購入情報行（操作） | 52pt 以上（SU-031） | DS `card.minTouchRow` |
| データ管理の各行 | 画面高さ **830px 以下は 56px 以上、831px 以上は 62px 以上**（SU-032。境界: 830px は 56px 以上、831px は 62px 以上） | Official 110 §4.3（CF-1 B案）。いずれも 52pt 以上 |
| アプリ情報の各行 | **44〜46pt**（SU-033。Settings 限定例外） | Official 110 §4.1 |
- SU-032A: 行高さの切替は CSS の画面高さ（viewport height）で判定し、830px 以下と 831px 以上の境界を明示的にテストする（SHALL）。831px 以上で 62px を維持した状態で Bottom Navigation と重ならないこと（Prototype 実測: 390×831 で余白 +1px のため、831px 付近で行高さ・余白を増やしてはならない）。他画面の行高さ・規則を変更してはならない（SHALL NOT）。
- SU-034: 全操作行の操作領域は 44×44pt 以上（SHALL。DS-REQ-018）。
- SU-035: 副題が長い行（例: 375px 幅の日本語「バックアップからデータを復元します」）は省略記号にせず折り返してよい（行は伸びてよい）。文字を切ってはならない（SHALL NOT）。
- SU-037: 副題の折り返しで 1 文字だけが次行に孤立しないことが望ましい（SHOULD）。Prototype の日本語 375px 幅では、Pro バッジのあるデータ復元行の副題「バックアップからデータを復元します」の末尾 1 文字が孤立して折り返す。実装 Gate で、バッジ幅・gap・行内余白の見直しにより解消するか、許容するかを確認する（文字切れではない）。
- SU-036: 見出しの文字サイズ（16px）、行タイトル（15px）、副題（11px 以上）を、1画面化のために更に縮小してはならない（SHALL NOT）。

## 4. プランカード
- SU-040: 状態表示は既存の `planViewState` が返す値（確認中／CueScore Free／CueScore Pro ✓）をそのまま表示する。課金状態の判定ロジック、`data-settings-plan-state` / `data-settings-plan-action` の契約は変更しない（SHALL NOT）。
- SU-041: 状態表示行はラベル「プラン」を持たず、状態表示のみを主表示とする。状態変化は読み上げられる（`aria-live="polite"` を維持）。

## 5. データ管理カード
- SU-050: バックアップ／データ復元／データ削除の機能、Pro バッジ、確認 Dialog、データ削除の安全確認、Demo 時の拒否ガードを変更しない（SHALL NOT）。
- SU-051: データ削除は通常操作と分離され、確認 Dialog を経由する（既存）。行の見た目を統一しても危険操作の識別性を損なわない。

## 6. アプリ情報カード
- SU-060: 行は 言語 / Language（`data-settings-open-language`）、About CueScore（`data-cuescore-about`）、利用規約・プライバシーポリシー（`data-settings-legal`）。既存のイベント・導線・Legal 画面の挙動（Legal 表示中は Bottom Navigation を非表示）を変更しない。
- SU-061: Decision 014 が削除した項目（ブレイクルール、イリーガル判定、設定検索）を再導入しない（SHALL NOT）。

## 7. 最下部
- SU-070: 「© 年 CueScore Apps」を最下部に維持する（SHALL）。最下部余白（内容〜Bottom Navigation）は 0 以上（SU-080）。

## 8. Version（単一定義）
- SU-090: About 画面は正しい Version を表示する（SHALL）。**Version を新たな文字列リテラルとして hardcode してはならない（SHALL NOT）。**
- SU-091: Version の単一定義（Single Source of Truth）を 1 箇所に置き、About はそこから取得する。現行の `CUESCORE_APP_VERSION`（Backup の `appVersion` 等に使用中）を単一定義の候補とする。実現方式（build 時に Native `MARKETING_VERSION` から生成する、または一致を検証する）は実装 Gate で決める（Official 110 CF-2）。
- SU-092: Web 側の定義と Native `MARKETING_VERSION`（現在 1.2）が一致することを自動検査する（SHALL）。将来の Version 更新で片方だけ更新された場合は検査が失敗する。
- SU-093: 現行の Version 表示の hardcode（About「Version 1.0」、旧 Settings footer の「Version 1.2」、他に `RELEASE_LABEL`、`.settings-version`）を実装 Gate で棚卸しし、About に関するものは単一定義へ統一する。他画面の Version 表示は本仕様の範囲外（変更しない）。
- SU-094: Backup JSON の `appVersion` / `createdByAppVersion` の値と意味は変更しない（SHALL NOT）。

## 9. Localization
- SU-100: アプリ情報カードの見出しは翻訳 Key `settings.section.appInfo` を使う（SHALL）。値は ja「アプリ情報」、en「App info」、zh-Hans「应用信息」。
- SU-101: カードの `aria-label` も**同じ翻訳 Key** を使う（SHALL）。他カードも見出しと `aria-label` が同じ表示を指すこと（プラン／データ管理）。ただしプランの見出し「プラン」は現在日本語のままであり、P1 の範囲では変更しない。
- SU-102: P1 の翻訳範囲を維持する。P2 以降の翻訳を前倒ししない。現在未翻訳の文字列（「プラン」「確認中」「購入情報を確認中」「About CueScore」）を今回翻訳しない（SHALL NOT）。
- SU-103: 3言語（ja／en／zh-Hans）のカタログに Key が揃うこと（欠落 0）、日本語表示の既存文言に意図しない変更がないこと。

## 10. アクセシビリティ（VoiceOver）
- SU-110: 3つの見出しは見出しとして識別できる。各カードは `aria-label`（SU-101）で名前を持つ。
- SU-111: 行は `button` として、行のタイトル（と副題）が読み上げられる。矢印は装飾（`aria-hidden`）。
- SU-112: プラン状態の変化は `aria-live` で通知される（SU-041）。
- SU-113: タップ領域、フォーカス、Safe Area を守る。

## 11. 1画面完結と fallback
- SU-080: 375×812 と 390×844 で、ja／en／zh-Hans の各言語、Bottom Navigation まで含めて Settings が1画面に収まる（SHALL）。内容の最下部は Bottom Navigation と重ならない（余白 0 以上）。
- SU-081: 文字切れ 0、横 overflow 0、操作不能 0、最下部項目へアクセス可能、日本語 UI の意図しない変更 0。
- SU-082: 小画面（例: 375×667、320×568）や文字拡大時は、`.settings-formal-scroll-v1` が縦スクロールできる（`overflow-y:auto`。Physical UI Fix で確立）。最下部の項目まで到達でき、Bottom Navigation は固定のまま。
- SU-083: 1画面化のために文字を不必要に縮小しない（SU-036）。

### 11.1 Prototype 実測（根拠）
Chrome 154、Safe Area 上 47pt／下 34pt、DPR 3。

| 案 | 構成 | 375×812 | 390×844 | 備考 |
|---|---|---|---|---|
| R（承認） | 角丸 18px、プラン行 50／48、データ行 60／56、アプリ情報 46／44 | 1画面（余白 +17.9〜24px） | 1画面（余白 +24px） | 6通り clipping 0・overflow 0 |
| **T（角丸 20pt）** | 角丸 **20pt**、プラン行 **52**、データ行 60／56、アプリ情報 46／44 | 1画面（余白 +18px。日本語のみ +11.9px・折返しで 6px のスクロール余地） | 1画面（余白 +20px） | **6通り 1画面・重なり 0・clipping 0・overflow 0・最小操作領域 44pt（390×844 は 46pt）** |
| **U（正式仕様 / CF-1 B案）** | 角丸 **20pt**、プラン行 **52**、データ行 **56（830px 以下）／62（831px 以上）**、アプリ情報 46／44 | **1画面（余白 +11.9〜18px。日本語のみ +11.9px・折返しで 6px のスクロール余地）** | **1画面（余白 +14px）** | **6条件すべて 重なり 0・clipping 0・横 overflow 0。境界: 390×830 は +36px、390×831 は +1px** |
| S（375×812 にもデータ行 62px を適用） | 角丸 20pt、プラン行 52、データ行 62、アプリ情報 46／44 | **成立しない（−18px、Nav と重なる）** | 成立（+14px） | データ行 62px は 375×812 と両立しない |
| 旧デザイン | 現行 | 成立しない（−62〜−68px） | 成立しない（−42〜−48px） | |

U案（正式仕様）により、**角丸 20pt・プラン行 52px・データ行 56／62px の組合せで 6条件すべて 1画面が成立することを Prototype で確認した。** 実機（WKWebView）での成立は §12 の必須受入条件。

## 12. 実装 Gate の必須受入条件（Implementation Gate Acceptance）
実装 Gate は、以下をすべて満たさなければ PASS としない。未確認の項目を PASS と記録しない。

| ID | 受入条件 |
|---|---|
| AC-SU-1 | 375×812 と 390×844 × ja／en／zh-Hans の 6通りで1画面（SU-080、余白 0 以上、重なり 0） |
| AC-SU-2 | 角丸 20pt で 1画面が成立することを**実装済み source で再確認**（Prototype T案の再現） |
| AC-SU-3 | 行高さ: プラン 52pt 以上、データ管理 830px 以下は 56px 以上・831px 以上は 62px 以上（SU-032）、アプリ情報 44〜46pt、全操作領域 44pt 以上 |
| AC-SU-4 | 文字切れ 0、横 overflow 0、操作不能 0、日本語 UI の意図しない変更 0 |
| AC-SU-5 | データ管理カード上枠 1px（先頭の表示行に上線なし）、3カードの外枠・区切り・余白・矢印が一致 |
| AC-SU-6 | About の Version が単一定義と一致し、Native `MARKETING_VERSION` との一致検査が PASS（SU-090〜092）。hardcode の新規追加 0 |
| AC-SU-7 | `settings.section.appInfo` の3言語表記と、見出しと `aria-label` が同じ Key（SU-100〜101）。3カタログの Key 欠落 0 |
| AC-SU-8 | 小画面（375×667、320×568）の縦スクロールで最下部へ到達でき、Bottom Navigation が固定（SU-082） |
| AC-SU-9 | 実機（iPhone 16e、WKWebView）の Safe Area・1画面・Bottom Navigation 非重なり（**NOT VERIFIED。実装 Gate で必須**） |
| AC-SU-10 | 文字サイズ拡大（Dynamic Type 相当）時の安全なスクロール（**NOT VERIFIED。実装 Gate で必須**） |
| AC-SU-11 | 回帰: Settings／Navigation／Legal links／Build 74・76 系テスト、i18n、Restore、Match Sharing、Backup、Player Identity、Free／Pro、Full Node、Native parity、Simulator Build。R-FIT など「旧 Settings 構成」を固定していたテストは本 Decision の内容へ更新する（弱体化・skip をしない） |
| AC-SU-12 | 変更範囲: S-B flag=false 維持、Match／Snapshot／Backup／QR／CSV／IAP／Free-Pro／Restore に変更なし |
| AC-SU-13 | 境界条件: 画面高さ 830px で 56px 以上、831px で 62px 以上、いずれも Bottom Navigation と重ならない（SU-032A）。実装 Gate は 830px と 831px の両方を実測する |

## 13. 範囲外
Settings 以外の画面、Design System v2.1 の他の規則、Shadow の標準化（CF-3）、Dynamic Type の仕様化、Version／Build 番号の更新、Release。

## 14. 状態
**Adopted / Official（2026-10-12 発行）。** Implementation NOT STARTED。Official 110 の Decision 032 に従う。
