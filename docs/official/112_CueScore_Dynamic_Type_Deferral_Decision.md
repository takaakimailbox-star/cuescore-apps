# CueScore Apps — Dynamic Type Automatic Linking Deferral Decision

**Status:** Adopted / Official（Decision 033）。Product Owner 承認済みの方針（2026-10-12）。Implementation: 該当なし（自動連動は実装しない）。
**Decision date:** 2026-10-12（Product Owner 承認）
**Official publication date:** 2026-10-12
**Authority:** Product Owner adopted decision（採番: ChatGPTりおん）
**Decision number:** **Decision 033**（Official Design Decision Log **v2.9** に収録。v2.8 は Decision 032 まで）
**Official document number:** **112**（本書）。**Official 109 は Localization Glossary 用に予約済み（未作成）のため使用しない。**
**Scope:** iOS の文字サイズ設定（Dynamic Type / Larger Text）へのアプリ文字サイズの**自動連動機能**。対象: 現行 v1.2 系および多言語化 P1。
**Baseline:** `takaakimailbox-star/cuescore-apps` main `fe1359c2823a6d59354f672d63e5a436b86a9b65`（作成時に fresh fetch で確認、変更なし）

> 本書は Design Decision である。製品 source、P1 実装 source、Official 110 / 111、Decision 014・032 は変更しない。

---

## 1. Decision

### 1.1 DT-1: 自動連動は Deferred
- iOS Dynamic Type への文字サイズ自動連動は、**現行の v1.2 系および多言語化 P1 では実装しない。Later / Deferred とする。**
- 将来の対応は、**別の Decision で判断する**（本書は将来の実装時期・方式を決めない）。
- 理由: ① 現行 Settings のレイアウト安定性を維持する、② 3 言語対応を優先する、③ 不要な UI 変更を増やさない。
- **アクセシビリティ対応を不要と判断したのではない。** 将来の改善対象として維持する。

### 1.2 区別する 3 つの事項（混同しない）
| 事項 | 本 Decision での扱い |
|---|---|
| ① 自動連動機能の実装（iOS の文字サイズ設定がアプリの表示に反映される） | **Deferred（Later）**。v1.2 系・P1 では実装しない。実装していないため **PASS とは記録しない** |
| ② 文字が拡大された場合の表示安全性（折返し、縦スクロール、主要内容を切り捨てない） | **要件として維持**。CSS 疑似拡大による 36 条件の検証（§3）は PASS のまま維持する |
| ③ 既存 Design System v2.1 のアクセシビリティ要件 | **削除・弱体化しない**（§5） |

## 2. 現行挙動の事実（2026-10-12、read-only 調査）
- **既存挙動である:** P1 より前の main（fe1359c）の Simulator ビルドでも、iOS の文字サイズを最大のアクセシビリティサイズにして Settings を表示した画面は、通常サイズと**ピクセル差 0**。文字サイズ非連動は P1 の退行ではない。P1 + Settings R のビルドも同様。
- **原因:** 文字サイズは px 指定（853 宣言、rem/em は 2 宣言）で、`-apple-system-body` 等の連動指定がない（`text-size-adjust:100%` は Home のレイアウトのみ）。ネイティブ（`CueScoreBridgeViewController`）にも連動処理はない。P1・Settings R の差分は文字サイズ処理に触れていない。
- **実機:** Product Owner の観察で、Score P1 は iOS の文字サイズを拡大しても表示が変化しない。**これは観察結果であり、Dynamic Type 対応の PASS ではない。**

## 3. 表示安全性（CSS 疑似拡大）
Settings の全文字を CSS で 100 / 130 / 160 / 200% に拡大し（最大 56px）、3 言語 × 3 viewport（390×844、375×812、320×568）= **36 条件**で実測した。到達不能 0、文字切れ 0、横 overflow 0、タイトルと副題の重なり 0、操作領域 44px 未満 0、最下部の © まで縦スクロールで到達可能（`overflow-y:auto`）。**この結果は維持する。**
**限界（記録として固定する）:** これは CSS による疑似拡大であり、**実際の iOS Dynamic Type ではない。実際の iOS Dynamic Type 下の表示、および実機での拡大時の挙動は NOT VERIFIED。実際の iOS Dynamic Type 対応を PASS と記録しない。**

## 4. DT-2: Official 111 AC-SU-10 との関係（後続 Decision）
- **Official 111 は改変せず保全する。** 本 Decision は、Official 111 に対する**後続 Decision** として、AC-SU-10 の意味の区別だけを明確にする。AC-SU-10 の行を削除・skip・弱体化しない。
- Official 111 の AC-SU-10 は「文字サイズ拡大（Dynamic Type 相当）時の安全なスクロール」。本 Decision は次の 2 つを区別する。

