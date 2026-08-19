# CueScore v1.0 Build 7候補 マス割り率修正・2段階Player UI Decision

- Status: Official Release
- Version: 1.0
- Published: 2026-08-19 JST
- Approval: Product Owner

## Decision

9-Ball／10-BallのPlayer分析用マス割り率を、正式マス割り回数 ÷ 本人がブレイクした全判定可能完了ラック数 × 100 とする。通常の手番交代、miss、ファール、break foul、break失敗があっても、そのラックのブレイク機会は分母へ残す。正式マス割り成功条件はDecision 024およびOfficial 022/023を変更しない。

Player Detailは、Player情報と6競技の通算一覧を示す第1階層と、選択競技に固定した分析・履歴を示す第2階層へ分離する。情報量を一画面へ積み上げず、Player起点のRival Analysis、Match Detail、Single Match Analysis導線は維持する。

Simulator UIレビュー後、第2階層は競技別Navigation Title、compact Player＋通算summary、主要指標1段、初期closedの推移、自己ベスト最大3件1段、最近の試合、Rival／全試合入口の順とする。競技通算と重複する「今の状態」sectionおよび画面内の重複戻るlinkは廃止し、標準Navigation戻るでPlayer情報へ戻る。

## Eligibility and compatibility

完了ラック、breaker、判定可能な`break_result`、`rack_end`、正式マス割り判定材料が試合record全体で揃う場合だけ率を算出する。部分recordの残存ラックだけで1/1を作らない。不足は`—`／`データなし`とし、0または推定値で補完しない。

Player／Match／Backup／event schema、保存key、Undo、競技ルール、正式マス割り成功条件は変更しない。通常データとサンプルデータに同じeligible判定を適用する。

## Supersession

Official 029/031の「非foul・非transferラックのみを分母にする」記載と、Official 032/033の統合1画面Player Detail構成を本Decisionが後続確定する。両資料のその他のderived metric、欠損、安全、互換性契約は維持する。

## Distribution gate

本Decisionはsource実装・自動検証・native asset同期・Simulator buildまでを承認する。Build Number 7設定、Archive、Validate、TestFlight upload、App Review、一般公開は別承認とする。

## Revision history

- 2026-08-19: Simulator UIレビュー後の競技詳細圧縮、競技別Title、「今の状態」廃止、指標／自己ベスト1段化、戻る導線整理を追加採用。
- 2026-08-19: Product Owner採用によりOfficial Release 1.0。
