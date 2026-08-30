# CueScore v1.x — Navigation & Information Architecture Decision

- Date: 2026-08-30
- Status: Official Decision
- Approval: Product Owner adopted
- Architecture: Official 066

## Decision

CueScoreの通常閲覧top-levelを`ホーム｜プレーヤー｜履歴｜設定`の4領域へ整理する。Player閲覧は将来のPlayer Hubへ統合し、Hub内を`成績｜試合｜分析`とする。競技は独立選択画面ではなくHub内Selectorで切り替える。

## Adopted Navigation Behavior

- `＜`／edge swipeは1つ前へ戻る。
- bottom tabはtop-level移動を担う。
- 選択中tab再tapは各領域のrootへ戻る。
- 別tabから戻った時は前回状態をruntimeで復元する。
- Match Detail表示中の別tab選択はDetailを閉じ、選択先へ移動する。
- CueScore logoはHome buttonにしない。
- Match Mode中はbottom tabを非表示にする。

## Adopted Player Hub Defaults

- 初回競技：`9-Ball`
- 初回tab：`成績`
- 2回目以降：Playerごとの最後の競技とtabを復元
- main Playerだけの特殊初期挙動は作らない

## Adopted Home and Opponent Behavior

Homeはactive match再開、新しい試合、最近の試合3件を優先順に表示する。対戦相手選択後は、対戦成績とその相手との試合一覧を同一画面に表示し、選択だけの中間画面を追加しない。

## Future Practice

練習機能を正式採用・実装する段階でのみ第5tab`練習`を追加する。v1.0では表示しない。

## Non-goals

本Decisionはscoring、saved-data schema、analytics計算式、Backup／Restore、競技ルールを変更しない。

## Implementation Policy

一括全面改修ではなくPhase分割で実装する。各Phaseで全自動test、390×844、native asset同期、iOS build、必要な実iPhone回帰確認を行う。Product Ownerの明示承認前にExternal TestFlight、App Store Review、一般公開を実施しない。
