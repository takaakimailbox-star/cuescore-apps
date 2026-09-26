# CueScore JPA 9-Ball Dead Ball UI Specification

**Status:** Adopted / Prototype PASS / Implementation Complete / Build 79 Internal TestFlight / Product Owner Accepted
**Decision:** `99_CueScore_JPA9_Dead_Ball_UI_Decision.md`
**Publication date:** 2026-09-25
**Implementation status:** Complete; Version 1.1 Build 79 Internal TestFlight and Product Owner physical iPhone verification PASS; App Store update not started

**Final Product Owner correction:** 2026-09-26 — 新規Dead visualを不採用。現行通常Dead球の既存`state="used"`表示をそのまま使用。

## 1. Dead Ball definition

Dead Ballは、JPA 9-Ballで得点としてどちらのPlayerにも与えられない的球数である。

| Input situation | Dead delta | Required interpretation |
| --- | ---: | --- |
| 通常のDead Ball操作で1〜8番を確定 | +1 / 球 | 当該球を得点から除外しDead Ballとして表示 |
| ブレイクで1〜8番を入れ、同時にスクラッチ／ファール | +1 / 球 | 入った的球だけをDead Ballとして表示 |
| 通常ショットで1〜8番を入れ、同時にファール | +1 / 球 | 当該球をDead Ballとして表示 |
| 入球なしのスクラッチ／ファール | 0 | Foulだけを記録 |
| 9番 | 0 | Dead Ballに変換しない。現行JPAルール処理を維持 |

ファール数とDead Ball数は別の値であり、ファール1回をDead 1として扱わない。

## 2. Existing event authority

新しい保存fieldを追加せず、現行のUndo-awareな共通event logを累計の正本とする。

- 通常Dead Ballは`sourceType="ball_dead"`のeventを1〜8番に限定して1球ずつ数える。
- ブレイク同時Dead Ballは`sourceType="break_result"`の`data.deadBalls`を1〜8番に限定して数える。
- 同一の通常Dead Ballについて、`ball_pocketed.data.dead=true`と後続`ball_dead`を二重加算しない。
- `foul`、`scratch`、`breakFoul`のflagだけでは加算しない。
- 9番はevent入力に含まれていても累計から除外する。

event identityと球番号の組み合わせで重複を避ける。表示値は有効なeventだけから再計算し、Undoで無効化されたeventを含めない。

## 3. In-game summary

JPA 9-Ballのゲーム中画面だけ、スコアカードと入力履歴の間にcompactなsummary rowを表示する。

- 第一Prototype: `ラック {rack} ｜ イニング {inning} ｜ デッド {count}`。
- 3項目は同じ視覚階層、等分幅、tabular numberで表示する。
- スコアカード、球入力、5操作ボタンのtap領域を縮小しない。
- 390×844で縦方向の欠落、横overflow、Bottom Navigationとの競合を発生させない。
- countは0でも常時表示する。

文言、separator、色、角丸、余白はPrototypeレビュー後に最終確定する。

## 4. Input history

JPA 9-Ballのlive historyと保存済みMatch Detail historyで、Dead Ballの球を通常得点球と区別する。

- 通常Dead Ballは、現行実装`logItemHtmlV1()`が`jpa_dead`に使用する`CueScoreBallIcon.html(..., {state:"used"})`の表示を一切変更しない。
- ブレイクスクラッチ／ファール同時入球がDeadとして確定した場合も、通常Dead Ballと同じ`state="used"`表示を使用する。
- 新しいDead visualを設計せず、色、濃さ、opacity、saturation、brightness、サイズ、border等を再定義しない。
- 新しいDOM上の文字ラベル、badge、×印、記号は追加しない。
- 既存の表示方法、配置、event順序、記号、履歴行の高さ、spacing、layoutを変更しない。
- ブレイク同時Dead Ballは`B`、Dead Ball、`F`の順序関係が読み取れるようにする。
- 通常ファール同時Dead BallはDead Ball、`F`の順序関係が読み取れるようにする。
- 入球なしスクラッチはDead Ballを生成せず、`B F`または該当Foul表示だけを残す。
- accessibility labelには球番号とDead Ballであることを含める。

初回Prototypeの`DEAD`文字ラベル案と、次Prototypeの`opacity: 0.46`／`saturate(0.55)`／`brightness(0.82)`案はProduct Owner reviewで不採用。採用仕様と混同せず、製品へ適用しない。

