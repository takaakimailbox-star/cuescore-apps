# CueScore Version 1.2 Build 84 — App Review Resubmission Preparation Evidence

- Date: 2026-10-03 JST
- Gate: `READY FOR PRODUCT OWNER APP REVIEW RESUBMISSION — VERSION 1.2 BUILD 84`
- External GitHub baseline: `1f0a568422312cd1c784617a6ac83da47fa1245d`
- Product Source commit: `8783c5e2ef4a73405ea6334c268422f6964fc920`
- App Store Version ID: `b794d928-74af-45e4-8342-65a570f294f2`
- Build 84 ID: `51ee69a0-e238-4382-9cbb-8529f4d0a682`
- Review Submission ID: `935f4971-9fb9-43a9-ae28-7292bd693c7d`

## Product Owner final acceptance

Product Owner performed the final physical smoke on Internal TestFlight `1.2 (84)` and reported all requested items PASS:

1. Cold launch → Home.
2. Completed Match → Share → one QR code.
3. Back → share the same Match again → one QR code again.
4. Camera ON → History → Receive → stable Scanner video.

The earlier Physical RC Camera Permission review is also accepted: the obsolete `カメラを確認する` action is absent, `設定を開く` and Back are present, Settings recovery works, and the next Receive action starts Scanner after Camera is enabled. Physical results are recorded separately from automated verification.

## Existing automated and distribution evidence

- Build 84 plus Camera Permission UI: `13/13 PASS`.
- Match Sharing: `122/122 PASS`.
- Player / Navigation / Native focused: `67/67 PASS`.
- Full Node: `609/609 PASS`.
- Runtime Sender E2E and Receiver E2E: PASS.
- Native parity, Release Simulator Build, Release device Archive, and Apple validation: PASS.
- Blocking validation error: 0. Archive / IPA `.storekit`: 0.
- Internal TestFlight state: `IN_BETA_TESTING` in `CueScore Internal Testers`.

These are existing Build 84 results. This documentation-only gate did not rerun or represent them as newly executed.

## Build and Version relationship

- Before the approved change, App Store Version `1.2` was `DEVELOPER_REJECTED`, release type `MANUAL`, and selected Build 83.
- The Version 1.2 Build relationship was changed from Build 83 to Build 84 only.
- Fresh read-back after the change:
  - Version: `1.2`
  - Version state: `READY_FOR_REVIEW`
  - Release type: `MANUAL`
  - Selected Build: `84`
  - Build ID: `51ee69a0-e238-4382-9cbb-8529f4d0a682`
  - Processing: `VALID`
  - Audience: `APP_STORE_ELIGIBLE`
  - `usesNonExemptEncryption=false`
- Build 83 remains immutable and available as `VALID` / `APP_STORE_ELIGIBLE` / Internal `IN_BETA_TESTING`; it was not deleted or modified.

## Metadata and Review Notes audit

- The adopted Japanese What's New was read back unchanged:

> 試合記録の共有とプレーヤー管理を改善しました。
>
> ・完了した試合をQRコードで別のCueScore Appsへ共有できるようになりました。
>
> ・プレーヤーの削除や並び順、一覧表示を改善しました。
>
> ・中断中の試合の再開画面など、表示と操作性を改善しました。

- Existing App Name, subtitle, description, promotional text, keywords, Sports / Utilities categories, 4+ age rating, Support URL, Privacy URL, Terms URL, and screenshots were audited without modification.
- Japanese iPhone 6.5-inch screenshots: `6/6 COMPLETE`.
- Review Notes remain suitable for Build 84 and describe: no account or sign-in; Free and Pro Match Sharing; completed Match Detail → Share; one QR code; History → Receive; Native QR Scanner; symmetric Player 1 / Player 2 mapping; duplicate protection; local/direct QR transfer without a CueScore server or sender-local Player IDs; and Camera use for optional Player photos and QR scanning.
- Review contact fields are present. No Build 83 defect or internal debug information was added.

## Privacy and product contract audit

- Official 101 / 102 and current source retain the privacy boundary: sender local Player IDs, sender avatars/photos, memo/reflection, and other local-only fields are excluded from the shared payload.
- Build 84 reconstructs shared analysis events through the approved allow-list and retains strict validation.
- Match Sharing is direct through the displayed QR; it does not require an account, CueScore server, cloud synchronization, tracking, or an advertising SDK. Camera images are not sent to an external server.
- The public App Store page continues to state `データの収集なし`; no App Privacy response was changed.
- Match Sharing remains available to both Free and CueScore Pro. The Free / Pro boundary is unchanged.

## Territory, IAP, and public URLs

- App availability: JPN only (`1` available territory), `availableInNewTerritories=false`.
- CueScore Pro:
  - Product ID: `com.takaakimailboxstar.cuescoreapps.pro`
  - Type: `NON_CONSUMABLE`
  - State: `APPROVED`
  - Availability: JPN only; `availableInNewTerritories=false`
  - Base territory / currency / active manual price: `JPN / JPY / 980`
- CueScore Pro was not added to the resubmission item. Price and availability were not changed.
- Fresh HTTP results:
  - App Store: `200` — `https://apps.apple.com/jp/app/cuescore-apps/id6802027038`
  - Official CueScore website: `200` — `https://takaakimailbox-star.github.io/cuescore-apps/cuescore/`
  - Support: `200` — `https://takaakimailbox-star.github.io/cuescore-apps/support.html`
  - Privacy: `200` — `https://takaakimailbox-star.github.io/cuescore-apps/privacy.html`
  - Terms: `200` — `https://takaakimailbox-star.github.io/cuescore-apps/terms.html`

## Review Submission draft

- The withdrawn Build 83 submission `ae69d05f-3f0c-4f10-bcb0-b72893db66f1` remains historical and `COMPLETE`; its item is removed.
- No reusable active draft existed, so a new iOS Review Submission was created.
- Submission ID: `935f4971-9fb9-43a9-ae28-7292bd693c7d`.
- State: `READY_FOR_REVIEW`.
- Submitted date: unset (`null`).
- Item count: `1`.
- Sole item: App Store Version `1.2` (`b794d928-74af-45e4-8342-65a570f294f2`), state `READY_FOR_REVIEW`.
- IAP review item: 0.
- Required-field / build relationship / export compliance / screenshots / review contact / territory / IAP blocking error: 0, evidenced by the authoritative Version, item, and submission `READY_FOR_REVIEW` states.
- Non-blocking warning surfaced in the API read-back: 0.

## Boundary

- `Submit for Review` was not executed.
- Release and Automatic Release were not executed; `MANUAL` is preserved.
- Build 85 was not created. Archive, Upload, TestFlight membership/state, External TestFlight, product source, metadata, screenshots, Privacy, CueScore Pro, price, availability, and public Version 1.1 were not changed.
- Product source change: 0. The dirty local mirror and old worktrees were not touched.

## STOP

`READY FOR PRODUCT OWNER APP REVIEW RESUBMISSION — VERSION 1.2 BUILD 84`

The next gate is Product Owner approval to execute `Submit for Review` for submission `935f4971-9fb9-43a9-ae28-7292bd693c7d`.
