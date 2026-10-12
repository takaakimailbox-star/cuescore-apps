# CueScore Apps — Settings Unified Design Decision

**Status:** Adopted / Official（Decision 032）。Product Owner 承認済みの設計判断（A〜L、CF-1 B案）。Implementation NOT STARTED。製品実装は別 Gate。

**Decision date:** 2026-10-12（Product Owner 正式承認: Settings Unified Design R案）
**Official publication date:** 2026-10-12（CF-1 B案の Product Owner 承認: 2026-10-12）
**Authority:** Product Owner adopted decision（採番: ChatGPTりおん）
**Decision number:** **Decision 032**（Official Design Decision Log **v2.8** に収録。v2.7 は Decision 031 まで）
**Official document number:** **110**（本書）／ 関連 Specification: **111**（`111_CueScore_Settings_Unified_Design_Spec.md`）。**Official 109 は Localization Glossary 用に予約済み（未作成）のため使用しない。**
**Scope:** Settings 画面、およびその中の「言語 / Language」「About CueScore」「利用規約」「プライバシーポリシー」の各行。**他画面へ一般化しない。**
**Baseline:** `takaakimailbox-star/cuescore-apps` main `8a40a2dac7505c6f9bdbc0b8a7e31fc3bc6d00f2`（作成時に fresh fetch で確認、変更なし）

> 本書は Official に発行された Design Decision である。Implementation（製品 source の変更）は別 Gate であり、本書の発行によって実装は開始されない。受入条件・数値・要件 ID は `111_CueScore_Settings_Unified_Design_Spec.md` に定める。

---

## 1. Purpose

### 1.1 目的
実機レビューで、Settings の見た目と構造に次の問題が確認された。

1. プラン／データ管理／アプリ情報の3領域で外枠・区切り線・余白・矢印が揃っていない（プランとデータ管理はカード、フッターはカード外）。
2. 独立した CueScore ロゴと「Version 1.2」の表示が Settings 下部を圧迫し、iPhone 16e の通常表示で Bottom Navigation まで含めて1画面に収まらない。
3. プランカードの見出し「プラン」と行ラベル「プラン」が重複している。
4. データ管理カードの上枠が太く見える（原因: カード枠 1px に先頭の表示行の上線 1px が重なり合計 2px）。
5. Version の表示が一致していない（About は「Version 1.0」、Settings の表示は「Version 1.2」、Native の `MARKETING_VERSION` は 1.2）。

本 Decision は、これらを解消する Settings の統一デザイン（R案）を正式な仕様として確定する。

### 1.2 本 Decision が決めないこと
- 課金状態の判定（Free / Pro）、Backup / Restore / Delete の機能と安全確認、言語切替・保存の契約（Official 107 / 108）の変更
- Settings 以外の画面のレイアウト、行高さ、カード形状
- 実装方式の詳細（実装 Gate で決める）、Release、Build、配信

---

## 2. Decision（確定事項）

Product Owner は 2026-10-12 に、Settings Unified Design R案を正式承認し、同日、CF-1（データ管理行の高さ）について B案を正式承認した。次の A〜L を採用する。

| ID | 決定 |
|---|---|
| **A** | **R案を採用する**（Settings Unified Design R案） |
| **B** | Settings を3つのカード（プラン／データ管理／アプリ情報）に統一する |
| **C** | 原則1画面完結（Bottom Navigation まで含めて Settings 全体を1画面に収める。375×812 と 390×844） |
| **D** | カード角丸 **20pt**（Design System v2.1 の `card.radius` / `radius.large`） |
| **E** | Settings の**情報行 44〜46pt（CSS 44〜46px）**を限定例外とする（§4.1） |
| **F** | データ管理行の高さ条件: 画面高さ **830px 以下は 56px 以上**、**831px 以上は 62px 以上**（§4.3。CF-1 B案） |
| **G** | 独立した CueScore ロゴと独立した Version 表示を削除する |
| **H** | Version は About 画面に集約する |
| **I** | 「アプリ情報」カードを新設する（言語 / Language、About CueScore、利用規約、プライバシーポリシー） |
| **J** | プランの重複ラベル（行ラベル「プラン」）を削除する |
| **K** | 「© 年 CueScore Apps」の表示を維持する |
| **L** | 小画面・文字拡大時の安全なスクロール fallback を維持する |

