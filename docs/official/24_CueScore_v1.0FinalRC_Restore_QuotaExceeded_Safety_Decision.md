# CueScore Apps v1.0 Final RC — Restore QuotaExceeded安全修正決定

Status: Adopted / Official  
決定日: 2026年8月13日  
Authority: Product Owner Decision

## Decision 025

Backup / Restoreで復元前の現在データを同一originのlocalStorageへ複製せず、復元対象4系統の現在値をメモリ上のスナップショットとして保持する。

## 対象データ

- Player
- Match History
- Category
- Season

置換RestoreではBackupがCategory／Seasonを持たない旧形式の場合、現行どおり端末上のCategory／Seasonを保持する。Merge Restoreでは4系統の統合結果を先にメモリ上で構築する。

## 安全手順

復元対象を書き込んだ後、全対象キーをlocalStorageから再読込してシリアライズ内容を照合する。失敗時はメモリスナップショットから復旧し、再読込照合が成功した場合のみ「元の状態へ戻しました」と案内する。復旧を確認できない場合は成功扱いせず、アプリの使用継続を避ける重大エラーとして案内する。

## エラー分類

JSON parse失敗、Backup形式検証失敗、QuotaExceededError、ロールバック検証失敗を区別する。QuotaExceededErrorをBackup破損として案内しない。

## 旧自動退避キー

新規Restoreでは以下を作成しない。既存キーを無条件に一括削除せず、既存のRestore専用一時退避に限定した最大5世代の保持処理は維持する。通常データの正式キーは整理対象にしない。

- `rotationScoreboard.beforeLocalRestore.*`
- `rotationScoreboard.beforeLocalMergeRestore.*`

## Compatibility

Backup JSON形式、ファイル名、保存schema、localStorage正式キー、Player、Match record、Category、Season、Undo、Game Result、Match Detail、Analytics、Official Demo Dataは変更しない。IndexedDBへの全面移行、Cloud同期実装、Storage層の大規模変更はv1.0対象外とする。

## Relationship

Decision 001〜024を履歴として維持し、Backup / Restoreの復元安全性について本Decisionを後続適用する。
