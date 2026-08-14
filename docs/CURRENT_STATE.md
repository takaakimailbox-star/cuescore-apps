# CueScore Apps Current State

## v1.0 Final RC Step 6：ネイティブ化前Final Acceptance（2026年8月13日）

- 基準main `554e137463279fb5041295a5840bbc5c331d6ddf`でGate 1〜14を再監査し、自動テスト117件成功／失敗0／スキップ0を確認した。
- 390px幅ブラウザでHome、New Match、Settings、9-Ballの開始・進行・完了・Result・完了後Undo・再進行・保存・History・再読込・Analytics、Legal / Supportを確認した。Service Worker取得後にローカルサーバーを停止し、Home、10-Ball試合設定、History、Supportがキャッシュから表示できることも確認した。
- 初回監査では、Settingsのサンプルデータカードに内部名称`Official Demo Data`が利用者向けテキストとして表示される名称不一致をMinor 1件として記録した。Product Ownerは受容せず、独立した軽微修正Stepでカード見出し・確認文・完了通知・データ削除説明を「サンプルデータ」へ統一した。内部識別子、保存領域名、変数名、技術資料上の内部名称は変更していない。
- 軽微修正後の再検証ではBlocker 0、Critical 0、Major 0、Minor 0、Cosmetic 0、自動テスト117件成功／失敗0／スキップ0。Step 6への回帰は確認されず、Product Owner承認により`PWA Final Acceptance: PASS`と確定した。PWA側Acceptanceとしてネイティブ化へ進行可能だが、Release確定、App Store提出、ネイティブ化自体は開始していない。
- Home Screen PWA、iOS Safari固有挙動、safe-area、写真選択、Backupファイル保存／選択、mailto、実機オフライン起動、長時間試合、画面回転抑止、実機6競技完走はProduct Owner実機確認待ち。
- 詳細記録：`docs/implementation/CueScore_v1.0_Final_RC_Step6_Final_Acceptance_2026-08-13.md`。

## v1.0 Final RC：9-Ball / 10-Ball マス割判定修正（2026年8月13日）

- マス割を「ブレーカーが相手へ一度も手番を渡さず、ファールせず、ブレイク入球を含む全対象球をテーブル上からなくしてラックに勝利した場合のみ1回」と正式確定した。
- 9-Ballは1〜9番、10-Ballは1〜10番を対象とし、スポットイベントを反映したラック終了時のテーブル状態で判定する。
- 9番／10番の早期入球によるラック勝利は維持するが、他球が残る場合はマス割に数えない。
- Game Result、Match Detail、Player Detail、Player Analytics、Match Analyticsを共通関数 `rackGameMasuwariCountsV1(record)` へ統一した。
- 球番号単位の履歴が不足する過去recordは、旧 `breakRunOut`／`break_run_out`フラグだけから推測せず0回とする。
- 保存schema、localStorage、Backup／Restore、既存record、ラック勝敗、Race、Undo、保存タイミング、スコア推移、Player情報は変更していない。
- Formal Decision 022、後継仕様023、Official Design Decision Log v1.8 Decision 024を正本とする。

## v1.0 Final RC：6競技 Race to表示統一（2026年8月13日）

- Game Result／Match Detailの試合条件表示を、6競技すべて `Race to X-Y` へ統一した。XはPlayer 1、YはPlayer 2の既存goalを使用する。
- 9-Ball／10-Ballの「最終ラック数」、Rotation／14.1の「目標点」、JPAの「Race／先取点」、3Cの「持ち点」とスラッシュ区切りを、両画面の条件行から廃止した。
- 共通renderer `openMatchDetailV1`で同じ表示を生成する。共通目標しかない旧データは同値を左右へ表示する。
- 競技ルール、勝敗判定、内部goal、JPA SL・マッチポイント、3C持ち点、Metrics、保存schemaは変更していない。
- 正式決定：`docs/official/20_CueScore_v1.0FinalRC_6Disciplines_RaceTo_Display_Decision.md`。後継仕様：`docs/official/21_CueScore_v1.0FinalRC_6Disciplines_RaceTo_Display_Spec.md`。

## v1.0 Final RC：JPA 9-Ball Result / Detail Metrics整理（2026年8月13日）

- JPA 9-Ballの上部にPlayer名、Avatar、SL、Race／先取点、最終取得点、マッチポイントを集約した。
- 下部は「イニング／セーフティ／アベレージ／ハイラン／ファール」の5行をこの順で表示する1枚のMetricsカードとした。
- 下部からSL、Race／先取点、最終取得点、マッチポイントの重複表示と、「試合結果情報」「分析情報」の見出し分離を廃止した。
- Decision 021の共通renderer、Game Result／Match Detailの下部差分、JPAスコア推移、マッチポイント計算、保存互換性は維持する。他5競技は変更しない。
- 正式決定：`docs/official/18_CueScore_v1.0FinalRC_JPA9_Result_Detail_Metrics_Refinement_Decision.md`。後継仕様：`docs/official/19_CueScore_v1.0FinalRC_JPA9_Result_Detail_Metrics_Refinement_Spec.md`。

