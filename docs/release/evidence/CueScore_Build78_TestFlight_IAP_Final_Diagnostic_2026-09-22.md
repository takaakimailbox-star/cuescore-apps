# CueScore Build 78 TestFlight IAP Final Diagnostic

- Date: 2026-09-22
- Gate: diagnostic only, before App Review resubmission
- Build 78 product source: `6e0a569e32e473f6b5bfa14c74eeca1482820467`
- Conclusion: `A — NON-BLOCKING — TESTFLIGHT/SANDBOX STOREFRONT METADATA ISSUE`

## Conclusion

Build 78のTestFlight Pro画面に表示された`$5.99`は、現在のEvidenceではCueScoreの価格計算・hard-code・stale fallback・StoreKit regressionではない。Build 77で分離済みのTestFlight/Sandbox storefront metadata discrepancyと同じ現象であり、App Review再提出を妨げない。

Apple内部でBuild 78 runtimeが選択したStorefront country/IDはproduction UIに露出していないため、正確なApple側内部経路までは断定しない。ただし、製品source、Archive、App Store ConnectのJPN価格、Build 77 A/B比較を合わせると、製品側問題を示すEvidenceはなく、distribution path固有のmetadata表示と判定できる。

## Product Owner device evidence

2026-09-22、Build 78 Internal TestFlightのiPhone実機Evidence 3枚を確認した。

| File | SHA-256 | Observed fact |
| --- | --- | --- |
| `IMG_3700.PNG` | `dc432c121eefd0d7e1120f039bd2de9db262aa6f5d7620431c41ff5354bf0d08` | Pro画面に`$5.99`、`CueScore Pro 有効`、Restore button |
| `IMG_3702.PNG` | `50c7b2b7b8fa1256f6ad321f3e45f4bc8d3ff1cd8b3ca582364963e14717a1f4` | Settingsに`CueScore Pro ✓`、Version 1.0 |
| `IMG_3701.PNG` | `72fce7e25b9d5642edc750552c949a771579f46b315517306834feb67d651319` | Restore操作後、Apple Account password認証UIへ到達 |

3枚とも1170×2532。Apple Account passwordは入力されず、認証完了後のRestore resultは取得していない。

Product Owner報告:

- cold launch: PASS
- Race selector: PASS
- Player Search黄色focus枠除去: PASS
- verified Pro entitlement表示: PASS
- Restore: Apple authentication UI到達までPASS、completionは未実施
- physical iPad: 所有なしのため未確認。Build 78作成GateではiOS 27 iPad Simulator cold launch 3/3をPASS済み

## App Store Connect read-only snapshot

2026-09-22 07:22 JSTに個人APIキーでread-only再取得した。metadata、price、availability、Build relationship、submissionは変更していない。

### App and IAP

- App ID: `6802027038`
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- App availability: JPN 1地域のみ
- App `availableInNewTerritories`: `false`
- IAP ID: `6808464490`
- Name: `CueScore Pro`
- Product ID: `com.takaakimailboxstar.cuescoreapps.pro`
- Type: `NON_CONSUMABLE`
- State: `READY_TO_SUBMIT`
- IAP availability: JPNのみ
- IAP `availableInNewTerritories`: `false`
- Base territory / currency: `JPN` / `JPY`
- Active manual JPN price: customer price `980` JPY、proceeds `833` JPY、start/end dateなし

### Build and review

- Build 78 ID: `eb2f6582-c42b-444d-9755-218e5e03ff49`
- Build 78: `VALID` / `APP_STORE_ELIGIBLE` / `usesNonExemptEncryption=false`
- Build 78 internal state: `IN_BETA_TESTING`
- Version 1.0: `REJECTED`, release type `MANUAL`
- Review submission `7fd64b66-fe2e-424e-9038-a37cbddf8e87`: `UNRESOLVED_ISSUES`
- Version 1.0 review-build relationship: Build 77のまま

## Build 78 source and Archive

- Native Product ID constant: `com.takaakimailboxstar.cuescoreapps.pro`.
- Product fetch: StoreKit 2 `Product.products(for:)`.
- Display authority: fetched productの`Product.displayPrice`を`localizedPrice`としてWebへ返す。
- Entitlement authority: verified StoreKit transaction only。
- `Transaction.currentEntitlements`、`Transaction.updates`、`AppStore.sync()`を使用。
- Restoreは`AppStore.sync()`後にverified current entitlementを再読取する。
- Product runtime source内に`$5.99`または`¥980`のhard-codeなし。`980`はLocal StoreKit test/configurationにのみ存在し、production Archiveへは混入しない。
- Build 78 Archive `.storekit`: 0件。
- Build 78 Archive bundle/version/build: `com.takaakimailboxstar.cuescoreapps` / `1.0 (78)`。
- Source / iOS copied / Archive `monetization-v1.js` SHA-256: `388ce045c2c925c761cc3f7c1055c4a41f76dbecdf5f9069d5cfc2dca9f30dca`。
- Source / Archive `index.html` SHA-256: `03eff6a2370da0dac060b752a43f065eb693952f7d1513004543c027321e6b95`。
- Build 78 source commit and Archive identity were established in the Build 78 RC record.

## Build 77 comparison

Build 77 product source commit `9828a8499f514d239b717d248a9a99976db23944` and Build 78 product source commit have no diff in:

- `monetization-v1.js`
- `ios/App/App/CueScoreStoreKitPlugin.swift`
- `package.json` / `package-lock.json`
- SwiftPM `Package.resolved`

The native plugin SHA and `monetization-v1.js` SHA are identical between Build 77 and Build 78. Build 78 added UIScene, Race selector, Player Search, build/cache identity, tests, and Evidence; it did not change IAP logic.

Build 77 A/B evidence:

| Runtime | Fresh product display | Apple price UI |
| --- | --- | --- |
| TestFlight Build 77 | `$5.99` | purchase sheet `¥980` |
| Xcode direct, identical product source | `¥980` | purchase action unavailable because Pro entitlement remained active |

Build 78 TestFlight again returned`$5.99` while verified Pro remained active. This is repetition of the same distribution-path-specific display metadata behavior, not a new Build 78 regression.

## Restore determination

Classification: `RESTORE COMPLETION NOT TESTED — NOT FAILED`.

Apple Account password UIまで到達したことは、Build 78のRestore buttonからnative `AppStore.sync()` pathへ入り、Appleの認証UIを呼び出せたEvidenceである。パスワード未入力のため、success、not-found、failureのいずれも返っておらず、`RESTORE FAILED`とは判定できない。

同時にPro画面とSettingsが`CueScore Pro 有効`を示すため、Build 78は既存のverified current entitlementを正常認識している。Build 77以前には同一Restore sourceでverified entitlement復元PASS Evidenceもある。今回の未完了操作は再提出Gateをblockしない。

## Verification and gate

- IAP focused tests: `44 pass / 0 fail / 0 skipped`.
- Current App Store Connect configuration: PASS.
- Build 78 product/Archive identity: PASS.
- Build 77 → 78 IAP regression: none detected.
- Product Owner Build 78 launch/Race/Search/Pro entitlement: PASS.
- Restore initiation: PASS.
- Restore completion: NOT TESTED, not classified as FAIL or blocking.
- Physical iPad: NOT AVAILABLE; existing iPad Simulator verification remains PASS.

Gate result: `READY FOR APP REVIEW RESUBMISSION` from the IAP diagnostic perspective. App Review resubmission, Build 78 relationship update, Apple reply, metadata/price change, and Release remain separate operations and were not performed in this task.
