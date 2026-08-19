# CueScore Apps — マス割り率 徹底監査・原因特定 完了報告

- 更新日：2026年8月19日（JST）
- 対象：CueScore Apps v1.0 / TestFlight Build 6
- 作業種別：監査・原因特定のみ
- 作業開始時 `origin/main`：`bcf7ba597806f7eadc8f9053a7a5be86229f235a`
- 判定：**現行マス割り率は分母ロジックに構造的問題があり、正確な率として継続表示しないことを推奨**

## 1. 結論

表示された「最高マス割り率 100%」の直接原因は、正式マス割り**回数**の誤判定ではなく、Player分析用マス割り**率の分母**です。

現行実装は、本人がブレイクした完了ラックであっても、そのラックに `player_switch` が1件でもあれば分母から除外します。通常の失敗ラックは相手へ手番を渡すため分母から消え、マス割りに成功した無交代ラックだけが残りやすくなります。その結果、次のように100%へ膨らみます。

|実際の内容|現行分子|現行分母|現行表示|全ブレイク機会を分母にした率|
|---|---:|---:|---:|---:|
|4ブレイク、3マス割り、1通常交代|3|3|100%|75%|
|2ブレイク、1マス割り、1通常交代|1|1|100%|50%|
|1ブレイク、1マス割り|1|1|100%|100%|
|4ブレイク、0マス割り、全て通常交代|0|0|—|0%|

これは一部欠損recordだけの問題ではありません。詳細eventが完全な新規recordでも、通常の `player_switch` を分母除外条件にしている限り発生します。

## 2. 確認した正本

- `docs/official/22_CueScore_v1.0FinalRC_Masuwari_Judgement_Decision.md`
- `docs/official/23_CueScore_v1.0FinalRC_Masuwari_Judgement_Spec.md`
- `docs/official/28_CueScore_v1.0_Build4_Player_Analytics_Renewal_Decision.md`
- `docs/official/29_CueScore_v1.0_Build4_Player_Analytics_Renewal_Spec.md`
- `docs/official/30_CueScore_v1.0_Build5_Player_Origin_Analytics_Decision.md`
- `docs/official/31_CueScore_v1.0_Build5_Player_Origin_Analytics_Spec.md`
- `docs/official/32_CueScore_v1.0_Build6_Integrated_Player_Detail_Decision.md`
- `docs/official/33_CueScore_v1.0_Build6_Integrated_Player_Detail_Spec.md`
- `docs/CURRENT_STATE.md`
- 現行mainの保存・算出・表示実装と自動テスト

Decision 022 / Spec 023の正式マス割り判定は、「合法ブレイク」「ブレーカー本人の勝利」「ファール・スクラッチ・相手プレー・手番移動なし」「スポットを反映して全対象球がなくなったこと」を要求しており、妥当です。問題はBuild 4以降の率の分母です。

Spec 029 / 031にも分母から `player_switch` や不正ブレイクを除外する記載があり、現行実装はその記載と整合しています。したがって修正には、実装だけでなくProduct Owner承認による正式定義の更新が必要です。

## 3. 保存データ監査

### 通常データ

|必要情報|保存状況|注意点|
|---|---|---|
|breaker|△|詳細記録モードの `break_result.player` / `breakPlayer` から取得可能。簡易記録や一部旧recordでは欠損する|
|break result|△|詳細記録モードでは `break_result` を保存。簡易記録モードでは作成されない|
|break pocket数・球番号|△|詳細 `break_result` と通常の球eventから取得可能。event不足recordは不可|
|scratch / foul / break foul / illegal break / pre-break foul|△|詳細 `break_result` とfoul eventから取得可能。旧・簡易recordは不足し得る|
|player switch|○|現行共通eventへ保存される。Undo後はactive eventだけが算出対象|
|rack end / winner|○|完了ラックでは `rack_end` と `rackResults` に保存|
|spot|△|発生した場合は `spot_ball` eventを保存|
|early money ball|△|終了理由とeventから確認可能だが、全残球判定には球履歴が必要|
|Undo|○|保存recordの `eventLog.events` はUndo反映後のactive snapshot。journalには無効化履歴も残る|