## 5. State transitions

### Normal Dead Ball

1. 1〜8番の入球を記録する。
2. 既存のDead操作で直前球をDead Ballへ変換する。
3. 得点を加算前へ戻し、共通eventへ`ball_dead`を残す。
4. 累計とhistoryを同じeventから更新する。

### Normal foul with pocketed ball

1. 1〜8番の入球を記録する。
2. 当該球をDead Ballへ変換する。
3. Foulを記録する。
4. 球はDead +1、Foulは既存Foul集計へ1回だけ記録する。

### Break scratch or foul

ブレイク入力でポケット球とスクラッチ／ファールが同時に確定した場合、1〜8番だけを`break_result.data.deadBalls`として扱う。入球なしでは配列を空とし、9番はDead Ball配列と累計から除外する。

## 6. Undo and recovery

- 各入力前の既存snapshotには`commonEventsV7`、JPA state、rowsが含まれるため、Undoはevent、累計、historyを同時に直前状態へ戻す。
- 中断試合は既存`cueScore.inProgressMatch.v1` snapshotとUndo historyで復元し、復元後の累計は有効eventから再計算する。
- 完了試合は既存`eventLog.events`を保存し、Match Detailは同じeventからDead Ball表現を再構築する。
- 旧recordでDead Ball判定情報が不足する場合、推測で補完しない。

## 7. Match History Analytics and Backup

- Match History一覧カードのscore、Race、Player名、navigationは変更しない。
- Match DetailのJPAゲーム履歴だけDead Ball表示を追加する。
- Analyticsの平均、ハイラン、ブレイクイン率、ファール数／率、shot関連の既存計算式は変更しない。Dead Ballを新しい分析metricとして追加しない。
- Backupは完了recordをそのまま含み、Restore migrationは未知fieldを保持する現行contractを維持する。Backup schema versionは変更しない。

## 8. Current implementation findings

- 通常Dead Ballは、1〜8番制限、得点巻戻し、`ball_dead` event、Undo snapshot、完了recordの`deadBallEvents`まで実装済み。
- ブレイクスクラッチでは`break_result.data.deadBalls`が保存されるが、live rowとMatch Detailはポケット球を通常球として描画している。
- 現行break decisionが`deadBalls`を自動設定する条件はscratchであり、ポケット球を伴う一般break foulを同じDead処理へ入れる独立branchはない。採用仕様を製品実装する際は、既存JPA break ruleを変えず、同時入球が存在するfoul caseだけを明示的に検証する。
- 現行`deadBallsV1`はラック開始時にresetされるため、試合累計の正本にはできない。
- 現行ブレイクスクラッチ処理は選択球を一括で`deadBallsV1`へ入れるため、製品実装時に9番除外を明示的に検証する必要がある。
- `jpaDeadEventsV1`は通常Dead操作を保持するが、ブレイク同時Dead Ballは`break_result`側にある。どちらか片方だけでは累計を構成できない。

## 9. Implementation acceptance

- Dead 0、Dead 1、複数Deadが常時正しく表示される。
- ブレイクスクラッチ＋的球1個はDead 1、スクラッチのみはDead 0。
- 通常ファール＋入球は当該球だけDead加算し、Foul自体を加算しない。
- 9番はDeadへ変換されず、既存得点・終了処理が維持される。
- Undo、中断／復元、完了保存、Match Detail、Backup／Restoreで表示が一致する。
- 他5競技へDead UIまたは用語が現れない。
- Analyticsの既存値と保存schemaに変更がない。

2026-09-26、上記acceptanceをfocused test、全Node regression、Release Simulator build、390×844 visual auditでPASSし、Product OwnerがImplementationを受け入れた。Version 1.1 Build 79をInternal TestFlightへ配布し、Product Owner physical iPhoneでVersion、cold launch／Home、JPA開始時Dead summary、normal Dead、break scratch Dead history／既存visual／累計、Undo history／累計を`ALL PASS`とした。dry scratch、9番除外、中断復元、History／Backupはautomated EvidenceでPASSしているが、このphysical device確認には含めない。Implementation Evidenceは`docs/implementation/CueScore_JPA9_Dead_Ball_UI_Implementation_2026-09-26.md`、physical acceptanceは`docs/implementation/CueScore_Build79_Product_Owner_Physical_iPhone_Acceptance_2026-09-26.md`を正本とする。App Store Version 1.1 updateは未開始。
