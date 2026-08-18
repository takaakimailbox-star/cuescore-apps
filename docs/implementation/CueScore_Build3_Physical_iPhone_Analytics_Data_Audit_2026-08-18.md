# CueScore Apps — Build 3実機確認記録／分析指標データ監査

更新日：2026-08-18（JST）  
対象：CueScore Apps v1.0  
工程：Build 4候補の分析画面リニューアル前データ監査  
状態：調査・記録完了。分析画面実装、Build 4作成、TestFlightアップロードは未実施

## 1. 監査基準

- 作業開始時の`origin/main`：`aad7ca7f0742c3d26001981d39f556e3d704122a`
- ローカルbranch：`codex/cuescore-step7b-native-ios-foundation`
- 作業開始時、ローカルHEADと`origin/main`の差分：0 commit／0 commit
- 正本：`docs/README.md`掲載の公式文書、特にOfficial Decision 024と`docs/official/23_CueScore_v1.0FinalRC_9Ball_10Ball_Masuwari_Judgement_Fix_Spec.md`
- 実装確認対象：保存record生成、`eventLog.events`、`analysis.events`、Player別保存metrics、`rackGameMasuwariCountsV1`、Player Detail／Analytics／Match Detailの集計・遷移

判定は次の意味で使用する。

- ○：現行schemaの必要情報が揃う対象recordでは正確に算出でき、旧recordにも信頼できる保存値がある
- △：現行の詳細recordでは算出できるが、旧・簡易・不完全recordの一部では必要情報が欠ける
- ×：現行recordでも正確性または競技上の意味を保証できない

## 2. Build 3実iPhone確認記録

Product Ownerは2026年8月18日、TestFlight Build 3について、今回の交代操作UI変更を実iPhoneで問題なく確認できたと報告した。直前のBuild 3対象と照合し、次をPASSとして記録する。

- Rotation：通常ファール／セーフティ後の手動交代
- 9-Ball：通常ファール／セーフティ後の手動交代
- 10-Ball：通常ファール／セーフティ後の手動交代
- Straight Pool（14-1）：通常ファール／セーフティ後の手動交代
- JPA 9-Ball：通常ファール／セーフティ後の手動交代
- JPA 9-Ball：「デッド」が操作列の一番左に配置されること

3 Cushionは公式Decision 026／Spec 027および実装差分上、今回の変更対象外である。これは変更scopeの確認であり、Build 3で3Cを完走したという新規PASS記録ではない。

今回の報告から新たにPASS扱いにしない項目：Backup書き出し／復元、オフライン起動、Player写真、データ保持、全6競技の完全完走、全Analytics、3C実戦、その他のBuild 3総合スモークテスト。過去BuildでのPASS記録は履歴として維持する。

## 3. 保存データ監査の共通結果

現行の完了Match recordには、安定した`id`、Player別`registeredPlayerId`、score、fouls、maxRun、completedTurns、average、pocketCount、misses、shotRateと、Undo反映後の`eventLog.events`が保存される。通常データとサンプルデータは保存領域を分離するが、同じ集計関数へ渡せる。

一方、旧recordには次の差がある。

- `eventLog.events`がなく`analysis.events`だけを持つ詳細recordがある。
- 簡易recordや古いrecordは、break event、球番号履歴、Player別completedTurnsの一部または全部を持たない場合がある。
- 旧`breakRunOut`／`break_run_out`だけから正式マス割を復元することは公式に禁止されている。
- `record.inning`はPlayer別の総手番を保証しないため、新しい手番基準ファール率の分母へ無条件に使用できない。

したがって、対象recordごとに必要イベントの存在を検査し、不足recordを分子・分母の両方から除外する必要がある。不足値を0として混ぜてはならない。

## 4. ブレイクイン率

正式既存定義は「自分のブレイクのうち、1球以上入球かつファールなし」。スクラッチ、その他のbreak foul、イリーガル、pre-break foul、break失敗は、入球があっても失敗である。1回のブレイクで複数球が入っても成功数は1である。

正確な分子／分母：

- 分子：対象Playerの`break_result`のうち、`pocketedBalls.length > 0`（legacy詳細recordでは`pocketCount > 0`も可）かつfoul／scratch／breakFoul／illegalBreak／preBreakFoul／breakFailedのいずれもないevent数
- 分母：対象Playerが行った`break_result` event数

|競技|指標|算出可否|分子|分母|過去record対応|Match Detailリンク|注意点|
|--|--|--:|--|--|--|--|--|
|9-Ball|ブレイクイン率|△|有効な成功break event数|本人のbreak event数|詳細eventありのみ|○|複数入球も1成功。break foulは失敗|
|10-Ball|ブレイクイン率|△|同上|同上|詳細eventありのみ|○|同上|
|Rotation|ブレイクイン率|△|同上|同上|詳細eventありのみ|○|同上|
|JPA 9-Ball|ブレイクイン率|△|同上|同上|詳細eventありのみ|○|scratch時のdead ballを成功へ含めない|
|14-1|対象外|×|—|—|—|○|今回の候補対象外|
|3C|対象外|×|—|—|—|○|break概念を適用しない|

