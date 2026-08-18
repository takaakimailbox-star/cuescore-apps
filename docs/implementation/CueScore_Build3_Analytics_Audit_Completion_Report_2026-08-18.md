# CueScore Apps — Build 3実機確認記録＋分析指標データ監査 完了報告書

更新日：2026-08-18（JST）  
対象：CueScore Apps v1.0  
工程：Build 4候補の分析画面リニューアル前データ監査  
状態：調査・正式記録・GitHub同期完了

## 1. 結論

TestFlight Build 3について、Product Ownerが実iPhoneで確認した交代操作UI変更とJPA 9-Ball「デッド」配置を、確認範囲を限定して正式記録した。

分析画面リニューアル候補の各指標は、現行の詳細Match recordでは多くを算出できる。一方、旧・簡易・不完全recordには必要eventやPlayer別分母が不足するため、ブレイクイン率、新しいマス割り率、ファール手番率、率・平均を使う自己ベストを全履歴一律で正確に表示することはできない。

最大ハイランと1試合最高得点／最多得点は、既存のPlayer別保存値から正確に取得できるため、v1.0の自己ベスト候補として採用を推奨する。

不足値は0や推定値で補完せず、数値欄は`—`、空状態は「データなし」、比較不成立時は「比較できません」と表示することを推奨する。

今回、分析画面実装、schema変更、Build 4作成、TestFlightアップロード、App Review提出、一般公開は行っていない。

## 2. Git／GitHub確認結果

- 作業開始時`origin/main`：`aad7ca7f0742c3d26001981d39f556e3d704122a`
- ローカルbranch：`codex/cuescore-step7b-native-ios-foundation`
- 作業開始時のローカルHEADと`origin/main`：一致
- 監査記録commit：`ac3fe34e6da104f1565e9021ab7fe6d9bd4a644a`
- `origin/main`への反映：完了
- 監査完了時のローカルHEADと`origin/main`：一致
- 監査完了時の作業ツリー：clean

## 3. Build 3実iPhone確認として記録した範囲

Product Ownerは2026年8月18日、TestFlight Build 3の今回のUI変更を実iPhoneで問題なく確認した。

PASSとして記録した項目：

- Rotation：通常ファール／セーフティ後の手動交代
- 9-Ball：通常ファール／セーフティ後の手動交代
- 10-Ball：通常ファール／セーフティ後の手動交代
- Straight Pool（14-1）：通常ファール／セーフティ後の手動交代
- JPA 9-Ball：通常ファール／セーフティ後の手動交代
- JPA 9-Ball：「デッド」が操作列の一番左に配置されること

3 Cushionは、公式Decision 026／Spec 027および実装上、今回の変更対象外であることを確認した。これは変更scopeの確認であり、Build 3で3Cを完全完走したというPASS記録ではない。

## 4. Build 3で未確認のまま残した項目

今回のProduct Owner報告から、以下を新たなBuild 3 PASSにはしていない。

- Backup書き出し／復元
- Offline起動
- Player写真
- データ保持
- 全6競技の完全完走
- 全Analytics
- 3C実戦
- その他のBuild 3総合スモークテスト

過去Buildでの確認結果は履歴として維持するが、Build 3で再確認したとは扱わない。

## 5. 保存データ監査の共通結果

現行の完了Match recordには次が保存される。

- 安定したMatch `id`
- Player別`registeredPlayerId`
- score
- fouls
- maxRun
- completedTurns
- average
- pocketCount
- misses
- shotRate
- Undo反映後の`eventLog.events`
- 互換用`analysis.events`

通常データとサンプルデータは保存領域を分離しているが、同じ集計関数へ渡せる。

旧recordには次の制約がある。

- `eventLog.events`がなく`analysis.events`だけを持つ詳細recordがある。
- 簡易recordや古いrecordはbreak event、球番号履歴、Player別completedTurnsを持たない場合がある。
- 旧`breakRunOut`／`break_run_out`だけから正式マス割を復元することは、公式仕様で禁止されている。
- `record.inning`はPlayer別総手番を保証しないため、手番基準ファール率の分母へ無条件に使用できない。

必要情報がないrecordは、分子・分母の両方から除外する必要がある。0、0%、推定値として集計へ混ぜてはならない。

## 6. ブレイクイン率

候補定義：

`ブレイクイン率 = 有効なブレイクイン回数 ÷ 自分がブレイクした回数 × 100`

有効なブレイクインの既存定義：

- 1球以上入球
- foulなし
- scratchなし
- break foulなし
- illegal breakなし
- pre-break foulなし
- break失敗なし
- 複数球が入っても成功数は1

