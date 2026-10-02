# CueScore Apps 1.2 Build 84 Match Sharing Fix Gate Evidence

- Date: 2026-10-02 JST
- Gate result: `PRODUCT OWNER PHYSICAL ACCEPTED / SOURCE FORMALIZED`
- Distribution boundary: local Physical RC only; no Build 84 Archive, Upload, TestFlight, App Store Connect build linkage, review resubmission, or release
- Initial implementation gate boundary: no commit and no push; later source formalization is recorded below

## Source identity

- Canonical worktree: `/Users/Ludique/Documents/Codex/cuescore-build84-match-sharing-fix`
- Branch: `codex/build84-match-sharing-fix`
- External remote: `github = https://github.com/takaakimailbox-star/cuescore-apps.git`
- Baseline HEAD / `github/main`: `39a42bc35612233a7ccf62a8398a68e193ef7955`
- Product Source commit: `8783c5e2ef4a73405ea6334c268422f6964fc920`
- Marketing Version: `1.2`
- candidate Build: `84`
- cache identity: `2.0-build84-match-sharing-fix-v1`

The task used a dedicated worktree because the existing local mirror contains unrelated work. No reset, checkout, clean, commit, push, or branch operation was performed on that mirror.

## App Store Connect withdrawal

Fresh pre-write read-back (2026-10-02 22:24:57 JST):

- App: CueScore Apps
- App Version: `1.2`
- Build: `83`
- Build ID: `f45b388a-9268-4d94-aa7a-56c4299799c1`
- Build state / audience: `VALID` / `APP_STORE_ELIGIBLE`
- Review Submission: `ae69d05f-3f0c-4f10-bcb0-b72893db66f1`
- Submission / App Version state: `WAITING_FOR_REVIEW`
- Submitted items: Version 1.2 only, 1 item
- Release type: `MANUAL`
- Internal TestFlight: `IN_BETA_TESTING`
- Public release: not performed

The Version 1.2 review submission was withdrawn through the authorized API operation. Final read-back at `2026-10-02T13:25:47.632Z`:

- Submission: `COMPLETE`
- Review item: `REMOVED`
- App Version 1.2: `DEVELOPER_REJECTED`
- Version 1.2 remains related to Build 83
- Build 83 remains `VALID` / `APP_STORE_ELIGIBLE`
- Internal TestFlight remains `IN_BETA_TESTING`
- Release remains `MANUAL` and unreleased

No Build 83 deletion, TestFlight stop, metadata change, Build 84 App Store Connect operation, review resubmission, or release was performed.

## Root causes and fixes

### Sender privacy failure

The production adapter cloned local `analysis.events` objects. Real saved events can carry local-only `category`, `season`, memo, undo/journal, or future unknown fields, so the intentionally strict privacy validator rejected the logical sharing payload before encoding and QR creation.

Fix:

- Rebuild events from the existing Format v1 event-type allow-list.
- Rebuild analysis summary and score progress from explicit shared fields.
- Drop unknown event types and unknown/local-only fields.
- Keep privacy validation unchanged and strict.
- Preserve the existing six-discipline format, compact encoding, Base45 `CSM1:`, ECC-M Single QR, symmetric mapping, duplicate, import, and Backup/Restore contracts.

### `sharedMatchId` premature persistence

The previous sender path persisted a newly generated identity before the QR artifact existed. A later validation, encoding, or QR generation failure could therefore mutate a saved Match even though sharing failed.

Fix:

- Generate/reuse a candidate identity through a read-only preparation step.
- Complete logical build, validation, encoding, and QR artifact generation first.
- Persist and read back the identity only after the artifact exists.
- Do not display QR success if persistence/read-back fails.
- Preserve existing valid identities and rollback behavior.

### Receiver permission recovery flash

The scanner controller could mark itself active and emit the scanner UI before native `startScan` returned success. During denied/retry/Settings recovery, this created a false camera-like scanner state before returning to permission UI.

Fix:

- Re-read authorization on each retry.
- Stop the previous session and remove old listeners before re-entry.
- Emit scanner/running state only after native `startScan` returns `{ active: true }`.
- Keep denied, restricted, unavailable, duplicate retry, Back cleanup, and memory clear distinct.
- Bind the production History receiver entry through an exported runtime click boundary covered by an EventTarget test.

## Verification

### Dedicated and focused

- Match Sharing sender/receiver/Stage 2–5B: `73/73 PASS`
- Player Delete, Player List/Navigation, Player UX, native foundation, and version/website focused: `64/64 PASS`
- Native foundation after formal sync: `6/6 PASS`
- FAIL: 0
- SKIPPED: 0

Runtime coverage includes:

- six-discipline real-save-like events containing prohibited and unknown local fields
- logical → compact → encode → decode → validate
- malicious prohibited-field rejection by the unchanged validator
- failed encoding with zero stored-record writes
- stable identity persistence/reuse after successful QR artifact creation
- production Sender click → QR artifact path
- production Receiver click → authorization → native start → active scanner → Back cleanup
- denied retry stability, Settings-style authorization change, and successful fresh restart
- native start failure with no false scanner state

### Full regression

- Full Node: `604/604 PASS`
- FAIL: 0
- SKIPPED: 0
- `git diff --check`: PASS

### Native sync and parity

Formal workflow:

1. `node scripts/build-native-web.mjs`
2. Capacitor iOS sync

For each of the following seven assets, source, `native-web`, and `ios/App/App/public` SHA-256 values are identical (`21/21` comparisons):

