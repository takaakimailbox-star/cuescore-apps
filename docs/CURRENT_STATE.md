# CueScore Apps Current State

Updated: 2026-08-09
Status: Living operational reference

## Purpose
ChatGPTとCodexで共有する「現在状態」の参照ファイル。
Official Release仕様を置き換えず、最新の実装状態・採用判断・延期項目・廃止項目を記録する。

## Authority
1. `docs/official/` のOfficial Releaseが正式仕様。
2. Official Design Decision Logの最新適用判断を優先。
3. `docs/CURRENT_STATE.md` は運用上の現在状態を記録するだけで、正式仕様を新規作成しない。
4. チャット、Draft、RC、未承認案は正式仕様ではない。
5. 正式資料と矛盾したら推測で進めずProduct Ownerへ確認する。

## Repository Baseline
- Repository: `takaakimailbox-star/cuescore-apps`
- Default branch: `main`
- Official source index: `docs/README.md`
- Codex instructions: `AGENTS.md`
- Official specifications: `docs/official/`
- Implementation reports: `docs/implementation/`
- Adopted UI: `docs/assets/adopted-ui/`（明示承認されたもののみ）

## Current Product Direction
- 新機能追加を続けるより、安定した公開可能版の完成を優先。
- iPhone縦画面、Safari/Home Screen PWA体験を維持。
- 保存データ互換、バックアップ/復元、オフライン、更新動作を壊さない。
- v1.0公開に不要な新規案は、採用された場合でもLater/Deferredへ整理する。

## Current Implementation State
以下はリポジトリまたは承認済みImplementation Reportで確認できる事実だけを書く。

- CueScore AppsはiPhone縦画面向けPWAとして実装されている。
- リポジトリにはアプリ本体、manifest、Service Worker、assets、src、tests、demo-data、公式資料がある。
- Official Demo Dataは通常ユーザーデータと分離された開発/デモ用機能として扱う。
- 個別種目・画面・フローの状態は、変更前に必ず現行コードで再確認する。

## Recently Completed / Verified
- CueScore Apps naming / GitHub / data migration reportあり。
- Home / Match Setup separation reportあり。
- Home screen icons implementation reportあり。
- Primary Player implementation reportあり。
- Official avatar reset / migration reportあり。

## Active Decisions
- GitHub上の正式資料をChatGPTとCodexの共通正本として使う。
- `docs/CURRENT_STATE.md` を共通の現在状態ファイルとして使う。
- Codexは作業前に本ファイルを読み、実装状態が変わった作業後には本ファイルも更新する。

## Deferred / Later Version
- 初期作成時点では追加なし。

## Retired / Rejected Directions
- 初期作成時点では追加なし。

## Stop Conditions
次の場合は推測せず確認する。
- 正式資料同士が矛盾
- 必要仕様が不足/曖昧
- 保存データ互換に影響する可能性
- 既存ワークフロー削除/置換が必要
- 画像だけでは動作を判断できない
- 現行実装を確認できない
- チャット上の判断が正式情報源へ未反映

## Maintenance Procedure

### Codex 作業前
1. `AGENTS.md`
2. `docs/README.md`
3. `docs/CURRENT_STATE.md`
4. 関連Official Release
5. 現行コード
の順で確認する。

### Codex 作業後
1. 実装とテスト結果を確認。
2. 現在状態が変わった場合のみ `docs/CURRENT_STATE.md` を更新。
3. 「予定」ではなく「完了した事実」を記録。
4. 延期確定はDeferredへ、廃止確定はRetiredへ移す。
5. 可能なら実装変更と同じコミットで更新する。

### ChatGPT
- 具体的な実装状態に触れる際は、可能ならGitHubの `CURRENT_STATE.md` と関連資料を確認。
- 古いチャット記憶より検証済みGitHub最新状態を優先。
- 提案と採用済みを明確に分ける。
