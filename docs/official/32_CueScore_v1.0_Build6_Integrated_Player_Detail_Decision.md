# CueScore v1.0 Build 6 Integrated Player Detail Decision

- Status: Official Decision
- Adopted: 2026-08-19 (JST)
- Owner: Product Owner

## Decision

Player DetailとPlayer Analysisを、Playerをruntime contextで固定した単一のPlayer Detailへ統合する。通常導線では独立した「プレーヤー分析を見る」画面遷移を使用しない。

統合画面は、プロフィール、通算成績、競技selector、今の状態と主要指標、最近の調子と折りたたみ式推移、自己ベスト、最近の試合、対戦相手別成績／試合一覧入口の順とする。自己ベストは初期3件、最近の試合は初期2件とし、残りは利用者操作で展開する。

指標、eligible判定、欠損表示、自己ベスト同率選択、Match DetailリンクはDecision 028〜031の正式契約を再利用する。推移の欠損値を0に変換しない。

Player編集、Main Player、avatar、試合履歴、Match Detail、Player目線Match Analysis、Rival Analysis、通常／サンプルデータは維持する。Player／Match／Backup／event schema、保存key、Undo、競技ルールは変更しない。

## Distribution gate

本Decisionはsource実装と自動検証を承認する。Build Number 6、Archive、Validate、TestFlight、App Review、一般公開は別承認とする。
