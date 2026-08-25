# CueScore Build 10 — Analytics Scope / Trend Axis Implementation

Date: 2026-08-25 (JST)  
Status: implementation and candidate verification PASS / distribution gates pending

## Implemented

- 競技固定の試合カードから可視`分析`操作を除外し、Match Detailだけを通常操作として残した。
- 簡潔な対戦相手別成績を維持し、対戦相手行から深いRival Analysisへ進む通常タップ導線を除外した。
- rateグラフへ5段階Y軸、日付X軸、同日試合連番、focus可能な点、日付と正確な値のcalloutを追加した。
- 既存の分析互換コード、データschema、算出定義、rate精度を維持した。
- Build Numberを未使用の`10`へ更新した。

## Verification contract

- `tests/analytics-v1-scope-trend-axis.test.mjs`でv1範囲、軸、同日識別、callout、互換保持を固定する。
- 全自動テストは`220 pass / 0 fail / 0 skipped`。native source/generated/copied資産整合、Simulator Debug／Releaseの`BUILD SUCCEEDED`、iPhone portrait起動表示をPASSした。
- 390px幅のoverflowとtrend popup要件はCSS／DOM回帰テストで固定した。実データ入りpopupの物理iPhone目視はpendingとする。
- Signed Archive、Validate、TestFlight Internal Only、Apple処理、輸出コンプライアンス、内部グループ確認は配布完了記録で追記する。
- 実iPhone確認はProduct Owner確認までpending。App Store Review、外部TestFlight、一般公開は行わない。