### 2.1 正式な画面構成
1. **プラン**カード: 現在のプラン状態（確認中／CueScore Free／CueScore Pro ✓）と購入情報行
2. **データ管理**カード: バックアップ／データ復元／データ削除（クラウド同期行は Official 71 / 72 のとおり非表示を維持）
3. **アプリ情報**カード: 言語 / Language／About CueScore／利用規約／プライバシーポリシー
4. 最下部: 「© 年 CueScore Apps」

3カードは外枠・区切り線・左右余白・矢印を統一する。

### 2.2 Version（G・H）
- Settings に独立した CueScore ロゴと Version は表示しない。
- About 画面に正しい Version を表示する。**Version は単一の定義から取得し、`1.2` を新たに hardcode しない。** 将来の Version 更新に追随する設計とする（要件は Spec 111 §8）。

### 2.3 Localization
新しい見出し「アプリ情報」の3言語表記と、`aria-label` に同じ翻訳 Key を使うことを確定する（Spec 111 §9）。

| 言語 | 見出し |
|---|---|
| ja | アプリ情報 |
| en | App info |
| zh-Hans | 应用信息 |

P1 の翻訳範囲を維持し、P2 以降の翻訳（例: 現在日本語のままの「プラン」「確認中」「購入情報を確認中」）を前倒ししない。

---

## 3. Decision 014 との関係（限定的な後続 Decision）

Decision 014（2026年7月25日「Settingsから低頻度・低重要度要素を削減」）は、ブレイクルール、イリーガル判定、**アプリ情報**、設定検索、不要 Chevron を削除し、低頻度項目を枠で区別した。Decision 014 は**削除・改変しない**。Decision 032 は次の範囲だけを、後続 Decision として限定的に上書きする。

**適用範囲（これ以外へ一般化しない）:** Settings／言語／About CueScore／利用規約／プライバシーポリシー。

| Decision 014 の記述 | Decision 032 の扱い |
|---|---|
| 「アプリ情報」を削除した | 「アプリ情報」という名前の**カードを、既存の4行（言語、About、利用規約、プライバシーポリシー）のコンテナとしてのみ**新設する。Decision 014 が削除した項目（ブレイクルール、イリーガル判定、設定検索、アプリ情報という旧項目の内容）は復活しない。**限定的に後続上書き** |
| 不要 Chevron を削除した | 遷移する行の Chevron は必要な Chevron であり、3カードで形状・色・位置を統一する。**不要な Chevron の削除方針は維持**（遷移しない行には付けない） |
| 低頻度項目は枠で区別 | 維持。アプリ情報は低頻度項目であり、枠（カード）で区別する。**矛盾しない** |
| ブレイクルール、イリーガル判定、設定検索の削除 | 変更しない（有効のまま） |
| 実際に変更する項目へ集中させる（設計意図） | 維持。プラン・データ管理を主役とし、アプリ情報は情報行寸法（§4）で控えめに構成する |

Decision 014 は履歴として保持し、Decision Log v2.8 でも Decision 001〜031 の意味・状態・採番を変更しない。

---

## 4. Design System 例外（限定）

既存の Design System v2.1 を優先する。次の3つは Design System v2.1 に合致する。

| 項目 | Design System v2.1 | Decision 032 |
|---|---|---|
| カード角丸 | `card.radius` 20pt（`radius.large`） | **20pt を採用**。Prototype R案の 18px はそのまま採用しない |
| 操作領域 | DS-REQ-018: すべての操作可能 Control は 44×44pt 以上 | 全行 44pt 以上（維持） |
| 余白 | DS-REQ-014: Spacing は定義済み Token から選択、任意値は Review 理由を記録 | 左右余白 16pt（`space.16` / `layout.margin.compact`）、見出し〜カード 8pt（`space.8`。830px 以下は 6pt）。それ以外の寸法（行高さ、セクション間隔の 12〜14pt など）は Spec 111 に Review 理由を記録（1画面成立のための実測値） |

### 4.1 限定例外（Settings のみ）
**E. 情報行 44〜46pt。** Design System v2.1 の `card.minTouchRow` は 52pt、Picker Row は 52pt min である。次の Settings の低頻度**情報行**に限り、**44〜46pt** を採用する。

