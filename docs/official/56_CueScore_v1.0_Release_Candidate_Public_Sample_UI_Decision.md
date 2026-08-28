# CueScore v1.0 Release Candidate — Public Sample UI Decision

Date: 2026-08-28  
Status: Official

## Decision

- v1.0一般公開用UIでは、Settingsのサンプルデータ見出し、状態、準備、表示、通常データ復帰、初期化、削除の入口を表示しない。
- サンプルデータ生成・分離保存の実装は開発検証互換のため維持する。
- Backup、Restore、Data Delete、保存schema、分析式、採点規則は変更しない。
- 公開版Settingsは390×844で横overflowを発生させない。

## Release boundary

本決定は公開版への入口非表示だけを定義する。External TestFlight、App Store Review提出、一般公開を承認するものではない。
