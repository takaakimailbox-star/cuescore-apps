# CueScore Build 8候補 — 平均ファール/ラック Follow-up Implementation Record

Date: 2026-08-24  
Start local HEAD: `385c4410c2376b79c30927e5a4cfbcb5a37a3500`  
Start `origin/main`: `3286992b739eaf17f36671214a2433d34d95181b`  
Start worktree: clean、local `main` ahead 1

## Audit and implementation

旧実装は`analytics-build4-metrics.js`で全対象recordの`metric.fouls`を合計し、対象試合数で割っていた。同じmetric APIをPlayer競技詳細と旧互換Player Analysisが利用している。Rival比較等に残る`ファール／試合`は別metricであり、本変更へ混在させていない。

新実装はOfficial 039の競技別境界からrecordごとのeligible分子・分母を作り、eligible recordだけを通算集計する。9/10-Ballの保存rack結果、Rotation/JPAの明示的rack完了と最終`game_end`、14-1の再ラックだけを使う。最終途中rack、欠損、負数、境界を持たない旧・簡易・一部sample recordは除外し、推定または0補完しない。schema、保存key、Backup／Restoreは不変。

UI labelは`平均ファール/ラック`、値は2桁へ統一。3 Cushionのmetric setは従来どおりaverage／high runだけ。

## Player-origin polish案（未実装）

画面階層は`Home → Player情報 → 競技詳細 → 対戦相手別成績または競技固定全試合 → Match Detail → Match Analysis`を基本とする。HomeはMain PlayerとPlayer一覧を最短入口、Player情報は6競技の通算行、競技詳細は主要指標・推移・自己ベストと末尾の「対戦相手別の成績」「全試合」だけを置く。全試合カードは「詳細」「分析」、Match Detailは当該試合の事実と「この試合を分析」、Match AnalysisはPlayer目線の解釈を担う。

削除候補は独立Analysis Home、Player selectorを重ねた旧入口、競技詳細の最近の試合、同じ目的への重複分析ボタン。BackはMatch Analysis→元のMatch Detailまたは競技固定全試合、Match Detail→競技固定全試合、全試合／対戦相手別→同競技詳細、競技詳細→Player情報、Player情報→Homeの1階層単位とする。利用者には「分析」分類を先に選ばせず、Player、競技、相手、試合という目的語から辿らせる。Product Owner承認前に実装しない。

## Verification

- Targeted metric／UI tests: 45 pass。
- Full automated tests: `206 pass / 0 fail / 0 skipped`。
- 主要3 JavaScriptのsource／generated `native-web`／Xcode copied `public` SHA-256一致。
- iOS Simulator Debug／Release: ともに`BUILD SUCCEEDED`。
- 390×844 portrait目視: Rotationの4指標を横overflowなしの1段で表示し、`平均ファール/ラック`が省略なしで収まることを確認。境界不明recordは`—`。3 Cushionはaverage／high runの2指標だけで、平均ファール指標を表示しないことを確認。
- 通常保存record、Sample Data v3.1、旧／欠損recordの構造差はcontract testとeligible監査で確認。Backup／Restore suiteを含む全回帰PASS。
- push、TestFlight upload、App Review、一般公開: 未実施。
