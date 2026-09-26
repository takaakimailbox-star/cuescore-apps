# CueScore JPA 9-Ball Dead Ball UI Decision

**Status:** Adopted / Prototype PASS / Implementation Complete / Product Owner Accepted / Undistributed
**Decision date:** 2026-09-25
**Approved by:** Product Owner
**Release boundary:** Version 1.0 Build 78 remains unchanged

**Final Product Owner correction:** 2026-09-26 — 新しいDead visualは設計せず、現行製品の通常Dead球表示を全Dead Ballへそのまま統一適用する。

## Decision

JPA 9-Ballのゲーム中画面へ、試合開始から現在までの累計Dead Ball数を常時表示する。Dead Ballは、得点としてどちらのPlayerにも与えられない的球を指す。

Dead Ballに含めるのは次の球である。

- 通常操作でDead Ballに確定した的球。
- ブレイク時、スクラッチまたはファールと同時にポケットされた的球。
- 通常ショットでファールと同時にポケットされ、Dead Ballに確定した的球。

ファールまたはスクラッチという事象自体はDead Ballへ加算しない。何も入らないスクラッチはDead 0、3番を入れてスクラッチした場合は3番をDead Ballとして1球加算する。9番はDead Ballに含めず、現行JPA 9-Ballの9番処理を維持する。

## UI direction

累計Dead Ball数はゲーム中に常時確認できる情報として、スコアカードと入力領域を圧迫しない位置へ置く。第一Prototypeでは、スコアカード直下に`ラック 1 ｜ イニング 1 ｜ デッド 1`の3項目行を置く。

入力履歴の既存表示方法、配置、event順序、記号、高さ、spacing、layoutは変更しない。通常Dead Ballが現在使用している既存`state="used"`の球表示を正本とし、ブレイクスクラッチ等でDeadとなった入球にもまったく同じ表示を適用する。通常Dead球の色、濃さ、opacity、saturation、brightness、サイズ等は変更しない。新しい文字ラベル、badge、記号、×印は追加しない。

初回Prototypeの`DEAD`文字ラベル案と、その後の新規opacity／saturation／brightness調整案は、2026-09-26のProduct Owner reviewで不採用となった。いずれも採用仕様ではない。

## Scope

- 対象はJPA 9-Ballのゲーム中画面と、そのJPA eventから生成されるゲーム履歴表示に限る。
- 9-Ball、10-Ball、Rotation、14-1、3 Cushionへ`Dead`用語や同じ表示を追加しない。
- 他競技のファール同時入球UIは別Decision候補とする。

## Data and compatibility direction

現行の共通event logにDead Ballを判定できる情報が存在するため、累計表示と履歴表現は既存eventから導出する。新しい保存schemaは追加しない。

Undo、中断試合保存／復元、Match History、Backup／Restoreでは既存eventとsnapshotを正本として維持する。Analyticsの既存指標・式・集計対象は本Decisionでは変更しない。

## Protected contracts

- JPA 9-BallのSL、Race、得点、9番2点、勝敗、マッチポイントを変更しない。
- 既存Player、Match、event、Backupのschemaを変更しない。
- Version 1.0 Build 78の製品source、Archive、App Store公開状態を変更しない。
- Product OwnerのPrototype承認前に製品実装、Build番号更新、Archive、TestFlight、App Store Connect操作を行わない。

## Gate

Product Ownerは修正版390×844 Prototypeを承認し、Prototype Gateを`PASS — READY FOR IMPLEMENTATION`とした。2026-09-26に本Decisionの範囲で製品実装、focused／全Node regression、Release Simulator build、390×844 visual auditを完了し、Product OwnerがImplementationを受け入れた。実装は未配布であり、次Gateは将来Buildへの収載判断とする。公開済みVersion 1.0 Build 78は変更しない。