## v1.0 Final RC：Game Result / Match Detail共通レイアウト（2026年8月13日）

- Game ResultとMatch Detailは`openMatchDetailV1`を共通rendererとして使用し、日時・種目、Player／Avatar／最終スコア、競技条件、Metrics、スコア推移まで同じ情報構造・順序・デザインとした。
- Game Resultはゲーム履歴と削除UIを生成せず、最下部に「試合へ戻る」「ホームへ戻る」「もう一度対戦する」を表示する。Match Detailはゲーム履歴、削除UI、削除説明文を維持する。
- 両画面のMetricsは、9-Ball／10-Ball＝シュート率・マス割・ファール、Rotation＝シュート率・ハイラン・ファール、JPA／14.1＝アベレージ・ハイラン・ファール、3C＝イニング・ハイラン・アベレージとした。
- Decision 020は履歴として維持し、後続Decision 021が画面責務と3C Metricsを上書きする。
- 保存schema、localStorage、Backup／Restore、過去データ、Undo、保存取消、スコア推移生成、JPAマッチポイント、10-Ballマス割判定は変更していない。
- 正式決定：`docs/official/16_CueScore_v1.0FinalRC_GameResult_MatchDetail_CommonLayout_Decision.md`。後継仕様：`docs/official/17_CueScore_v1.0FinalRC_GameResult_MatchDetail_CommonLayout_Spec.md`。

## v1.0 Final RC：Game Result / Match Detail 6競技正式仕様（2026年8月13日）

- Game Resultの主要2指標を、9-Ball／10-Ball＝シュート率・マス割、Rotation＝シュート率・ハイラン、JPA 9-Ball＝イニング・セーフティ、14.1／3C＝アベレージ・ハイランへ統一した。
- Match Detailは、9-Ball／10-Ball＝シュート率・マス割・ファール、Rotation＝シュート率・ハイラン・ファール、JPA 9-Ball／14.1＝アベレージ・ハイラン・ファール、3C＝アベレージ・ハイランとした。3Cにはファール項目を表示しない。
- JPA Match Detailは、SL、Race／先取点、最終取得点、マッチポイント、イニング、セーフティの試合結果情報と、アベレージ、ハイラン、ファールの分析情報を区別して表示する。
- 9-Ball／10-Ballの共通ラベルを「シュート率」「マス割」「ファール」へ統一した。10-Ballの10番マス割判定は変更していない。
- 保存schema、localStorage、Backup／Restore、過去データ、Undo、結果保存取消、JPAマッチポイント、スコア推移生成は変更していない。
- 正式決定：`docs/official/14_CueScore_v1.0FinalRC_GameResult_MatchDetail_6Disciplines_Decision.md`。後継仕様：`docs/official/15_CueScore_v1.0FinalRC_GameResult_MatchDetail_6Disciplines_Spec.md`。

## v1.0 Final RC：Player1／Player2正式Selection UI統一（2026年8月12日）

- New MatchのPlayer1／Player2選択画面も、管理画面と同じ白基調の正式Player Library外装、正式avatar、検索、追加、Back UIへ統一した。
- 選択画面は行タップで選択し、メインプレーヤー最上位、現在選択中、相手側で選択済みのdisabled、プロフィールメモ、最終使用を表示する。管理用の成績／編集操作は表示しない。
- 6競技は同じPlayer1／Player2選択入口を使用し、旧緑色Player選択UIは現行New Match導線から使用しない。
- 選択ロジック、プレーヤーデータ、保存形式、試合メモ／タグのv1.0非採用状態は変更していない。Official Releaseも変更していない。

## v1.0 Final RC：正式Player Library回帰復旧（2026年8月12日）

- Code Cleanup Phase 1で未参照Legacy関数を削除した際、直後の正式Player Library renderer overrideまで誤って削除され、旧Player1／Player2選択UIが露出する回帰が発生した。
- 正常比較元 `68886dc4bb7180f68477b5aa1079301552532246` から、白基調の正式Player Library描画、検索、並び替え、avatar、メインプレーヤー優先、現在選択中、最終使用、Player Detail／編集／新規追加の導線を復旧した。
- 試合メモ／タグのUI・生成・検索・絞り込み・編集は復活させず、Phase 1 Finalの非採用状態を維持する。
- Phase 2の未使用コード削除はiPhone実機で本修正を確認するまで開始しない。
- Official Releaseは変更していない。

