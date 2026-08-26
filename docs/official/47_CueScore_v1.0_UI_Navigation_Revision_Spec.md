# CueScore v1.0 — UI / Navigation Revision Specification

- Status: Official Specification
- Adopted: 2026-08-26
- Approval: Product Owner
- Implements: Official Decision 046

## Discipline Detail / Self Best

- Rotation: `最大ハイラン`、`最高シュート率`を保持し、`1試合最高得点`を表示しない。
- 14-1: `最大ハイラン`、`最高アベレージ`を保持し、`1試合最高得点`を表示しない。
- JPA 9-Ball: `最大ハイラン`、`最高アベレージ`を保持し、`1試合最高得点`／`1試合最多得点`を表示しない。

## Trends

- `主要指標`の下、`自己ベスト`の上に`グラフで見る ›`を配置する。
- metric cellは値表示だけとし、個別bottom sheetを開かない。
- page titleは`{競技名} 推移`。Backは元の同一Player・同一競技詳細へ戻る。
- 9-Ball／10-Ballは勝率、シュート率、ブレイクイン率、マス割り率、ファール率の順。
- その他は既存定義に存在する指標だけを採用順で表示する。
- 各graphは既存のY軸、日付、同日連番、point calloutを再利用する。10試合を通常portrait幅で読める領域とし、多数時はgraph領域を横scroll可能にする。
- eligible値がなければ位置を保って`データなし`を表示する。

## Opponent Records

- Player avatar／nameと固定競技を表示する。競技select／chevron、4項目summary、対戦数順／勝率順を表示しない。
- groupの最新match時刻を降順にする。同時刻は既存opponent key／Player IDの昇順。
- cardは相手、試合数、判定可能な勝敗、勝率、右chevronを保持する。

## Histories

- 相手固定履歴の順序はPlayer vs Opponent、aggregate、月別履歴。
- 相手固定match cardは日付、時刻、race／target、勝敗、score、chevronだけを基本とし、競技icon／text、相手avatar／name、詳細／分析buttonを表示しない。
- Player履歴は期間button、詳細／分析buttonを表示しない。競技・相手・日時・race／target・勝敗・scoreは保持する。
- いずれもcardを一つの明確なbuttonとしてMatch Detailへ接続し、accessible nameに試合文脈を含める。

## Player List

- title、登録人数、検索、`＋`を保持し、並び替えcontrolを表示しない。
- rowはsmall avatar、Player name、one-line memo、right chevron。main indicatorをavatar付近へcompactに統合する。
- main Playerを常に先頭。その他は実matchの最新参加日時が新しい順。未使用Playerは使用済みPlayerの後に置く。同値と未使用同士は既存stable IDの昇順。
- long name／memoはellipsisとし、390×844で横overflowを発生させない。

## Navigation / Compatibility

- `競技詳細 → 推移 → 競技詳細`、`競技詳細 → 対戦相手別成績 → 競技詳細`、`相手固定履歴 → Match Detail → 相手固定履歴`を維持する。
- 左上Backとedge Swipe Backは表示中の標準Back controlへ集約する。
- Match Analysis、Deep Rival Analysis、個別trend bottom sheetは通常v1導線に表示しない。
