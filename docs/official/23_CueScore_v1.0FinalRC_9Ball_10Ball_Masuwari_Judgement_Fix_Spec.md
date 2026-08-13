# CueScore Apps v1.0 Final RC — 9-Ball / 10-Ball マス割判定修正仕様

Status: Official Addendum
Publication date: 2026年8月13日
Supersedes: 既存Game Result／Match Detail／Player Detail／Analytics仕様の9-Ball／10-Ballマス割計算

## 共通判定

`rackGameMasuwariCountsV1(record)`は、9-Ball／10-Ballの保存イベントをラック単位で評価する。

成立条件は、合法ブレイク、ブレーカーのラック勝利、ブレーカーの無ファール・無スクラッチ、相手への手番移行なし、相手のプレーなし、スポット反映後の全対象球消失のすべてを満たすこととする。

## テーブル状態

ラック開始時は9-Ballで1〜9番、10-Ballで1〜10番がテーブル上にあるものとする。ブレイク入球と通常入球で該当球を除き、`spot_ball`／`SpotBall`で該当球を戻す。ラック終了時に集合が空の場合のみマス割を1加算する。

## 非成立

- ブレイクまたは継続手番で勝利対象球のみを早期入球し、他球が残る
- プレーヤー交代が一度でもある
- ブレーカーのファール、スクラッチ、イリーガルブレイク、プレブレイクファールがある
- 相手が入球、セーフティ、ファール、ミス等のプレーを行う
- スポットされた対象球がラック終了時に残る
- 球番号単位の履歴が不足し、全対象球消失を確認できない

## 画面・集計

Game Result、Match Detail、Player Detail、Player Analytics、Match Analyticsは共通判定結果を使用する。旧 `breakRunOut`／`break_run_out`フラグだけから独自に加算しない。

## Compatibility

保存schemaと保存値は変更しない。既存recordを表示・集計する際にイベントから再計算する。判定材料が不足するrecordは0回として扱い、推測で補完しない。
