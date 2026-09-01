# CueScore Build 31 Final Review UI / Navigation Implementation

- Date: 2026-09-01
- Version: 1.0
- Build: 31
- Base GitHub main: `33ddf5d22fd57203e5692bb83d242091b0626b0c`
- Official: 083 / 084

## Scope

This stabilization batch implements the Product Owner-adopted Home, Player, Player Hub, Settings, and navigation changes from the Build 30 physical-iPhone final review. It adds no scoring feature and changes no saved-data contract.

## Navigation Root Cause and Fix

The shared Bottom Navigation changed its active indicator and invoked a destination opener, but it did not have a single source-of-truth close for `settings-mode`, `records-mode`, and Player journey overlays. Legacy destination cleanup could also re-expose a previously closed Settings DOM after the destination opened. The result was a valid History active state and `records-mode` with Settings content still visible. The same missing source close left Player detail and opponent overlays able to intercept or survive top-level navigation.

The Phase 1 shell now:

1. snapshots the current stable runtime context;
2. closes Match Detail and the source top-level mode;
3. opens the requested destination;
4. explicitly hides every non-destination top-level root and journey overlay;
5. synchronizes `settings-mode`, `records-mode`, and the active tab.

Retap still opens the selected root. Cross-tab return restores the prior Player/History DOM context and meaningful scroll state where stable. Existing Player journey and shared Match Detail Back owners remain unchanged.

## UI Changes

- Home logo visual height is 42px and its header spacing is reduced upward.
- `新しい試合` is placed lower in the one-handed reach region without overlapping Bottom Navigation.
- Home icon is a monochrome three-dot cue-ball SVG.
- Player root removes the avatar pin and uses the name-adjacent neutral primary badge.
- Player Hub renders six icon-only discipline tabs in one row with accessible labels.
- Settings root Back is removed and its header, data rows, footer, and legal rows are compacted for 390×844 without deleting content.

## Protected Contracts

No change was made to scoring, winner, Race to, JPA, Break Input, 14-1, Undo, GameSet, active-match recovery, IDs, saved-data schema, Backup / Restore data, analytics formulas, aggregate SSOT, History record interpretation, or Match Detail calculations.

The Build 30 interactive-control edge exclusion remains present. Non-editable text selection suppression and editable caret/selection behavior remain present.

## Verification

- Automated: `303 pass / 0 fail / 0 skipped` after Build-number/document finalization.
- 390×844 browser: horizontal overflow 0; console/runtime errors 0.
- Settings root: `scrollHeight == clientHeight`; all data/legal entries visible; Back control count 0.
- Settings → History: Settings hidden, History visible, `records-mode`, active History.
- Player detail → Home: detail and root hidden, Home visible, active Home.
- Cross-tab return to Player restores the prior detail; active Player retap returns to Player root.
- Opponent journey → Home closes all Player journey overlays.
- Player Hub selector: six icon-only tabs, one row, overflow 0.
- Native source/generated/copied parity: PASS after Capacitor copy.
- Simulator Debug: `BUILD SUCCEEDED`.
- Simulator Release: `BUILD SUCCEEDED`.

## Archive and Internal TestFlight

- Source/archive commit: `59bc1b68bd8a2a65e2a33cd2d9c5fed35ea8c29a`.
- Signed archive: `/private/tmp/CueScore-Build31.xcarchive`; archive succeeded.
- Normal App Store Connect export/upload succeeded; Apple processing reached `VALID`.
- Existing export-compliance answer is recorded as `usesNonExemptEncryption=false`.
- `CueScore Internal Testers` is an internal group with all-build access, so Build 31 is automatically available to that group.
- Version 1.0 remains `PREPARE_FOR_SUBMISSION`; Build 31 is not its App Store review build.

## Pending Physical iPhone

The Internal TestFlight Build 31 candidate must be checked on a physical iPhone for P0/P1, all four top-level tabs, Player/Opponent/Match Detail Back contexts, retap/restore, New Match thumb reach, intended edge Swipe Back, and editable/non-editable text behavior. These items are not marked PASS until that check occurs.

## Distribution Boundary

Internal TestFlight only. App Review, `審査用に追加`, External TestFlight, and public release were not performed.
