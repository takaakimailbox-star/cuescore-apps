# CueScore v1.0 Build 4候補 — Player分析リニューアル決定

Status: Official Release
Publication date: 2026年8月18日
Approved by: Product Owner

## Decision

Player分析トップを、次の順序へ再構成する。

1. 今の状態
2. 主要指標
3. 推移
4. 今回のポイント
5. 自己ベスト
6. 詳細分析への入口

Single Match AnalysisとRival Analysisは削除せず、詳細分析への入口として維持する。

## Adopted derived metrics

- 9-Ball、10-Ball、Rotation、JPA 9-Ballのブレイクイン率は、判定可能な`break_result` eventだけを分子・分母へ使用する。
- 9-Ball、10-BallのPlayer分析用マス割り率は、正式マス割り回数を、本人がブレイクした判定可能な完了ラック数で割る。
- 平均ファールは、現行の「総ファール数 ÷ 対象試合数」を維持する。
- 自己ベストは正確に算出可能でMatch IDを持つeligible recordだけを対象にし、Match Detailへ遷移できるものとする。

詳細eventや分母が不足するrecordを0または推定値として混ぜない。数値欠損は`—`、セクション空状態は「データなし」、比較不成立は「比較できません」とする。

## Compatibility boundary

- Player、Match、Backup、eventのschema、保存key、Undo上限は変更しない。
- 正式マス割り判定は`rackGameMasuwariCountsV1(record)`を単一判定源として維持する。
- Player Detail等に残る既存マス割り率を、この決定だけで全面置換しない。
- 通常データ／サンプルデータ、History、Match Detail、Player Detail、Backup／Restore、競技別scoreを変更しない。

## Later

- ファール手番率
- 3Cファール率
- CueScore Best Game／CueScore Rating／独自総合点
- AI試合総合評価
- event不足旧recordの推定補完
- schema migration

## Distribution gate

本決定はソース実装と自動検証を承認する。Build Number 4設定、Archive、App Store Validate、TestFlight upload、内部配信、App Review提出、一般公開は別のProduct Owner承認を必要とする。

## Revision history

- 2026-08-18: Product Owner採用内容をOfficial Releaseとして初版発行。