- 対象行: アプリ情報カードの「言語 / Language」「About CueScore」「利用規約」「プライバシーポリシー」
- 条件: 操作領域 44×44pt 以上（DS-REQ-018）、文字を縮小しない、VoiceOver 対応、Safe Area、Bottom Navigation を維持、小画面スクロール fallback を維持
- 目的: 低頻度の情報行を詰め、プラン・データ管理の主要行を 52pt 以上に保ったまま 1画面を成立させる

**この例外は Settings のアプリ情報カードだけに適用される。Settings 以外の画面、および Settings の他のカードへ一般化しない。Settings 以外の 52pt 規則（`card.minTouchRow`、Picker Row、Text Field 52pt min ほか）は一切変更しない。**

### 4.2 例外の対象外（52pt 以上を維持する行）
- プランカードの購入情報行（タップ可能）: 52pt 以上
- データ管理の各行（バックアップ／データ復元／データ削除）: 52pt 以上。危険操作（データ削除）の安全性（確認 Dialog、通常操作との分離）は変更しない

### 4.3 Official 84（Build 31 Settings）との関係（CF-1 B案）
Official 84 §Settings は「390×844 で CueScore + Version を含めて収まる」「Data rows は compact portrait で 62px 以上」と定めている。Decision 032 は **Settings に限り**、次のとおり後続置換する。

- 「CueScore + Version」の項目は G・H により削除する（Version は About へ移動）。
- **データ管理行の高さ（F。Product Owner 承認: CF-1 B案、2026-10-12）:**
  - 画面高さ（CSS viewport height）**830px 以下**: データ管理行は **56px 以上**。Official 84 の 62px 規則は、この範囲に限り本 Decision が後続置換する。
  - 画面高さ **831px 以上**: データ管理行は **62px 以上**。Official 84 の 62px 規則を維持する。
  - 境界: **830px は 56px 以上、831px は 62px 以上**（830px と 831px の間でのみ切り替わる）。
  - 他画面の行高さ・規則は一切変更しない。
- 根拠（Prototype 実測。Chrome 154、Safe Area 上47pt・下34pt）: 角丸 20pt・プラン行 52px・アプリ情報行 46／44px の構成で、830px 以下に 56px、831px 以上に 62px を適用すると、375×812 と 390×844 × ja／en／zh-Hans の 6条件すべてで 1画面が成立する（Bottom Navigation との余白: 390×844 は +14px、375×812 は +11.9〜18px、390×830 は +36px、390×831 は +1px）。一方、375×812 にデータ行 62px を適用すると 1画面は成立しない（−18px、Nav と重なる）。
- Official 84 は改変しない。本 Decision が上記範囲に限って後続置換する。

### 4.4 Shadow・Border・Spacing の既存 Token との整合確認
| 項目 | Design System v2.1 | 現行 Settings 実装 | 本 Decision |
|---|---|---|---|
| border | `card.border` 1px `color.border.subtle`（必要時のみ） | 1px `--settings-line` | 1px を維持。**二重 border（先頭行の上線）を廃止**し、カード上枠は 1px に統一 |
| shadow | `card.shadow`（Hero / floating 限定。通常 Card は標準化しない） | `0 8px 24px rgba(30,25,20,.045)`（Settings 3カード） | 既存実装値を維持（Product Owner 承認の R案の見た目）。DS の「Hero / floating 限定」との差は**既存 Settings 実装の既知の逸脱として記録**し、他画面へ一般化しない。見直しは別 Design Gate |
| card.padding | 20pt（content card） | 行リストのため行内左右 16pt | 行リスト型カードは行の左右余白 16pt（`space.16`）を採用（content card の 20pt とは別） |

---

