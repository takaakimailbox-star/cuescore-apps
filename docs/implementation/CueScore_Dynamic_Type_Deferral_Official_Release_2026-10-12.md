# CueScore Dynamic Type Deferral — Official Decision Publication（2026-10-12）

Decision 033 / Official 112 / Official Design Decision Log v2.9 を発行した。Documentation-only。自動連動は実装しない（Deferred）。

## 承認方針
- DT-1: iOS Dynamic Type への文字サイズ自動連動は、現行 v1.2 系・多言語化 P1 では実装せず Later / Deferred。将来の対応は別 Decision で判断。
- DT-2: Official 111 は改変せず保全。後続 Decision として AC-SU-10 を区別（10a 自動連動＝DEFERRED、10b 拡大時の表示安全性＝CSS 疑似拡大 36 条件 PASS）。実際の iOS Dynamic Type 対応は PASS と記録しない。Design System のアクセシビリティ要件は削除・弱体化しない。
- DT-3: Larger Text 対応を未実装の状態で App Store の対応済み機能として申告しない。

## 発行内容
- `docs/official/112_CueScore_Dynamic_Type_Deferral_Decision.md`（Decision 033）
- `docs/official/07_CueScore_Official_Design_Decision_Log_v2.9_Official_Release.docx`（v2.8 を保存し、Decision 001〜032 を byte 単位で維持して Decision 033 を追加）
- 更新: `docs/README.md`、`docs/CURRENT_STATE.md`、`docs/CURRENT_STATUS.md`、`docs/handoff/`、`tests/localization-official-docs.test.mjs` と `tests/settings-unified-design-decision.test.mjs`（番号ガードを最大 112、README の v2.9 表記のみ。弱体化・skip なし）。新規: `tests/dynamic-type-deferral-decision.test.mjs`。
- Official 109 は Glossary 用に予約のまま未使用。Official 110・111、Decision 014・032 は改変していない。

## 調査の要点（read-only、2026-10-12）
- P1 より前の main（fe1359c）の Simulator ビルドでも、最大のアクセシビリティ文字サイズで Settings は通常サイズとピクセル差 0（既存挙動、P1 の退行ではない）。文字は px 指定（853 宣言）、連動指定なし。
- CSS 疑似拡大（100／130／160／200%、3 言語 × 3 viewport = 36 条件）: 到達不能・文字切れ・横 overflow・重なり・操作領域 44px 未満はいずれも 0、縦スクロールで最下部へ到達。
- 実機の Score P1 は PO の観察で拡大しても表示変化なし（観察であり、Dynamic Type 対応の PASS ではない）。

## NOT VERIFIED
実際の iOS Dynamic Type 下の表示、実機での拡大時の挙動、VoiceOver。

## 境界
製品 source、P1 / P2 source、Settings R の実装、S-B flag（false）、Device Build / install、TestFlight、App Store Connect、Release、CueScore Apps・Score RC の変更は行っていない。P1 は未完成・未 commit。
