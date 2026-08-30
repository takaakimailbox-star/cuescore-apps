# CueScore v1.0 Cloud Sync Row Hidden Decision

- Status: Adopted
- Date: 2026-08-30
- Scope: Version 1.0 / Build 22 public-release finish

## Decision

Version 1.0の設定画面では、利用不能な「クラウド同期」行を表示しない。

Build 22はBuild 21と同一内容にはせず、この表示修正だけを独立した公開前仕上げとして含める。クラウド同期機能自体はLater / Deferredのままとし、有効化・実装・データ移行を行わない。

## Non-goals

- scoring、勝敗、競技ルールの変更
- saved-data schema、Backup／Restoreの変更
- analytics、aggregate、表示指標の変更
- 既存機能、Navigation Architecture Phase 1の変更