## v1.0 Final RC：試合メモ／タグ非採用・コード整理 Phase 1（2026年8月12日）

- Product Owner決定により、試合メモ／タグはv1.0非採用とし、新規入力・生成・検索・絞り込みUIおよび専用ロジックを削除した。
- 既存record内の `memo`、`matchMemo`、`tags`、`reflection`、`playerReflections` は保存データ互換のため削除・変換しない。旧試合メモ／タグはBackup／RestoreとCSV出力で保持するが、v1.0 UIでは表示・入力・編集・検索・絞り込みを行わない。
- プレーヤープロフィールのメモと、Decision 013で採用済みのプレーヤー別振り返りは別機能として維持する。
- 将来の試合メモ／タグ再検討はLaterとし、v1.0では新しい保存項目やデータ移行を追加しない。
- Official Releaseは変更していない。

## App Store v1.0 RC：Settings法務導線（2026年8月10日）

- Settingsの「利用規約」は同一タブで `terms.html`、「プライバシーポリシー」は同一タブで `privacy.html` を開く。遷移前の一時フラグにより、ブラウザ／PWAの標準「戻る」でSettingsへ復帰できる。
- 公開先は既存のGitHub Pages URLを使用し、Step 4で正式公開URLとして確定した。新しいURLや本文は作成していない。
- Terms／PrivacyのHTML、Official Markdown、表示スクリプト、スタイルはService WorkerのApp Shell対象で、取得済み環境ではオフライン表示できる。
- ライセンス画面、ライセンス文書、OSSライセンス一覧、正式表示URLは現行リポジトリおよび公式文書に存在しない。推測で作成せず、正式資料が確定するまで無効状態を維持する。
- 法務ページ遷移時のService Workerは遷移先URLへレスポンスを保存し、Home用 `index.html` キャッシュを上書きしない。
- 既存正式URL記録：`docs/official/app-store-v1.0/submission/CueScore_App_Store_Public_URLs_v1.0_RC.md`。

## App Store v1.0 RC：JPA 9-Ball マッチポイント20点配分（2026年8月10日）

- ユーザー提供のJPA公式スコアシート `p_scoresheet.pdf` 1ページ上部「敗者獲得点数」表を全SL・全セル目視照合し、SL1〜9の20-0〜12-8配分を実装。
- JPA 9-BallのGame ResultとMatch Detailで、既存の最終取得点直下に「マッチポイント」を表示する。取得点の重複表示は行わない。
- 敗者SLと敗者最終取得点から共通の純粋関数で算出し、画面上のPlayer 1 / Player 2順を維持する。合計は常に20ポイント。
- 同点・未完了・SL欠損・範囲外は推測せず「—」。その他5競技には表示しない。
- 両者のSL・取得点・勝者は既存保存データにあるため、新規保存項目や移行は不要。必要情報を持つ既存履歴とサンプルデータも表示時に再計算する。
- サンプルデータ生成時のJPA SLは先取点から公式対応表で決定し、SLと先取点の整合を保証する。
- 正式決定記録：`docs/official/11_CueScore_v1.0RC_JPA9_MatchPoint_Decision.md`。

Updated: 2026-08-13
Status: Living operational reference

## Purpose and Authority

ChatGPTとCodexで共有する現在状態の参照ファイル。Official Releaseを置き換えず、最新の実装状態、採用判断、延期項目を記録する。

1. `docs/official/` のOfficial Releaseが正式仕様。
2. Official Design Decision Logの最新適用判断を優先。
3. 本ファイルは運用上の現在状態であり、正式仕様を新規作成しない。
4. 正式資料と矛盾した場合は推測せずProduct Ownerへ確認する。

## App Store v1.0 RC：Game Result競技別統計2指標（2026年8月10日）

- Product Owner採用済み仕様として、Game Resultのプレーヤーカード下部2指標を競技別に切り替える。
- 9 Ball・10 Ball：シュート率／マス割。マス割は既存のブレイクランアウト成立回数を使用。
- Rotation：ハイラン／シュート率。
- JPA 9 Ball：アベレージ（総得点 ÷ 自分の総イニング数。0点で終了したイニングを含む）／ハイラン。
- Straight Pool（14.1）：アベレージ（総得点 ÷ イニング数）／ハイラン。
- Three Cushion（3C）：アベレージ（総得点 ÷ イニング数）／ハイラン。
- レイアウト、カード寸法、色、余白は変更せず、表示ラベルと計算式のみ切り替える。
- 試合終了時は結果を先に保存してGame Resultを表示する。Game Resultから「試合へ戻る」場合のみ、その保存済み結果を取り消して試合進行の再編集へ戻す。
- Undo反映後のイベントログから完了手番を再計算し、既存データ形式を変更しない。
- 本決定はGame Result表示に対する仕様であり、プレーヤー詳細のJPA 9 Ball「平均イニング」未確定事項は変更しない。
- 正式仕様：`docs/official/08_CueScore_v1.0RC_GameResult_Statistics_Spec.docx`。