現行詳細recordと現在のサンプルデータは同じ算出が可能。break eventがない旧recordは「—」とし、0%へ混ぜない。

## 5. マス割り率

正式マス割の分子は`rackGameMasuwariCountsV1(record)`だけを判定源とする。合法ブレイク、breakerの勝利、無ファール、相手への手番移行なし、相手のプレーなし、spot反映後の全対象球消失が必要である。早期9番／10番で他球が残る場合は成立しない。

今回候補の正確な分子／分母：

- 分子：共通正式判定で成立した対象Playerのマス割数
- 分母：対象Playerの`break_result`と同一rackの`rack_end`が確認できる、本人がブレイクした完了ラックの一意な数

|競技|指標|算出可否|分子|分母|過去record対応|Match Detailリンク|注意点|
|--|--|--:|--|--|--|--|--|
|9-Ball|マス割り率|△|正式マス割数|本人がブレイクした完了対象ラック数|球番号・spot・turn履歴が揃うrecordのみ|○|早期9番、break foul、turn transferを正式判定で除外|
|10-Ball|マス割り率|△|正式マス割数|本人がブレイクした完了対象ラック数|同上|○|早期10番を誤認しない|
|他4競技|対象外|×|—|—|—|○|正式マス割の対象外|

現行Player Detailの既存「マス割率」は、正式マス割数を全完了ラック数で割っている。今回候補の「本人がブレイクした対象ラック数」とは分母が異なる。監査では変更せず、新定義を採用する場合はProduct Ownerの正式決定と専用回帰テストを必要とする。

分母0または判定材料不足は「—」。旧flagだけを理由に0回または成立回数として扱わない。

## 6. ファール率

第一候補の正確な分子／分母：

- 分子：対象Playerについて、同一手番key（disciplineに応じたrack／inning／player）内に1件以上の有効`foul` eventがある手番数
- 分母：Player別`completedTurns`、または現行eventから一意に復元できる総手番数

同一手番に複数のfoul関連eventがあっても分子は1とする。14-1の`straight_pool_three_foul`は累積罰則eventであり、新しいfoul手番として重複加算しない。JPAのDeadは`ball_pocketed`のdead処理でありfoulへ含めない。

|競技|指標|算出可否|分子|分母|過去record対応|Match Detailリンク|注意点|
|--|--|--:|--|--|--|--|--|
|9-Ball|ファール手番率|△|foulを含む一意な手番数|本人の総手番数|現行詳細record中心|○|break foulのlinked eventを二重計上しない|
|10-Ball|ファール手番率|△|同上|同上|現行詳細record中心|○|同上|
|Rotation|ファール手番率|△|同上|同上|現行詳細record中心|○|手番keyをeventから復元できることが条件|
|JPA 9-Ball|ファール手番率|△|同上|同上|現行詳細record中心|○|Deadを除外|
|14-1|ファール手番率|△|foulを含む一意な手番数|本人の総手番数|現行詳細record中心|○|3ファール罰則eventを重複加算しない|
|3C|ファール手番率|×|正式なfoul event定義なし|総手番は取得可能|比較不可|○|現行公式画面もfoul非表示。共通定義は不適切|

代替候補の比較：

|候補|正確性／比較可能性|評価|
|--|--|--|
|ファールした手番数 ÷ 総手番数|機会数で正規化できる。現行詳細recordでは最も比較しやすいが旧recordが欠損|条件付き推奨（3C除外）|
|ファール回数 ÷ 総手番数|同一手番の重複eventや罰則eventの正規化が必要|第一候補より劣る|
|ファール回数 ÷ 試合数|公式の既存「平均ファール」と一致し、旧record互換が最も高いが試合長を補正しない|現行v1.0維持に推奨|
|ファール回数 ÷ ラック数|非ラック競技と比較できず、ラック長の影響も残る|Laterにも非推奨|

## 7. 自己ベスト

自己ベストは独自総合点を作らず、必要な分子・分母が揃うeligible matchだけを比較する。各eligible recordは`id`を持つため、既存`openMatchDetailV1(id)`でMatch Detailへ遷移できる。

