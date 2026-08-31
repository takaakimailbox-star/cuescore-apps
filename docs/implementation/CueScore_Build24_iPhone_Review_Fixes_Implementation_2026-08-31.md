# CueScore Build 24 iPhone Review Fixes — Implementation Report

- Date: 2026-08-31
- Version: 1.0
- Build: 24
- Source request: `CueScore_Build23_iPhone_Review_Fixes_Request_2026-08-31.md`

## Implemented

- Removed recent matches from Home and moved New Match into the thumb-reachable center/lower-center zone.
- Added the explicit six-discipline step before existing match setup.
- Replaced Player Hub dropdown with a six-item horizontal selector while retaining per-Player runtime state.
- Replaced the ambiguous Settings dot with a person-and-gear icon.
- Routed Settings Player cards directly to the existing editor while preserving Player-tab browsing.
- Moved the global History discipline icon immediately before Race to.

## Verification

- Focused tests for each change passed.
- Complete automated suite: 285 pass / 0 fail / 0 skipped.
- 390×844 in-app Browser: Home, six-discipline selection, 14-1 setup, Player Hub selector, Settings direct editor route, and History layout verified.
- Native source, generated bundle, and Xcode copied assets synchronized.
- Simulator Debug and Release: `BUILD SUCCEEDED`.
- Signed Release Archive: `/private/tmp/CueScore-Build24.xcarchive` (`ARCHIVE SUCCEEDED`).
- Normal App Store Connect distribution upload (not Internal Testing Only): `Upload succeeded` / `EXPORT SUCCEEDED` at 2026-08-31 10:58 JST.
- App Store Connect processing: completed.
- Export compliance: saved with the existing formal answer `上記のアルゴリズムのどれでもない`.
- Internal TestFlight: included in `CueScore Internal Testers` (1 tester), status `提出準備完了`; available for physical-iPhone verification.
- Version 1.0: replaced Build 23 association with Build 24 and saved. Existing metadata, screenshots, review contact, and manual-release setting were preserved.
- Stopped with `審査用に追加` enabled. The button was not selected and App Review was not submitted.

## Preserved contracts

No changes to scoring, winner calculation, Player ID / Match ID, saved-data schema, Race to persistence, Backup / Restore, analytics formulas, aggregate SSOT, discipline rules, Break Input, 14-1 rerack, Practice, monetization, or cloud sync.

App Review was not submitted and `審査用に追加` was not selected.