Build 1〜6の該当ソース世代を確認し、共通event schemaと詳細 `break_result` 保存経路は存在しました。ただし記録モードが簡易の場合は `break_result` 自体を保存しないため、Build番号だけで全recordの率を算出可能とは判定できません。

### サンプルデータ

サンプルは主にlegacy `analysis.events` を生成し、現行Player分析率が要求する `eventLog.events` は空です。そのためBuild 6のマス割り率ではeligibleになりません。またマス割りサンプルでも全対象球の球番号eventが完全とは限らず、旧 `breakRunOut` フラグから推測することはOfficial仕様で禁止されています。

結論：通常詳細recordとサンプルデータは、現状では同じ可用性・精度でマス割り率を算出できません。

## 4. 算出経路監査

### 正式マス割り回数

`index.html` の共通関数 `rackGameMasuwariCountsV1(record)` がGame Result / Match Detail / Analytics共通の正式回数を返します。球履歴、スポット、勝者、ブレーカー、ファール、スクラッチ、交代をラック単位で確認し、旧 `breakRunOut` だけから推定しません。この回数ロジックに今回の100%固定化原因は確認されませんでした。

### Player分析用マス割り率

`analytics-build4-metrics.js` の `masuwariForRecord(record, playerId)` は次の処理です。

1. record内の全完了ラックに一意な詳細 `break_result` があるか確認する。
2. 正式共通関数のPlayer別マス割り回数を分子にする。
3. 本人がブレイクしたラックのうち、`rack_end`、詳細break、合法性を確認する。
4. **ラック内に `player_switch` があれば分母へ入れない。**
5. eligible recordだけを合算し、`Σ分子 ÷ Σ分母` を主要指標にする。

Build 6の統合Player Detail (`player-detail-build6.js`) は、この同じ `aggregate()` と `bests()` を使用します。主要指標は直近10試合、自己ベストは対象全試合というscope差はありますが、率の計算関数は同じです。

### 自己ベストとMatch Detailリンク

自己ベストは同じ `masuwariForRecord` を試合単位で計算し、最高値のrecord IDをカードへ保持し、そのIDでMatch Detailを開きます。選択されたrecordとリンクIDの取り違えはコード上確認されませんでした。リンク先が体感と合わない原因は、リンク処理ではなく、そのrecordの分母が通常交代ラックを除外して100%になっている可能性が高いです。

## 5. 再現fixture

現行mainの関数を直接呼び出す監査fixtureで次を再現しました。

```text
A 4break/3masuwari  {eligible:true,  numerator:3, denominator:3, rate:100}
C 2break/1masuwari  {eligible:true,  numerator:1, denominator:1, rate:100}
D 1break/1masuwari  {eligible:true,  numerator:1, denominator:1, rate:100}
F 4break/0masuwari  {eligible:false, numerator:0, denominator:0, rate:null}
```

この再現により、「100%しか出ない／0%が—になる」現象は保存欠損がなくても分母条件だけで起きることを確認しました。

## 6. 問題recordの個別監査

指定された「石塚 貴章 / 9-Ball / 2026-08-18」の生record JSON、Backup JSON、localStorage exportは、repositoryおよび提供ファイル内に存在しませんでした。

したがって、次は**確認できません**。

- 試合内rack数
- 各rackのbreaker / break結果 / foul / scratch / switch / rack winner
- 正式マス割り回数
- 現行分母へ採用されたrack番号
- 表示100%の実分子・実分母

画面表示や記憶からeventを推定してrack-by-rack表を作ることはしていません。個別recordの確定監査には、該当試合を含むBackup JSONの提供が必要です。

## 7. 原因分類