## 5. 維持される範囲（変更しない）
- 課金状態の判定（`planViewState` が返す 確認中／CueScore Free／CueScore Pro ✓）と購入導線、Free / Pro 境界、IAP Product ID
- Backup / Restore / Delete の機能、安全確認、`Pro` バッジの有無
- クラウド同期行の非表示（Official 71 / 72）
- 言語の切替・保存・ガード契約（Official 107 / 108。S-B は条件付きのまま `LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false`）
- Legal 画面（利用規約・プライバシーポリシー）の本文、および Legal 表示中に Bottom Navigation を非表示にする挙動（Physical UI Fix）
- 保存データ（Match / Player / Snapshot / Backup / QR / CSV）、Official 107 / 108 のデータ互換契約
- Bottom Navigation（4 tab、固定、Safe Area）、小画面の安全なスクロール（`overflow-y:auto`、Physical UI Fix）

---

## 6. Gate 分離
- 本書は Design Decision である。**Implementation は別 Gate。** 本書の発行は Documentation のみで、製品 source、P1 実装 source、Version / Build、S-B flag、Score RC は変更しない。P1 は未完成・未 commit のままである。
- Official 110 / 111 と Decision Log v2.8 は 2026-10-12 に Official として発行された（Documentation-only commit）。
- 実装 Gate の必須受入条件は Spec 111 §12 に定める。

---

## 7. 未解決事項・確認事項
| ID | 内容 | 状態 | 判断者 |
|---|---|---|---|
| CF-1 | データ行の最小高さ（Official 84 の 62px との関係。§4.3） | **RESOLVED（2026-10-12、Product Owner 承認 B案）: 830px 以下は 56px 以上、831px 以上は 62px 以上** | Product Owner |
| CF-2 | Version の単一定義の実現方式（build 時生成か、一致検証か。Spec 111 §8） | 実装 Gate で決定（要件は確定） | 実装 Gate |
| CF-3 | Shadow の扱い（既存 Settings 実装値を維持。DS の Hero / floating 限定との差の解消） | 別 Design Gate | Product Owner |
| CF-4 | U9（言語行の最終ラベル・選択 UI）の Official 107 / 108 上の正式クローズ | 本 Decision は言語行の**配置と見た目の統一**のみを確定。U9 のクローズは Localization 文書側の別 Gate | ChatGPTりおん |
| CF-5 | 新見出し「アプリ情報／App info／应用信息」の翻訳レビュー | P1 範囲の最小3言語表記として確定。P4 の翻訳レビューで再確認 | Product Owner |

---

## 8. 関連文書
- Official Design Decision Log v2.7（Decision 014、Decision 031）→ v2.8（Decision 032）
- Official Design System v2.1、UI Components v1.1
- Official 84（Build 31 Final Review UI / Navigation Spec）、Official 71 / 72（Cloud Sync 行非表示）
- Official 107 / 108（Localization Decision / Spec）。**Official 109（Glossary）は未作成のまま予約**
- Settings Unified Design Prototype Report（`CueScore_i18n_P1_Settings_Unified_Design_Prototype_Report.md`）、Physical UI Fix Report
- 本 Decision の Spec: `111_CueScore_Settings_Unified_Design_Spec.md`

## 9. Evidence basis
- Prototype 実測（Chrome 154、Safe Area 上47pt・下34pt を再現）: R案 6通り（375×812／390×844 × ja／en／zh-Hans）で 1画面・clipping 0・横 overflow 0・Nav 重なり 0。旧デザインは 6通りとも収まらず Nav と 42〜68px 重なる。
- 正式仕様の行高さ（角丸 20pt・プラン行 52px・データ行 56px（830px 以下）／62px（831px 以上）・アプリ情報行 46／44px）: 375×812 と 390×844 × ja／en／zh-Hans の 6条件すべてで 1画面（重なり 0・clipping 0・横 overflow 0）。Bottom Navigation との余白は 390×844 で +14px。境界は 390×830 で +36px、390×831 で +1px（831px はほぼ余白がなく、実装で行高さを増やしてはならない）。
- 比較として、データ行 60px（承認前の T案）は 6条件で成立、データ行 62px を 375×812 に適用すると成立しない（−18px）。
- データ管理カード上枠: 旧 2.00px → 新 1.00px。
- 実機（WKWebView）・Dynamic Type は **NOT VERIFIED**（Spec 111 §12 の実装 Gate 受入条件）。

## 10. 本 Decision の状態
**Adopted / Official（2026-10-12 発行）。** Decision 032 は Product Owner 承認済みの設計判断（A〜L、CF-1 B案）。Implementation NOT STARTED。
