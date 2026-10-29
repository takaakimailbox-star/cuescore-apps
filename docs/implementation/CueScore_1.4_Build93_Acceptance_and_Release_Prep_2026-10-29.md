# CueScore Version 1.4 公開準備報告 — Build 93 実機受入・残課題の整理（2026年10月29日、documentation only）
状態: 製品コード・Version／Build・ASC は変更していない（Build 93 のまま）。App Store 提出・一般公開は別Gate。公開中の Version 1.3（Build 88）は不変。

## 1. Build 93 受入記録
| 項目 | 内容 | 根拠 |
|---|---|---|
| Build 92 の重大FAIL | 9-Ball の試合設定で「試合開始」がタブバーの後ろに隠れ、押せなかった（2026-10-29、PO実機）。原因: 設定画面の高さが約945pxになり、開始ボタンが折り返しの下で、スクロールの手がかりもなかった。従来の到達テストは `scrollIntoView` で動かしていたため見逃した | 再現（セーフエリア34px、320〜402幅の全幅でボタンが画面外） |
| 修正 | `navigation-shell-phase1.css` の3ルール（開始ボタンを設定画面のスクロール領域内でタブバー直上に sticky 固定、背景帯、無効時は不透明）。サイズ・タッチ領域・文言・処理は不変。main `39874aa` | Node 1221／1221、専用回帰 216件 PASS、Native 実タッチ（SE 375pt／iPhone 17 402pt）で開始 |
| 配布 | Version 1.4／Build 93、Build ID `b043b2c9-a5ac-4ddb-ab93-86ff6ca0e16e`、Upload 1回、Export Compliance `usesNonExemptEncryption=false`（PO限定承認、当該Buildのみ、1回）、`VALID`／`IN_BETA_TESTING`（2026-10-29 19:52 JST） | ASC read-back |
| **PO実機受入（2026-10-29）** | 「試合開始ボタン: OK」「ショットクロック: 全部OK」。**Build 93 の試合開始不能は CLOSED。** | PO報告（司令塔経由） |
- 受入範囲: PO が実機で確認した「試合開始」と「ショットクロック」。**個別に報告されていない項目（Dynamic Type、VoiceOver、誤タップ率、各種目・言語の個別画面）までは PASS と推定しない。**
- 保護する受入済み操作: 開始ボタンの sticky 配置、ショットクロック（Decision 047）の表示・延長・取消・色。
- 延長ボタンの強調（Before／After 案）と淡い黄のコントラスト: PO は「全部OK」と回答。現行デザインを維持し、Before／After 案は**採用しない（提案のまま）**。

## 2. P1（操作画面の比較）正式採用の判断材料
- 現状: 9-Ball／10-Ball の試合画面の比較スイッチ（「操作画面の比較（試験）」、既定OFF）。`ui-pilot-v1.js／.css`、`i18n-catalog-uipilot-v1.js` と3タグで1つの除去単位。**P1 は正式採用されていない**（Decision なし）。
- P1 が変えるもの（`ui-pilot-v1.css`）: ボール入力ボタン 52px（9-Ball／10-Ball）、操作ボタンの幅と「戻る」の位置づけ、手番でないカードの淡色化、Race to 行の弱化、得点・ログの160msアニメーション。比較スイッチは試合画面右上の「新／旧」。試合データ・時計・権限は読み書きしない。
- PO のA/B比較結果: **記録なし（NOT VERIFIED）**。「全部OK」はショットクロックの報告であり、P1 の採否とは見なさない。
- 公開前ルール: Pilot が正式採用されなければ、App Store 提出用 Build に試験UIを含めない（`CueScore_UIPilot_P1_Removal_Procedure_2026-10-28.md`）。既定OFFだけを公開安全性の根拠にしない。
| 選択肢 | 内容 | 工数・影響 |
|---|---|---|
| **A（推奨）: 1.4 では除去** | 除去手順どおり3ファイル、`index.html`／`sw.js`／`build-native-web.mjs` の各参照、Pilot テストを削除し、digest pin を change map で更新。Race to 修正と手球フリー表示削除は残す | 新Build（Build 94）が必要。設定画面が1行分低くなり、開始ボタン到達性にも有利。P1 は隔離Prototypeとして保全し、採用は後日別Gateで |
| B: 正式採用 | 別Gateで Decision／Spec 化（9-Ball／10-Ball）。比較スイッチと「新／旧」を除き、P1 を既定表示にする | 実機A/B結果と全種目回帰が先に必要。1.4 の公開が遅れる |
| C: 試験UIを残して公開 | 不可（上記ルール） | — |

## 3. ショットクロック翻訳（P4）
- 21キー（ja／en／zh-Hans）の PO一括承認用資料: `CueScore_ShotClock_Translation_P4_Approval_Package_2026-10-29.md`（キー別の訳文・残余リスク R0〜R2・ハッシュ・既存カタログとの整合・PO判断 T-1〜T-4、推奨付き）。
- 現状は `CANDIDATE`。en／zh-Hans のユーザーには画面に出る語のため、**公開前に PO承認（または明示的な保留判断）が必要**。承認後は別Gateで承認記録と主カタログへの移動（製品変更を伴う）。

