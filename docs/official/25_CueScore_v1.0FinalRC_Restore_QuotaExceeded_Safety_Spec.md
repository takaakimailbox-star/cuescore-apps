# CueScore Apps v1.0 Final RC — Restore QuotaExceeded安全仕様

Status: Adopted / Official  
決定日: 2026年8月13日  
適用Decision: 025

## 1. 目的

正常なBackup JSONの復元時にlocalStorageの一時使用量を増加させず、書込み失敗時に既存データの復旧状態を検証可能にする。

## 2. Backup互換性

Backupのformat、schemaVersion、ファイル名、Player、Match History、Category、Seasonの構造は変更しない。既存の`cuescore-apps-backup`および`rotation-scoreboard-backup`を受け入れる。

## 3. メモリスナップショット

復元開始直前にPlayer、Match History、Category、SeasonのlocalStorage文字列をメモリへ保持する。キーが存在しない状態も`null`として区別する。復元前スナップショットをlocalStorageへ新規保存しない。

## 4. 置換Restore

1. ファイル読込
2. JSON parse
3. Backup形式検証
4. 内容プレビューとユーザー確認
5. 現在値をメモリへスナップショット
6. 復元対象キーを書込み
7. 全書込み対象を再読込し、期待したJSON文字列と照合
8. 成功時のみ復元完了
9. 失敗時はメモリスナップショットを復元
10. 全スナップショット対象を再読込して元の文字列と照合

旧形式BackupがCategory／Seasonを持たない場合、その2系統は書き換えない。

## 5. Merge Restore

Player、Match History、Category、Seasonの統合結果をメモリ上で先に構築し、置換Restoreと同じトランザクション相当処理で書込み・照合・ロールバック・再照合を行う。

## 6. エラー表示

- JSON parse失敗：`バックアップファイルを読み込めませんでした。JSONファイルが破損している可能性があります。`
- 形式検証失敗：`このバックアップファイルはCueScore Appsで復元できる形式ではありません。`
- Quota・変更なし：`復元できませんでした。端末の保存容量が不足しているため、データを復元できませんでした。現在のデータは変更されていません。`
- Quota・復旧確認済み：`端末の保存容量が不足したため復元できませんでした。現在のデータは元の状態へ戻しました。`
- 復旧未確認：`復元中にエラーが発生し、元のデータへ完全に戻せたことを確認できません。アプリの使用を続けず、保存済みバックアップを保管したままサポート確認を行ってください。`

## 7. 旧退避

`rotationScoreboard.beforeLocalRestore.*`および`rotationScoreboard.beforeLocalMergeRestore.*`は新規作成しない。既存キーは無条件に一括削除しない。従来のStorage lifecycleが行う`beforeLocalRestore.*`最大5世代の限定保持は維持し、Player、Match History、Category、Season等の正式キーを整理対象にしない。

## 8. 非対象

IndexedDB全面移行、保存schema変更、Backup JSON変更、Cloud同期、自動容量拡張、Storage層の大規模リファクタリングは行わない。
