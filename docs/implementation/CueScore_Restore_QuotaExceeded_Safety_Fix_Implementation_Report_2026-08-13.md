# CueScore Apps v1.0 Final RC — Restore QuotaExceeded安全修正 実装報告

実装日: 2026年8月13日  
基準main: `8e2876f79977a8a86d2891b14135edba117f525a`  
作業ブランチ: `codex/cuescore-restore-quota-safety-fix`  
対応Decision: 025

## 実装結果

- 置換Restoreの`importBackupFile`から`rotationScoreboard.beforeLocalRestore.*`作成を廃止した。
- Merge Restoreの`mergeBackup`から`rotationScoreboard.beforeLocalMergeRestore.*`作成を廃止した。
- Player、Match History、Category、Seasonのraw localStorage値をメモリに保持する共通安全処理`CueScoreRestoreSafetyV160`を追加した。
- 書込み後に対象キーを再読込し、期待したシリアライズ値との完全一致を検証する。
- 書込み失敗時はメモリスナップショットから復元し、全4系統のraw値を再読込して復旧を検証する。
- JSON parse失敗、Backup形式不一致、QuotaExceededError、ロールバック検証失敗の表示を分離した。
- Cloud dirty marking失敗をローカル復元失敗として誤案内しないよう分離した。
- 旧退避キーは新規作成せず、無条件一括削除も追加していない。従来の`beforeLocalRestore.*`最大5世代の限定保持は維持し、正式データキーを削除対象にしていない。

## Restore / Merge Restore

置換RestoreとMerge Restoreの双方が`performLocalRestoreTransactionV160`を使用する。Merge結果は従来どおり先にメモリ上で構築し、同じ書込み・照合・ロールバック・再照合手順へ渡す。

## Compatibility

- Backup JSON format: 変更なし
- Backup schemaVersion: 変更なし（2）
- Backupファイル名: 変更なし
- localStorage正式キー: 変更なし
- Player／Match record／Category／Season schema: 変更なし
- 既存旧形式Backup: 対応維持
- IndexedDB移行: 未実施

## 検証

- Restore安全性テスト: 8件成功
- 全自動テスト: 114件成功／0件失敗／0件スキップ
- インラインJavaScript構文検証: 33 script成功
- Decision Log v1.9: 18ページをDOCXからPNGへレンダーし、Decision 025、索引、Revision History、ヘッダー版番号を確認

Quotaテストはメモリ上のlocalStorage模擬実装で行い、実ユーザーデータや実端末の保存容量を消費していない。
