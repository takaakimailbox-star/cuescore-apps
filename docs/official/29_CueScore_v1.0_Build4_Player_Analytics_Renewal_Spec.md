# CueScore v1.0 Build 4候補 — Player分析リニューアル仕様

Status: Official Release
Publication date: 2026年8月18日
Decision: `28_CueScore_v1.0_Build4_Player_Analytics_Renewal_Decision.md`

## Player分析トップ

Player／競技選択の後に、今の状態、主要指標、切替式推移チャート、強みと次の課題、自己ベスト、Rival／Single Match Analysis入口を順に表示する。iPhone portraitの2列カードを基本とし、390pxで横overflowを発生させない。

## 競技別主要指標

|競技|指標|
|--|--|
|9-Ball／10-Ball|シュート率、ブレイクイン率、マス割り率、平均ファール|
|Rotation|シュート率、ブレイクイン率、ハイラン、平均ファール|
|JPA 9-Ball|アベレージ、ブレイクイン率、ハイラン、平均ファール|
|14-1|アベレージ、ハイラン、平均ファール|
|3 Cushion|アベレージ、ハイラン|

## ブレイクイン率

分子は、対象Playerの判定可能な`break_result`のうち、1球以上入球し、foul、scratch、break foul、illegal break、pre-break foul、break失敗のいずれもないevent数とする。複数球入球でも1成功とする。分母は対象Playerの判定可能な`break_result` event数とする。

詳細判定材料がないevent／recordは除外する。分母0は`—`とする。

## Player分析用マス割り率

分子は`rackGameMasuwariCountsV1(record)`の正式判定結果とする。分母は、本人の判定可能な`break_result`と同一rackの`rack_end`を現行共通event logで確認できる完了ラック数とする。

旧`breakRunOut`だけの推定、早期money ball、turn transfer、判定材料不足rackは対象にしない。分母は本人の有効な`break_result`と同一rackの`rack_end`があり、break foul等や`player_switch`のない判定可能な完了rackだけとする。分母0は`—`とする。

## 平均ファール

`総ファール数 ÷ 対象試合数`を維持する。ファール手番率は実装しない。

## 推移と今回のポイント

推移チャートは1つとし、競技別主要指標と勝率をタブで切り替える。eligible valueがない点を0として描画しない。今回のポイントは比較可能な指標だけから強みと次の課題を各1件生成し、比較不能時は「比較できません」とする。

## 自己ベスト

- 正のPlayer別`maxRun`から最大ハイランを選ぶ。
- 正のPlayer別`score`から1試合最高／最多得点を選ぶ。
- シュート分母、break event、正式マス割り分母、Player別completedTurnsが成立するrecordだけを条件付き指標へ使用する。
- 3C最少イニング勝利は、勝利recordかつ正のPlayer別turn数がある場合だけ選ぶ。
- 0と欠損は候補にしない。
- 同値は`endedAt`／`playedAt`の新しい順、その後Match ID辞書順で選ぶ。最少イニングだけ指標値を昇順とする。
- カードはMatch IDを使って`openMatchDetailV1(id)`へ遷移する。

## Data and compatibility

すべてderived metricとして表示時に算出する。Player、Match、Backup、event schemaと保存keyを変更しない。通常データとサンプルデータは既存の分離されたreaderから同じ集計処理へ渡す。

## Acceptance criteria

- 全6競技で指定された主要指標だけが表示される。
- event不足、分母0、比較不能を0で補完しない。
- 新しいマス割り率の分母は本人breakの判定可能な完了rackだけである。
- 自己ベストのeligible判定、tie-break、Match Detailリンクが機能する。
- Rival AnalysisとSingle Match Analysis入口を維持する。
- 390px portrait、長いPlayer名、通常／サンプル切替で横overflowがない。
- 全自動テスト、native asset一致、iOS Simulator Debug／ReleaseをPASSする。

## Revision history

- 2026-08-18: Decision 28の実装契約と受入基準を初版発行。
