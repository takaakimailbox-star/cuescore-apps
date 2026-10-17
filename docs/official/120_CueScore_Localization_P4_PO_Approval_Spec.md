# 120 — CueScore Localization P4 PO Approval Spec（Decision 037 付随 Spec）

**状態: Adopted / Official（2026-10-17 発行）。** Official 108・118 を改変せず、Decision 037（Official 119）の適用規則と受入条件を定める。

## 1. 規則
- P4A-R1: 承認記録（`tests/fixtures/p4/po-approval.json`）は、キー単位で `r`（残余リスク等級）と `h`（承認時点の en／zh-Hans 訳文のハッシュ）を持つ。承認日・範囲・「人間の独立レビュー未実施」を記録する。
- P4A-R2: 承認済みキーの訳文が変わるとハッシュが一致しなくなり、テストが失敗する（再承認が必要）。
- P4A-R3: `P4-REVIEWED` は使わない。`P4-AI-VERIFIED` の記録（`ai-verification.json`）と R2／R3 の残余リスクは削除しない。
- P4A-R4（用語）: CONFIRMED は PO 承認記録がある用語のみ（Official 119 §D037-2）。Official 109 は発行しない。
- P4A-R5（U3）: 注記は en／zh-Hans の UI のみ。文言: en `Legal pages are currently available in Japanese only.`／zh-Hans `法律页面目前仅提供日语版本。`。ja UI の DOM・表示は不変（注記要素を描画しない）。法務ページ・リンク先・戻る動作は不変。
- P4A-R6（U8）: `title`／`text`／`dialogTitle` は `cueT` で解決。ja は現行文言と完全一致。en: `CueScore Apps Backup`／`CueScore Apps v1.0 Backup`／`Save backup`。zh-Hans: `CueScore Apps 备份`／`CueScore Apps v1.0 备份`／`保存备份`。これらは共有シートの表示にのみ使い、ファイル名・payload・保存値に流入させない。
- P4A-R7（Main バッジ）: 名前の省略は CSS／最小限のマークアップで行い、バッジの寸法・色・位置を変えない。通常名のレイアウト（スクリーンショット）は変更前後で同一。

## 2. 受入基準
- AC-P4A-1: 承認対象の全キー（承認時点の 1,331 キーと、U3 の注記 1 キー・U8 の 3 キー＝新規 4 キーの計 1,335 キー）に承認記録があり、`h` が現行の訳文と一致する。新規 4 キーの訳文は本 Spec の R5／R6 に記載のとおりで、残余リスクは R2（人間の独立レビュー未実施）とする。
- AC-P4A-2: R2／R3 の残余リスク記録（`ai-verification.json`）が保持されている。
- AC-P4A-3: 承認記録に「人間の独立レビュー未実施」が明記され、`P4-REVIEWED` が 0 件。
- AC-P4A-4: ja catalog と日本語表示は不変（L2 golden 差分 0）。
- AC-P4A-5: U3 の注記は en／zh のみ、ja には描画されない。法務ページ本体は不変。
- AC-P4A-6: U8 の文言が共有シート以外（Backup payload・ファイル名・保存値）に現れない。
- AC-P4A-7: Main バッジが長い名前でも画面内に収まり、通常名の画面がバイト一致。
- AC-P4A-8: U4・U11 が DECISION PENDING のまま（購入面・Native 設定は不変）。
