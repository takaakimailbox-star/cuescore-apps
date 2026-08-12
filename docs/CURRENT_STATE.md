# CueScore Apps Current State

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
- 公開先は既存のGitHub Pages正式URL候補を使用し、新しいURLや本文は作成していない。
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

Updated: 2026-08-11
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
- PWAキャッシュ版は `2.0-game-result-modal-progress-v1`。Official Release文書は変更していない。

## App Store v1.0 Final RC：Game Result Modal右上Close廃止（2026年8月11日）

- Product Owner採用決定により、Game Result Modalの右上×を表示しない。
- 試合進行へ戻る正式経路は「試合へ戻る」ボタンだけとし、保存済みの暫定結果を取り消してGame画面へ復帰する既存処理を維持する。
- 「ホームへ戻る」「もう一度対戦する」は維持する。BackdropタップおよびEscapeではGame Resultを閉じない。
- 中央配置、左右余白、最大幅、角丸、Fade＋Scale、背面操作不可は維持する。
- Race Picker、Result以外のModal、Picker、OverlayのClose仕様は変更しない。
- 正式決定記録：`docs/official/13_CueScore_v1.0FinalRC_GameResult_Close_Decision.md`。Official Design Decision Log v1.3へのDecision 019追記案を同文書に記録した。
- 現行Official Design System v2.0およびUI Components v1.0の一般Modal／Result Close規定にはGame Result例外の追補が必要。既存Official Release本体は未変更。

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

## App Store v1.0公開準備

- 2026-08-09付の公式Markdown一式を `docs/official/app-store-v1.0/` に登録。
- 公開文書とApp Store提出資料を分離して管理。
- Privacy Policy / Terms of Use / Support の公開用HTML入口を用意。
- URL、公開用連絡先、App Review連絡先は未確定のため未記入。
- 整合確認結果を `docs/implementation/CueScore_App_Store_v1.0_Consistency_Review_2026-08-09.md` に記録。
- 現段階は公式文書のGitHub反映と整合確認まで。ネイティブ化、TestFlight、App Store Connect登録、本審査提出には未着手。

## v1.0 Release Scope

- 6競技
- プレーヤー管理、メインプレーヤー、アバター／写真
- 試合進行、ブレイク入力、Undo
- 試合履歴、統計・分析、Official Demo Data
- オフライン利用、バックアップ／復元

## Deferred / Later

- CSV入出力
- 自動クラウド同期
- 試合共有（Match Sharing）：1台で記録した完了試合を対戦相手のCueScore Appsへ転送し、相手側の履歴・統計・分析へ取り込める機能。v1.0非搭載、v1.1以降候補。転送方式・プレーヤー紐付け・重複防止・編集競合・データ互換を正式設計してから実装する。

## 要確認事項

- 公開用連絡先
- App Review担当者の氏名・メール・電話番号
- App Store提出時に使用する公開URL候補の最終採用
- 提出ビルドとPrivacy Policy / Review Notesの最終一致

## Active Decisions

- GitHub上の正式資料と本ファイルをChatGPT/Codexの共通参照に使う。
- v1.0ではバックアップ/復元とプレーヤー写真を採用する。
- v1.0ではCSVと自動クラウド同期をLaterとして扱う。
- App Store v1.0 release profileはCSV・クラウド同期を無効化し、関連UIを表示しない。
- Official Demo Dataは提出ビルドに収録し、通常データとの完全分離を維持する。
- Official Demo Dataの本番向け表示は「サンプルデータ」を採用し、状態を「通常データ／サンプルデータ」、操作を「準備する／サンプルを見る／通常データへ戻る／初期状態に戻す／削除」とする。
- 試合共有（Match Sharing）はv1.0ではLaterとし、自動クラウド同期とは別の将来機能として扱う。実装開始前にProduct Ownerの再採用判断を必要とする。正式決定記録：`docs/official/12_CueScore_Later_Match_Sharing_Decision.md`。

## App Store Public URL Candidates

- Privacy Policy: https://takaakimailbox-star.github.io/cuescore-apps/privacy.html
- Support: https://takaakimailbox-star.github.io/cuescore-apps/support.html
- Terms of Use: https://takaakimailbox-star.github.io/cuescore-apps/terms.html
- 2026-08-09にGitHub Pages上の外部表示、Official本文読み込み、3ページ間リンクを確認済み。
- 正式URL候補として管理する。Supportページの公開用連絡先確定後にApp Store提出用として最終採用する。

## v1.0 RC Verification

- 回帰テスト計画: `docs/implementation/CueScore_App_Store_v1.0_RC_Regression_Test_Plan_2026-08-09.md`
- Service Workerの現行2.0系版番号にテスト期待値を統一。
- 自動テスト14件の全成功をRC整合変更の必須条件とする。

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
