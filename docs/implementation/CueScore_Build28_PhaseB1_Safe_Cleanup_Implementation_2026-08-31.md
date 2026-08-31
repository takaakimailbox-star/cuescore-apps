# CueScore Build 28 — Phase B-1 Safe Cleanup Implementation

- Date: 2026-08-31
- Version: 1.0
- Build: 28
- Scope: Phase B-1 Safe Cleanup only

## Implemented

- Removed the hidden legacy Home dashboard markup. Its legacy renderer now exits before record/player reads and before installing `pageshow`, `storage`, or selector handlers because the required surface no longer exists.
- Removed declaration-only legacy Home routes: New Game, Player Management, Records, Settings, and legacy Rankings.
- Stopped deferred Cloud Sync at the start of its runtime initializer when the v1 release profile reports `cloudSync:false`. No cloud-state initialization, cloud event handlers, or network client setup occurs in v1.
- Removed the production CSV click entry point while retaining the deferred implementation for a later module extraction. `csvExport:false` and hidden UI remain the release contract.
- Removed the superseded bubble-phase Player Library list, Back, and Add handlers. The current capture-phase owner remains the single handler for each control.
- Updated the PWA/native cache version and iOS build number for Build 28.

## Preserved contracts

No changes were made to scoring, winner determination, Race to, JPA, Break Input, 14-1 rerack, Player ID, Match ID, saved-data schema, Backup/Restore, analytics formulas, aggregate SSOT, History, or active-match recovery.

## Automated verification

- Full suite: 294 pass / 0 fail / 0 skipped.
- Native source and generated/copy bundle equality: PASS.
- Simulator Debug: BUILD SUCCEEDED.
- Simulator Release: BUILD SUCCEEDED.

## 390×844 measurements

Three click-settlement samples after cleanup:

- Player: 289 / 298 / 283 ms
- History: 282 / 285 / 282 ms
- Settings: 282 / 284 / 284 ms
- New Match: 3072 / 3068 / 3068 ms

Phase A/Build 27 comparison:

- Player: 284 / 297 / 299 ms
- History: 299 / 299 / 299 ms
- Settings: 300 / 284 / 300 ms
- New Match: 3057 / 3063 / 3067 ms

The normal-navigation differences are within browser automation variation. New Match remains dominated by the automation action-settling delay and is not a visible-paint measurement.

## 9-Ball selector follow-up

Three post-cleanup samples, with `aria-selected=true` confirmed after every click:

- 9-Ball: 306 / 305 / 294 ms
- 10-Ball: 306 / 297 / 299 ms
- Rotation: 306 / 299 / 299 ms
- 14-1: 301 / 299 / 301 ms
- JPA 9-Ball: 299 / 300 / 302 ms
- 3 Cushion: 299 / 301 / 300 ms

No uniquely slow or non-responsive 9-Ball path was reproduced at 390×844. This does not close the reported physical-iPhone issue; Build 28 is intended for that independent device confirmation.

## Distribution boundary

Build 28 is intended for Internal TestFlight physical-iPhone confirmation. App Review, Add for Review, External TestFlight, and public release remain out of scope.
