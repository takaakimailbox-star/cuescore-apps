# CueScore v1.0 Build 31 Final Review UI / Navigation Decision

- Date: 2026-09-01
- Status: Official Decision
- Approval: Product Owner adopted
- Supersedes: conflicting presentation details only in Official 067/068/073/074

## Decision

Build 31 adopts the final physical-iPhone review changes for Home, Player, Player Hub, Settings, and the shared four-tab navigation shell. This is a stabilization batch for Version 1.0, not a feature expansion.

- Home enlarges and raises the CueScore brand, moves `新しい試合` into an easier thumb-reach region, and uses a monochrome three-dot cue-ball line icon for the Home tab. The logo is not a hidden Home button.
- Player root removes the avatar-overlaid blue primary pin and shows a compact `メインプレーヤー` badge beside the name only for the primary Player.
- Player Hub uses the same six discipline icon semantics as New Match and removes visible discipline text from the selector while retaining accessible names and selected state.
- Bottom Navigation always closes the previous top-level mode before opening the selected destination, then enforces destination/content/active-state agreement.
- Cross-tab return restores the previous runtime Player and History context where stable. Retapping the active tab returns to that area root.
- Settings root has no Back button and safely fits its data and legal entries within a 390×844 portrait screen without reducing action-row targets below the adopted compact size.

## Protected Contracts

Scoring, winner determination, Race to, JPA Skill Level, Break Input, 14-1 rerack, Undo, GameSet, active-match recovery, Player ID / Match ID, saved-data schema, Backup / Restore, analytics formulas and aggregate SSOT, History, and Match Detail correctness do not change.

Build 30 interactive-target edge-back exclusion and non-editable text selection suppression remain required. Editable fields retain caret, selection, Copy, and Paste.

## Distribution Boundary

Internal TestFlight distribution is allowed after automated, 390×844, native parity, and Simulator gates pass. External TestFlight, App Review, `審査用に追加`, and public release remain prohibited without separate approval.
