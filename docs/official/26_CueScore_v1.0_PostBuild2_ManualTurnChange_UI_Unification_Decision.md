# CueScore v1.0 Post-Build 2 Manual Turn Change UI Unification Decision

Status: Official Release
Publication date: 2026-08-18
Approved by: Product Owner

## Decision

Rotation、9-Ball、10-Ball、14-1、JPA 9-Ballでは、通常のファールまたはセーフティ入力後の交代操作を、既存Rotation方式へ統一する。

1. 入力は現在Playerのイベントとして記録する。
2. 自動交代せず、交代待ち状態へ入る。
3. 交代待ち中は通常のゲーム入力を無効にし、「交代」で次Playerへ移る。
4. 交代後に通常入力を再度有効にする。
5. Undo、中断、再開、復帰はRotationで既に保存されている交代待ち状態を共通利用する。

14-1の3ファール成立時に行う既存の減点、再ラック、次ブレーカー決定は競技処理であり、本UI統一では変更しない。3Cは対象外とする。

JPA 9-Ballの「デッド」はゲーム操作列の一番左へ移す。機能、得点処理、イベント記録は変更しない。

## Compatibility boundary

- 得点、勝敗、ラック、JPA SL／Race／マッチポイント、セーフティ集計、Analytics定義を変更しない。
- Player、Match、保存、BackupのschemaおよびUndo上限を変更しない。
- Build 2は既にTestFlightへ配信済みであり、この決定を含まない。次の配布にはBuild Number 3以上を使用する。
- App Review提出および一般公開は別のProduct Owner承認を必要とする。

## Revision history

- 2026-08-18: Product Owner採用内容をOfficial Releaseとして初版発行。
