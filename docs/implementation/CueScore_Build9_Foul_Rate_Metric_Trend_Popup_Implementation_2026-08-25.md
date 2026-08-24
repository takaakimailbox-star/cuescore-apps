# CueScore Build 9 — Foul Rate / Metric Trend Popup Implementation

Date: 2026-08-25

## Start gate

- Branch: `main`
- Start local HEAD and `origin/main`: `dddba7e58ed63524aa41b79da6c4068e3ae56381`
- Worktree was clean at start.
- Build 8 was already distributed to TestFlight Internal Only; this follow-up therefore uses Marketing Version 1.0 / Build Number 9.
- Authority reviewed: `docs/CURRENT_STATE.md`, Official 028–039, current metric/event contracts, and the Product Owner decisions adopted 2026-08-24.

## Implemented

- Replaced average fouls per rack with the official rack-level foul rate for five disciplines; 3 Cushion remains excluded.
- Added explicit completed-rack, actual-participation, and per-rack foul evidence rules. Incomplete and indeterminate history stays ineligible (`—`).
- Removed the standalone trend card. 勝率 and each supported major metric now open a direct bottom-sheet trend modal and preserve Player/discipline context.
- Applied one-decimal rate display and two-decimal foul-rate display.
- Updated PWA/native asset manifests and synchronized source, generated native bundle, and Xcode-copied assets.

## Verification

- Required foul-rate cases cover 3/8 = 37.50%, 2/5 = 40.00%, duplicate fouls in one rack, opponent break-and-run exclusion, target break-foul inclusion, no-foul participation, incomplete rack, indeterminate history, discipline boundaries, and 3 Cushion absence.
- Automated suite: `216 pass / 0 fail / 0 skipped`.
- iOS Simulator Debug: `BUILD SUCCEEDED`.
- iOS Simulator Release: `BUILD SUCCEEDED`.
- 390×844 browser review: no horizontal overflow; standalone trend card absent; direct ファール率 modal opened with the correct title; closing returned to the same Rotation detail context.
- Physical iPhone/TestFlight Build 9 review is pending and is not marked PASS.

## Distribution boundary

No Archive, Validate, TestFlight upload, external testing, App Review submission, or public release was performed in this change.
