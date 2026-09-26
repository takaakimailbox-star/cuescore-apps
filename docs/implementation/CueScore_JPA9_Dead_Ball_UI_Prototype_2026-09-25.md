# CueScore JPA 9-Ball Dead Ball UI Prototype Evidence

**Date:** 2026-09-25
**Final correction:** 2026-09-26 after Product Owner review
**Gate:** Adopted / Prototype only / Product implementation not started
**Baseline:** `a318a7588093a715913d1e69f10ccf681ccab0c8`

## Conclusion

JPA 9-Ballの現行game screenを基準に、スコアカード直下へ`ラック ｜ イニング ｜ デッド`のcompact summaryを追加し、ブレイクスクラッチ等のDead Ballへ現行通常Deadの既存表示を統一適用する最終訂正Prototypeを作成した。390×844の6状態で、score cards、ball input、5 action buttonsを維持している。

初回Prototypeの`DEAD`文字ラベル案と、次Prototypeの新規opacity／saturation／brightness調整案は2026-09-26のProduct Owner reviewで不採用。最終訂正版はlabel、badge、×印や新しいvisualを追加せず、現行通常Deadの表示方法、配置、event順序、記号、history行の高さ、spacing、layoutを正本とする。本成果物はProduct Ownerレビュー用であり、製品sourceへ実装していない。

## Existing normal Dead presentation authority

- 現行`logItemHtmlV1()`は`jpa_dead` itemを`CueScoreBallIcon.html(number, {size:"history", state:"used"})`で描画する。
- 現行Official BallIcon CSSの`data-ball-state="used"`をそのまま再現する。新しいDead用CSS値は決めない。
- 現行値は20×20px history ball、`--cue-ball-color:#b8b8b5`、文字`#858582`、背景`#f3f3f1`、`opacity:1`、`filter:none`、`box-shadow:none`。
- これらは新規デザイン値ではなく、公開Build 78 sourceに存在する通常Dead表示のEvidenceである。

## Source findings

| Area | Current source | Finding |
| --- | --- | --- |
| Normal Dead | `markLastJPA9BallDeadV1()` | 直前の1〜8番を0点へ戻し、`ball_dead` eventとhistory objectを生成 |
| Break scratch / foul | `buildBreakDecisionV700()` / `saveBreakResultV61()` | scratch時は`break_result.data.deadBalls`とrack-local setへ保存。historyは通常球表示。一般break foul＋入球の独立Dead branchは現行なし |
| Foul with pocket | `pocketBall()` → Dead → `foulEvent()` | 現行操作の組合せでevent factsを保持可能 |
| Undo | `snapshot()` / `restore()` / `saveAndDo()` | common events、rows、JPA stateを復元 |
| Interrupted match | `cueScore.inProgressMatch.v1` | snapshotと最大50件のUndo stateを保存／復元 |
| Completed record | `saveCurrentMatchRecord()` | `jpa9.deadBalls`、`deadBallEvents`、`eventLog.events`を保存 |
| Match Detail | `historyRowsV1()` | Dead Ball専用branchがなく、break／shot球を通常球として描画 |
| Analytics | result and analytics reducers | Deadを独立metricとして集計しない。既存metric変更はscope外 |
| Backup / Restore | schema 2 backup | match record全体を保存し、normalizerは未知fieldを保持 |

## Event derivation

累計Deadはrack-localな`deadBallsV1`ではなく、現在有効な`commonEventsV7`から導出する。

1. 通常Deadは`ball_dead`を1〜8番に限定して数える。
2. ブレイク同時Deadは`break_result.data.deadBalls`を1〜8番に限定して数える。
3. Foul／scratch flag自体は数えない。
4. 通常Deadの元`ball_pocketed.data.dead=true`は、後続`ball_dead`と重複して数えない。
5. 9番は常に除外する。

この導出で新しい保存schemaは不要である。

## Visual evidence

修正版390×844 PNGを次の6状態で作成した。

1. `01_normal_scoring_ball_390x844.png` — 通常得点球③。
2. `02_dead_ball_390x844.png` — 現行通常Deadの既存`state="used"`表示。
3. `03_break_scratch_dead_ball_390x844.png` — 既存順序`B ③ F /`、③へ同じ既存通常Dead表示を適用。
4. `04_normal_foul_dead_ball_390x844.png` — 既存順序`③ F`、③へ同じ既存通常Dead表示を適用。
5. `05_dead_0_390x844.png` — 入球なしスクラッチ、`B F /`、Dead 0。
6. `06_multiple_dead_390x844.png` — 複数Dead、累計3。

Contact sheet: `00_contact_sheet.png`。

各PNGのpixel寸法とSHA-256は同Evidence directoryの`manifest.json`へ固定した。

## Prototype review questions

- 通常DeadとブレイクスクラッチDeadが、現行通常Deadの既存`state="used"`表示で完全に同じ見た目か。
- `ラック ｜ イニング ｜ デッド`の累計値が各caseで正しいか。

## Boundary

- Product source changes: 0。
- Version / Build changes: 0。
- Archive / TestFlight / App Store Connect operations: 0。
- Version 1.0 Build 78 remains the released product.