正確な分子：条件を満たす対象Playerの`break_result` event数  
正確な分母：対象Playerが行った`break_result` event数

|競技|算出可否|過去record対応|注意点|
|--|--:|--|--|
|9-Ball|△|詳細eventありのみ|break foulは入球があっても失敗|
|10-Ball|△|詳細eventありのみ|同上|
|Rotation|△|詳細eventありのみ|同上|
|JPA 9-Ball|△|詳細eventありのみ|scratch時のDeadを成功へ含めない|
|14-1|×／対象外|—|今回の候補対象外|
|3C|×／対象外|—|break概念を適用しない|

現行詳細recordと現在のサンプルデータでは算出可能。break eventがない旧recordは`—`とする。

## 7. マス割り率

候補定義：

`マス割り率 = 正式マス割り回数 ÷ 自分がブレイクした対象ラック数 × 100`

正確な分子：`rackGameMasuwariCountsV1(record)`による正式マス割数  
正確な分母：本人の`break_result`と同一rackの`rack_end`を確認できる完了ラックの一意な数

|競技|算出可否|過去record対応|注意点|
|--|--:|--|--|
|9-Ball|△|球番号・spot・turn履歴が揃うrecordのみ|早期9番、break foul、turn transferを除外|
|10-Ball|△|同上|早期10番を誤認しない|
|他4競技|×／対象外|—|正式マス割の対象外|

正式マス割には、合法ブレイク、breakerの勝利、無ファール、相手への手番移行なし、相手のプレーなし、spot反映後の全対象球消失が必要。

重要事項：現行Player Detailの既存「マス割率」は、正式マス割数を全完了ラック数で割っている。今回候補の「本人がブレイクした対象ラック数」とは分母が異なる。今回は実装を変更していない。新定義を採用する場合はProduct Ownerの正式決定が必要。

分母0または判定材料不足は`—`とする。

## 8. ファール率

第一候補：

`ファール率 = ファールした手番数 ÷ 自分の総手番数 × 100`

正確な分子：同一手番key内に1件以上の有効`foul` eventがある手番数  
正確な分母：Player別`completedTurns`、または現行eventから一意に復元できる総手番数

|競技|算出可否|過去record対応|注意点|
|--|--:|--|--|
|9-Ball|△|現行詳細record中心|break foulのlinked eventを二重計上しない|
|10-Ball|△|現行詳細record中心|同上|
|Rotation|△|現行詳細record中心|手番keyを復元できることが条件|
|JPA 9-Ball|△|現行詳細record中心|Deadをfoulへ含めない|
|14-1|△|現行詳細record中心|3ファール罰則eventを重複加算しない|
|3C|×|比較不可|正式なfoul event定義がなく共通定義は不適切|

代替候補比較：

|候補|評価|
|--|--|
|ファールした手番数 ÷ 総手番数|機会数で正規化できるため条件付き推奨。3Cは除外|
|ファール回数 ÷ 総手番数|重複eventと罰則eventの正規化が必要。第一候補より劣る|
|ファール回数 ÷ 試合数|現行公式「平均ファール」。旧record互換性が最も高いためv1.0維持を推奨|
|ファール回数 ÷ ラック数|非ラック競技と比較できないため非推奨|

## 9. 自己ベスト監査

|競技|候補|算出可否|Match Detailリンク|注意点|
|--|--|--:|--:|--|
|9-Ball|最高シュート率|△|○|入球＋missの分母があるrecord限定|
|9-Ball|最高ブレイクイン率|△|○|詳細break eventが必要|
|9-Ball|最高マス割り率|△|○|正式判定材料が必要|
|9-Ball|1試合最多マス割り|△|○|0件のみなら非表示|
|10-Ball|最高シュート率|△|○|入球＋missの分母があるrecord限定|
|10-Ball|最高ブレイクイン率|△|○|詳細break eventが必要|
|10-Ball|最高マス割り率|△|○|正式判定材料が必要|
|10-Ball|1試合最多マス割り|△|○|0件のみなら非表示|
|Rotation|最高シュート率|△|○|分母0を除外|
|Rotation|最高ブレイクイン率|△|○|詳細break eventが必要|
|Rotation|最大ハイラン|○|○|正の保存値だけを候補にする|
|Rotation|1試合最高得点|○|○|0のみなら非表示|
|JPA 9-Ball|最高アベレージ|△|○|score ÷ Player別completedTurns|
|JPA 9-Ball|最高ブレイクイン率|△|○|詳細break eventが必要|
|JPA 9-Ball|最大ハイラン|○|○|正の保存値だけ|
|JPA 9-Ball|1試合最多得点|○|○|0のみなら非表示|
|14-1|最高アベレージ|△|○|減点反映後score ÷ completedTurns|
|14-1|最大ハイラン|○|○|正の保存値だけ|
|14-1|1試合最高得点|○|○|0のみなら非表示|
|3C|最高アベレージ|△|○|score ÷ Player別completedTurns|
|3C|最大ハイラン|○|○|正の保存値だけ|
|3C|最少イニング勝利|△|○|勝利recordかつ正のPlayer別turn数が必要|

