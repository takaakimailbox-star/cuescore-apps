# CueScore v1.0 Build 26 UI / Performance Specification

Date: 2026-08-31  
Version: 1.0 / Build 26

## UI contract

- New Match opens the existing full-screen setup directly.
- The selector retains all six disciplines, existing icons/colors, tap selection, selection state, horizontal safety, and auxiliary adjacent swipe.
- Selector labels are visually hidden; the selected discipline summary below remains visible.
- The outer setup container has no modal border, radius, shadow, or card background. Inner player/rule/start structures remain.
- Player Management title is explicit, rows use a pencil affordance, and add copy is `プレーヤー追加`.
- Player browsing and management routing remain separate.

## Performance contract

- History root performs one initial render and does not re-click the already-selected `all` discipline.
- One `readMatchRecords()` result is shared by category, season, and filtered-list work within a History render.
- Phase 1 and Player-root broad observers coalesce reconciliation to at most one pending animation frame.
- History ordering, filtering, detail routing, state restoration, and saved results remain correct.

## Verification

- Automated suite: 288 pass, 0 fail, 0 skipped.
- 390×844: no horizontal overflow; six icons and selected state visible; management pencil affordance visible.
- Same-method Home→History measurements: 1180/1178ms before, 283/282ms after.
- iOS Simulator Debug and Release: BUILD SUCCEEDED.
- Signed App Store Connect archive/upload, processing, export compliance, and existing Internal TestFlight group required.

App Review, External TestFlight, and release are out of scope.
