# 115 — CueScore Localization U6 Dialog Decision（Decision 035）

**状態: Adopted / Official。** 2026年10月16日発行（Decision 035、Official Design Decision Log v2.11）。Product Owner の U6 承認（2026-10-16）に基づく。
**Scope:** 多言語化（Official 107／108）の **未決事項 U6（`alert/confirm/prompt` の OS ボタン言語依存への対応）のみ**。他の未決事項・他の Phase へ一般化しない。

## 1. 番号（fresh 確認、GitHub main `b2af3421c60a34670e2f45361f3bd7d9c231bb53`）
- Decision Log は v2.10（Decision 001〜034）。本書 = **Decision 035**、Decision Log = **v2.11**（Decision 001〜034 は改変しない）。
- Official 文書: 発行前の最大番号は 114。**109 は Glossary 用に予約済み（使用しない）**。本書 = **Official 115**（Decision）、付随の Spec = **Official 116**（`116_CueScore_Localization_U6_Dialog_Spec.md`）。115・116 は発行前に main に存在しないことを確認済み（衝突なし）。
- Official 107／108／110／111／112／113／114 は**改変しない**。108 の U6 行（DECISION PENDING）は、本書を参照して閉じる（108 の条文自体は不変、108 が規範であり続ける）。

## 2. Product Owner 承認（2026-10-16、明示）
| ID | 承認内容 |
|---|---|
| PD-U6-1 | `alert` / `confirm` / `prompt` の**標準方式を維持**する |
| PD-U6-2 | ダイアログの**メッセージ本文**を ja／en／zh-Hans へ翻訳する |
| PD-U6-3 | OK・キャンセル等の**ボタンは OS に任せる** |
| PD-U6-4 | **独自モーダルへの全面置換はしない** |
| PD-U6-5 | OS ボタン表示の言語一致は**未検証**。実機確認は**後工程** |

上記以外の仕様変更を、Product Owner が承認したものとは扱わない。

## 3. 決定

### D035-1 U6 — RESOLVED（標準ダイアログ維持＋本文のみ翻訳）
1. Official 108 の U6 は **RESOLVED**（PD-U6-1〜5 の範囲）。
2. `alert`／`confirm`／`prompt` は現行の標準ダイアログを維持する。メッセージ本文のみを翻訳 catalog 経由で 3 言語表示にする。
3. 既存の **ダイアログ種類・表示タイミング・入力初期値（prompt）・戻り値・キャンセル分岐・保存処理・Restore 処理・エラー時の動作は変更しない**。
4. OS が表示するボタン名（OK／キャンセル 等）は OS 言語で表示され、アプリ内の手動言語設定に追随しない（Official 108 L-NAT-3 の既知挙動のまま）。**言語一致を保証する記述を置かない**。独自モーダルへの置換は行わない。
5. 実機でのボタン表示確認は **NOT VERIFIED** とし、後工程（P6／実機 Gate）へ引き継ぐ。

### D035-2 状態を変更しないもの
U3（法務ページ未翻訳期間の注記）、U4（Paywall の法的／Apple 要件文言）、U8（Backup Share Sheet 文言）、U11 は **DECISION PENDING のまま**であり、本 Decision は解決しない。

## 4. 本 Decision が変更しないもの
Official 107／108／110／111／112／113／114 の本文、Decision 001〜034、言語解決アルゴリズム、S-A、S-B（`LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false`）、言語キー `cueScore.language.v1`、保存データ（Match／Snapshot schema、Player ID、`registeredPlayerId`、`sharedMatchId`、QR、Backup、CSV、`resultLabel` の日本語 canonical 値）、Analytics 数値、IAP Product ID、Free／Pro、Glossary PENDING、Native 設定。

## 5. Official 108 との関係
| Official 108 | 本 Decision での扱い |
|---|---|
| §17 U6（DECISION PENDING／P3 着手前） | **RESOLVED（D035-1）**。条文は不変、本書を参照 |
| L-NAT-3（OS ボタン名は OS 言語） | **不変**（既知挙動として維持） |
| 「独自モーダル化は決定前に行わない」 | 独自モーダル化は**行わない**ことが決定された |
| G-SEP-9（U6 の方針決定は P3 の前） | **充足** |

## 6. 発行内容
Decision Log v2.11（Decision 035 を追加、001〜034 は byte 単位で維持）、`docs/official/115_…Decision.md`、`116_…Spec.md`、`docs/README.md`、`CURRENT_STATE.md`／`CURRENT_STATUS.md`、番号ガードのテスト更新（最大 Official 番号 114→116、109 予約の検査は維持）と 115／116 用の docs テスト。Product source は本 Decision では変更しない（実装は P3 の Gate で行う）。

## 7. 承認・発行
Product Owner の U6 承認（2026-10-16）に基づき、2026-10-16 に Official 発行（Documentation-only）。
