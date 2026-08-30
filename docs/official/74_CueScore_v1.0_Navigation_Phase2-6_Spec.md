# CueScore v1.0 Navigation Phase 2–6 Specification

- Status: Official Release
- Published: 2026-08-30
- Applies to: Version 1.0 post-Build 22 candidate

## Player Hub

- Header: avatar, name, main-player badge when applicable.
- Context: exactly one native discipline selector covering the six supported disciplines.
- Tabs: exactly `成績`, `試合`, `分析`; initial state is `9-Ball / 成績` for each player.
- Runtime selection and tab state are retained independently per player and are not persisted to the saved-data schema.
- `成績` shows existing aggregate results and clickable personal bests.
- `試合` shows the latest three matches and routes to the shared Match Detail, full player history, and opponent records.
- `分析` consumes the existing Build 4 aggregate SSOT and existing trend, detailed-analysis, and opponent-analysis journeys.

## Navigation ownership

- Player root is for viewing. Add/register/edit/delete controls are absent.
- Settings owns Player management and Data management.
- Home contains only resume when applicable, `新しい試合`, and up to three recent saved matches.
- The bottom navigation remains Home / Player / History / Settings.

## Compatibility and acceptance

- No scoring, match result, saved-data schema, analytics formula, backup/restore, cloud, or telemetry contract changes.
- Existing records open through the shared Match Detail renderer.
- Layout must not create horizontal overflow at 390 × 844.
- Debug and Release Simulator builds, native-web parity, offline shell inclusion, and the complete automated test suite must pass.
- Distribution may proceed to internal TestFlight, but `審査用に追加` and App Review submission are prohibited until separately authorized.

