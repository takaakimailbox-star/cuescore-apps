# Cloud work: Player tab stale selection (Build 97 candidate source) — 2026-11-01
Base: main 7d2074f. Branch: cloud/tab-selection-fix-build97. Fix commit: eb15ef1 (local only, NOT pushed).
Changed: navigation-shell-phase1.js (+2 lines in reconcile()); new tests/player-select-tab-state.test.mjs, tests/browser/player-select-tab-state.mjs; baseline fixture entry.
Evidence: player-select-tab-state-{ja,en,zh-Hans}.json 720/720 (4 widths x 6 disciplines); history-tab-from-setup 360/360; setup-card-layout 1512/1512; numeric-input-focus-ring 8/8; home-tab-exits, player-hub-tab-hit-area, match-setup-ux-func PASS; Node 1247/1250.
Node non-PASS (same on unmodified main): 607/608 need ios/App/App/public from `cap sync` (6/6 PASS when mirrored from native-web); 846 reporter-format check (child 13/13 PASS).
Cloud browser: Chromium needs --no-sandbox as root (wrapper script, env-only; not a product issue).
NOT done: build number 97, Archive, Export, ASC upload, TestFlight, push/PR/merge. iPhone device NOT VERIFIED.
Archive preconditions (Mac, separate Gate): approve Git handoff of eb15ef1; set Build 97 (index.html/sw.js/pbxproj); npm run native:sync; Xcode 27.1 Archive; signing stays on Mac.
