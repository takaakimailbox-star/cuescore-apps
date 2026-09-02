# CueScore v1.0 Build 34 Match Card C／Back Navigation Spec

- Status: Adopted / Implemented
- Date: 2026-09-02

## Match Card C

- 最近の試合: 日付、対戦相手、勝敗badge、スコア、chevronを一つのcompact cardに配置する。
- 競技別全試合: 日付／勝敗、対戦相手／スコア、Race toの3行構成とする。
- 対戦相手別: 固定済みの相手情報を重複表示せず、日付、勝敗、スコア、Race to、chevronを保持する。
- 全体履歴: 2 player lane、score、Race to、discipline icon、chevronを保持して縦余白を圧縮する。
- 390px portraitでhorizontal overflowを禁止し、名前はellipsis、scoreはnowrapとする。

## Match Detail Back

open前のcapture phaseで次をsnapshotする。

- origin kind
- Player／discipline／opponent context
- listまたはdetail bodyのscrollTop
- 選択中filter（存在する場合）

Back button、Escape、iOS edge Backはいずれも共通close contractを通り、Player個人成績、競技別全試合、対戦相手別一覧、全体履歴の正しい所有元を再表示してscrollTopを復元する。

## Acceptance

- 全6競技でMatch Detailを共有する。
- 長い名前と大きいスコアで欠落や横スクロールがない。
- 各入口から開いて1回のBackで直前文脈へ戻る。
- source／native-web／iOS copied assetsが一致する。
- 自動回帰test、390px UI確認、iOS Release buildを通す。
