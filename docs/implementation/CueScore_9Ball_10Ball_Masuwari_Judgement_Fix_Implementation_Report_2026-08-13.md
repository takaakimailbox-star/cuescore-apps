# CueScore Apps v1.0 Final RC — 9-Ball / 10-Ball マス割判定修正 実装報告

実装日: 2026年8月13日

## 変更概要

- 共通判定関数 `rackGameMasuwariCountsV1(record)` で、ラック終了時のテーブル状態をイベントから復元するよう修正した。
- 9-Ballは1〜9番、10-Ballは1〜10番の全消失を必須とした。
- ブレイク入球、通常入球、スポット、ファール、スクラッチ、イリーガルブレイク、プレーヤー交代、相手のプレー、ラック勝者を判定へ反映した。
- 勝利対象球の早期入球によるラック勝利ルールは変更していない。
- Game ResultとPlayer／Match Analyticsの独自フラグ参照を廃止し、Match Detail／Player Detailと同じ共通判定へ統一した。
- 判定材料が不足する過去recordは、旧フラグから推測せず0回とする。

## Compatibility

保存schema、localStorage、Backup／Restore、既存record形式、過去record、ラック勝敗、Race、Undo、Game Result保存タイミング、スコア推移、Player情報は変更していない。

## 文書

- Formal Decision 022と後継仕様023を追加した。
- Official Design Decision Log v1.8へDecision 024を追加した。
- `docs/README.md`と`docs/CURRENT_STATE.md`を更新した。

## テスト

- 9-Ball 10ケース、10-Ball 10ケース、全経路一致1ケースを追加した。
- 既存の誤った「9番のみ入球＝マス割1回」期待値を正式定義へ更新した。
- 全回帰テストは106件成功、失敗0件、スキップ0件。
