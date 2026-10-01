# CueScore Current Decision

- Decision ID: `CUESCORE-1.2-BUILD80-INTERNAL-TESTFLIGHT-20261001`
- Date: 2026-10-01
- Gate: `VERSION 1.2 BUILD 80 INTERNAL TESTFLIGHT AVAILABLE / PRODUCT OWNER VERIFICATION PENDING / APP_STORE_ELIGIBLE NOT SATISFIED`

## Result

- Product Source commit is `810a9e134c5de1e033eb644027c37f51834fd6d4`; Archive baseline is Documentation commit `d1ba8b7fa8821e7f93a10b3b54dde0984b5e703e`.
- Fresh verification passed cache/version `42/42`, Player Delete `11/11`, Match Sharing `109/109`, integration `102/102`, native foundation `6/6`, Full Node `578/578`, native parity, and Release device Archive.
- App Store Connect Build `80`, ID `0851e2bb-b9dc-47b3-bab6-04d3f687e200`, is `VALID`, `IN_BETA_TESTING`, and available through `CueScore Internal Testers`; Product Owner physical verification is pending.
- Audience is `INTERNAL_ONLY`, not the requested `APP_STORE_ELIGIBLE`, and Apple does not permit post-upload audience changes. This deviation is retained as FAIL without creating Build 81 or expanding the Gate.
- Public Version 1.1 remains unchanged and App Store Version 1.2 was not created.

## Boundary

- The next independent Gate is Product Owner physical iPhone verification of TestFlight Version `1.2 (80)` using safe disposable Player data and, if available, two iPhones for Match Sharing.
- App Store eligibility remediation would require an independently approved later build; do not create Build 81 from this Gate.
- External TestFlight, App Store Version creation, App Review, Release, metadata, screenshots, Privacy, CueScore Pro, price, and availability remain outside scope.

## STOP

Stop after Internal TestFlight availability. Product Owner device action is now required for the separate physical verification Gate.
