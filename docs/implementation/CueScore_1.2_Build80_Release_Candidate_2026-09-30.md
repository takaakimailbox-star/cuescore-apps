# CueScore Apps 1.2 (80) Release Candidate Evidence

> 2026-09-30 RC smoke addendum: duplicate integrity was PASS, but duplicate detection reached the user only after mapping and appeared as a generic transaction error. The scoped correction and retest evidence are tracked in `CueScore_1.2_Build80_RC_Early_Duplicate_UX_Fix_2026-09-30.md`; the original RC evidence below remains historical.

- Date: 2026-09-30
- Repository: `takaakimailbox-star/cuescore-apps`
- Baseline / GitHub `main`: `88f0eda30eb3b1437e6c24401e9bbd922d19d969`
- Gate: `READY FOR PRODUCT OWNER 1.2 (80) RELEASE CANDIDATE SMOKE TEST`
- Public release retained: Version `1.1`, Build `79`

## Candidate identity

- Product Marketing Version: `1.2`
- Product Build: `80`
- Product Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Physical RC display name: `CueScore RC 1.2`
- Physical RC temporary Bundle ID: `com.takaakimailboxstar.cuescoreapps.rc12`
- Physical target: Product Owner physical iPhone 16e

The temporary RC identity is artifact-only. It keeps the public `CueScore Apps` container and data separate while exercising the same candidate source and bundled web assets. The repository product Bundle ID remains unchanged.

## Version / Build changes

- Xcode Debug and Release settings: `MARKETING_VERSION 1.1 → 1.2`; `CURRENT_PROJECT_VERSION 79 → 80`.
- Visible/canonical app version metadata in `index.html`: `1.0 → 1.2`.
- Version identity assertions updated to `1.2 (80)`.
- No Match Sharing behavior, scoring rule, storage schema, Backup / Restore, IAP, dependency, or product feature change was introduced in this Gate.

## Regression evidence

| Gate | Result |
|---|---:|
| Match Sharing Stage 1–5B focused | `99 PASS / 0 FAIL / 0 SKIPPED` |
| Full Node regression | `557 PASS / 0 FAIL / 0 SKIPPED` |
| Capacity fixtures | `18/18 PASS` |
| ECC-M theoretical fit | `18/18`, QR Version `19–30` |
| Source → native-web parity | PASS |
| Source → iOS public parity | PASS |
| `git diff --check` | PASS |

An initial native parity run found one stale copied `ios/App/App/public/index.html` after the visible version metadata changed. `native:sync` regenerated the bundle, byte parity was read back, and both the dedicated native test and full Node suite then passed. This was a generated-asset sequencing issue, not a product behavior failure.

## Release Simulator Build

- Configuration: `Release`
- SDK: `iphonesimulator27.0`
- Result: PASS
- App Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Version / Build: `1.2 (80)`
- `.storekit`: `0`
- Camera usage description: present
- `capacitor-swift-pm`: `8.0.2`
- `ion-ios-filesystem`: `1.1.2`
- Executable SHA-256: `ab2dd6e677665fe87534fee0f96c206d2ebfd3b0fb64b15ba6dead215f738865`
- Bundled `public/index.html` SHA-256: `cb240af6acb5d37225e4229afc164b01b12132e7b47b5c96a192e9e3abb7bb20`
- Source / native-web / built asset identity: PASS

## Physical RC Build / install

- Configuration: signed Debug device build for smoke testing
- Result: BUILD PASS / INSTALL PASS
- Display name: `CueScore RC 1.2`
- Temporary Bundle ID: `com.takaakimailboxstar.cuescoreapps.rc12`
- Version / Build: `1.2 (80)`
- `.storekit`: `0`
- Camera usage description: present
- Signature: Apple Development / Team `U26DF88PRW`
- Executable SHA-256 after final artifact signing: `a3651797b06f28c76b8b4146692114491e67dedbbf71f7852307a0cf0153a336`
- Bundled `public/index.html` SHA-256: `cb240af6acb5d37225e4229afc164b01b12132e7b47b5c96a192e9e3abb7bb20`
- Source / physical RC asset identity: PASS

Installed-app read-back on the physical iPhone:

- `CueScore Apps` — `com.takaakimailboxstar.cuescoreapps` — `1.1 (79)`
- `CueScore RC 1.2` — `com.takaakimailboxstar.cuescoreapps.rc12` — `1.2 (80)`

The RC did not overwrite or migrate the public app container. The existing `CueScore Stage5B` diagnostic app also remains installed; removing it was outside this Gate.

## Product Owner smoke test — NOT VERIFIED

Open **CueScore RC 1.2**, not the public **CueScore Apps** app.

1. Cold launch; Home is shown and Settings displays Version `1.2`.
2. Create/use isolated RC Players and one completed Match; verify History and normal Match Detail.
3. From a completed Match, open `共有` and verify the Single QR screen.
4. From History, open `受け取る`; verify Camera preview and scan a safe CueScore test QR.
5. Complete symmetric Player 1 / Player 2 mapping, final confirmation, Import, success feedback, and normal Match Detail.
6. Scan the same QR again; verify duplicate protection, then choose `他の試合を読み取る` and confirm Camera restarts and can read another QR.

PASS requires no crash, stuck camera, wrong Player mapping, partial Import, or public-app data change. Physical smoke status remains `NOT VERIFIED — PRODUCT OWNER PHYSICAL IPHONE TEST REQUIRED` until reported by the Product Owner.

## Boundary / STOP

- Commit: NOT PERFORMED
- Push: NOT PERFORMED
- Archive: NOT STARTED
- Upload: NOT STARTED
- TestFlight: NOT STARTED
- App Store Connect: NOT TOUCHED
- Release: NOT STARTED

Stop at the Product Owner physical RC smoke-test Gate.
