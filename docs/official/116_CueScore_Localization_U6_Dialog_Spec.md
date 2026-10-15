# 116 — CueScore Localization U6 Dialog Spec（Decision 035 付随 Spec）

**状態: Adopted / Official（2026-10-16 発行）。** Official 108 を改変せず、Decision 035（Official 115）の適用規則と受入条件を定める。108 と食い違う場合は 108 が優先する。

## 1. 規則
- U6-R1: `alert`／`confirm`／`prompt` の呼出し形式（API、呼出し箇所、順序、タイミング）は変更しない。
- U6-R2: メッセージ本文のみを、表示時に翻訳 catalog（`cueT`）で解決する。ja の本文は現行と**文字列完全一致**する。
- U6-R3: 戻り値の扱い、`prompt` の初期値、キャンセル分岐、保存・Restore・エラー時の動作は不変。
- U6-R4: 独自モーダル、ボタン名のカスタマイズ、OS ボタン言語の一致を保証する記述は導入しない。
- U6-R5: 動的値（件数、名前、日付等）は catalog の補間で組み立て、保存値・canonical 値を変更しない。
- U6-R6: en／zh-Hans の訳は、承認済み Glossary（Official 109）が存在しない間 **P3-PROVISIONAL** と管理し、P4 承認済みと表記しない。

## 2. 受入基準
- AC-U6-1: 製品コード内の `alert`／`confirm`／`prompt` 呼出しの本文リテラルが catalog 経由になっている（未移行は台帳で明示）。
- AC-U6-2: ja の本文は旧リテラルと完全一致。
- AC-U6-3: en／zh-Hans で本文が日本語のまま残らない（U3／U4／U8 に属する箇所は保留として隔離）。
- AC-U6-4: ダイアログ種類・戻り値・キャンセル分岐の特性テストが変更前後で同一。
- AC-U6-5: 保存データ・QR・Backup・CSV・Analytics・Free／Pro に差分 0。
- AC-U6-6: OS ボタン言語の実機確認は **NOT VERIFIED**（PASS と記録しない）。
