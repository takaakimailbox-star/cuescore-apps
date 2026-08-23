# CueScore Build 8候補 — Build 7実iPhoneレビュー対応 Implementation Record

Date: 2026-08-23  
Baseline: `3286992b739eaf17f36671214a2433d34d95181b`

## Implemented

- Take Photo crash: iOS `Info.plist`に欠けていた`NSCameraUsageDescription`を追加。Web input／圧縮／保存処理は変更していない。
- 競技詳細の「最近の試合」を削除し、Rival／全試合入口を維持。
- 全6競技のNavigation Titleへ既存競技アイコンを追加。
- 競技詳細起点の履歴をPlayer／競技固定とし、selectorを非表示化。
- 試合カード右端を「詳細」「分析」の2段compact操作へ変更。Match DetailとMatch Analysisは独立維持。
- 固定履歴Backを競技詳細へ、競技詳細BackをPlayer情報へ戻す1階層stackへ修正。
- edge Swipe Backへ指追従、完了、cancel motionを追加し、既存Back controlを実行する契約を維持。
- ブレイク結果close後の対象を現在rack divider／最新rowへ強化。
- Player削除を閲覧画面から除き、既存編集modalへ表示。
- Photo Library／Choose File／Take Photoのfile確定後にchooserを閉じ、編集previewへ直接復帰。
- 3 Cushion操作を1段3列化。未到達／未確定は空白、確定0は`-`を維持。
- PWA cache versionを`2.0-build8-candidate-v1`へ同期更新。

## Audit: 平均ファール

`analytics-build4-metrics.js`の現行集計は、対象Playerの各recordに保存された`metric.fouls`を合計し、`avgFouls = fouls / games`で算出する。分母は対象試合数であり、ラック数・イニング数・手番数ではない。現表示は「平均ファール」だが、計算変更とラベル変更は未採用のため実装していない。判断候補は「平均ファール/試合」への名称明確化。

## Audit: 分析Navigation

### 現行画面と導線

- Player情報 → 競技詳細（主要指標、推移、自己ベスト）
- 競技詳細 → 対戦相手別成績 → Rival Analysis
- 競技詳細 → 競技固定全試合 → Match DetailまたはPlayer目線Match Analysis
- Match Detail／Match Analysisは別画面
- 旧Analysis Home／Player selector実装の一部は互換コードとして残るが、通常導線ではPlayer起点を優先

### 重複・深さ

- 競技詳細の最近の試合と全試合が重複していたため今回削除。
- Player情報→競技詳細→全試合→詳細／分析は最大4階層。旧不具合は全試合BackがPlayer情報へ飛ぶことだった。
- Match DetailとMatch Analysisにはスコア、Player、競技等のcontext重複があるが、責務は異なるため統合未採用。

### v1.0に維持するもの

競技別主要指標・推移・自己ベスト、競技固定履歴、Match Detail、Player目線Match Analysis、Rival Analysis、欠損／eligible安全契約。

### Deferred候補

独立Analysis Homeの復活、分析種類を先に選ばせるselector、推定的な自動助言、Match DetailとAnalysisの長大統合、追加schemaを要する高度な試合展開分析。

### 簡素化案（未実装）

1. **案A（推奨）— 現行Player起点を磨く**：Player情報→競技詳細を主軸にし、競技詳細末尾を「対戦相手」「全試合」の2入口だけにする。今回の実装が土台。最小変更でv1.0向き。
2. **案B — Player Workspaceの3タブ化**：Player固定で「競技」「対戦相手」「試合」の3タブを持ち、深いoverlayを減らす。分かりやすいがNavigation再設計と広い回帰範囲を伴う。
3. **案C — 試合一覧中心**：Player情報から競技固定試合一覧へ早く進み、各カードの詳細／分析を主入口にする。頻繁な振り返りには強いが、長期指標・自己ベストの発見性が下がる。

Product Owner承認前に案A〜Cの追加実装は行わない。

## Verification

- Automated tests: `202 pass / 0 fail / 0 skipped`。
- Native source／generated `native-web`／Xcode copied `public`を正式build/copyで同期。
- iOS Simulator Debug: `BUILD SUCCEEDED`。
- iOS Simulator Release: `BUILD SUCCEEDED`。
- iPhone 17 Simulator目視: Player情報、9-Ball詳細、アイコンTitle、最近の試合削除、競技selector非表示、compact詳細／分析、Backによる1階層復帰を確認。
- 実iPhone pending: Take Photo permission／撮影／cancel／画像確定、Photo Library、Choose File、edge Swipeの指追従、3 Cushion操作／セル、ブレイク後rack位置、6競技、Backup／Restore、通常／サンプル。

Build 8 TestFlight upload、App Review、一般公開は実施していない。

