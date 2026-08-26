# CueScore Current UI Audit — 2026-08-26

Build 11時点の現行UIを、貴章さんが画面単位で追いやすいよう整理した監査セットです。

## まず見るもの

1. [Screenshot Index](../../../CueScore_Current_UI_Screenshot_Index_2026-08-26.md)
2. [Screen / State Inventory](../../../CueScore_Current_UI_Screen_Inventory_2026-08-26.md)
3. [Visual Issue Audit](../../../CueScore_Current_UI_Visual_Issue_Audit_2026-08-26.md)
4. [Deferred / Compatibility](../../../CueScore_Current_UI_Deferred_Compatibility_2026-08-26.md)

## 撮影条件

- 主監査セット: Google Chrome、viewport `390 × 844`、device scale factor `1`、Light
- URL: ローカル配信した現行`main`の`index.html`
- データ: CueScore公式Sample Data（分析画面）、通常データ領域（Backup）
- 主監査画像: 22枚、すべて`390 × 844 px`を検証済み
- `environment/000_...png`はiPhone 17 Simulator（iOS 26.5）の参考画像で、主監査セットには含めない

## フォルダ

- `v1/`: 通常導線の採用画面
- `modals/`: popup / modal / bottom sheet
- `gameplay/`: ゲーム中画面（次の撮影単位）
- `empty-states/`: 空状態（次の撮影単位）
- `deferred-compatibility/`: 通常導線外。必要な場合だけ格納
- `environment/`: 撮影環境の参考画像

## 再撮影

ローカルサーバーをrepository rootで起動し、`scripts/capture-current-ui-audit.mjs`を実行します。スクリプトはSample Dataへ入り、正規の画面操作で採用画面を撮影します。

このセットは「撮影できた範囲」と「未撮影」を明確に分けています。Gameplay、Player編集／登録、OS所有の写真・ファイル選択UI、Restore状態は未撮影であり、完了扱いにしません。
