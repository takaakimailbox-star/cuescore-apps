# CueScore v1.0 — Release Candidate Build 16 Preparation

Date: 2026-08-28  
Status: implementation and pre-archive gates PASS / Archive, Validate, TestFlight and physical iPhone pending

## Basis

- Start SHA: `433403adf292f7938d129ef5c50ed2c588cc6dd4`
- Build 15はTestFlight Internal Onlyで`テスト中`。Product Owner提供の本指示で実iPhone動作確認PASSを確定した。
- App Store ConnectでBuild 16が未使用であることを確認し、Marketing Version `1.0`／Build Number `16`を設定した。

## Implementation

- 公開版Settingsのサンプルデータ見出し／card／全操作入口をrenderしない固定release gateを追加した。
- サンプルデータ実装と自動検証は保持した。
- Backup、Restore、Data Delete、saved-data schema、analytics formula、scoring rulesは変更していない。

## Verification

- Automated tests: `244 pass / 0 fail / 0 skipped`。
- 390×844 Settings: sample heading `0`、sample region `0`、document width `390`、viewport width `390`。
- source／native-web／iOS copied assets:一致。
- iOS Simulator Debug: `BUILD SUCCEEDED`。
- iOS Simulator Release: `BUILD SUCCEEDED`。
- Archive／Validate／TestFlight Internal Only: pending。
- RC Build 16 physical iPhone: pending。
- App Store metadata／public screenshots: RC実iPhone PASS後に監査するためpending。
- App Store Review／External TestFlight／一般公開:未実施。
