# CueScore Current Decision

- Decision ID: `CUESCORE-TESTFLIGHT-SANDBOX-IAP-20260918`
- Date: 2026-09-18
- Product Owner Decision: GO
- Scope: Internal TestFlight Build 66でApple実商品を使うSandbox IAP検証を再開する

## Objective

`Internal TestFlight Build 66 → Sandbox → StoreKit 2 → verified entitlement`が実際に成立することを確認する。Phase AではCodexがGit、製品実装、Build 66、App Store Connectのpreflightを行い、問題がなければProduct Owner実機テストのREADY判定で停止する。

## Authorized work

- GitHub最新`main`、branch、HEAD、working treeを確認する。
- Version `1.0`、Build `66`、正式Product ID、StoreKit 2 verified entitlement、`displayPrice`、Free最新20件、購入後の即時更新、`AppStore.sync()` Restore、商品取得失敗時の既存Pro保護を確認する。
- App Store Connect API／既存EvidenceでBuild 66、Internal TestFlight、IAP metadata／availabilityを確認する。
- `docs/handoff/CURRENT_DECISION.md`、`docs/handoff/CURRENT_REPORT.md`、必要最小限の`docs/CURRENT_STATUS.md`だけを更新する。
- Phase A判定をhandoff checkpointとしてcommitし、GitHub `main`へpushする。

## Protected scope

- 製品コード、StoreKit実装、Product ID、Bundle ID、価格、商品type、Version、Build番号を変更しない。
- Build 67、Archive、TestFlight Upload、External TestFlight、App Review、一般公開を行わない。
- 既存working treeをclean、reset、stashしない。
- Product Ownerの実機結果を推測でPASSにしない。

## Gate boundary

Phase Aが正常なら`READY FOR PRODUCT OWNER TESTFLIGHT SANDBOX IAP TEST`として停止する。実機Sandbox transaction結果を受け取る前に、コード修正や次工程へ進まない。
