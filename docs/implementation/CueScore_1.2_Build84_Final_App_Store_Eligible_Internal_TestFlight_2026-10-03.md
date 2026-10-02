# CueScore Version 1.2 Build 84 — Final App Store Eligible Candidate / Internal TestFlight Evidence

- Date: 2026-10-03 JST
- Gate result: `BUILD 84 VALID / APP_STORE_ELIGIBLE / INTERNAL TESTFLIGHT AVAILABLE / PRODUCT OWNER FINAL SMOKE PENDING`
- Product Source commit: `8783c5e2ef4a73405ea6334c268422f6964fc920`
- Gate baseline: `b076e5e8b25be7a91c1e3e373923be70119a0d80`
- App Store Connect Build ID: `51ee69a0-e238-4382-9cbb-8529f4d0a682`

## Canonical source and fresh pre-Archive verification

- Canonical repository: `/Users/Ludique/Documents/Codex/cuescore-build84-match-sharing-fix`; branch `codex/build84-match-sharing-fix`.
- External GitHub `main` and task HEAD matched the expected baseline before work, and the working tree was clean. The dirty local mirror and old worktrees were not accessed or modified.
- Version / Build / Bundle ID: `1.2` / `84` / `com.takaakimailboxstar.cuescoreapps`.
- Cache identity: `2.0-build84-match-sharing-fix-v1`.
- Build 84 plus Camera Permission UI dedicated: `13 PASS / 0 FAIL / 0 SKIPPED`.
- Match Sharing focused: `122 PASS / 0 FAIL / 0 SKIPPED`.
- Player／Delete／Navigation／Native focused group: `67 PASS / 0 FAIL / 0 SKIPPED`.
- Full Node: `609 PASS / 0 FAIL / 0 SKIPPED`.
- The Sender runtime test used real-storage-format data and the production DOM Share click through eligibility, adapter, privacy validation, compression, Base45／CSM1, QR generation, and Share screen. The Receiver runtime test used the production DOM Receive click through fresh authorization and native scanner start request. Both passed; these were not source-regex-only checks.
- The environment did not expose `npm` directly, so the identical full suite was executed with the bundled Node runtime. This is an environment command-path note, not a product failure.

## Native sync, parity, Simulator, and dependency identity

- Formal source → native-web → Capacitor iOS public sync completed. Capacitor's pnpm-local `Package.swift` path rewrite was not retained; the repository's canonical relative dependency paths remained unchanged.
- Native foundation after sync: `6 PASS / 0 FAIL / 0 SKIPPED`.
- Source／native-web／iOS public／Release Simulator／Archive `index.html` SHA-256: `4f8840d5d9c09c67944cfe7b2ba3f4f56d3ea13b02574b0ced8e76c19a9f1da3`.
- Sender module SHA-256: `55068b12a89ac580cbf5950e9540df8a028938c34e83cea2f3fee634f8a3077c`.
- Receiver module SHA-256: `d6345bc520499e5d458eddae15fbf63757175f2b520c0f1dfed0fc7b0fa3eb40`.
- Match Sharing adapters／persistence／validation／format, QR vendor, and compression vendor also matched source, native-web, and iOS public byte-for-byte.
- Release Simulator Build: `BUILD SUCCEEDED`; identity `1.2 (84)` / production Bundle ID; built `.storekit` 0; built assets matched source.
- `Package.resolved` SHA-256: `1e68bbcd65eea223108220becced97a2d9eb05c79aaaa88e6f879078b8a6a0aa`.
- `capacitor-swift-pm`: `8.0.2`, revision `13a39179b3df796f3bb2e70c47ccdd92593f34d2`.
- `ion-ios-filesystem`: `1.1.2`, revision `0d81e26e828ff9582807e2339112cedf2e0fab85`.
- No dependency update was accepted into product source.

## Archive and artifact identity

- Release device Archive: `ARCHIVE SUCCEEDED`.
- Archive path: `/private/tmp/CueScoreBuild84.xcarchive`.
- App / dSYM UUID: `0BC0F6D0-C254-3036-AC7C-F1D09BA098D9`.
- Archive executable SHA-256: `e1ea2fcdbf056ec5ed10008df26e35da35caa05e518246d2b9caa07ed4121d97`.
- Exported App Store IPA SHA-256: `a176c8986cb7a01af95a15a0f3a0594620eeb84fe3e94ce47b34c94596962d37`.
- App Store-signed IPA executable SHA-256: `d5697d801913a10d29ce04f7af8ecc2113fe74d3d4906cecf1788532c5d77bfe`.
- Archive／IPA `.storekit`: 0.
- Archive and IPA preserved Version `1.2`, Build `84`, Bundle ID `com.takaakimailboxstar.cuescoreapps`, Team `U26DF88PRW`, and the approved Camera usage description.

## Distribution, validation, upload, and audience

- Distribution method: Xcode `app-store-connect` / normal `TestFlight & App Store` path.
- Export and upload options explicitly read back `testFlightInternalTestingOnly=false`; Internal Testing Only was OFF.
- The standalone `altool` personal-key attempt returned an authentication-only 401 before product validation. It was not recorded as a product validation failure.
- The signed Xcode distribution path completed package analysis and Apple-side validation with blocking error 0 before upload transfer began.
- Upload completed with `Upload succeeded` / `EXPORT SUCCEEDED` at Apple timestamp `2026-10-02T15:32:09-07:00` (`2026-10-03 07:32:09 JST`).
- Processing: `VALID`.
- Audience: `APP_STORE_ELIGIBLE`.
- `usesNonExemptEncryption=false` was saved through the App Store Connect API using the pre-approved historical answer.

## Internal TestFlight and App Store boundary

- Internal state: `IN_BETA_TESTING`; external state: `READY_FOR_BETA_SUBMISSION`.
- Internal group: `CueScore Internal Testers`; the group is internal, has `hasAccessToAllBuilds=true`, and Build 84 is included.
- Product Owner can obtain Version `1.2 (84)` through Internal TestFlight.
- Build 83 remains Build ID `f45b388a-9268-4d94-aa7a-56c4299799c1`, `VALID`, `APP_STORE_ELIGIBLE`, `usesNonExemptEncryption=false`, and `IN_BETA_TESTING`; it was not deleted or modified.
- App Store Version `1.2` remains `DEVELOPER_REJECTED`, release type `MANUAL`, and still references Build 83. Build 84 was not selected as its Review Build and App Review was not resubmitted.
- Public Version `1.1` remains `READY_FOR_DISTRIBUTION` with its existing Build 79 relationship. Release, Automatic Release, External TestFlight, metadata, screenshots, Privacy, CueScore Pro, price, and availability were not changed. Build 85 was not created.

## Product Owner final smoke

Use TestFlight Version `1.2 (84)` and perform only this non-destructive smoke:

1. Confirm TestFlight shows `1.2 (84)`, then cold launch to Home.
2. Open a completed Match containing analysis events, tap `共有`, and confirm a Single QR appears with no error toast.
3. Return, share the same Match again, and confirm a QR appears again.
4. With Camera ON, open History → `受け取る` and confirm stable Scanner video.

Camera Permission UI already passed Physical RC. Recheck it only if Product Owner considers it necessary. Do not repeat destructive Player Delete or other previously accepted physical tests.
