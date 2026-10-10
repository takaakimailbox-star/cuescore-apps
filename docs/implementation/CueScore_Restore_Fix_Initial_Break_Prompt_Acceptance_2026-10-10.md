# CueScore Restore Fix — 初回 Break prompt 復元 / Back UX B案 / Visual Accepted（2026-10-10）

Gate: `CUESCORE RESTORE FIX — SOURCE FORMALIZED / PHYSICAL REVIEW PENDING`
Baseline（External GitHub main）: `a4dde57dcb001c302c2e1979ee90949b984a9c31`
Product Source commit: `74928978c80a505f59ba9e0c4f56fb9ff256984d`（`fix: restore pending initial break input`）

## 1. Product Owner 決定
- 2026-10-09: (A) 初回 Break prompt 復元、(B) 未確定入力復元、(C) Back UX B案（確認ダイアログ）を承認。Back UX A案（常設の「ブレイク結果を入力」ボタン）は不採用。
- 2026-10-10: Back 確認ダイアログを **Visual Accepted**。「入力に戻る」＝黒背景・白文字、「閉じる」＝白背景・黒文字。ボタン順序・文言・処理は維持。
- 承認範囲: 最終監査 → Product Source commit → Documentation commit → External GitHub main へ non-force push → read-back。P1 統合、Build、実機配布、App Store 操作は含まない。

## 2. Root Cause
- `restore()` の末尾が `closeBreakResultPromptV61()` を呼び pending（breaker／rack）を消す。初回ラックの Break prompt は新規試合開始（`showBreakResultPromptV61(startingPlayer, 1, {source:"new-match"})`）でしか開かれず、`updateGame()` が再武装するのは次ラック prompt（`rackEnded`）のみ。
- そのため、初回 Break 結果の入力前に中断（pagehide）して再開すると、prompt が戻らず初回の `break_result` が欠落した。Build 84 の source でも同じ（Build 84 相当 source で再現確認済み）。
- 対象競技: Rotation／9-ball／10-ball／JPA9。14-1 と 3 Cushion は Break prompt を持たず影響なし。

## 3. 修正内容
1. `restoreInProgressMatchV1` の末尾: snapshot に `pendingBreakPlayerV61` があり、次ラック prompt（`pendingBreakStartsNextRackV1`）でも `rackEnded` でもないとき、Undo が prompt を開き直すのに既に使う `restoreBreakPromptFromUndoV697` を、保存済みの pending 値（breaker／rack／選択球／スクラッチ／noIn／pre-break foul／illegal／push out）で呼ぶ。prompt を開くだけで、確定・保存・自動確定・二重イベントは行わない。
2. Back 確認ダイアログ `breakResultBackConfirmV1`: 既存 Break 中断ダイアログと同じクラス・構造を再利用（新デザインなし）。「ブレイク結果が未入力です」／「入力をやめると、今回のブレイク結果は記録されません。」／「入力に戻る」「閉じる」。
3. `handleBreakResultBackV3`: `source:"game"` かつ現在ラック（`!pendingBreakStartsNextRackV1`）の prompt の Back だけ確認を挟む。システム Back（popstate）は「入力に戻る」と同じ。
- 変更なし: `restore()`、`closeBreakResultPromptV61` の既存動作、`snapshot()`、snapshot schema、Match schema、Player ID／`registeredPlayerId`／`sharedMatchId`／`resultLabel`、Match events contract、QR、Backup、IAP、Free／Pro、Analytics 計算、Version／Build、Service Worker／cache identity、次ラック prompt の Back、新規 Match 開始時の中断確認。

## 4. 未確定入力の復元（B）
snapshot が保持する breaker・rack・選択球・スクラッチを復元する。Undo で再表示された prompt（前回入力つき）も、中断→再開後に同じ入力で復元される（修正前の候補は空で戻り「無得点」等の誤記録になりえたため、Undo と同じ routine を再利用）。

## 5. Back UX B案と既知の制約
| 操作 | 結果 |
|---|---|
| Back（再開した prompt／Undo で再表示した prompt）| 確認ダイアログ。prompt は背面に維持 |
| 入力に戻る | prompt と選択済み入力を維持。OK で確定した Match は中断なしと一致 |
| 閉じる | prompt を明示的に閉じる。`break_result` は生成されない。以降は従来の Back と同じ |
| システム Back | ダイアログ表示中は「入力に戻る」と同じ |
**既知の制約（仕様）:** B案は完全防止ではない。利用者が「閉じる」を選ぶと、今回の Break 結果は未記録になりうる。「閉じる」後に prompt を呼び戻す UI は無い（既存仕様。再入力機能は未承認のため追加していない）。次ラック prompt の Back は変更していない（Product Owner／Score の判断事項）。