## App Store v1.0 Final RC：Game Result Modal復元・スコア推移修正（2026年8月11日）

- Game ResultはBottom Sheetではなく中央Result Modalを使用する。左右16pt相当、最大幅560pt、角丸28pt、Fade＋Scale、背面操作不可とし、Bottom Sheet用Grabberと下端固定構造は使用しない。2026年8月11日のProduct Owner決定により、Game Resultに限り右上Closeを廃止した。
- Game ResultとMatch Detailは同じUndo対応の得点推移生成関数を使用し、保存形式や新規保存項目は変更しない。
- 9 Ball／10 BallはラックをX軸、累積ラック勝利数をY軸とし、`rackResults`、競技別`rackResults`、旧履歴の`rack_end`の順に使用する。入球イベントはラック得点にしない。
- Rotation／JPA 9 Ball／Straight Pool（14.1）／Three Cushion（3C）はイニングをX軸、累積得点をY軸とする。JPAは有効得点、14.1は入球・ブレイク得点と通常／3ファール減点、3Cは`carom_point`または保存済みイニングを反映する。
- 最終点だけ保存スコアへ強制置換する処理を廃止。通常試合はUndo後の有効共通イベント、Official Demo Data v3.1と旧履歴は既存の検証済み保存推移を共通関数内の後方互換経路で使用する。
- JPA 9-Ball Game Resultは中央マッチポイント列の実幅をGridに確保し、左右Player Cardを同幅のまま表示する。Match PointはCardへ重ならず、Player 1→Player 2順の1行表示を維持する。
- Game Result／Match Detailの共通スコア推移は、色だけに依存せずPlayer 1を実線、Player 2を破線で区別し、凡例も同じ線種に統一する。6競技の得点推移生成・X軸・Y軸・保存形式は変更しない。
- PWAキャッシュ版は `2.0-jpa9-result-lines-v1`。Official Release文書は変更していない。

## App Store v1.0 Final RC：Game Result Modal右上Close廃止（2026年8月11日）

- Product Owner採用決定により、Game Result Modalの右上×を表示しない。
- 試合進行へ戻る正式経路は「試合へ戻る」ボタンだけとし、保存済みの暫定結果を取り消してGame画面へ復帰する既存処理を維持する。
- 「ホームへ戻る」「もう一度対戦する」は維持する。BackdropタップおよびEscapeではGame Resultを閉じない。
- 中央配置、左右余白、最大幅、角丸、Fade＋Scale、背面操作不可は維持する。
- Race Picker、Result以外のModal、Picker、OverlayのClose仕様は変更しない。
- 正式決定記録：`docs/official/13_CueScore_v1.0FinalRC_GameResult_Close_Decision.md`。Decision 019としてOfficial Design Decision Log v1.3へ正式収録した。
- Game Result Close例外は、一般Modal規則を維持したままDesign System v2.1、UI Components v1.1、Official Design Decision Log v1.3へ正式反映済み。既存のv2.0／v1.0／v1.2は履歴として保持する。

## App Store v1.0 RC：Player Analytics競技別統計3指標（2026年8月10日）

- Player Analyticsの統計定義を採用済みGame Result仕様へ統一。
- 9 Ball・10 Ball：シュート率／マス割／平均ファール。
- Rotation：ハイラン／シュート率／平均ファール。
- JPA 9 Ball・Straight Pool（14.1）・Three Cushion（3C）：アベレージ／ハイラン／平均ファール。
- 現在の変化、変化の根拠では既存カード構造を維持し、競技選択時に統計ラベルと値だけを切り替える。
- 成長の推移、グラフ、次のアドバイス、配色、余白は変更していない。
- 正式決定記録：`docs/official/09_CueScore_v1.0RC_Player_Analytics_Discipline_Statistics_Spec.md`。

## v1.0 Final RC：Player Analytics／Match Analytics表示整合（2026年8月12日）