- `index.html`: `dd7096b9342571b41310fceb5db23d6403d22f07b70f8057f776bdb5778ad05a`
- `match-sharing-adapters-v1.js`: `f10ac88ee5ba7317b75b4ba5f11d654bb2547503c6b15df783e7be0cb8170ea5`
- `match-sharing-persistence-v1.js`: `d174bf09b853e985053d1c6a75fb96e8dba10b21087fb1f78ba10e1546d264d9`
- `match-sharing-sender-v1.js`: `55068b12a89ac580cbf5950e9540df8a028938c34e83cea2f3fee634f8a3077c`
- `match-sharing-receiver-v1.js`: `a308b1055a78a0548ca43d9354ed70711fc35275bf5b3fd667d6feaa0b4b43ae`
- `match-sharing-validation-v1.js`: `4399a8a63818ce2a687a78dc5fb2c157e2f239f71f2f44f36463cc75cace1aee`
- `match-sharing-format-v1.js`: `9026e21ff1d72932eb4f95d5fd93125d5e576762f6481fb3cff90e51741369f3`

The generated native directories remain repository-policy-excluded. The generated Swift package manifest was restored to the canonical relative dependency paths; no machine-specific dependency path is in the diff.

## Build and visual audit

Release Simulator Build:

- Target: `App`
- Configuration: `Release`
- SDK: `iphonesimulator27.0`
- Result: `BUILD SUCCEEDED`
- Runtime device: iPhone 16e equivalent, 390×844 points (`1170×2532` pixels at 3×)
- Cold launch/Home visual: PASS; no unintended layout change
- Local browser 390×844 runtime: 20-match History and Match Detail rendered successfully with the Build 84 cache/module set
- Sender QR and Receiver permission/scanner state transitions: verified by production-handler runtime tests; final camera/QR appearance remains pending Product Owner physical review

Device Release Build:

- Target: `App`
- Configuration: `Release`
- SDK: `iphoneos27.0`
- Result: `BUILD SUCCEEDED`
- Development Team: `U26DF88PRW`
- Signing: existing Automatic development signing
- Executable SHA-256: `1a8684ba5009adfda9cba53294e9af65b213f7d6fc7b065aa7d05316d1638ed8`
- App/dSYM UUID: `720A22DD-E855-3172-9944-D4E5391FF97B`
- `Package.resolved` SHA-256: `1e68bbcd65eea223108220becced97a2d9eb05c79aaaa88e6f879078b8a6a0aa`
- `.storekit` files in built app: 0

## Physical RC

Connected-device read-back before install:

| Use | Display name | Bundle ID | Version / Build |
|---|---|---|---|
| Production / TestFlight | CueScore Apps | `com.takaakimailboxstar.cuescoreapps` | `1.2 (83)` |
| Physical RC | CueScore RC 1.2 | `com.takaakimailboxstar.cuescoreapps.rc12` | `1.2 (82)` |
| Legacy Stage test | CueScore Stage5B | `com.takaakimailboxstar.cuescoreapps.stage5b` | `1.1 (79)` |

Only the Physical RC bundle was overwrite-installed. No uninstall was performed.

Final read-back:

- Display name: `CueScore RC 1.2`
- Bundle ID: `com.takaakimailboxstar.cuescoreapps.rc12`
- Version / Build: `1.2 (84)`
- Install: PASS
- Cold launch: PASS
- Running process: confirmed
- Production/TestFlight app remains `1.2 (83)`
- Stage/DEV app remains unchanged

Data-retention evidence:

- Full container aggregate changed from 88 entries / 1,040,383 bytes to 85 entries / 1,040,095 bytes because install/runtime housekeeping files are not stable indicators.
- The 66 WebKit/local-storage-related path-and-size metadata entries were byte-identical before and after overwrite.
- Pre/post metadata SHA-256: `d6b732c8ba8567689de91375b3475d1636dbc9ccc07b580d0502bfff7bcf8c54`
- No container deletion, data reset, LocalStorage edit, Player edit, or Match edit was performed.

## Changed files

Product/source identity:

- `index.html`
- `sw.js`
- `match-sharing-adapters-v1.js`
- `match-sharing-persistence-v1.js`
- `match-sharing-sender-v1.js`
- `match-sharing-receiver-v1.js`
- `ios/App/App.xcodeproj/project.pbxproj`

Tests:

- `tests/match-sharing-build84-fix.test.mjs` (new)
- `tests/match-sharing-stage2.test.mjs`
- `tests/match-sharing-stage4.test.mjs`
- `tests/match-sharing-stage5a.test.mjs`
- exact Build/cache identity expectations in existing regression tests

Evidence:

- this report

No Official 101/102 contract, validator privacy rule, saved-data schema, Player, Navigation, Analytics, Backup/Restore, Free/Pro, or Match Sharing mapping/import contract was changed.

## Source formalization update（2026-10-03）

- Product code: accepted source fixed in commit `8783c5e2ef4a73405ea6334c268422f6964fc920`
- Documentation / Evidence: maintained in the subsequent documentation commit
- External GitHub push: authorized by the Product Owner in the source-formalization gate
- iPhone: Physical RC only, overwrite-installed as `1.2 (84)`
- Build 84 Archive / IPA export: not performed
- Build 84 Upload / TestFlight: not performed
- Build 84 App Store Connect linkage: not performed
- App Review resubmission: not performed
- Release: not performed
- Product Owner physical verification: ALL PASS（Sender／Receiver／Single QR／re-share／Native Scanner／permission recovery）
