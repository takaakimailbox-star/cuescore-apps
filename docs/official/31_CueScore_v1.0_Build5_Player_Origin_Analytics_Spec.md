# CueScore v1.0 Build 5候補 Player起点分析 Spec

- Status: Official Release
- Version: 1.0
- Published: 2026-08-18 JST
- Approval: Product Owner

## Navigation contract

Player Detailは「プレーヤー分析を見る」と「試合一覧」を表示する。Player AnalysisはPlayer IDと選択競技をruntimeで受け取る。試合一覧は対象Player参加recordだけを表示し、各recordからMatch Detailまたは「この試合を分析」を選べる。Match AnalysisはMatch IDとviewer Player IDをruntimeで受け取る。同一Matchでもviewerを入れ替えれば、主役、結果、主要指標、良かった点、改善点の視点を入れ替える。

## Player Analysis UI

- compact Player headerと競技selector
- compact「今の状態」と2列主要指標
- 推移指標はselectで切替し、390pxで見切れさせない
- chartは高さを抑え、欠損点を0で結ばない
- 比較不能は「比較できません」のcompact message
- 自己ベストは採用項目を維持し、先頭2件を強く、残りをcompact表示
- Player Analysis内の「試合別分析を見る」は表示しない

## Rate best eligibility

Break-inは対象Playerのsingle record内にある全`break_result`が正式判定材料を持つ場合だけeligible。Masuwariはcommon event ledgerを使用し、全`rack_end`に対して一意かつ正式判定可能な`break_result`が対応するrecordだけeligible。分母は本人break・完了・非foul・非transferのrack数、分子は正式共通判定結果とし、分子が分母を超えるrecordは除外する。

Shot rateは保存済みpocketCountとmissesの正の分母、Averageはscoreと正のcompletedTurnsが揃うrecordだけeligible。小さいが正しい分母を排除するminimum denominatorは未採用。

欠損は数値`—`、空状態「データなし」、比較不成立「比較できません」。0や推定値で補完しない。

## Compatibility and gate

Rival Analysis、Single Match Analysis、History、Match Detail、通常／サンプルデータ、Backup／Restore、Undo、Main Player、競技ルールを維持する。schema migrationは行わない。Build Number 5、Archive、Validate、TestFlight、App Review、一般公開は本仕様の範囲外。

## Revision history

- 2026-08-18: Official Release 1.0。