- Product Owner採用により、新規分析機能を追加せず、既存保存データから説明できる範囲で分析表示を整合。
- Player Analyticsは採用済み競技別3指標を維持し、勝率と各指標の方向性を組み合わせて状態を判定する。シュート率・マス割・ハイラン・アベレージは高い方、平均ファールは少ない方を改善として扱う。
- 改善と悪化が混在する場合は「安定」とし、好調／要調整を断定しない。前期間または現在期間が3試合未満の場合は「蓄積中」とする。
- 「現在の変化」は競技別指標の結論、「変化の根拠」は前期間値から現在値への比較として役割を分離。
- Match Analyticsは9 Ball／10 Ball＝シュート率・マス割・ファール、Rotation＝ハイラン・シュート率・ファール、JPA 9 Ball／14.1／3C＝アベレージ・ハイラン・ファールを使用。保存値が存在しない指標は推測コメントを生成しない。
- `punishedRate < 40`だけを理由にファール関連文を「良かった点」へ追加しない。ファール増加・ファール多数は改善側として扱わない。
- 実イベントから算出していなかった固定の「序盤＝互角／中盤＝変化／終盤＝安定」は非表示。試合展開解析はLater。
- 遷移先のない「次のアドバイス」「振り返り」行のChevronを削除。新しい詳細画面・遷移は追加しない。
- 保存形式、既存統計定義、Official Demo Data、試合履歴、Official Releaseは変更していない。

## App Store v1.0 RC：競技別プレーヤー統計4指標（2026年8月10日 再確認）

- Product Owner採用済み仕様として、プレーヤー詳細の4カードを競技タブ別に切り替える実装へ更新。
- Rotation：試合数／ハイラン／シュート成功率／ブレイクイン率。
- 9 Ball・10 Ball：試合数／マス割率／シュート成功率／ブレイクイン率。
- JPA 9 Ball：試合数／シュート成功率／ブレイクイン率／平均イニング。
- Straight Pool（14.1）：試合数／ハイラン／シュート成功率／平均得点/イニング。
- Three Cushion（3C）：試合数／ハイラン／平均得点/イニング／おすすめ持ち点。
- ブレイクイン率は、自分のブレイクのうち「1球以上入球かつファールなし」の割合。スクラッチ、その他ファール、イリーガル、ブレイク失敗は入球があっても失敗として集計。
- 9 Ball／10 Ballのマス割率は、既存のブレイクランアウト判定による成立ラック数 ÷ 対象完了ラック数。既存判定ロジックは変更していない。
- 14.1／3Cの平均得点/イニングは、保存済み対象試合の総得点 ÷ 完了イニング総数。
- JPA 9 Ball平均イニングは、対象試合における自分の完了イニング総数 ÷ 対象試合数。0点で終了した完了イニングも総数に含め、保存済みイベントログから再計算する。
- 3Cおすすめ持ち点はNBA、JPBF、UMB等の公開原典から標準アベレージ対応表の具体値を確認できていないため、推測せず「—」表示。
- 新規保存項目・データ移行なし。既存試合とサンプルデータから表示時に再計算し、通常データとの分離や保存仕様は変更していない。
- Game Result／Player Analyticsの競技別統計とは目的と表示項目を分離し、Player Detail専用の長期プロフィール4指標として維持する。
- 2026年8月10日、最新 `main`、正式文書、現行実装、サンプルデータ互換テストを再照合し、6競技の表示切替と上記算出定義が一致することを確認。
- 正式決定記録：`docs/official/07_CueScore_Official_Design_Decision_Log_v1.2_Official_Release.docx` Decision 017（同内容を含む最新版）。

## App Store v1.0 RC：Navigation UI統一・Player Detail不具合修正（2026年8月10日）

- 戻る、編集、＋、進む、フィルター、並び替えを共通ナビゲーション・トークンへ統一。既存画面の配置は変えず、タップ領域、線幅、背景、Shadow、Padding、Corner Radiusを共通化。
- Player Detailの競技別統計集計で、プレーヤー側取得関数 `side` と同名のローカル変数を初期化式内で参照していたため、Temporal Dead Zoneによる `ReferenceError` が発生していた。
- ローカル変数を `playerSide` へ変更し、対象プレーヤーが試合に存在しない古い／不完全な履歴は安全にスキップする後方互換ガードを追加。
- 既存プレーヤー、試合履歴、サンプルデータの保存形式は変更していない。
- 正式決定記録：`docs/official/10_CueScore_v1.0RC_UI_Unification_PlayerDetail_Bugfix_Decision.md`。

## Repository Baseline

- Repository: `takaakimailbox-star/cuescore-apps`
- Default branch: `main`
- Official index: `docs/README.md`
- App Store v1.0 package: `docs/official/app-store-v1.0/`
- Implementation reports: `docs/implementation/`

## Current Product Direction

- 新機能追加より、安定した公開可能版の完成を優先。
- iPhone縦画面、Safari/Home Screen PWA体験を維持。
- 保存データ互換、バックアップ/復元、オフライン、更新動作を壊さない。

## Current Implementation State

