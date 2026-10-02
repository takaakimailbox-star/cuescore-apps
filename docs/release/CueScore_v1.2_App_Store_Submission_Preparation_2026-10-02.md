# CueScore Apps v1.2 App Store Submission Preparation

- Date: 2026-10-02
- Product source: `1fc69c80370620b4db0448ecbcea1f5d28f003ca`
- Candidate: `1.2 (83)`
- Result: `READY FOR PRODUCT OWNER APP REVIEW SUBMISSION`
- App Review submitted: **No**

## Product Owner Final Smoke

Product Owner completed the TestFlight `1.2 (83)` Final Smoke and reported **ALL PASS** for nine recorded items: TestFlight identity, cold launch to Home, Player row / pencil, Player sort, Few-Players Content-Fit, multi-player Bottom Navigation clearance, all three Interrupted Match Modal actions, absence of the yellow touch-focus outline, and the Match Sharing entry point. No repeat smoke was requested.

## App Store Version and build

App Store Connect Version `1.2` was created and read back as `READY_FOR_REVIEW`. Release type is `MANUAL`; automatic release is not enabled.

- App Store Version ID: `b794d928-74af-45e4-8342-65a570f294f2`
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Selected build: `83`
- Build ID: `f45b388a-9268-4d94-aa7a-56c4299799c1`
- Build state: `VALID` / `APP_STORE_ELIGIBLE`
- `usesNonExemptEncryption=false`

No archive, upload, Build 84, or product-source change was made during this preparation.

## What's New

The exact Japanese release notes were set and read back:

```text
試合記録の共有とプレーヤー管理を改善しました。
・完了した試合をQRコードで別のCueScore Appsへ共有できるようになりました。
・プレーヤーの削除や並び順、一覧表示を改善しました。
・中断中の試合の再開画面など、表示と操作性を改善しました。
```

## Metadata and screenshots

Version 1.2 inherited the approved Japanese metadata. Read-back confirmed description, keywords, Support URL, promotional text, app name, subtitle, Privacy Policy URL, categories, and age-rating data remained present. The inherited `APP_IPHONE_65` screenshot set contains six assets; all six are `COMPLETE`.

The six retained screenshots were visually audited. They remain legible, internally consistent, free from broken/corrupt assets, and represent the stable Home, Player, Player Detail, History, Match Detail, and CueScore Pro/Backup flows. No screenshot was created, replaced, or uploaded. The retained Settings image visibly contains the historical in-app `Version 1.0` label, and the description retains a historical `Version 1.0` sentence. These remain accurate descriptions of the original baseline and do not contradict the continuing absence of automatic cloud sync and CSV import/export; App Store Connect reports no blocking error.

## Review Notes and Match Sharing

Review Notes were updated to preserve the existing product and CueScore Pro instructions and add the Version 1.2 Match Sharing review path. The notes now state:

- no CueScore account or sign-in is required;
- Match Sharing is available to Free and Pro users;
- sender path: completed Match Detail → `共有`;
- receiver path: History → `受け取る` → camera permission → Player 1 / Player 2 local mapping → final confirmation → import;
- scanning the same QR verifies duplicate protection;
- one completed match is transferred directly in one QR, without a CueScore server, cloud synchronization, or sender-local Player IDs;
- camera access is used only for optional player photos and QR scanning.

Read-back confirmed Review Notes length `2928`, Match Sharing text present, review contact details present, and sign-in not required.

## App Privacy, Free / Pro, availability, and price

The public Japan App Store page reports `データの収集なし`. This remains consistent with the local QR Match Sharing contract and unchanged local-data design. The authenticated App Store Connect Privacy UI was not available in the in-app browser session; no Privacy answer was changed.

- App availability: JPN only; `availableInNewTerritories=false`.
- CueScore Pro: `com.takaakimailboxstar.cuescoreapps.pro`.
- Type/state: `NON_CONSUMABLE` / `APPROVED`.
- IAP availability: JPN only; `availableInNewTerritories=false`.
- Active Japan price: `JPY 980`.
- Free: six match workflows, Match Sharing send/receive, newest 20 saved matches and basic statistics.
- CueScore Pro: all saved history, personal bests, detailed analytics/trends, opponent review, Backup, Restore.

CueScore Pro was not added to the Version 1.2 review draft because the approved IAP itself is unchanged.

## Public URLs

Fresh production checks returned HTTP 200:

- App Store: `https://apps.apple.com/jp/app/cuescore-apps/id6802027038`
- Support: `https://takaakimailbox-star.github.io/cuescore-apps/support.html`
- Privacy Policy: `https://takaakimailbox-star.github.io/cuescore-apps/privacy.html`
- Terms: `https://takaakimailbox-star.github.io/cuescore-apps/terms.html`

## Review submission draft

A new review draft was created for this update and contains exactly one item:

- Submission ID: `ae69d05f-3f0c-4f10-bcb0-b72893db66f1`.
- Submission state: `READY_FOR_REVIEW`.
- Submitted date: unset.
- Item count: `1`.
- Item: iOS App Version `1.2` (`b794d928-74af-45e4-8342-65a570f294f2`) only.
- Item state: `READY_FOR_REVIEW`.
- IAP item: none.

The draft has **not** been submitted. Version 1.2 and its only review item being `READY_FOR_REVIEW`, together with the exact Build 83 relationship, confirms that App Store Connect reports no blocking required-field error at this gate.

## Existing verification basis

No product tests were rerun because this gate changed App Store Connect metadata and repository Evidence only. Product source remains unchanged from the already verified Build 83 source. Existing accepted Evidence remains the basis:

- Build 83 focused: `230 pass / 0 fail / 0 skipped`.
- Full Node: `596 pass / 0 fail / 0 skipped`.
- Native parity / Release Simulator Build / Release device Archive: PASS.
- Apple validation: PASS.
- Build 83: `VALID` / `APP_STORE_ELIGIBLE` / Internal TestFlight available.
- Product Owner TestFlight Final Smoke: `9 / 9 PASS` for the explicitly recorded items.

## Final classification and STOP

### BLOCKER

- None detected.

### NON-BLOCKING

- Authenticated App Store Connect App Privacy UI could not be freshly opened in the in-app browser. The public Japan App Store disclosure, unchanged App Privacy configuration, and local Match Sharing contract are consistent.
- Retained screenshot/description text includes the historical `Version 1.0` label. It is unchanged, does not make a false current feature claim, and App Store Connect reports the Version and review item as ready.

### READY

- Version 1.2, Build 83, exact What's New, metadata/screenshots, Match Sharing Review Notes, Japan-only availability, CueScore Pro `¥980`, Free/Pro contract, public URLs, MANUAL release, and the one-item unsubmitted review draft have all been read back.

This gate stops immediately before `Submit for Review`. No App Review submission, release, external TestFlight distribution, source change, Build 84, archive, upload, IAP change, price change, availability change, Privacy change, or automatic-release change was performed.
