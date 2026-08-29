# CueScore v1.0 — Final UI and Data Consistency / Build 18 Candidate

Date: 2026-08-29  
Status: implementation and automated verification PASS / distribution Gate pending

## Basis

- Start SHA: `8e7c2f5bc3d1f93e8cd51a38abb28a2189539a90`。
- Start時にlocal／origin一致、working tree cleanを確認した。
- App Store ConnectでBuild 18が未使用であることを確認した。Build 17は再利用しない。
- Marketing Version `1.0`を維持する。
- Implementation commit: `8aee676`。その後Build Number `18`を設定した。

## Implementation

- 全画面推移の各pointを、古い順recordのprefixに対する`CueScoreBuild4Metrics.aggregate`値へ変更した。最新pointと主要指標は同じSSOT／対象recordを使用する。
- 競技固定履歴に`{競技名}の全試合`titleと専用compact rowを追加し、競技名／Race toの重複を除去した。
- 14-1 `14ボールラック`時だけ既存queue overlayを中央Modal化し、その他案内とscoring stateを維持した。
- Match Setupに登録Player数別guideを追加し、有効な異なる登録Player IDが2件揃うまで開始を拒否する。placeholder初期値を廃止した。
- PWA version／Service Worker、native asset listへBuild 18 assetを同期した。

## Data Compatibility

- saved-data schema、match record、Player record、Backup／Restore formatは変更していない。
- 既存placeholder由来recordは削除も推測migrationも行わず、既存history互換として保持する。
- 新規保存は開始Gateにより登録Player IDを持つ2人に限定される。

## Verification

- Full automated tests: `255 pass / 0 fail / 0 skipped`。
- 累計勝率fixture: `100% → 50% → 66.666…%`、最新pointと全件aggregate一致、eligible外rateは`null`。
- source／native-web／iOS copied assets: 一致。
- 390×844 in-app browser: viewport／document／body幅390、横overflowなし。Player 0人案内1件、開始disabled、placeholder候補0を確認。
- iOS Simulator Debug: `BUILD SUCCEEDED`。
- iOS Simulator Release: `BUILD SUCCEEDED`。
- RC Build 18 physical iPhone: pending。
- Archive／Validate／TestFlight Internal Only／Apple processing／輸出コンプライアンス／`テスト中`: pending。

## Unchanged

- scoring rules、aggregate formula、eligible判定、Break Input、Back／Swipe、saved-data schema、Backup／Restore。
- App Store Review、External TestFlight、一般公開は実施しない。