- CueScore AppsはiPhone縦画面向けPWAとして実装されている。
- Official Demo Dataは製品上「サンプルデータ」と表示し、通常ユーザーデータと完全分離して扱う。v3.1は登録済み10プレーヤー、全6競技各20試合、合計120試合・3,523件の詳細イベントで再構築済み。
- バックアップ/復元およびプレーヤー写真の実装経路を現行コードで確認済み。
- CSV出力およびクラウド同期関連コードは将来再利用のため残しているが、App Store v1.0 release profileでは非提供。
- ネイティブiOSプロジェクトおよびApp Store本審査提出は開始していない。

## v1.0 Final RC：Restore QuotaExceeded安全修正（2026年8月13日）

- 置換Restore／Merge Restoreは、復元前の現在データを同じlocalStorageへ複製せず、Player、Match History、Category、Seasonのraw値をメモリ上に保持する。
- 復元書込み後は全対象を再読込して期待値と照合する。失敗時はメモリスナップショットからロールバックし、再読込照合が成功した場合のみ「元の状態へ戻しました」と表示する。
- JSON parse失敗、Backup形式不一致、QuotaExceededError、ロールバック検証失敗を区別し、容量不足をBackup破損として案内しない。
- `rotationScoreboard.beforeLocalRestore.*`と`rotationScoreboard.beforeLocalMergeRestore.*`は新規作成しない。既存分は無条件削除せず、従来のRestore専用一時退避に限定した最大5世代の保持処理のみ維持する。
- Backup JSON、保存schema、localStorage正式キー、Player／Match record構造は変更していない。IndexedDB全面移行とStorage層の大規模変更はLaterとする。
- 正式決定：`docs/official/24_CueScore_v1.0FinalRC_Restore_QuotaExceeded_Safety_Decision.md`。正式仕様：`docs/official/25_CueScore_v1.0FinalRC_Restore_QuotaExceeded_Safety_Spec.md`。

## App Store v1.0公開準備

- 2026-08-09付の公式Markdown一式を `docs/official/app-store-v1.0/` に登録。
- 公開文書とApp Store提出資料を分離して管理。
- Privacy Policy / Terms of Use / Support の公開用HTML入口を用意。
- Privacy Policy、Terms of Use、SupportのURLと公開用連絡先は2026-08-13のStep 4で確定済み。App Review連絡担当者の氏名・メール・電話番号は未確定。
- 整合確認結果を `docs/implementation/CueScore_App_Store_v1.0_Consistency_Review_2026-08-09.md` に記録。
- 現段階は公式文書のGitHub反映と整合確認まで。ネイティブ化、TestFlight、App Store Connect登録、本審査提出には未着手。

## App Store v1.0 Final RC Step 4：公開前Legal / Support最終整備（2026年8月13日）

- Privacy Policy、Terms of Use、Supportの正式公開URLを`https://takaakimailbox-star.github.io/cuescore-apps/`配下の各公開ページへ確定した。
- 公開問い合わせ方法はメール、統一表示は`cuescore.apps@gmail.com`とし、`mailto:cuescore.apps@gmail.com`からメール作成へ進める。問い合わせフォームはVersion 1.0では非採用。
- 3ページはOfficial Markdownを正本としてfetchし、raw HTMLを許可しないDOM生成rendererで見出し、段落、箇条書き、太字、インラインコード、区切り線、リンクを通常のWeb文書として表示する。Markdown生表示は廃止した。
- Terms、Privacy、Supportから公開前TODOを削除し、正式Support URLと問い合わせ先へ到達できる状態にした。
- Terms、Privacy、Supportは同じ戻るUIと相互ナビゲーションを使用する。Settings経由は既存履歴でSettingsへ戻り、直接アクセスまたは履歴不成立時はCueScore Appsホームへ戻る。
- Settings子画面の戻るボタンは視覚上の矢印だけを表示し、「設定」「クラウド同期」の文字を表示しない。戻り先を示す`aria-label`は維持する。
- App Store提出、Release確定、スコアリング、保存schema、Backup / Restore等は本Stepでは変更していない。

## v1.0 Release Scope

- 6競技
- プレーヤー管理、メインプレーヤー、アバター／写真
- 試合進行、ブレイク入力、Undo
- 試合履歴、統計・分析、サンプルデータ（内部名称：Official Demo Data）
- オフライン利用、バックアップ／復元

## Deferred / Later

- CSV入出力
- 自動クラウド同期
- 試合共有（Match Sharing）：1台で記録した完了試合を対戦相手のCueScore Appsへ転送し、相手側の履歴・統計・分析へ取り込める機能。v1.0非搭載、v1.1以降候補。転送方式・プレーヤー紐付け・重複防止・編集競合・データ互換を正式設計してから実装する。

## 要確認事項

- App Review担当者の氏名・メール・電話番号
- ネイティブiOS提出ビルド、TestFlight、App Store Connect登録
- 実提出ビルドでの6競技完走、オフライン、バックアップ／復元、プレーヤー写真の動作確認
- 提出ビルドとPrivacy Policy / Review Notesの最終一致

