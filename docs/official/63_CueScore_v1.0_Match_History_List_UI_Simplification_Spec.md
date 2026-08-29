# CueScore v1.0 — Match History List UI Simplification Spec

- Status: Official / Product Owner adopted
- Date: 2026-08-30
- Decision: Official 062

## Screen Contract

全体の試合履歴一覧は次の順で表示する。

1. `試合履歴一覧`
2. 種目tab
3. 選択tabの試合件数
4. 履歴card一覧または既存empty state

検索field、`絞り込み`button、詳細filter panel、`新しい順`／`古い順`選択、保存状態表示は置かない。削除した領域に専用containerの高さ、margin、paddingを残さない。

## Filtering and Ordering

- `すべて`は全競技、各種目tabは該当競技だけを対象とする。
- 件数はtab対象record数と一致させる。
- 各tabとも`endedAt`、なければ`playedAt`の降順で表示する。
- 日時が同じ場合は既存Match IDの辞書順で安定させる。新しいschema fieldは追加しない。
- 日時が不正または欠損する互換recordは時刻0として扱い、Match IDで決定的に並べる。

## Unchanged

- 履歴cardの内容とlayout
- cardからMatch Detailへの遷移
- Match DetailのBack tap／edge Swipe Back
- 勝敗判定、score、Player情報
- saved-data schema、Backup／Restore、分析、採点

## Acceptance

- title、7種目tab、tab件数、固定順、empty state、Match Detail遷移を確認する。
- 検索／filter／sort controlが0件であることを確認する。
- 390×844で横overflowと削除領域の不要余白がないことを確認する。
- 全既存testをPASSさせ、実iPhone確認は別Gateとして記録する。
