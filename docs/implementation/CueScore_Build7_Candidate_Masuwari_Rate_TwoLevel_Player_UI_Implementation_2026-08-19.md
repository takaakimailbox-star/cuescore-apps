# CueScore Build 7 Candidate — Masuwari Rate Fix and Two-Level Player UI Implementation

更新日：2026-08-19（JST）
状態：source実装・自動検証完了／実iPhone未確認／配布未承認

## 1. 作業開始状態

- 作業開始時`origin/main`：`e105804a30c1cbe5ac6af91b7bc9cae311f6e8dd`
- Local branch：`codex/cuescore-step7b-native-ios-foundation`
- 作業開始時はlocal HEADと`origin/main`が一致し、worktreeはcleanだった。
- Marketing Version：`1.0`
- Build Number：`6`（変更なし）

## 2. 正式資料

- Official Design Decision Logをv2.0へ更新し、Decision 026として本採用事項を記録した。
- `docs/official/34_CueScore_v1.0_Build7_Masuwari_Rate_TwoLevel_Player_UI_Decision.md`
- `docs/official/35_CueScore_v1.0_Build7_Masuwari_Rate_TwoLevel_Player_UI_Spec.md`

Official 029/031の非foul・非transferラックだけを分母にする契約と、Official 032/033の統合1画面構成は、本資料が該当範囲のみ後続確定する。正式マス割り成功条件、その他のderived metric、欠損、安全、互換性契約は変更していない。

## 3. マス割り率修正

9-Ball／10-BallのPlayer分析用マス割り率を次へ統一した。

`正式マス割り回数 ÷ 本人がブレイクした全判定可能完了ラック数 × 100`

- 分子は既存の正式共通判定`rackGameMasuwariCountsV1(record)`をそのまま利用する。
- 通常の手番交代、miss、foul、scratch、break foul、illegal break、pre-break foul、break失敗のラックも、本人がブレイクした判定可能完了ラックなら分母へ含める。
- 完了rack ledgerとbreak ledgerがrecord全体で一致し、各完了ラックに一意で判定可能な`break_result`がある場合だけ率を算出する。
- 部分recordから残存成功ラックだけを使った1/1=100%を生成しない。
- `break_result`のみ、`rack_end`のみ、breaker不明、重複break、legacy-only、分子が分母を超えるrecordはineligibleとする。
- 通算、推移、自己ベストは同じ`masuwariForRecord`／aggregate経路を利用する。Single Match Analysisには率表示が存在せず、既存の正式マス割り回数表示を変更していない。

## 4. 2段階Player UI

### 第1階層：プレーヤー情報

- avatar、Player名、Main Player、既存メモ、編集、削除を維持した。
- 9-Ball、10-Ball、Rotation、14-1、JPA 9-Ball、3 Cushionの通算行を固定順で表示する。
- 各行は試合数、勝数、敗数、勝率、競技詳細へのchevronを持つ。
- 0試合は`0試合`、勝敗`—`、勝率`—`とする。

### 第2階層：競技詳細

- Playerと競技を固定し、プレーヤー情報へ戻る導線を表示する。
- 通算、競技別主要指標、今の状態、初期折りたたみ推移、自己ベスト3件、最近の試合3件、Rival Analysis、当該競技の全試合入口を配置した。
- 自己ベストと最近の試合は記録元Match Detailへ遷移する。
- 既存Player HistoryからSingle Match Analysisへ進む経路を維持した。
- 白背景のPlayer名とカード本文に濃色および`-webkit-text-fill-color`を明示し、390px portrait、2列カード、ellipsis、横overflowなしの契約を追加した。

## 5. 互換性

Player編集、Main Player、avatar、History、Match Detail、Rival Analysis、Single Match Analysis、通常／サンプルデータ、Backup／Restore、Undo、全6競技ルールを維持した。Player／Match／Backup／event schema、保存key、新保存field、正式マス割り成功判定は変更していない。

## 6. テストと検証

- 全自動テスト：`191 pass / 0 fail / 0 skipped`。
- マス割り率：`3/4 = 75%`、`1/2 = 50%`、`1/1 = 100%`、`0/4 = 0%`。
- 通常交代、foul、break foulを分母に含むことを確認した。
- incomplete rack ledger、breakのみ、rack endのみ、重複／不足、分母0、分子超過をineligibleとする回帰契約を確認した。
- 2段階UI：6競技通算行、競技固定詳細、主要指標、折りたたみ推移、自己ベスト3件、最近の試合3件、Match Detail、Rival／History導線、欠損、390px、白背景文字色を確認した。
- Native source／`native-web`／Xcode copied `ios/App/App/public`の主要変更assetはSHA-256一致。Xcode copied側にCapacitor生成の`cordova.js`／`cordova_plugins.js`だけが追加される既存構成を確認した。
- iOS Simulator Debug：`BUILD SUCCEEDED`。
- iOS Simulator Release：`BUILD SUCCEEDED`。

## 7. 配布Gate

- Build Numberは`6`のまま。
- Build 7 Archive：未実施。
- App Store Validate：未実施。
- TestFlight Build 7 upload／内部配信：未実施。
- App Review提出：未実施。
- 一般公開：未実施。
- 実iPhone確認：未実施。確認済みと推測せず、別Gateで扱う。
