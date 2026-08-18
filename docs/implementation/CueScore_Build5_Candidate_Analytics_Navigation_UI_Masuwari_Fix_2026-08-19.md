# CueScore Apps — Build 5候補 分析導線・UI・マス割り率修正 完了報告

- 作業日：2026-08-18〜2026-08-19（JST）
- 対象：CueScore Apps v1.0
- 状態：ソース実装・自動検証・Simulator検証完了
- 配布状態：Build 5未作成／TestFlight未配信

## 1. 作業開始時の状態

- `origin/main`：`11834c19570ad9f2a34ff8acdfc2bbad2cc84bc7`
- ローカルbranch：`codex/cuescore-step7b-native-ios-foundation`
- ローカルHEADは開始時の`origin/main`と一致し、worktreeはcleanだった。

## 2. Build 4実iPhone報告として記録した範囲

Product Ownerから確認できた事実は次の2点だけである。

1. Player分析トップの第一印象が「見づらい」。
2. 最高マス割り率`100%`カードから開いた試合が、試合内容と一致していない。

これ以外のBuild 4分析項目、全競技、Backup、Offline等は、本作業で新たに実機PASS扱いにしていない。

## 3. 現行分析導線と変更内容

従来はHomeに独立「分析」入口があり、独立分析HomeからPlayer分析／試合分析を選ぶ構造だった。これを通常導線から外し、次のPlayer起点へ統一した。

- Player一覧 → Player Detail → `プレーヤー分析を見る` → Player Analysis
- Player一覧 → Player Detail → `試合一覧` → 対象試合 → Match Detail
- Player一覧 → Player Detail → `試合一覧` → `この試合を分析` → Match Analysis

Player AnalysisのPlayer selectorは削除し、競技selectorは維持した。Player Analysis内の独立した「試合別分析を見る」は削除した。Rival AnalysisとSingle Match Analysis本体は維持した。

## 4. Player目線Match Analysis

Match IDとviewer Player IDをruntime contextで渡す。保存recordへ`viewerPlayerId`を書かず、Player／Match／Backup／event schemaおよび保存keyは変更していない。

同一MatchをPlayer A／Player Bの各試合一覧から開いた場合、表示の主役、勝敗表示、比較の左右を選択Player目線へ切り替える。戻る操作はPlayer Detailへ戻す。

## 5. UI再設計

- Player header、「今の状態」、主要指標cardの余白と高さを縮小。
- 主要指標は2列を維持し、390px portraitで横overflowしない。
- 推移タブを横並びbutton群からselectへ変更し、見切れを防止。
- chart高を縮小。
- 自己ベストは先頭2件を優先表示し、残りをcompact化。
- 長いPlayer名は省略表示し、full nameはtitleで保持。
- 欠損表示`—`、空状態「データなし」、比較不成立「比較できません」を維持。

## 6. 最高マス割り率100%問題

### 直接原因

従来のsingle-record算出では、正式共通判定によるマス割り回数をrecord全体の分子に使う一方、分母は詳細eventが残る一部rackだけで成立し得た。部分欠損recordで成功rackだけが判定可能だと、他の完了rackを落として`1 / 1 = 100%`にできる構造だった。

### 当該実機Matchの分子／分母

Product Ownerの実機recordそのものはリポジトリに存在せず、保存JSONも提供されていないため、正しい分子／分母は確認不能である。推測値は記録しない。確認できたのは、旧ロジックが部分recordを`1 / 1`として選び得る構造と、リンク先内容が100%ではないという実機報告である。

### 修正

- record内の全完了rackに、正式判定可能な一意の`break_result`が対応することを必須化。
- 本人break、完了、非foul、非turn-transferのrackだけを分母へ加える。
- 正式共通判定の分子が分母を超えるrecordをineligible化。
- 部分欠損recordは率自己ベスト候補からrecord単位で除外。
- 修正fixtureでは、2完了rack・正式マス割り1回を`1 / 2 = 50%`と確認。
- 当該実機Matchの正しい率は材料不足のため表示対象外（`—`相当）とするのが正しい。実データなしに別の率へ補正していない。

## 7. 他の率自己ベスト再監査