|候補|判定|根拠|
|---|---|---|
|マス割り回数ロジック|主原因ではない|正式共通判定はラック条件を厳密に確認|
|分母定義|**主原因**|通常の相手交代ラックを分母から除外|
|eligible判定|**主原因の一部**|record完全性は確認するが、完全な通常交代ラックまで除外|
|保存schema|条件付き問題|詳細recordは材料あり。簡易・旧recordはbreak_result不足|
|サンプルデータ|問題あり|現行common event ledgerを持たず率はeligibleにならない|
|自己ベスト選択/link|主原因ではない|算出record IDをそのままMatch Detailへ渡す|
|最低試行数なし|別課題|1/1=100%は数学的に正しいが小標本。今回の3/4→3/3とは別問題|

## 8. Product Owner判断用の比較

|案|定義|長所|短所|監査評価|
|---|---|---|---|---|
|A 現行維持|無交代eligibleラックだけを分母|現行Spec・実装維持|失敗ラックが消え、率が100%へ強く偏る|非推奨|
|B Match-level完全性 + 全本人break機会|record全体が判定可能な場合、本人がブレイクした全完了ラックを分母|一般的な成功率として理解しやすく、失敗も母数に残る|Official 029/031更新と回帰テストが必要|**推奨**|
|C 最低試行数導入|Bに加え、例：3回未満は自己ベスト対象外|小標本100%を抑制|閾値はProduct Owner判断が必要|条件付き推奨|
|D 表示停止|率と率自己ベストを一時非表示|誤解を即時防止|改善指標を一時利用できない|修正承認まで推奨|

### 推奨する新定義案（未採用）

```text
マス割り率 = 正式マス割り回数
             ÷ 本人がブレイクした、record全体として判定可能な完了ラック数
             × 100
```

- 分子：現行 `rackGameMasuwariCountsV1(record)` を維持。
- 分母：本人がブレイクした全判定可能完了ラック。foul、scratch、break foul、illegal break、early money ball、通常のturn transferも「ブレイク機会」として1件に含める。
- record eligibility：完了ラックすべてに一意な詳細 `break_result` と `rack_end` があり、正式判定に必要なactive event ledgerを確認できるrecordだけを使用。
- 一部rackだけを拾うpartial denominatorは禁止。
- 集計と自己ベストは同じ式・同じeligibilityを使用。
- 分母0は `—`。

この案は未採用です。Product Owner承認前にOfficial資料・実装・表示を変更してはいけません。

## 9. 影響範囲

定義変更時に必要となる範囲：

- `analytics-build4-metrics.js` のマス割り率分母・eligibility
- 主要指標集計、推移、ポイント生成
- 最高マス割り率、1試合最多マス割りのeligible選定
- Build 6統合Player Detail上の表示とMatch Detailリンク検証
- normal / sample dataの可用性表示
- Official Decision / Spec 029 / 031 / 033の後継または追補
- マス割り回数、rate fixture、集計、tie-break、欠損、Undo、旧record、sampleの回帰テスト

変更不要と見込むもの：正式マス割り回数関数、Player / Match / Backup / event schema、競技ルール、Bundle ID、Team ID。

## 10. 今回行っていないこと

- マス割り率実装の変更
- Official仕様の変更
- Player / Match / Backup / event schema変更
- 分析画面UI変更
- Build Number `7`設定
- Archive / App Store Validate
- TestFlight upload / 内部配信
- App Review提出 / 一般公開

## 11. 検証結果

- 原因再現fixture：4/3、2/1、1/1、4/0の4パターンで現行出力を直接確認。
- マス割り・Build 4 metrics・Build 4 UI・Build 6 Player Detail集中テスト：`55 pass / 0 fail / 0 skipped`。
- 全自動回帰テスト：`186 pass / 0 fail / 0 skipped`。
- 実装・schema・native assetsは変更していないため、Archive / Simulator build / native asset再生成は実施対象外。

## 12. 次のGate

Product OwnerとChatGPTで次を決定してから、別指示で修正します。

1. 分母を「本人の全判定可能break機会」へ変更するか。
2. record-level完全性条件を正式採用するか。
3. 率の自己ベストに最低試行数を設けるか。
4. 修正版配信まで現行率を非表示にするか。
5. サンプルデータを現行common event ledgerへ更新するか、率を `—` のままにするか。

最優先は、見栄えの良い100%を残すことではなく、失敗機会も母数に含む再現可能な率だけを表示することです。
