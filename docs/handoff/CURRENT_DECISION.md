# CueScore Current Decision

- Decision ID: `CUESCORE-1.2-BUILD82-APP-STORE-ELIGIBLE-20261002`
- Date: 2026-10-02
- Gate: `BUILD 82 APP STORE ELIGIBLE / INTERNAL TESTFLIGHT`

## Result

- Accepted product content `a0971212b13fa09ace7bbb2b0ab2571a0cd7497b`を維持し、Build 82 identityだけをSource Commit `7c7ba922c2ba0603757aa1a4f832324b5833dafe`として固定する。
- Version `1.2`／Build `82`をInternal Testing Only OFFの通常`TestFlight & App Store`経路でUploadする。
- Build 82は`VALID`／`APP_STORE_ELIGIBLE`／`usesNonExemptEncryption=false`。`CueScore Internal Testers`に含まれ、Internal stateは`IN_BETA_TESTING`。
- Product Owner final smokeはartifact identity確認に限定し、destructive Player Delete／same-name identity testを再要求しない。

## Boundary

- Public Version 1.1 remains unchanged. App Store Version 1.2 does not exist.
- External TestFlight, App Store Version creation, App Review, Release, metadata, screenshots, Privacy, CueScore Pro, price, and availability remain outside scope.
- Build 83は作成しない。

## STOP

Stop after Build 82 is `VALID`／`APP_STORE_ELIGIBLE`, available to the internal group, and Documentation is pushed/read back. Do not create App Store Version 1.2, submit for review, or release.