自己ベストの同率選択ルール候補：

1. 指標値
2. `endedAt`／`playedAt`の新しい順
3. Match `id`の辞書順

最少イニングだけは指標値を昇順にする。対象が1試合だけの場合も表示は可能だが、「対象1試合」と補足し、他試合より優れていると断定しない。

eligible recordは既存Match `id`を持つため、`openMatchDetailV1(id)`でMatch Detailへ遷移可能。

## 10. 欠損データ表示

- コンパクトな数値欄：`—`
- カード／空状態：`データなし`
- 前期間比較などが成立しない場合：`比較できません`

0、0%、推定値で補完しない。0が実測値なのか分母0／event欠損なのか区別できないrecordは、自己ベスト候補から除外する。

## 11. 採用分類

### v1.0採用推奨

- 最大ハイラン
- 1試合最高得点／最多得点
- eligible matchからMatch Detailへのリンク
- 欠損表示`—`
- 空状態「データなし」
- 比較不成立「比較できません」
- 既存公式「平均ファール（総ファール数 ÷ 試合数）」の維持

### 条件付き採用

- 9-Ball／10-Ball／Rotation／JPA 9-Ballのブレイクイン率
- 9-Ball／10-Ballの本人breakラック分母による新しいマス割り率
- 3C以外のファール手番率
- 最高シュート率
- 最高ブレイクイン率
- 最高マス割り率
- 最高アベレージ
- 3C最少イニング勝利

採用条件：record eligibility判定、欠損record除外、Product Ownerの正式定義承認、必要な公式文書更新、専用fixtureと回帰テスト。

### Later推奨

- 3Cファール率
- event不足の旧recordを推定補完する処理
- CueScore Best Game
- CueScore Rating
- 独自総合点
- 新event保存またはschema変更を必要とする旧履歴完全補完

## 12. テスト／監査方法と結果

監査方法：

- GitHub最新`origin/main`取得とローカルHEAD照合
- `docs/README.md`掲載の公式文書確認
- Official Decision 024／Spec 023の正式マス割判定確認
- 保存record生成コード確認
- `eventLog.events`／`analysis.events`確認
- Player別保存metricsとlegacy fallback確認
- `rackGameMasuwariCountsV1`確認
- Player Detail／Player Analytics／Match Detailの集計・遷移確認
- 通常データ／サンプルデータ経路確認

結果：

- 指標関連テスト：34 pass / 0 fail
- 全自動テスト：153 pass / 0 fail
- `git diff --check`：PASS
- アプリ実装変更：なし
- native asset変更：なし
- schema変更：なし

## 13. 更新ファイル

- `docs/CURRENT_STATE.md`
- `docs/implementation/CueScore_Build3_TestFlight_Distribution_2026-08-18.md`
- `docs/implementation/CueScore_v1.0_TestFlight_Readiness_2026-08-16.md`
- `docs/implementation/CueScore_Build3_Physical_iPhone_Analytics_Data_Audit_2026-08-18.md`

## 14. 禁止事項の確認

- Build 4作成：実施していない
- Build Number 4設定：実施していない
- Archive：実施していない
- TestFlightアップロード：実施していない
- App Review提出：実施していない
- 一般公開：実施していない
- Player schema変更：実施していない
- Match schema変更：実施していない
- Backup schema変更：実施していない
- event schema変更：実施していない
- 既存Analytics定義変更：実施していない

## 15. 次の判断

Build 4候補実装へ進む前に、Product OwnerとChatGPTで次を正式決定する。

1. v1.0自己ベストへ最大ハイランと1試合最高得点／最多得点を採用するか
2. eventが揃う試合だけにブレイクイン率を表示するか
3. マス割り率の分母を「本人がブレイクした完了ラック」へ正式変更するか
4. 現行の平均ファールを維持するか、3C以外へファール手番率を追加するか
5. 条件付き指標の対象試合数と欠損表示をどのUIで示すか

正式採用項目が決まるまでは、Build 4候補の実装を開始しない。
