# CueScore v1.0 Cloud Sync Row Hidden Spec

- Status: Adopted
- Date: 2026-08-30
- Target: Version 1.0 / Build 22

## Required behavior

1. 設定 > データ管理で「クラウド同期」行を表示しない。
2. `data-release-feature="cloud-sync"`の`hidden`契約をCSSが上書きしないよう、hidden要素を`display:none`に固定する。
3. バックアップ、データ復元、データ削除は従来どおり表示・動作する。
4. `cloudSync:false`を維持し、クラウド同期処理やsaved-data schemaを追加しない。
5. source、native generated asset、Xcode copied assetを同一内容に同期する。

## Acceptance

- 全自動テストが全件成功する。
- 390×844でクラウド同期行が非表示、横overflowなし、console errorなし。
- iOS Simulator Debug／Releaseが成功する。
- Marketing Version 1.0 / Build 22を通常のApp Store Connect配信用としてArchive／Uploadできる。
- App Store Reviewへは提出せず、「審査用に追加」の直前で停止する。

