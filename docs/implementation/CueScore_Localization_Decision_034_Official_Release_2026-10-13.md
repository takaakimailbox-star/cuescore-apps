# CueScore Localization P1 Formalization — Decision 034 Official Publication（2026-10-13）

Decision 034 / Official 113（Decision）/ Official 114（Spec）/ Official Design Decision Log v2.10 を発行した。**Documentation-only**。Product source・P1／P2 source は変更していない。P1 の source は main に未反映（正式固定は別 Gate）。

## Product Owner 承認（2026-10-13）
1. **U9**: 実機 Visual Acceptance 記録を採用。同一画面の重複確認は不要。ただし既存 Evidence と承認範囲を照合し、未確認画面を PASS にしない。
2. **S-B**: P1 は `LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false`。保存済み中断試合がある間は言語切替不可。有効化は Later／別 Gate。T-SW の未検証項目を PASS／FAIL に変更しない。
3. **L-RES-10**: P1 では確認済み範囲を受け入れ。実機 PWA・複数言語構成・Score P1 本体での直接測定等は NOT VERIFIED として後工程へ。Official 108 の既存要件を無断で緩和しない。

## U9 Evidence 再照合（A／B／C）
前回（2026-10-12 12:34 JST 時点）の Claude 側 Evidence は、実機の PO 確認を Settings（日本語）の Screenshot（「確認したよ。ok」）に限って記録していた（`Addendum_PO_screenshot_2026-10-12`）。ChatGPT りおん（司令塔）側には、以後および以前の PO 明示確認記録がある。両者は時系列が異なり矛盾しない。PO の確認記録は消去・縮小せず、証拠のない確認は追加記録しない。
| 区分 | 項目 | 出所・根拠 |
|---|---|---|
| **A. PO が明示確認** | 2026-10-12: English Settings OK／简体中文 Settings OK／About Version 1.2 OK／利用規約・プライバシーポリシー OK／Back OK | ChatGPT りおんの PO 確認記録（原本は りおん側）。Claude 側は本 Gate の指示でこの記録の存在を受領 |
| A | 2026-10-12 12:34 JST: Settings（日本語）Screenshot「確認したよ。ok」 | Claude 側のチャット記録・Addendum（直接保持） |
| A | それ以前: ja／en／zh-Hans の言語切替 OK、Home／Player／Settings OK | りおんの PO 確認記録 |
| A（報告） | 言語選択 UI: 確認報告あり | りおんの記録上は「確認報告あり」。PO の明示 OK 文言の原本は Claude 側で未確認 |
| **B. 画像・ログで独立確認** | Settings（ja）実機 Screenshot の行高さ実測（3 カード 1 画面、重なりなし、831px 以上の側） | `Addendum_PO_screenshot_2026-10-12` |
| B | Settings・言語選択画面の ja／en／zh-Hans Visual Evidence（375×812・390×844）、ボタン縦位置の 3 言語同一（23.09px のずれを解消） | U9 UI Polish Evidence |
| B | About の Version 単一定義（"1.2"）と Native `MARKETING_VERSION` の一致検査（AC-SU-6 PASS） | Settings R 実装 Evidence |
| B | 法務画面の導線・戻る・スクロールの自動検証（settings-legal-links 9/9、Build 76 3/3） | Physical UI Fix Evidence |
| B | 言語切替の手動優先・再起動後の保持（Simulator PWA 実走）、Full Node 685／695 PASS | 本 Gate 系列の Evidence |
| **C. 未確認** | 言語選択 UI の PO 明示 OK 文言の原本（上記「確認報告あり」の裏付け）。U9 の対象外: 実機 PWA、他 iOS・他端末、実際の iOS Dynamic Type（AC-SU-10。Decision 033 で Deferred） | — |
結論: U9 は RESOLVED（P1 形式の採用）。AC-SU-10 と実機 PWA は PASS にしない。Official 111 の AC 表は改変しない。

## S-B・L-RES-10
- S-B: 保守的規則（flag=false）を P1 の挙動として固定。T-SW-1〜10 の記録（隔離 headless Chrome で全 PASS）は保全し、WKWebView・実機 iOS ライフサイクル・PWA reload は NOT VERIFIED のまま。S-B 有効化 Gate の条件（予告）は Official 113 D034-2。
- L-RES-10: 受入範囲は Simulator WKWebView／Safari 17 構成、Simulator PWA 2 構成、Simulator 診断アプリ 4 構成、実機 Safari（ja）、実機 WKWebView 診断アプリ（ja、iOS 26.6.2）。診断アプリは Score P1 本体とは別の WKWebView インスタンス。未確認範囲は Official 114 §5 の引継ぎ台帳。

## 発行内容
- `docs/official/113_CueScore_Localization_P1_Formalization_Decision.md`、`114_CueScore_Localization_P1_Acceptance_Spec.md`
- `docs/official/07_CueScore_Official_Design_Decision_Log_v2.10_Official_Release.docx`（v2.9 を保存し、Decision 001〜033 を byte 単位で維持して Decision 034 を追加）
- 更新: `docs/README.md`、`CURRENT_STATE.md`、`CURRENT_STATUS.md`、`handoff/CURRENT_DECISION.md`・`CURRENT_REPORT.md`、番号ガード（最大 Official 番号 112→114。109 予約の検査は維持）と README の版表記（v2.10）のテスト更新、新規 `tests/localization-p1-formalization-decision.test.mjs`
- Official 107／108／110／111／112 は改変していない（内容 hash で検査）。Official 109 は未使用。

## 境界
P1／P2 source、Settings R の追加実装、S-B 有効化、Device Build／install、診断アプリ削除、TestFlight、App Store Connect、Release、CueScore Apps・Score RC・Score P1 の変更は行っていない。P1 source の commit／push は別 Gate。
