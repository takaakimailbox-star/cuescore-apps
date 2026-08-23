# CueScore v1.0 Build 8候補 平均ファール/ラック Specification

- Status: Official Specification
- Published: 2026-08-24 (JST)
- Decision: Official 038

## Formula and display

`平均ファール/ラック = eligible recordに保存された対象Playerの総ファール数 ÷ 同recordの判定可能な完了ラック総数`

表示名は`平均ファール/ラック`、表示精度は小数第2位までとする。分母0は`—`、分子0かつ分母が正なら`0.00`。3 Cushionのmetric setには追加しない。

## Completed-rack evidence

- 9-Ball／10-Ball：完了保存recordの`rackResults`（競技別配列を含む）にある一意なrack。配列がない場合は詳細event ledgerの一意な`rack_end`。
- Rotation／JPA 9-Ball：詳細event ledgerの一意な`rack_completed`または`rack_end`と、`game_end`で確定する最終rack。同じrackは1回だけ数える。
- 14-1：`straightPool.rerackEvents`、または詳細event ledgerの`straight_pool_rerack`／`straight_pool_three_foul`で確定する再ラック境界。試合終了時に進行中のphysical rackは完了扱いにしない。

終了日時と勝敗結果を持つ完了保存recordだけを候補にする。境界証拠がない旧・簡易record、現行Sample Data v3.1のRotation／14-1／JPA 9-Ball points recordはineligibleとし、`record.rack`、得点、イニング数から推定しない。9-Ball／10-BallのSample Data v3.1は明示的な`rackResults`を利用できる。

複数recordの集計ではeligible recordのファールだけを分子へ足し、ineligible recordのファールを混ぜない。ファール保存値が欠損、負数、非数値なら当該recordを除外する。

## Compatibility and acceptance

表示時のderived metricであり、保存、Backup、Restore、Undo、競技処理、通常／サンプルデータのreaderとschemaを変更しない。

Acceptance：4ラック／4ファール=`1.00`、10ラック／4ファール=`0.40`、4ラック／0ファール=`0.00`、分母不明=`—`、途中ラック除外、3 Cushion非表示。iPhone portraitで主要指標を横overflowなしに保つ。