## Active Decisions

- GitHub上の正式資料と本ファイルをChatGPT/Codexの共通参照に使う。
- v1.0ではバックアップ/復元とプレーヤー写真を採用する。
- v1.0ではCSVと自動クラウド同期をLaterとして扱う。
- App Store v1.0 release profileはCSV・クラウド同期を無効化し、関連UIを表示しない。
- Official Demo Dataはv1.0提出予定範囲に含める。実提出ビルドでの収録と通常ユーザーデータからの分離確認は未実施。
- Official Demo Dataの本番向け表示は「サンプルデータ」を採用し、状態を「通常データ／サンプルデータ」、操作を「準備する／サンプルを見る／通常データへ戻る／初期状態に戻す／削除」とする。
- 試合共有（Match Sharing）はv1.0ではLaterとし、自動クラウド同期とは別の将来機能として扱う。実装開始前にProduct Ownerの再採用判断を必要とする。正式決定記録：`docs/official/12_CueScore_Later_Match_Sharing_Decision.md`。

## 新規試合の数値入力上限（2026年8月12日）

- 9-Ball／10-BallのRace toは1〜100、Rotation／Straight Pool（14-1）の目標点は1〜1000、Three Cushion（3C）の持ち点は1〜100の整数とする。
- JPA 9-Ballは既存のSL／Race仕様を維持し、自由入力上限の対象外とする。
- 上限は新規試合の自由入力と試合開始時の検証にのみ適用し、既存recordの読込・History／Match Detail表示・Backup／Restore・保存形式には適用しない。既存値を移行、自動補正、削除しない。

## App Store Public URLs

- Privacy Policy: https://takaakimailbox-star.github.io/cuescore-apps/privacy.html
- Support: https://takaakimailbox-star.github.io/cuescore-apps/support.html
- Terms of Use: https://takaakimailbox-star.github.io/cuescore-apps/terms.html
- 公開問い合わせ先: cuescore.apps@gmail.com
- 問い合わせ方法: メール。問い合わせフォームはVersion 1.0では非採用。
- 2026-08-09にGitHub Pages上の外部表示、Official本文読み込み、3ページ間リンクを確認済み。2026-08-13のStep 4でApp Store提出用の正式URLとして確定した。

## v1.0 RC Verification

- 回帰テスト計画: `docs/implementation/CueScore_App_Store_v1.0_RC_Regression_Test_Plan_2026-08-09.md`
- Service Workerの現行2.0系版番号にテスト期待値を統一。
- FA-IPHONE-001 Homeカード回帰を含む自動テスト125件の全成功（失敗0、スキップ0）をFinal RC整合変更の必須条件とする。

## FA-IPHONE-001：進行中試合の再起動復元（2026年8月14日）

- 進行中試合が存在してもCueScore Apps再起動時はHomeを表示し、6競技カードより上に「中断中の試合」カードを表示する。起動直後の自動復帰は採用しない。
- Home中断カード方式を維持し、Product Owner採用の2段コンパクト横長カードへ変更した。高さ目標は約90〜100pxで、1段目に「中断中の試合」・競技名・競技アイコン、2段目にPlayer 1／2・競技条件・開始時刻・「再開 ›」を表示する。
- 大きな黒い「試合を再開」ボタンは廃止し、カード全体のタップ／クリックまたはキーボード操作でGame画面へ復元する。右側の「再開 ›」は補助導線として表示する。
- 中断中に6競技カードから新規試合へ進む場合は、「中断中の試合を再開」「新しい試合を始める」「キャンセル」の3分岐を表示する。新規開始を明示選択した場合のみ現在領域の中断スナップショットを削除する。
- 進行中状態は専用schema version 1、通常キー`cueScore.inProgressMatch.v1`へ保存する。サンプルデータでは既存resolverによる専用設定キーへ分離し、通常データと混在させない。
- 6競技のPlayer、競技、Race／目標点／持ち点、得点、ラック、手番、ブレイク、イニング、ファール、入力履歴、競技固有状態、イベントログ、直近50状態のUndoを保存対象とする。
- 試合完了・履歴保存、明示的なHome復帰、ブレイク入力中の明示中断で進行中スナップショットを削除する。不正・完了済みスナップショットは復帰しない。
- 完了試合record、Backup JSON、Player、History、Analyticsの保存形式、競技ルール、既存データは変更・移行しない。
- 長いPlayer名は2段目でellipsisとし、accessible nameでは完全名を保持する。カード全体からの再開、「再開 ›」補助導線、新規試合時の3分岐、保存schema・復元ロジックは変更していない。390×844px相当のブラウザ確認後も、実iPhone Home Screen PWAでの再確認までは未完了とする。
- 現在判定：`FA-IPHONE-001: Code Fix Complete / iPhone Re-test Required`。実機再確認前にApp Store提出、Release確定、ネイティブ化へ進まない。

