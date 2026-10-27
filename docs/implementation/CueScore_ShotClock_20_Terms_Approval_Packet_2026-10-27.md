# ショットクロック20語 一括承認資料（一般公開前のP4承認用）
状態: **全20語 CANDIDATE（P3-PROVISIONAL）。P4-APPROVED ではない。** 内部TestFlight（Version 1.4 / Build 89）では「PO確認用の暫定翻訳」として扱う。AI検証は人間の独立レビューではない。
正本: Official 135 付録A、`i18n-catalog-shotclock-v1.js`（主catalog 3本・Official 109 は無改変、SHA不変）。
承認方法（Decision 036／041／Official 117／127 の形式）: POが語ごと（または一括）で承認 → 承認記録（語・ja/en/zh-Hans・残余リスク）を作成 → 主catalogへ統合し Official 109 v1.1 で CONFIRMED。承認前に APPROVED と表記しない。

| ID | 用途 | ja | en | zh-Hans | 既存語彙との整合 | 320幅（実測） | 残余リスク |
|---|---|---|---|---|---|---|---|
| SC01 | 名称 | ショットクロック | Shot Clock | 出杆计时器★ | 既存Glossaryに同義語なし。衝突なし | 設定行1行（3言語×3幅で検証） | zh競技用語の一次資料 NOT VERIFIED（代替: 击球计时器）|
| SC02 | 開始 | 開始 | Start | 开始 | 既存「試合開始／Start」系と同語 | ドック内1行 | なし |
| SC03 | 一時停止 | 一時停止 | Pause | 暂停 | 既存の「中断」系（試合の中断）とは別語 | 1行 | 試合の中断との混同はARIAと位置で区別 |
| SC04 | 再開 | 再開 | Resume | 继续 | 既存「再開／Resume›／继续」と同語（試合の再開は別概念） | 1行 | ARIAで時計と明示 |
| SC05 | リセット | リセット | Reset | 重置 | 既存「端末内設定をリセット／Reset device settings／重置设备内设置」と整合 | 1行 | なし |
| SC06 | 延長 +60 | 延長 +60 | Extend +60 | 延长 +60 | 数字は言語共通 | 2段（語＋+60） | なし |
| SC07 | 延長の取消 | 取消 −60 | Undo −60★ | 撤销 −60 | 試合の戻る（Back／Undo）と語が重なる → −60併記＋ARIA「延長を取り消す／Undo extension」で区別 | 2段 | enのUndoが試合のUndoと紛らわしい可能性（代替: Remove +60）|
| SC08 | 単位 | 秒 | sec | 秒 | — | 1行 | なし |
| SC09 | 待機 | 待機中 | Ready | 待机 | 新規 | 1行 | なし |
| SC10 | 停止 | 停止中 | Paused | 已暂停★ | 主ボタン「暂停」（動作）と状態「已暂停」を区別 | 1行 | zhの語感（代替: 暂停中）|
| SC11 | 時間切れ | 時間切れ | Time up | 时间到 | 新規（通知のみ） | 1行（警告記号付き） | zh競技用語 NOT VERIFIED |
| SC12 | 設定補足 | 残り時間を手動で計ります | Count the time manually | 手动计时 | 連動しないことを一言で示す | 設定行の副題1行（12px） | なし |
| SC13 | 基本時間 | 基本時間 | Base time | 基本时间 | 新規 | 設定行1行（13px） | なし |
| SC14〜SC20 | VoiceOver 7文言 | 役割名／残り{count}秒／時間切れ／延長、60秒を追加／延長を取り消す／リセット、残り時間を基本時間に戻す／延長{count}回 | Shot clock／{count} second(s) left／Time up／Extend, add 60 seconds／Undo extension／Reset, return to base time／Extended {count} time(s) | 出杆计时器／剩余{count}秒／时间到／延长，增加60秒／撤销延长／重置，恢复为基本时间／已延长{count}次 | 既存aria語彙（Undo／再開）と整合 | 表示しない（読み上げのみ） | **実機VoiceOver実音声は未確認** |
★ = POの優先候補（出杆计时器／已暂停／Undo −60）。
## 確認した内容
- 既存Glossary（Official 109、38語 CONFIRMED）との語の衝突: なし（SC01・SC09・SC11・SC12・SC13・SC14〜 は新規、SC02〜SC05 は既存語流用）。
- 3言語の意味の一致、複数形（enの one／other、ja／zhは単一形）: Node単体で確認。
- 表示幅: 設定行（ja／en／zh-Hans × 320／375／430幅）で文字切れ・2行超えなし（72項目PASS）。ドック（3言語×5幅×4倍率×8状態×6種目＝2880条件、NG 0）。
## NOT VERIFIED
- 中国語（出杆／击球、计时器、已暂停／暂停中）の競技用語としての一次資料。人間の独立レビュー。実機フォントでの表示。実機VoiceOver音声。
## PO判断（一般公開前）
1. 20語の承認（または修正）。2. enの取消語（Undo −60 のまま／Remove +60）。3. zhの別案採否。
