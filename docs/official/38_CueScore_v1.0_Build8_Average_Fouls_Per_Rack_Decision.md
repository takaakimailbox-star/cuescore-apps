# CueScore v1.0 Build 8候補 平均ファール/ラック Decision

- Status: Official Decision
- Adopted: 2026-08-23 (JST)
- Owner: Product Owner

## Decision

3 Cushionを除く9-Ball、10-Ball、Rotation、14-1、JPA 9-BallのPlayer主要指標を`平均ファール/ラック`とし、対象Playerの総ファール数を、同じ集計範囲にある判定可能な完了ラック総数で割る。

分母境界を保存recordから確定できない試合は、分子・分母の両方から除外する。途中ラック、欠損record、旧・簡易recordを保存値らしき数値から推定せず、eligibleな完了ラックが0なら`—`とする。eligibleな完了ラックがありファール0なら`0.00`とする。

3 Cushionには本指標を表示しない。ファール数自体の記録方法、競技ルール、Player／Match／Backup／event schemaは変更しない。

## Supersession and scope

本DecisionはOfficial 028／029の平均ファールを「総ファール数 ÷ 対象試合数」とする決定と、Official 036／037の平均ファール変更を対象外とする記載を、本指標に限って後続確定する。Official 036／037のBuild 8実iPhoneレビュー修正は維持する。

分析Navigationの再設計、Build 8 TestFlight upload、App Review、一般公開は含めない。
