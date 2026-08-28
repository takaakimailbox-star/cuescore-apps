# CueScore v1.0 Release Candidate — Public Sample UI Specification

Date: 2026-08-28  
Status: Official

## Acceptance criteria

1. 通常起動した公開版SettingsのDOM／Accessibility Treeにサンプルデータの見出し、region、操作buttonが存在しない。
2. データ管理のBackup、Restore、Data Deleteは従来どおり表示・動作する。
3. About、Terms、Privacy、SupportおよびSettings footerを維持する。
4. サンプルデータの生成・保存・通常データ分離に関する既存自動検証を維持する。
5. 390×844でdocument widthはviewport widthを超えない。
6. source、native-web、iOS copied assetsを同一内容にする。

## Non-goals

- saved-data migration、分析、採点、Navigationの変更
- App Store metadataの推測入力
- App Store Review提出、External TestFlight、一般公開
