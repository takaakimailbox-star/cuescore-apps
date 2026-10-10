# CueScore Restore Persistence — Minimal Fix B（2026-10-11）

Gate: `CUESCORE RESTORE PERSISTENCE — SOURCE FORMALIZED`
Baseline（External main）: `e3316d5089558dc80a52079e1c6ca29894d6995a`
Product Source commit: `356d730852642c274e7f3fd6216e68a726e5e869`（`fix: persist pending break prompt state`）

## 1. 不具合（Root Cause）
in-progress snapshot の persist トリガーは `updateGame()` 末尾・`visibilitychange(hidden)`・`pagehide` の 3 つだけだった。Resume では `restore()` が Break prompt を閉じて `pendingBreak*` を null にし、`updateGame()` がその状態を保存した後に Restore が prompt を再表示するため、再表示後に保存する経路がなかった。新規 Match 開始直後・Undo による再表示直後も同様。この間に異常終了（pagehide／visibilitychange を経由しない終了）すると、再起動後に Break prompt と開いた時点の入力が復元されず、その rack の `break_result` が未記録になる（Match の得点・履歴・schema は無傷）。通常の background 経由の中断は影響なし。

## 2. 修正（B案、`index.html` +4 行）
- `showBreakResultPromptV61` の末尾: `if (!options.nextRack) persistInProgressMatchV1();`（次ラック prompt は `updateGame()` 内で開かれ、直後に同関数が persist するため除外）。
- `restoreBreakPromptFromUndoV697` の末尾: `persistInProgressMatchV1();`（Undo／Resume の再表示）。
- 新規 `tests/break-prompt-persistence.test.mjs`（5 tests）。
- `persistInProgressMatchV1` 本体（live-context guard）、snapshot schema、`snapshot()`、Restore 読取側、Back UX B案、次ラック prompt、persist トリガー集合は変更なし。球・Scratch・breaker の選択変更ごとの保存は実装していない（範囲外）。

## 3. 検証（最終 source）
- 異常終了（隔離 Chrome 154、CDP `Page.crash`）: 65 ケース（12 シナリオ＋旧 snapshot 19 件 × crash／background、＋ live 3）。変更前 main は crash 終了 25 件で prompt 未復元、**修正後 0 件**。P1／P2 breaker、選択球、Scratch、Undo、Demo、旧 snapshot、新規 Match 直後を復元。14-1／3 Cushion は非影響。P1 統合版（P1＋B 案）でも 20/20。書込は prompt を開くたびに 1 回増えるだけ（再帰なし、次ラックは不変）。
- 回帰: Restore 41 シナリオ、Back UX B 21 比較、未確定入力 14、Undo 4、旧 snapshot 19（18 完走、1 件は従来どおりの既知事情）すべて PASS。
- P1 統合版（隔離コピー）: Official 108 C3 60 run（復元差分は全件空集合）、C4 8、C6 9、T-SW-4 7、T-SW-10（ja／en／zh-Hans 各 15）PASS。
- Node: Match Sharing 122/122、commit 前の最終 source で Full Node **638/638**（既存 633＋新規 5、fail 0／skip 0）。P1 統合＋B 案の隔離コピーは 660/660。`git diff --check` PASS。
- Evidence（repo 外）: Minimal Fix B Report／Evidence ZIP（異常終了 JSON、patch、実行ログ）。

## 4. NOT VERIFIED / 範囲外
実機（iOS の終了・suspend の実イベント順と頻度）、prompt を開いた後の選択変更の persist（異常終了でその変更は失われうる）、英語・中国語の実機表示、U9、S-B の最終承認、到達不能な Break オプション。**C5 の追加 runtime は未完了のまま次 Gate に維持**（Dead Ball 確定後、`FoulPenalty` 等の未観測 event、canonical `resultLabel` の追加値、複数ラック、複数段 Undo、ユーザー入力、到達不能機能の分類）。Product Owner Physical PASS は記録していない。

## 5. 保全状態 / 次 Gate
P1: `IMPLEMENTATION IN PROGRESS`、S-B flag `LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false`、**P1 未統合**。Version／Build、cache identity、Score RC、公開 Build データは変更なし。Archive／Upload／TestFlight／App Store Connect／Release は 0。次 Gate（提案）: 必要なら B 案を P1 統合版へ取り込む Gate → C5 追加 runtime → S-B 判断（いずれも別 Gate）。