| 指標 | 判定 | 契約 |
| --- | --- | --- |
| 最高シュート率 | 条件付きeligible | 保存済み`pocketCount`と`misses`が有限で、合計が正のrecordのみ。欠損分母は除外。 |
| 最高ブレイクイン率 | 修正済み | 対象Playerのsingle record内の全`break_result`が詳細判定可能な場合のみ。部分詳細recordは除外。 |
| 最高マス割り率 | 修正済み | 全完了rackのbreak ledgerが完全なrecordだけ。部分欠損、分子超過は除外。 |
| 最高アベレージ | 条件付きeligible | scoreと正のPlayer別completed turnsが取得できるrecordのみ。 |

minimum denominatorはProduct Owner未決定のため追加していない。小さいが正しい分母を恣意的に除外していない。

## 8. 更新ファイル

- `index.html`
- `analysis-build4.js`
- `analysis-build4.css`
- `analytics-build4-metrics.js`
- `tests/analysis-v2.test.mjs`
- `tests/analytics-build4-metrics.test.mjs`
- `tests/analytics-build4-ui.test.mjs`
- `docs/official/30_CueScore_v1.0_Build5_Player_Origin_Analytics_Decision.md`
- `docs/official/31_CueScore_v1.0_Build5_Player_Origin_Analytics_Spec.md`
- `docs/CURRENT_STATE.md`
- `docs/README.md`
- 本報告書

生成・copyされた`native-web/`と`ios/App/App/public/`はsourceと一致するが、生成物の追跡方針に従い、Git差分としてはsource側だけが対象になる場合がある。

## 9. Official Decision / Spec

- Decision：`docs/official/30_CueScore_v1.0_Build5_Player_Origin_Analytics_Decision.md`
- Spec：`docs/official/31_CueScore_v1.0_Build5_Player_Origin_Analytics_Spec.md`

採用：独立分析入口廃止、Player起点分析、Player目線Match Analysis、compact UI、部分欠損率自己ベスト除外。

非採用：独立分析トップ維持、Homeから直接Match Analysis、viewerPlayerIdのschema保存、minimum denominatorの無断追加。

## 10. テスト・検証

### 追加・変更テスト

- Homeに独立分析入口がないこと。
- Player Detailに`プレーヤー分析を見る`と`試合一覧`があること。
- 試合一覧にMatch Analysis入口があること。
- viewer Player runtime contextと戻る導線。
- Player selector削除、競技selector維持、推移select。
- 部分詳細break-in record除外。
- 部分欠損masuwari ledger除外。
- 2rack中1マス割りが50%になること。
- 分子が分母を超えるrecord除外。
- 既存のfoul／break foul／turn transfer／欠損／正式マス割り回帰。

### 全自動テスト

- 結果：`180 pass / 0 fail / 0 skipped`

テスト中に意図的なQuotaExceeded rollback fixtureのconsole出力があるが、該当テストを含め全件PASSしている。

### Native asset一致

`index.html`、`analysis-build4.js`、`analysis-build4.css`、`analytics-build4-metrics.js`について、source／`native-web`／`ios/App/App/public`のSHA-256一致を確認した。

### Simulator

- iOS Simulator Debug：`BUILD SUCCEEDED`
- iOS Simulator Release：`BUILD SUCCEEDED`

### Git

- `git diff --check`：PASS
- 新commit SHA：コミット後に確定
- `origin/main`反映：push後に確定

## 11. CURRENT_STATE更新

Build 4実機報告の2点、Player起点導線、UI整理、率自己ベストのrecord-level eligibility、テスト結果、Native asset一致、Simulator結果、および配布禁止Gateを記録した。

## 12. 未確認事項

- Product Owner端末に保存された問題Matchの生recordと正しい分子／分母。
- Build 5候補の実iPhone表示・操作。
- minimum denominatorの要否。

これらを推測でPASS／数値化していない。

## 13. 配布・公開Gate確認

- Marketing Version：`1.0`のまま。
- Build Number：`4`のまま。Build Number 5は未設定。
- Distribution Archive：未実施。
- App Store Validate：未実施。
- TestFlight Build 5 upload／内部配信：未実施。
- App Review提出：未実施。
- App Store一般公開：未実施。
