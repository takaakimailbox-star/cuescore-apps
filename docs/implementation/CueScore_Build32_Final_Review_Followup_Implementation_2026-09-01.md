# CueScore Build 32 Final Review Follow-up Implementation

- Date: 2026-09-01
- Version / Build: 1.0 / 32
- Base main: `26642cb408fdbe42efa2a7b3fa1ab6d978c47741`
- Official: 085 / 086

## Implemented

- Lowered the 42px Home logo by 30px while compensating the surrounding flow so New Match remains at its Build 31 position.
- Refined the Home navigation SVG with a 5.5-unit outline and three perspective-oriented ellipses.
- Added a 30px New Match main-area top inset. The Back control, selector, selected discipline, matchup cards, and controls move together.
- Fixed Player journey Back hit testing. Root cause: Phase 1 top-level navigation correctly set transient Player overlays to `aria-hidden=true`, but the journey-local `show()` only removed `.hidden`. The visible overlay therefore retained the global `[aria-hidden=true]` pointer-input suppression. `show()` and `hide()` now synchronize both states.
- Bumped the PWA/app-shell version so installed clients receive the changed layout and SVG assets.

## Verification

- 390×844: Home logo top 56px (Build 31: 26px); New Match top unchanged at 414.7px; Bottom Navigation top unchanged at 776px; horizontal overflow 0.
- New Match: top Back and the content block move 30px downward; six selectors stay one row; horizontal overflow 0.
- Player 9-Ball all-matches overlay: visible state reports `aria-hidden=false`, `pointer-events:auto`, and Back hit-test reaches the button. One tap returns to the same Player Hub `試合` tab.
- Opponent and Match Detail paths retain their existing context-aware owners; all disciplines share the corrected journey visibility primitive.
- Automated: `308 pass / 0 fail / 0 skipped`.
- Source/generated/copied native asset parity: PASS.
- Simulator Debug and Release: `BUILD SUCCEEDED`.

## Boundary

## Internal TestFlight

- Source/archive commit: `fe9e8571d43dccea9378df13a4ba79f363a4ec73`.
- Signed archive: `/private/tmp/CueScore-Build32.xcarchive`; archive succeeded.
- Normal App Store Connect upload succeeded; Apple processing reached `VALID`.
- Existing export-compliance answer is recorded as `usesNonExemptEncryption=false`.
- `CueScore Internal Testers` is internal with all-build access, so Build 32 is automatically available to the group.
- Version 1.0 remains `PREPARE_FOR_SUBMISSION`; Build 32 is not linked as its App Store review build.

Physical-iPhone confirmation remains required. App Review, review-build attachment, External TestFlight, and public release were not performed.
