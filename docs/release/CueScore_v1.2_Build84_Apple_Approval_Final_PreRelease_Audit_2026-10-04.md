# CueScore Apps v1.2 Build 84 Apple Approval / Final Pre-Release Audit

- Date: 2026-10-04 JST
- External GitHub baseline: `b44e5702952236667d6ae8ad4f426624e3935686`
- Product source: `8783c5e2ef4a73405ea6334c268422f6964fc920`
- Audit mode: read-only App Store Connect / public URL audit
- Gate result: `APPLE REVIEW APPROVED / PENDING DEVELOPER RELEASE / FINAL PRE-RELEASE AUDIT PASS`

## Conclusion

Version `1.2` / Build `84` has completed App Review and is eligible for distribution. App Store Connect reports Version 1.2 as `PENDING_DEVELOPER_RELEASE`, release type `MANUAL`, with the approved Build 84 linked. The release action was not invoked.

No product source, build, metadata, screenshot, App Privacy answer, CueScore Pro product, price, territory, TestFlight state, public Version 1.1, or App Store release state was changed during this audit.

## Apple approval notification

The Product Owner-provided Apple notification states that review is complete and the submission is eligible for distribution. It records one accepted item, App Version `1.2 for iOS`, and Submission ID `935f4971-9fb9-43a9-ae28-7292bd693c7d`.

- Repository Evidence: `docs/release/evidence/CueScore_v1.2_Build84_Apple_Approval_2026-10-04.png`
- Original dimensions: `2880 x 1800`
- SHA-256: `f7d363ef7ecd5e8f470abb5376e0d5c35b4a2644b121d3113c48454f9e3b1cb0`
- Email display time: `2026-10-04 04:06` as shown by the supplied screenshot

## Fresh App Store Connect read-back

Read-only API audit time: `2026-10-04T04:53:16.161Z` (`2026-10-04 13:53:16.161 JST`).

- App: `CueScore Apps`
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- App Store Version: `1.2`
- Version ID: `b794d928-74af-45e4-8342-65a570f294f2`
- App Version state: `PENDING_DEVELOPER_RELEASE`
- Release type: `MANUAL`
- Linked Build: `84`
- Build ID: `51ee69a0-e238-4382-9cbb-8529f4d0a682`
- Build state: `VALID`
- Audience: `APP_STORE_ELIGIBLE`
- Uses non-exempt encryption: `false`
- Review Submission: `935f4971-9fb9-43a9-ae28-7292bd693c7d`
- Submission state: `COMPLETE`
- Submitted timestamp: `2026-10-03T02:18:14.384Z` (`2026-10-03 11:18:14.384 JST`)
- Submitted items: `1`
- Submitted item: Version `1.2` only
- Review item state: `APPROVED`

`PENDING_DEVELOPER_RELEASE` together with `MANUAL` confirms that the approved version is held for the developer's explicit release. No release request was sent in this Gate.

## Metadata / screenshots

- Locale: `ja`
- App name: `CueScore Apps`
- Subtitle: `ビリヤードの試合・履歴・分析`
- Primary category: Sports
- Secondary category: Utilities
- Description: present (`575` characters)
- Keywords: `ビリヤード,スコア,試合,対戦,ローテーション,9ボール,10ボール,JPA,14-1,3C`
- Promotional text: present
- Support URL: `https://takaakimailbox-star.github.io/cuescore-apps/support.html`
- Review Notes: present (`2928` characters), Match Sharing covered, contact present, login not required
- iPhone 6.5-inch screenshots: `6/6 COMPLETE`
- Age rating declaration: no newly declared content; no override

Approved What's New:

```text
試合記録の共有とプレーヤー管理を改善しました。
・完了した試合をQRコードで別のCueScore Appsへ共有できるようになりました。
・プレーヤーの削除や並び順、一覧表示を改善しました。
・中断中の試合の再開画面など、表示と操作性を改善しました。
```

## App Privacy / availability / CueScore Pro

- Fresh public App Store read-back: `データの収集なし` / `データを収集しません`
- App availability: Japan only (`JPN`)
- `availableInNewTerritories`: `false`
- CueScore Pro product: `com.takaakimailboxstar.cuescoreapps.pro`
- Type: `NON_CONSUMABLE`
- State: `APPROVED`
- Price: `JPY 980`
- IAP availability: Japan only; `availableInNewTerritories=false`
- Free / Pro product contract: unchanged

## Public URL audit

Fresh HTTP read-back returned `200` for all five URLs:

1. App Store: `https://apps.apple.com/jp/app/cuescore-apps/id6802027038`
2. Official website: `https://takaakimailbox-star.github.io/cuescore-apps/`
3. Support: `https://takaakimailbox-star.github.io/cuescore-apps/support.html`
4. Privacy: `https://takaakimailbox-star.github.io/cuescore-apps/privacy.html`
5. Terms: `https://takaakimailbox-star.github.io/cuescore-apps/terms.html`

The public App Store page still displayed Version `1.1` during this audit. App Store Connect independently reported Version 1.1 as `READY_FOR_SALE`; no Version 1.1 operation was performed.

## Release action / verification boundary

- Authoritative release eligibility: available, because Version 1.2 is `PENDING_DEVELOPER_RELEASE` with `MANUAL` release.
- Release invoked: no.
- The isolated in-app browser was not authenticated to App Store Connect, so the exact rendered release-button label was not separately captured. No login was attempted. The API state is authoritative for release eligibility.
- Product source changes: `0`.
- Build 85: not created.
- Archive / Upload / TestFlight / App Store Connect mutation: none.
- Release: not performed.

## Next Gate

After a separate Product Owner Manual Release decision, release only Version `1.2` / Build `84`, then perform a read-only post-release audit. This Gate ends before that action.

`READY FOR PRODUCT OWNER VERSION 1.2 BUILD 84 MANUAL RELEASE`
