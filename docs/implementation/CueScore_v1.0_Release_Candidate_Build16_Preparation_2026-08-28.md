# CueScore v1.0 — Release Candidate Build 16 Preparation

Date: 2026-08-28  
Status: implementation, Archive, Validate and Internal TestFlight distribution PASS / physical iPhone pending

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
- Signed Release Archive: `ARCHIVE SUCCEEDED`。
- App Store validation: `App 1.0 (16) validated`、all validation checks PASS。
- Xcode distribution: `Upload for TestFlight (Internal Testing Only)`で`App 1.0 (16) uploaded`。
- App Store Connect: Apple処理完了後、輸出コンプライアンスを正式回答「上記のアルゴリズムのどれでもない」で保存した。
- Internal distribution: Build 16は`CI CueScore Internal Testers`（招待数1）に含まれ、状態は`テスト中`。Product OwnerはiPhoneのTestFlightから更新可能。
- RC Build 16 physical iPhone: pending。
- App Store metadata／public screenshots: RC実iPhone PASS後に監査するためpending。
- App Store Review／External TestFlight／一般公開:未実施。