## 4. 言語を切り替えると時計が待機に戻る現象
- **再現した**（実Chrome、9-Ball、時計ON、基本45秒で一時停止中に切替→中断試合を再開）: ja→ja は `paused/43` を保持。**ja→en、ja→zh-Hans、en→ja は `idle/45`（待機）に戻る**。試合の得点・ログ・保存データは影響を受けない（時計だけ）。
- 原因: `shotclock-v1.js` の `matchKey()` が試合の同一性に `#proStartTime` の文字列全体（「開始時刻 20:14」「Start time 20:14」「开始时间 20:14」）を使っている。言語で文言が変わると鍵が一致せず、保存済みの時計を復元しない。
- 安全な修正案（**未適用**。差分は Evidence の `langclock/proposed_matchKey_fix.diff`）: 鍵に使う開始時刻を時刻の数字（`\d{1,2}[:：]\d{2}`）だけにする。プロトタイプで4条件すべて `paused/43` を保持。ゲーム名は固定文字列（言語非依存）、選手名はユーザーデータ。
  - 副作用: 修正後の最初の再開だけ、旧形式の鍵で保存された中断中の時計が1回待機に戻る（試合データは無関係）。時計の計算・保存schema・QR・Backup は不変。
  - 提案: 次のBuild（P1除去・翻訳移動と同時）に含めるか、1.4 では既知の制限として残すかはPO判断。**公開の必須条件ではない**（データ破壊なし、言語切替は稀）。
- 注: 試合中の言語変更が S-A／S-B（`LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false`）の対象かは別論点で、本件は時計の鍵のみ。

## 5. 公開前の必須項目と任意の保守項目
| 区分 | 項目 | 状態 |
|---|---|---|
| **必須** | P1 の扱いのPO決定（推奨A）と、Aの場合の除去Build（Build 94）＋Node全回帰＋Native確認 | 未決定 |
| **必須** | ショットクロック翻訳21キーのPO判断（承認または保留） | 資料作成済み、PO待ち |
| **必須** | 提出用Build（P1除去後）の Node 全回帰・実機の最終確認（試合開始とショットクロックの再確認は1点のみ） | 未実施（Build 94 後） |
| **必須** | Version 1.4 の App Store 提出準備（What's New、審査メモ、スクリーンショット、Final pre-release audit。1.3 の手順を再利用）。提出・公開は別Gate | 未着手 |
| **必須** | 1.3→1.4 の上書き更新でデータが保持されること（保存schemaは不変、新キーは時計と P1 のみ）。Simulatorでの更新リハーサルを推奨 | 未実施（NOT VERIFIED） |
| 任意（推奨） | 時計の言語切替の鍵の修正（上記4章） | PO判断 |
| 任意（推奨） | Info.plist に `ITSAppUsesNonExemptEncryption=false` を入れ、Build ごとの Export Compliance 手作業をなくす（要新Build、暗号の実態は不変） | PO判断 |
| 任意 | 10-Ball／Rotation／3 Cushion／JPA 9-Ball／14-1 の設定画面の Native 確認、en／zh-Hans の Native 実タッチ、320pt 幅 | NOT VERIFIED |
| 任意 | 実機 Dynamic Type（Deferred）、VoiceOver、誤タップ率 | NOT VERIFIED |
| 任意 | 320幅×130%疑似拡大で基本時間「60」が17px はみ出す（Build 92 から同じ。開始ボタンへは到達可能） | 既知 |
| 任意 | 延長ボタンの強調案、淡い黄のコントラスト | PO「全部OK」。現行維持 |

## 6. 再利用する既存PASS
Node 1221／1221（39874aa）、専用回帰 `tests/browser/start-button-reach.mjs` 216件、ショットクロック統合検証 423チェック、320幅レイアウト576条件、既存操作回帰（`shotclock-regression.mjs`）、Build 93 の Native 実タッチ。Build 94 後は Node 全回帰と専用回帰を再実行し、P1 除去分のテスト（`ui-pilot-p1.test.mjs`、`tests/browser/ui-pilot-p1.mjs`）は手順どおり削除。

## 7. Version 1.4 公開候補
- 含む: ショットクロック（Decision 047、延長 +25／30／45／60、4色の横棒、数字と単位）、Race to 表示修正（9-Ball／10-Ball）、手球フリー表示の削除、試合開始ボタンの到達性修正（Build 93）。
- 含めない（推奨）: P1 比較UI。
- 次Gate案: ①PO決定（P1、翻訳、時計の言語切替の修正の要否、Info.plist）→ ②Build 94（コード変更を伴う分のみ）→ ③Node全回帰・Native確認・PO実機確認 → ④提出準備 → ⑤審査提出（別承認）。

## 8. 更新（2026-10-29、PO委任に基づく翻訳承認後）
- ショットクロック21語は Decision 048／Official 138・139 で `P4-APPROVED`（PO委任に基づく条件付き）。5章の翻訳の必須項目は解消。
- P1 は 1.4 から**除去**（推奨A、PO委任の方針に従う）、時計の言語切替の鍵は**修正**、Export Compliance は Info.plist に宣言を追加。いずれも main に反映済みで、Version／Build は未採番。詳細と 1.3→1.4 データ保持の検証: `CueScore_1.4_Build94_Preparation_and_Data_Retention_2026-10-29.md`。
- 残る必須項目: 採番Gate（Build 94）、Node全回帰・Native確認・PO実機確認、App Store 提出準備、実機での 1.3→1.4 更新（NOT VERIFIED）。