|競技|指標|算出可否|分子|分母|過去record対応|Match Detailリンク|注意点|
|--|--|--:|--|--|--|--|--|
|9-Ball|最高シュート率|△|入球数|入球＋miss|保存countsありを優先。rateのみの旧recordは由来確認不可|○|分母0を除外|
|9-Ball|最高ブレイクイン率|△|有効break数|本人break数|詳細eventありのみ|○|分母0を除外|
|9-Ball|最高マス割り率|△|正式マス割数|本人break完了ラック数|正式判定材料ありのみ|○|旧flagから推測しない|
|9-Ball|1試合最多マス割り|△|正式マス割数|—|正式判定材料ありのみ|○|0件だけなら自己ベスト非表示|
|10-Ball|最高シュート率|△|入球数|入球＋miss|同上|○|分母0を除外|
|10-Ball|最高ブレイクイン率|△|有効break数|本人break数|詳細eventありのみ|○|分母0を除外|
|10-Ball|最高マス割り率|△|正式マス割数|本人break完了ラック数|正式判定材料ありのみ|○|早期10番を除外|
|10-Ball|1試合最多マス割り|△|正式マス割数|—|正式判定材料ありのみ|○|0件だけなら非表示|
|Rotation|最高シュート率|△|入球数|入球＋miss|countsありを優先|○|分母0を除外|
|Rotation|最高ブレイクイン率|△|有効break数|本人break数|詳細eventありのみ|○|分母0を除外|
|Rotation|最大ハイラン|○|保存`maxRun`|—|Player別保存値あり|○|正の値だけを候補にする|
|Rotation|1試合最高得点|○|保存Player score|—|Player別保存値あり|○|客観値として安全。0のみなら非表示|
|JPA 9-Ball|最高アベレージ|△|保存score|本人completedTurns|現行／必要情報ありのみ|○|旧`record.inning`をPlayer分母へ流用しない|
|JPA 9-Ball|最高ブレイクイン率|△|有効break数|本人break数|詳細eventありのみ|○|分母0を除外|
|JPA 9-Ball|最大ハイラン|○|保存`maxRun`|—|Player別保存値あり|○|正の値だけ|
|JPA 9-Ball|1試合最多得点|○|保存Player score|—|Player別保存値あり|○|0のみなら非表示|
|14-1|最高アベレージ|△|保存score|本人completedTurns|現行／必要情報ありのみ|○|減点反映後scoreを使用|
|14-1|最大ハイラン|○|保存`maxRun`|—|Player別保存値あり|○|正の値だけ|
|14-1|1試合最高得点|○|保存Player score|—|Player別保存値あり|○|0のみなら非表示|
|3C|最高アベレージ|△|保存score|本人completedTurns|現行3C recordは可、旧欠損あり|○|分母0を除外|
|3C|最大ハイラン|○|保存`maxRun`／3C highRun|—|Player別保存値あり|○|正の値だけ|
|3C|最少イニング勝利|△|勝利Matchの本人completedTurns|—|Player別turn情報ありのみ|○|勝利・正のturn数が条件|

同率1位は、(1) 指標値、(2) `endedAt`／`playedAt`の新しい順、(3) `id`の辞書順、の順で安定選択する。最少イニングだけは(1)を昇順とする。1試合しかなくても「自己ベスト」と表示可能だが、補足として「対象1試合」を表示し、比較優位を示す表現は使わない。

## 8. 欠損表示

- コンパクトな数値欄：既存Design Systemと現行画面に合わせて`—`
- カードまたは空状態の補足：`データなし`
- 前期間比較・同条件比較が成立しない説明：`比較できません`

0、0%、推定値で代用しない。値0が競技上の実測値でも、「分母0／event欠損」と区別できないrecordは自己ベスト候補から除外する。

## 9. 採用分類

### v1.0採用推奨

- 既存保存値から直接取得できる客観的自己ベスト：最大ハイラン、1試合最高得点／最多得点
- eligible matchの記録元Match Detailリンク
- 欠損表示`—`、空状態`データなし`、比較文`比較できません`
- 現行公式定義の「平均ファール（総ファール数 ÷ 試合数）」は互換性優先で維持

### 条件付き採用

- 9-Ball／10-Ball／Rotation／JPA 9-Ballのブレイクイン率
- 9-Ball／10-Ballの新しい本人breakラック分母によるマス割り率
- 3C以外のファール手番率
- 分母を必要とする自己ベスト（最高シュート率、最高ブレイクイン率、最高マス割り率、最高アベレージ、最少イニング勝利）

条件：対象recordのeligibility判定、欠損record除外、正式定義のProduct Owner承認、既存Analytics定義を変更する場合の公式文書更新、専用fixture／回帰テスト。

### Later

- 3Cファール率
- event不足の旧recordを推定補完する処理
- CueScore Best Game／CueScore Rating／独自総合点
- 新event保存またはschema変更を必要とする旧履歴完全補完

## 10. 実施していないこと

- Player／Match／Backup／event schema変更
- 既存Analytics定義変更
- 分析画面リニューアル実装
- Build Number 4設定、Archive、TestFlightアップロード
- App Review提出、一般公開

## 11. 監査・回帰確認結果

- GitHub `origin/main`取得・ローカルHEAD一致確認：PASS
- 公式Decision／Specと現行実装の静的照合：PASS
- 保存record、現行event、legacy fallback、サンプルデータ経路の静的監査：完了
- 指標関連テスト（masuwari、Player Analytics、Demo Data、共通Match Detail）：34 pass / 0 fail
- 全自動テスト：153 pass / 0 fail
- `git diff --check`：PASS

今回追加したのは監査・状態記録のみで、アプリ実装とnative assetは変更していない。