## 6. 検証
- 旧 snapshot 互換: 無修正 main が書いた snapshot 19 件（初回・P2・未確定入力付き・OK 後・ラック途中）を投入し全件復元。18 件は最後まで進行・保存。残り 1 件（Rotation のスクラッチ入力付き）はこの自動入力では終局しない既知の事情で、復元自体は成功。snapshot schema 変更・migration・既存 Match の自動修復・欠落 `break_result` の補完はなし。
- 6 競技 Regression（main 無改変 vs 修正版、41 シナリオ）: 全 PASS。修正対象外 25 シナリオの差は 0（許容は UUID・ISO 時刻のみ）。14-1／3 Cushion は影響なし。
- Break 統計: 初回中断→再開した Match の初回 `break_result` が欠けなくなった（Rotation 0→1、9/10-ball 1→2、JPA9 3→4。中断なしと同数）。統計画面の実数値は未実測。
- Official 108 C3（P1＋本修正の隔離コピー、P1 本体は無変更）: 全 36 run で復元差分が空集合、snapshot raw 値は切替 run 20/20 で byte-identical。
- **最終 source での fresh 検証（2026-10-10）**: Full Node **633/633 PASS**（既存 632 + Back ダイアログの配色テスト 1。fail 0／skip 0）、Match Sharing／QR／Backup／Free-Pro を含む。`git diff --check` PASS。ブラウザ runtime smoke（390x844、最終 source）: Rotation／9-ball／10-ball／JPA9 で 中断→再開→prompt と P2 breaker・選択球の復元→Back→ダイアログ（入力に戻る＝rgb(23,23,23)背景・白文字、閉じる＝白背景・rgb(23,23,23)文字、clipping 0、横 overflow 0）→入力に戻る（prompt・入力維持）→閉じる（prompt 閉、試合画面）が 4/4 PASS。14-1／3 Cushion は再開後も prompt・ダイアログなし。
- 再利用した既存 Evidence: 旧 snapshot 互換・41 シナリオ Regression・C3・Break 統計・14 ケースの入力復元は、Visual Polish 前の候補（`.patch` 上の差は `index.html` の CSS 2 行（ダイアログのボタン配色の入替）のみ）で実施した結果を再利用した。AGENTS.md の再利用条件（関連 code の差分が特定できること）に従い、差分が配色のみであること・Full Node と最終 runtime smoke を再実行したことを理由として記録する。
- 補足: Node の `tests/*.test.mjs` は、既存の流儀どおり隔離コピーで正式 `scripts/build-native-web.mjs` により `native-web/` を生成し `ios/App/App/public/` へ単純コピーして実行した（生成物は commit 対象外）。

## 7. Visual Evidence
`docs/implementation/evidence/restore-initial-break-prompt-fix-2026-10-10/`（合成プレーヤー名のみ）: `1`（再開後の prompt と復元された入力）、`2`（承認された配色の確認ダイアログ）、`3`（入力に戻る後に prompt と入力を維持）、`4`（閉じる後のゲーム画面）。`1`・`3` は prompt 画面で、ダイアログ配色は `2` が最終。

## 8. NOT VERIFIED
- illegal break／pre-break foul／Push Out／14-1 Rebreak（製品で非表示・到達不能。到達不能は PASS ではない）。
- 次ラック prompt の Back（変更なし）。キーボード／VoiceOver の詳細。英語・中国語表示での見え方（i18n 未統合）。
- 公開版 Build 84 実機での再現、過去 Match の欠落件数、統計画面の実数値、PWA／WKWebView の実機。
- **Product Owner Physical PASS は記録していない。**

## 9. 保全状態 / 次 Gate
- P1: `IMPLEMENTATION IN PROGRESS`、S-B flag `LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false`、P1 未統合。本修正の P1 への統合は別 Gate で fresh baseline から判断する。
- Version 1.2 Build 84 の Release 状態、Build 番号、Score RC、公開 Build データは変更なし。Archive／Upload／TestFlight／App Store Connect／Release は 0。
- 次 Gate（提案）: Product Owner の Physical review → P1 統合判断 → 次 Build に含めるか。次ラック prompt の Back の扱いも判断する。この修正を配布 Build に含める際は、Version／Build と cache identity を別 Gate で同期更新する。
