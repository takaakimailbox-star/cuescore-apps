# CueScore Apps 名称・GitHub・データ互換移行 実装報告 v1.0

実施日: 2026-08-07

## 目的

旧プロジェクト名「Rotation Scoreboard」をCueScore Apps統合アプリへ移行し、競技名Rotationと既存保存データの互換性を維持する。

## 名称と公開先

- 上位ブランド／プロジェクト: CueScore Apps
- ユーザー向けブランド: CueScore
- GitHub: `takaakimailbox-star/cuescore-apps`
- Pages: `https://takaakimailbox-star.github.io/cuescore-apps/`

GitHubリポジトリは新規作成せず、既存リポジトリのrename機能を使用した。default branchとPages sourceは引き続き`main`のリポジトリルートである。

## データ保護

- `rotationScoreboard.*` LocalStorageキーは既存データの正規互換キーとして維持した。
- Player ID、Match ID、履歴、メインプレーヤー、分析、設定、クラウド同期状態を初期化・削除しない。
- 新規バックアップ形式は`cuescore-apps-backup`とし、旧`rotation-scoreboard-backup`も引き続き受理する。
- 復元前snapshot、検証付き書き込み、重複排除mergeの既存保護処理を維持した。
- Cloud payloadは`cuescore-apps-cloud-backup`へ更新したが、内容照合はPlayer・履歴・区分・シーズンのcore dataを基準とし、旧payloadを拒否しない。

## PWA

- Manifest nameを`CueScore Apps`、short_nameを`CueScore`へ統一した。
- Service Worker cacheを`cuescore-apps-*`へ更新した。
- activate時は現在cache以外を削除し、旧cacheの残留を防止する。
- HTMLとService Workerのversion識別子を同期した。

## 意図的に残したRotation表記

- 競技名、`gameType="rotation"`、`game-rotation.svg`、Rotation固有ルール。
- `rotationScoreboard.*`保存キーと`rotation-scoreboard-backup`旧形式識別子（後方互換）。
- 過去の実装コメント、Release Audit、Design Decision等の履歴記録。
