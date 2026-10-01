# CueScore Current Decision

- Decision ID: `CUESCORE-1.2-BUILD80-PLAYER-LIST-BOTTOM-NAV-FIX-20261001`
- Date: 2026-10-01
- Gate: `IMPLEMENTATION FIX COMPLETE / SIMULATOR VERIFICATION PASS / PRODUCT OWNER RE-TEST REQUIRED`

## Result

- Player List Fix Product Source Commit is `7e2beb0ade0685ff331fa808273e00e6f832bd2c`.
- Internal TestFlight Build 80のphysical Player一覧はBottom Navigation overlapでFAIL。実scroll owner `.player-library-list`へNavigation clearanceを適用し、iOS overscroll後に戻る直接原因を修正した。
- Player 0／1／7／12件、History 0／1／12件、Home／Player／History／Settings、Player Delete、Match Sharingを検証。Full Node `583/583`、native parity、Release Simulator BuildをPASSした。
- 試合履歴一覧は既存の実scroll owner `.records-list` clearanceにより、390×844で最終試合とNavigationの間に23ptを確保しており、同症状なし。
- 既存Internal TestFlight Build 80は修正前sourceのため、修正後のphysical PASSとは記録しない。

## Previous Distribution State

- Product Source commit is `810a9e134c5de1e033eb644027c37f51834fd6d4`; Archive baseline is Documentation commit `d1ba8b7fa8821e7f93a10b3b54dde0984b5e703e`.
- Fresh verification passed cache/version `42/42`, Player Delete `11/11`, Match Sharing `109/109`, integration `102/102`, native foundation `6/6`, Full Node `578/578`, native parity, and Release device Archive.
- App Store Connect Build `80`, ID `0851e2bb-b9dc-47b3-bab6-04d3f687e200`, is `VALID`, `IN_BETA_TESTING`, and available through `CueScore Internal Testers`; Product Owner physical verification is pending.
- Audience is `INTERNAL_ONLY`, not the requested `APP_STORE_ELIGIBLE`, and Apple does not permit post-upload audience changes. This deviation is retained as FAIL without creating Build 81 or expanding the Gate.
- Public Version 1.1 remains unchanged and App Store Version 1.2 was not created.

## Boundary

- The next independent Gate is commit/push and a separately approved distributable build-number decision, followed by Product Owner Player-list physical re-test.
- App Store eligibility remediation would require an independently approved later build; do not create Build 81 from this Gate.
- External TestFlight, App Store Version creation, App Review, Release, metadata, screenshots, Privacy, CueScore Pro, price, and availability remain outside scope.

## STOP

Stop after implementation, tests, visual evidence, native parity, and Release Simulator Build. Do not create Build 81, commit, push, Archive, Upload, or operate TestFlight/App Store Connect in this Gate.
