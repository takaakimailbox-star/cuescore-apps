# CueScore Build 95 数字入力の中立フォーカス限定改善（2026年10月31日）

## 結論

POの訂正どおり、「その他」で開く実編集可能な数値入力の黄色いキーボードフォーカス枠だけを、中立の黒2px outline＋白4px haloへ局所置換した。全画面共通の黄色3px `:focus-visible`、試合中の手番・選択中・勝者、27セレクタ、9-Ball正式色、ショットクロック正式色は変更していない。

Gate結果: **IMPLEMENTATION / FOCUSED REGRESSION PASS — PHYSICAL DEVICE AND VOICEOVER AUDIO NOT VERIFIED**。

## 根拠と境界

- Fresh external main: `a9d4dd59e68169e1a96c14833ebfdc4e5920e042`（2026-10-31 fetch後の`origin/main`／`FETCH_HEAD`一致）。
- 実装commit: `9e37a0b0bd952d65e72e5712d752be323e41fbfa`（branch `codex/build95-number-focus-20261031`）。
- 正式Decision Log v2.24の最新正式Decisionは048。Decision 049／Official 140・141は候補であり、今回正式採用・発行していない。
- PO訂正により、先行「試合中状態表示の中立化」隔離Prototypeは不採用・製品未反映。今回の承認範囲は数字入力フォーカスだけ。
- 未承認のまま維持: 縦バランス、9/10-Ball 1〜10＋その他、3 Cushion 7〜40＋その他、外側タップ対応、翻訳7→3。

## 実装

`match-setup-ux-v1.css`へ次の対象だけを追加した。

```css
.new-match-race-custom-v1 input[type="number"]:focus-visible {
  outline: 2px solid #171717 !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 0 4px #fff !important;
}
```

- `index.html`の全画面共通黄色3px規則は変更なし・hash一致。
- 色だけに依存せず、outline幅・offset・白haloの形とコントラストで位置を示す。
- `:focus-visible`限定のためタッチ操作契約を広げない。DOM、Tab順、ARIA、VoiceOver属性を変更しない。
- 数値候補、入力範囲、適用、キャンセル、保存、得点・勝敗・ファール、Free/Pro、QR、Backupを変更しない。

## Evidence

| 検証 | 結果 |
|---|---|
| Full Node | **1235/1235 PASS、FAIL 0**（既存1232＋新規3） |
| 新規静的保護 | **3/3 PASS**。共通黄色focus、局所selector、手番・選択・勝者・9-Ball・時計色を固定 |
| 実Chrome 390×844 | **8/8 PASS**。実座標で「その他」→入力focus、2px黒outline、黄色0、白4px halo、46px高、Tab→決定、決定は黄色3px維持、Shift+Tab復帰 |
| 既存試合設定機能 | ja／en／zh-Hans **全PASS**。候補、その他、適用、キャンセル、Escape、開始条件、試合開始、時計保存を確認 |
| Native parity | Native Web生成、iOS publicコピー、Native foundation **6/6 PASS** |
| 差分品質 | `git diff --check` PASS |

Machine-readable evidence: `docs/implementation/evidence/CueScore_Build95_Numeric_Input_Neutral_Focus_2026-10-31.json`。

## 変更ファイル

- `match-setup-ux-v1.css`
- `tests/numeric-input-focus-ring.test.mjs`
- `tests/browser/numeric-input-focus-ring.mjs`
- `tests/fixtures/p2/existing-tests-baseline.json`（新規テスト1本の登録のみ。既存assertion変更なし）
- `docs/implementation/evidence/CueScore_Build95_Numeric_Input_Neutral_Focus_2026-10-31.json`
- 本報告、Build 95設計報告のPO訂正追記、`docs/CURRENT_STATE.md`、`docs/CURRENT_STATUS.md`、`docs/handoff/CURRENT_REPORT.md`

## 未確認・STOP

- 実iPhoneでの表示、物理キーボード、VoiceOver実音声は **NOT VERIFIED**。既存アクセシビリティ実装は変更していない。
- 製品側の自動・実Chrome検証はPASS。最初の`node` PATH不足とブラウザのloopback bind制限はテスト環境側で、同梱Nodeと許可済み実Chrome実行により解消した。
- Build番号、Archive、Upload、iPhone反映、TestFlight、App Store Connect、App Review、一般公開は**未実施**。
- 実装commit済み。文書commitとpushは最終diff・Git状態確認後に本Gate内でのみ実施する。
