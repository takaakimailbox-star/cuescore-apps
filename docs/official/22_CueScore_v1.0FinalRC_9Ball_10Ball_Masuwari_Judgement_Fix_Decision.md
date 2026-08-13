# CueScore Apps v1.0 Final RC — 9-Ball / 10-Ball マス割判定修正決定

Status: Adopted / Official
決定日: 2026年8月13日
Authority: Product Owner Decision

## Decision 024

9-Ball／10-Ballのマス割は、ブレイクしたプレーヤーが相手へ一度も手番を渡さず、ファールせず、ブレイク入球を含む全対象球をテーブル上からなくしてラックに勝利した場合のみ1回とする。

## 対象球

- 9-Ball：1〜9番
- 10-Ball：1〜10番

勝利対象球の早期入球による既存のラック勝利は変更しない。ただし、他球が残るラック勝利はマス割に数えない。

## 判定責務

保存イベントからスポットを含むテーブル状態を復元する共通関数 `rackGameMasuwariCountsV1(record)` を、Game Result、Match Detail、Player Detail、Player Analytics、Match Analyticsの単一判定源とする。

## 過去record

全対象球の消失を履歴から確認できないrecordはマス割に数えない。旧 `breakRunOut: true` または `break_run_out` だけでは成立とみなさず、推測で補完しない。

## Compatibility

保存schema、localStorage、Backup／Restore、既存record形式、ラック勝敗、Race、Undo、Game Result保存タイミング、スコア推移、Player情報は変更しない。表示・集計時の再計算のみを修正する。

## Relationship

Decision 020〜023を履歴として維持し、そのうち9-Ball／10-Ballのマス割計算定義を本Decisionが後続確定する。
