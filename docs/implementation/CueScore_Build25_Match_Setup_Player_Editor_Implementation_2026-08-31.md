# CueScore Build 25 Match Setup / Player Editor — Implementation Report

- Date: 2026-08-31
- Version: 1.0
- Build: 25
- Source request: `CueScore_Build24_iPhone_Review_Fixes_Request_2026-08-31.md`
- Official: 077 / 078

## Implemented

- Removed the dedicated discipline-selection screen and routed New Match directly to the existing setup.
- Integrated the existing six official discipline icons and labels at the top of setup with tap selection, explicit selected state, horizontal scrolling, and one-neighbor horizontal swipe.
- Preserved the Build 24 Home placement and kept recent matches absent.
- Converted Player Registration and Edit from modal cards to a shared 390×844 full-screen layout with common Back, mode-specific title / CTA, and Edit-only delete.
- Removed initial input autofocus; the non-input editor container receives focus until a field is tapped.
- Updated the PWA/native cache version and iOS build number to Version 1.0 / Build 25.

## Verification

- Complete automated suite: 286 pass / 0 fail / 0 skipped.
- 390×844 in-app Browser: direct setup, all six tap switches, selected state, document width 390 / overflow 0, Registration and Edit at 390×844, initial input focus absent, field-tap focus, Edit Back, and console error 0 verified.
- Swipe event contract is covered by automated regression checks; final physical-touch confirmation is assigned to Product Owner Internal TestFlight review.
- Native source, generated bundle, and Xcode copied assets synchronized.
- Simulator Debug and Release: `BUILD SUCCEEDED`.

## Distribution

- Signed Release Archive: `/private/tmp/CueScore-Build25.xcarchive` (`ARCHIVE SUCCEEDED`).
- Normal App Store Connect distribution upload (not Internal Testing Only): `Upload succeeded` / `EXPORT SUCCEEDED` at 2026-08-31 14:35 JST.
- App Store Connect processing: completed (`終了`).
- Export compliance: saved with the existing formal answer `上記のアルゴリズムのどれでもない`.
- Internal TestFlight: included in `CueScore Internal Testers` (1 tester), status `提出準備完了`; available for physical-iPhone verification.
- Version 1.0 remains associated with Build 24; this Internal TestFlight review request did not authorize replacing it with Build 25.

## Preserved contracts

No changes to scoring, winner calculation, Break logic, Player ID / Match ID, saved-data schema, Backup / Restore schema, analytics formulas, aggregate SSOT, Race to semantics, 14-1 rerack, 3 Cushion scoring, JPA 9-Ball scoring, Match Result / Detail calculations, cloud sync, or App Store metadata.

App Review, `審査用に追加`, External TestFlight, and general release are not performed.
