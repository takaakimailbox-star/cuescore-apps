# CueScore v1.0 Build 5候補 Player起点分析 Decision

- Status: Official Release
- Version: 1.0
- Published: 2026-08-18 JST
- Approved by: Product Owner

## Decision

分析はPlayer起点へ統一する。Home／main navigationの独立「分析」入口と、独立分析Home（Player分析／試合分析／分析について）は現行導線から廃止する。

- Player Analysis: プレーヤー一覧 → Player Detail → プレーヤー分析
- Match Analysis: プレーヤー一覧 → Player Detail → 試合一覧 → 対象試合 → 試合分析
- Match Analysisは保存schemaを変えず、runtimeのviewer Player contextを受け取り、そのPlayer目線で表示する。
- Rival AnalysisとSingle Match Analysis本体は維持する。
- Player AnalysisのPlayer selectorは廃止し、競技selectorは維持する。
- Player Analysisはcompact header／summary／metrics、見切れない推移selector、短いchart、重要2件を優先した自己ベスト表示へ整理する。
- Build 4で報告された最高マス割り率100%問題は、完了rack全体の詳細break ledgerが確認できない部分欠損recordを率の自己ベスト候補から除外して防止する。
- minimum denominatorは採用しない。必要性が生じた場合はProduct Ownerの別決定を要する。
- Player／Match／Backup／event schema、保存key、Undo、競技ルールは変更しない。

## Gate

本決定はソース実装・自動検証・Simulator buildまでを承認する。Build Number 5、Archive、Validate、TestFlight upload、App Review、一般公開は承認しない。

## Revision history

- 2026-08-18: Official Release 1.0。Product OwnerのBuild 4実機レビューを反映。