## FA-IPHONE-002：再起動後の中断カード保持とCompact Card v3（2026年8月14日）

- iPhone Home Screen PWAで、Homeに中断カードを表示した状態から完全終了・再起動するとカードが消える事象を確認した。
- 根本原因は、`pagehide`／`visibilitychange`から呼ばれる`persistInProgressMatchV1`が、Homeでは`pro-game-mode`でないことを理由に有効な保存済みsnapshotを削除していたこと。snapshotは終了イベント時に消えていた。
- 終了・再起動・単なるHome表示では既存snapshotを保持し、試合完了、確認付きの明示破棄、新規試合開始の明示選択、不正snapshotの場合だけ削除するようcleanup条件を修正した。`pageshow`でもHomeカードを再描画する。
- カード最終UIは2段・高さ88px。上段は「中断中の試合」・競技アイコン・`YYYY/MM/DD HH:mm`、下段はPlayer 1／2・競技条件・「再開 ›」。開始日時を優先し、取得不能時のみ保存日時へfallbackする。競技名文字は表示しない。
- Player名はellipsis、accessible nameは完全名と競技名・条件・再開操作を保持する。保存キー、schema version 1、Undo 50状態、通常／サンプル分離、Backup JSON、完了試合record、競技ルールは変更していない。
- 最終Severity：修正前はCritical候補、根本原因特定・コード修正・回帰テスト後の残存Severityは0。実iPhone再確認前は`Code Fix Complete / iPhone Re-test Required`とする。
- Product Owner実機再確認により、Home表示→PWA完全終了→Home Screen再起動後も同一カードとsnapshotが保持されることを確認した。`FA-IPHONE-002: Resolved / iPhone PASS`。
- Compact Card v4として高さ64pxの1列カードを採用した。表示は競技アイコン、Player 1 avatar＋名前、`vs`、Player 2 avatar＋名前、`再開 ›`のみとし、日時・競技条件はHomeカードから非表示にした。
- 競技アイコン34pxを左端の区切り付き独立領域に置き、Player avatar 24pxより大きく表示する。既存Player写真／preset avatar／default avatarのresolverを再利用し、新規schemaは追加しない。
- v4 UIは実iPhone再確認待ち。保存・復元、50 Undo、通常／サンプル分離、3分岐、Backup JSON、競技ルールは変更していない。
- Compact Card v4 micro adjustmentとして、競技アイコン右側のdividerを削除し、44px独立領域と余白のみでPlayer領域と区別する。Player 1／`vs`／Player 2は5px間隔の単一対戦ブロックへ統合した。その他仕様は変更していない。

## サンプルデータ v3.1（2026年8月11日）

- 旧サンプル試合を使用せず、安定したPlayer IDを持つ登録済み10プレーヤーだけで決定論的に再生成する。
- 本番収録は120試合。9 Ball、10 Ball、Rotation、JPA 9 Ball、Straight Pool、Three Cushionを各20試合収録する。
- 期間は2025年4月2日〜2026年7月14日。調子、強さ、得意競技、対戦頻度を均一化しない。
- 入球、ミス、手番交代、ブレイク、スクラッチ、ブレイクファール、セーフティ、ファール、ラック結果、マス割り、得点、イニング、勝敗、Undo利用済み最終状態を詳細イベントまたは既存保存項目で保持。
- 120試合は詳細イベント3,523件、JSON約0.68 MiB、localStorage UTF-16概算約1.35 MiB。通常データとの完全分離、初期化時の決定論的復元、存在しないPlayer ID参照なしを自動テストで固定する。
- 詳細イベントを維持した500試合（約3.14 MiB）と1,000試合（約6.10 MiB）は製品へ収録せず、自動テスト／性能テスト専用として生成・集計・JSON直列化／復元を検証する。

## セーフティ成功率（Decision 018）

- 正式定義：セーフティ実行者の直後に行う相手の次手番で、有効な入球が1球も成立しなければ成功。
- 相手のミス、セーフティ返し、ファール、ファールしながらの入球は成功。有効入球が1球以上成立した場合のみ失敗。
- 成功率 ＝ 成功したセーフティ数 ÷ セーフティ実行数 × 100。
- 現行詳細記録の `safety`、相手の次手番イベント、`safety_result` で追跡可能。新しい保存項目は追加しない。根拠がない過去データは推測しない。
- サンプルデータは成功・失敗の双方と判定根拠をイベント順に保持。
- 正式決定記録：`docs/official/07_CueScore_Official_Design_Decision_Log_v1.2_Official_Release.docx` Decision 018。
