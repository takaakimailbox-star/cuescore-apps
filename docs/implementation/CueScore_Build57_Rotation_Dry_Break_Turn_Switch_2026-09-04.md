# CueScore Build 57 Rotation Dry Break Turn Switch

Date: 2026-09-04

## Request

Rotationだけ、ブレイク結果が「ノーイン」の場合にゲーム入力へ戻っても同じプレーヤーのままになる問題を、9-Ballと同様に次のプレーヤーへ交代するよう修正し、main反映およびInternal TestFlight配布まで行う。

## Root cause

共通のブレイク結果処理はノーインを記録して入力をロックする。その後、9-Ball／10-Ball分岐では手番交代とロック解除を行っていたが、Rotation分岐は連続ファール数のリセットだけで終了し、`current`の交代と入力ロック解除が欠落していた。

## Implementation

- Rotationの合法なノーイン時に`current`を相手プレーヤーへ交代。
- 先攻へ戻る場合はinningを進め、行を確定。
- `foulLocked`および`turnLockReasonV62`を解除し、次プレーヤーがそのまま入力できる状態へ統一。
- 9-Ball／10-Ballの既存挙動、Rotationのファール処理、得点処理は変更しない。
- Rotationノーインの手番交代を固定する回帰testを追加。

## Verification

- Automated tests: `361 pass / 0 fail / 0 skipped`
- native web生成、Capacitor iOS assets同期: 完了
- Release Archive: 成功
- Version: `1.0`
- Build: `57`
- Source commit: `aa3824b`
- Build commit: `dd4d965`
- App Store Connect Build ID: `d745fd3b-8c66-4a10-a48e-5a8ef18ccfb6`
- 輸出コンプライアンス: 「上記のアルゴリズムのどれでもない」を保存
- TestFlight status: `テスト中`
- Internal group: `CueScore Internal Testers`（内部、テスター1名）

実iPhoneでの最終受入確認はpending。External TestFlight、App Review、審査用追加、一般公開は実施していない。
