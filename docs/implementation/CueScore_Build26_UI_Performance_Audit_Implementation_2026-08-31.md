# CueScore Build 26 UI / Performance Audit — Implementation Report

Date: 2026-08-31

## Outcome

Version 1.0 / Build 26 implements the adopted New Match and Player Management finish and a minimal, measured navigation performance correction. It is available to `CueScore Internal Testers` for physical-iPhone review. App Review was not submitted.

## Root cause and correction

1. `navigation-shell-phase1.js` opened History through the existing Records button, which already resets and renders, then re-clicked the `all` filter and rendered the full list again. The duplicate click was removed; restore re-clicks only a non-`all` saved filter.
2. `renderMatchRecords()` independently read and parsed match records for historic categories, seasons, and filtering. It now shares one source array for those steps.
3. Phase 1 and Player-root MutationObservers watched broad body changes and could run repeated reconciliation during one visual update. Both now queue at most one reconciliation per animation frame.

## Measurements

In-app browser, 390×844, same semantic click measurement, two repetitions:

| Journey | Before | After |
| --- | ---: | ---: |
| Home → Player | 295 / 285 ms | 282 / 301 ms |
| Home → History | 1180 / 1178 ms | 283 / 282 ms |
| Home → Settings | 289 / 287 ms | 284 / 300 ms |
| Home → New Match | 3060 / 3060 ms | 3073 / 3071 ms |

The New Match click completion value contains the automation action-settling wait and could not be separated from visible paint with the available read-only page instrumentation. The screen visually appears before that completion; physical-iPhone perception remains the final review item.

## Files

- `index.html`
- `navigation-phase2-6.css`
- `navigation-phase2-6.js`
- `navigation-shell-phase1.js`
- `sw.js`
- `ios/App/App.xcodeproj/project.pbxproj`
- navigation, cache-version, and native foundation tests
- generated `native-web` and iOS copied public assets

## Verification and distribution

- Automated: 288 pass / 0 fail / 0 skipped.
- Responsive: 390×844, no horizontal overflow, six icon-only disciplines, retained selected summary, outer-card removal, subdued Back, management title/edit affordance.
- iOS Simulator Debug and Release: BUILD SUCCEEDED.
- Archive: `/private/tmp/CueScore-Build26.xcarchive`, ARCHIVE SUCCEEDED.
- App Store Connect validation/upload: Upload succeeded / EXPORT SUCCEEDED at 17:08 JST.
- Apple processing: `終了`.
- Export compliance: `上記のアルゴリズムのどれでもない`.
- Internal group: `CueScore Internal Testers`, 1 tester, Build 26 `提出準備完了`.
- Version 1.0 remains associated with Build 24. `審査用に追加` was not pressed.

## Deferred / residual risk

- Product Owner physical-iPhone review of perceived New Match responsiveness and real-finger swipe.
- Any deeper analytics caching or architectural navigation rewrite is deferred because the measured duplicate History work was resolved without changing correctness contracts.
- App Review, External TestFlight, and release remain deferred.
