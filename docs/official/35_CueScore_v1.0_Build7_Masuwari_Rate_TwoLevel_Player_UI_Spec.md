# CueScore v1.0 Build 7候補 マス割り率修正・2段階Player UI Spec

- Status: Official Specification
- Published: 2026-08-19 JST
- Decision: Official 034

## Masuwari rate contract

対象は9-Ball／10-Ball。分子は`rackGameMasuwariCountsV1(record)`による対象Playerの正式マス割り回数。分母は、対象Playerがブレイクし、`rack_end`まで完了し、正確なbreakerと判定可能な`break_result`を持つラックの一意な数。

以下も分母に含める：通常の`player_switch`、miss、foul、scratch、break foul、illegal break、pre-break foul、break失敗。これらは正式マス割りの分子にはならないが、ブレイクした完了ラックとしての分母からは除外しない。

record-level completenessを必須とする。全完了ラックとbreak ledgerが同じラック集合であり、各ラックに一意かつ判定可能な`break_result`があること。`break_result`だけがあり`rack_end`がないラック、`rack_end`だけのラック、breaker不明、重複break、legacy-only recordは率全体をineligibleとする。対象Playerの分母が0なら`—`。分子が分母を超えるrecordもineligible。

同じ共通関数を競技詳細の通算値、推移、自己ベストで使用する。正式マス割り回数自体の判定は変更しない。

## Level 1: Player information

- Header: プレーヤー情報、戻る、編集。
- Profile: avatar、Player名、Main Player、既存メモ。
- 競技別通算一覧: 9-Ball、10-Ball、Rotation、14-1、JPA 9-Ball、3 Cushion。
- 各行: 種目、試合数、勝敗、勝率、chevron。0試合は`0試合`、勝敗`—`、勝率`—`。
- Player削除と「過去履歴は残る」既存契約を維持。

## Level 2: Discipline detail

Playerと競技を固定する。中央Navigation Titleは`Rotation 詳細`、`9-Ball 詳細`、`10-Ball 詳細`、`JPA 9-Ball 詳細`、`14-1 詳細`、`3 Cushion 詳細`の競技別表示とする。標準Navigation戻るでPlayer情報へ戻り、画面内へ同義の戻るlinkを重複配置しない。

上からcompact Player＋競技通算summary、主要指標1段、初期折りたたみの推移、自己ベスト最大3件1段、直近3試合、Rival Analysis、当該競技の全試合を表示する。競技通算と重複する「今の状態」見出し、badge、勝敗summary、W/L表示は置かない。

9-Ball／10-Ball／Rotation／JPA 9-Ballは4指標を横1段4分割、14-1は3指標を横1段3分割、3 Cushionは2指標を横1段2分割する。自己ベストは初期最大3件を1つのsummary block内で件数どおりに分割し、2件時に空枠を作らない。横scrollは禁止する。

自己ベストと最近の試合はMatch Detailへ遷移する。全試合から既存Player目線Single Match Analysisへ進める。Rival Analysisは選択競技を引き継ぐ。

## Visual and accessibility contract

iPhone portrait／390pxを優先し、競技別通算一覧、1段summary、ellipsis、十分なtap領域、横overflowなしを維持する。白背景カードは明示的な濃色textと`-webkit-text-fill-color`を持ち、iOSのappearance継承でPlayer名や本文が白抜けしない。欠損数値は`—`、空状態は`データなし`。

## Compatibility and prohibitions

Player編集、Main Player、avatar、History、Match Detail、Rival Analysis、Single Match Analysis、通常／サンプルデータ、Backup／Restore、Undo、全6競技ルールを維持する。schema変更、新保存field、Build Number 7、Archive、Validate、TestFlight、App Review、一般公開は禁止する。
