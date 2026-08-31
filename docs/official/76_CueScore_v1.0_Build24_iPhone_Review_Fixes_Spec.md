# CueScore v1.0 Build 24 iPhone Review Fixes Specification

- Status: Official RC addendum
- Date: 2026-08-31
- Decision: Official 075

## Home and New Match

- With no active match: branding, then `新しい試合` near the vertical center or slightly below.
- With an active match: branding, resume, then `新しい試合` with safe separation from bottom navigation.
- Home does not render recent saved matches.
- `新しい試合` opens a six-item discipline selection page. Selecting 9-Ball, 10-Ball, Rotation, 14-1, JPA 9-Ball, or 3 Cushion opens the existing setup for that discipline.

## Player Hub and Settings

- Player Hub renders six icon-and-label buttons in a horizontally scrollable tablist.
- The selected discipline is visually distinct. Discipline and Hub-tab runtime state remain independent per Player.
- Settings Player Management uses a monochrome person-and-gear line icon.
- A Player card opened from Settings calls the existing Player Editor directly. A Player card opened from the Player tab calls Player Hub.

## History

- The top-right metadata lane is `[discipline icon] Race to …` followed by the chevron.
- Date and both Player lanes remain on the left; score, sorting, grouping, Match ID, and shared Match Detail behavior remain unchanged.

## Acceptance

- Complete automated suite: 0 fail / 0 skipped.
- 390×844: no horizontal overflow, all six disciplines visible by scrolling, no bottom-navigation collision.
- Source, native-web, and Xcode copied assets are byte-identical.
- Simulator Debug and Release both succeed.
- Version 1.0 / Build 24 may be archived and uploaded for Internal TestFlight only; App Review is not submitted.

