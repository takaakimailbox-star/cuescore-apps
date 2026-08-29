# CueScore v1.0 — Match History List UI Simplification Implementation

- Date: 2026-08-30
- Status: implementation and local verification PASS / TestFlight Gate pending sign-in
- Basis SHA: `4ee4df53cf78840d1ca2335aa34a62c76be7cdc1`

## Implementation

- 全体履歴titleを`試合履歴一覧`へ変更した。
- 検索、詳細絞り込み、並び替え、保存状態の上部UIを除去した。
- title、7種目tab、対象件数、履歴card一覧の順に整理し、件数とcard間の余白を縮小した。
- 全tabの並びを新しい順へ固定し、同時刻はMatch ID辞書順のtie-breakを追加した。
- card renderer、Match Detail、Back、score、Player情報、schemaは変更していない。
- 詳細検索とユーザー指定sortはLater / Deferredとした。

## Verification

- 専用contract testを6件追加した。
- native asset同期後、Full tests: `261 pass / 0 fail / 0 skipped`。
- 390×844 in-app browser: title、7種目tab、対象件数、既存empty state、検索／filter／sort control 0件、document／body幅390、横overflowなし。
- Layout: tabから件数6px、件数からlist 0px。削除領域の空白なし。
- iOS Simulator Debug／Release: `BUILD SUCCEEDED`。
- App Store ConnectでBuild 19未使用を確認し、Marketing Version `1.0`／Build Number `19`を設定した。Archive／Validate／TestFlight Internal Onlyはpending。
- 実iPhone確認はpending。

## Release Boundary

- Marketing Versionは`1.0`を維持する。
- App Store Review、External TestFlight、一般公開は実施しない。