| 区分 | 内容 | 状態（2026-10-12 時点） |
|---|---|---|
| **AC-SU-10a** | Dynamic Type 自動連動（iOS の文字サイズ設定がアプリの表示に反映される） | **DEFERRED（Later）**。実装しない。**PASS ではない** |
| **AC-SU-10b** | 文字が拡大された場合の表示安全性・縦スクロール | **CSS 疑似拡大 36 条件 PASS**（§3）。実際の iOS Dynamic Type 下では **NOT VERIFIED** |

- 現行 v1.2 系・P1 の受入では、AC-SU-10a は Deferred（対象外）、AC-SU-10b は CSS 疑似拡大の検証で充足と扱う。**ただしこれは「実際の iOS Dynamic Type 対応が PASS」を意味しない。** Official 111 の AC-SU-10 の記録は、Deferred と NOT VERIFIED を明示した上で保持する。
- 本書の発行は、AC-SU-10 を実機の Dynamic Type で PASS にするものではない。

## 5. Design System v2.1 のアクセシビリティ要件の保持
次の既存 Official 要件は**削除・弱体化・改変しない**。
- Design System v2.1 §14 Accessibility「Dynamic Type: 200% 相当まで主要内容を欠落させない」
- DS-REQ-034「Dynamic Type 拡大時に主要操作または主要値を切り捨ててはならない（SHALL NOT）。Verification: 200% text-size test」、DS-REQ-033（Accessible Name / Role / State）
- Design System v2.1 §3 Typography「Dynamic Type 拡大時は固定高を解除し、折返しと縦方向拡張を許可する」、UI Components v1.1 の Dynamic Type 記述
- これらは、自動連動を実装する将来の対応（Later）で満たすべき目標として維持される。現行は連動しないため、Dynamic Type 拡大という事象が発生しない（要件の前提が成立しない）が、**要件自体は有効のまま**である。

## 6. DT-3: App Store での申告
**Larger Text（文字サイズ拡大）対応を未実装の状態で、App Store の対応済み機能として申告しない。** 自動連動を実装し、実機で検証して正式に PASS するまで、「Larger Text に対応」と申告・表示してはならない。App Store Connect の項目確認は別 Gate とする（本書は Apple 操作を行わない）。

## 7. Later 登録（将来の改善対象）
- 内容: iOS Larger Text への連動、200% 相当までの表示保証（DS-REQ-034）の実機確認、固定高の見直し。
- 影響範囲: 全画面（文字 px 指定 853 宣言）。Settings だけでは済まないため、Design System レベルの Design Gate（Prototype、全画面の Visual 回帰、Physical Accepted UI の再確認）を前提とする。
- 開始: 別 Decision（Product Owner の起票）。Version / Build の更新は別 Gate。

## 8. 維持される範囲（変更しない）
Official 110 / 111（本文）、Decision 014・032、Official 84、Official 107 / 108、Design System v2.1、Settings R の実装、課金・Backup・Restore・データ削除、言語の切替・保存・ガード契約（S-B は条件付きのまま `LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false`）、保存データ、Version / Build。P1 は未完成・未 commit のままである。

## 9. Gate 分離
- 本書は Documentation のみ。製品 source、P1 / P2 source、Device Build、install、TestFlight、App Store Connect、Release、CueScore Apps・Score RC の変更は行わない。
- 既存の Official 111 の改訂・置換は行わない。AC-SU-10 の関係は本書（後続 Decision）で明確にした。

## 10. 関連文書
Official Design Decision Log v2.8（Decision 001〜032）→ v2.9（Decision 033）／Official 110・111（Settings Unified Design）／Official Design System v2.1（§3、§14、DS-REQ-033・034）／UI Components v1.1／Official 107・108（Localization）／`docs/CURRENT_STATE.md`（Match Sharing Final Integration 2026-09-30: 最大 Dynamic Type は Release 前推奨だが blocker ではない）。

## 11. Evidence basis
Dynamic Type Deferred RC / Evidence（Simulator 比較、CSS 疑似拡大 36 条件、source 調査）。要約は `docs/implementation/CueScore_Dynamic_Type_Deferral_Official_Release_2026-10-12.md`。

## 12. 本 Decision の状態
**Adopted / Official（2026-10-12 発行）。** Decision 033。自動連動は Deferred（Later）。実際の iOS Dynamic Type 対応は PASS ではない。
