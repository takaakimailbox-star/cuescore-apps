# CueScore Apps — Build 4候補 Player分析リニューアル 実装完了報告

更新日：2026-08-18（JST）
対象：CueScore Apps v1.0
工程：ソース実装・自動検証
状態：実装完了。Build 4配布Gateは未承認／未実施。

## 1. 開始点

- 作業開始時`origin/main`：`d7b8ccc23436f5b5fe9d433dad4d791b46135da8`
- ローカルブランチ：`codex/cuescore-step7b-native-ios-foundation`
- 開始時はlocal HEADと`origin/main`が一致し、worktreeはcleanだった。

## 2. 確認した正式資料

- `docs/README.md`の正本索引
- Official 09 Player Analytics競技別統計
- Official 22／23 正式マス割り判定Decision／Spec
- Official 26／27 手動交代UI Decision／Spec
- `docs/CURRENT_STATE.md`
- Build 3実機確認／分析指標データ監査記録
- 現行Player／Rival／Single Match Analysis、Match Detail、`rackGameMasuwariCountsV1(record)`実装

## 3. 実装構造

既存Analysis v2のreader、Player／競技選択、Rival Analysis、Single Match Analysis、Match Detail経路を維持し、その上にPlayer分析トップ専用のderived metrics層と表示層を追加した。保存時のPlayer／Match／event／Backup schema、保存key、Undo上限には触れていない。

Player分析トップは、今の状態、主要指標、推移、今回のポイント、自己ベスト、詳細分析への入口の順とした。今の状態は「改善傾向」「安定」「要調整」「データ蓄積中」を使用し、条件付き指標の欠損を0として判定へ入れない。

## 4. 競技別主要指標

|競技|主要指標|
|--|--|
|9-Ball／10-Ball|シュート率、ブレイクイン率、新マス割り率、平均ファール|
|Rotation|シュート率、ブレイクイン率、ハイラン、平均ファール|
|JPA 9-Ball|アベレージ、ブレイクイン率、ハイラン、平均ファール|
|14-1|アベレージ、ハイラン、平均ファール|
|3 Cushion|アベレージ、ハイラン|

## 5. 新指標算出

### ブレイクイン率

- 対象：9-Ball、10-Ball、Rotation、JPA 9-Ball。
- 分子：対象Playerのeligible `break_result`のうち、1球以上入球し、foul／scratch／break foul／illegal break／pre-break foul／break失敗がないevent数。
- 分母：対象Playerの判定可能な`break_result` event数。
- 複数球入球は1成功。event不足と分母0は`—`。

### Player分析用マス割り率

- 対象：9-Ball、10-Ball。
- 分子：既存正式共通関数`rackGameMasuwariCountsV1(record)`のPlayer別結果。
- 分母：本人のeligible `break_result`と同一rackの`rack_end`があり、break foul等と`player_switch`がない一意な完了rack数。
- 旧`breakRunOut`、早期money ball、交代rack、event不足rackを推定採用しない。
- Player Detail等の既存マス割り率定義は変更していない。

### 平均ファール

現行正式ロジック「総ファール数 ÷ 対象試合数」を再利用した。ファール手番率は実装していない。

## 6. 推移／今回のポイント／自己ベスト

- チャートは1つで、勝率と競技別主要指標をタブ切替する。missing pointを0へ変換しない。
- 強み／次の課題は比較可能な保存値から各1項目だけ生成し、比較不能時は「比較できません」とする。
- 自己ベストは競技別の採用項目だけを表示し、正確な分子・分母を持つeligible recordだけを使う。
- 0／欠損は自己ベストにしない。同率は指標値、記録日時の新しい順、Match ID辞書順。最少イニング勝利だけ指標値を昇順とする。
- Match IDを持つカードから`openMatchDetailV1(id)`へ遷移する。

## 7. 欠損表示と既存機能

- 数値：`—`
- セクション空状態：`データなし`
- 比較不成立：`比較できません`

Rival Analysisは`openRivalAnalysisForPlayerV832(playerId)`、Single Match Analysisは既存`data-open-match-analysis`経路を再利用した。History、Player Detail、通常／サンプルデータ切替、Backup／Restore、Undo、競技別score、正式マス割り判定を変更していない。

## 8. 修正ファイル

- `analytics-build4-metrics.js`
- `analysis-build4.js`
- `analysis-build4.css`
- `index.html`
- `sw.js`
- `scripts/build-native-web.mjs`
- `tests/analytics-build4-metrics.test.mjs`
- `tests/analytics-build4-ui.test.mjs`
- `docs/README.md`
- `docs/CURRENT_STATE.md`
- `docs/official/28_CueScore_v1.0_Build4_Player_Analytics_Renewal_Decision.md`
- `docs/official/29_CueScore_v1.0_Build4_Player_Analytics_Renewal_Spec.md`
- 本報告書

## 9. テストと検証

- Build 4指標／UI対象テスト：22 pass / 0 fail。
- 全自動テスト：175 pass / 0 fail / 0 skipped。
- ブレイクイン：valid、0球、scratch、foul、break foul、illegal break、pre-break foul、break失敗、複数球、event不足、分母0を確認。
- マス割り：本人break分母、複数rack、turn transfer、foul、break foul、rack_end不足、break_result不足、legacy-only、分母0を確認。既存正式テストでearly money ball、spot、正常マス割りも回帰確認。
- 自己ベスト：正値限定、値／日付／Match ID tie-break、最少イニング昇順、eligible指標、Match Detailリンク契約を確認。
- UI：全6競技、6ブロック、欠損、部分欠損チャート、390px portrait、2列カード、詳細入口を確認。
- Native asset：buildとCapacitor sync後、source／generated／Xcode copied asset一致テストをPASS。
- iOS Simulator Debug／Release：`BUILD SUCCEEDED`。
- `git diff --check`：PASS。

`restore-quota-safety`が意図的なQuotaExceededErrorログを出力するが、rollback safetyの期待ケースであり当該テストを含め全件PASSしている。

## 10. Gate確認

- Marketing Version：`1.0`のまま。
- Build Number：`3`のまま。`4`へ変更していない。
- Distribution Archive／App Store Validate：未実施。
- TestFlight Build 4 upload／内部配信：未実施。
- App Review提出／一般公開：未実施。

## 11. 未確認事項

- TestFlight Build 4として未配布のため、新Player分析トップの実iPhone確認は未実施。
- event不足の旧recordは条件付き指標の対象外。schema migrationや推定補完はLater。
- Build 4配布は、Product OwnerとChatGPTによる実装レビュー後の別Gateとする。

## Revision history

- 2026-08-18: Product Owner採用仕様のソース実装・自動検証完了記録を作成。
