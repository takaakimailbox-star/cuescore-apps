# CueScore Build 30 — Physical-iPhone 9-Ball Edge-Gesture Fix

- Date: 2026-09-01
- Version: 1.0
- Build: 30

## Scope

This follow-up changes only the physical-iPhone 9-Ball selector defect. It does not change scoring, winner determination, Race to, JPA, Break Input, 14-1 rerack, Player ID / Match ID, saved-data schema, Backup / Restore, analytics formulas, aggregate SSOT, history, or active-match recovery.

## Physical-device root cause

Build 29 was reproduced on an iPhone 16e running iOS 26.6.1 with Safari Web Inspector attached to a local diagnostic Release build. The ordered trace stopped after trusted `pointerdown`, `touchstart`, `pointerup`, and `touchend`; WebKit never generated `click`, so the discipline handler, state update, localStorage write, render, and UI paint never started.

The 9-Ball selector occupied x=16–70.671875 px while the common edge-Back gesture began for touches at x<=64 px. The edge gesture immediately added `cue-edge-back-tracking-v3`, whose CSS sets `.app` to `pointer-events:none`. A normal tap in most of the first 9-Ball button therefore removed its own hit target before WebKit synthesized `click`. Other disciplines did not overlap the left-edge range.

## Fix

Edge-Back tracking no longer starts when the initial touch target is an interactive control: button, link, input, textarea, select, summary, contenteditable, `role=button`, or `role=tab`. Edge swipe remains available from non-interactive left-edge space. No selector state, persistence, rendering, scoring, or recovery code changed.

The diagnostic-only `ios.webContentsDebuggingEnabled=true` setting was used only in a local signed Release and was removed when the normal App Store bundle was regenerated.

## Verification

- Physical iPhone before: trusted touch events arrived, but no click or handler stage appeared; selection remained unchanged beyond 30 seconds.
- Physical iPhone after: trusted click arrived; handler/state/localStorage/render completed in 1 ms and selected UI paint completed in approximately 25 ms. The Product Owner reported immediate response.
- Physical iPhone P1: ordinary non-editable text did not expose selection, Copy, or Look Up actions; Player registration/edit fields retained cursor placement and text selection.
- Full automated test: 297 pass / 0 fail / 0 skipped.
- Native source/generated/copied `index.html` SHA-256: `4482319d4c2f9a250bb98808c5c4009188256bd2d0769a1600c894eafb37a117`.
- 390x844: six disciplines, 9-Ball selected, horizontal overflow 0, console errors 0.
- Simulator Debug: BUILD SUCCEEDED.
- Simulator Release: BUILD SUCCEEDED.

## Distribution guardrails

Build 30 is for Internal TestFlight confirmation only. App Review, `審査用に追加`, External TestFlight, and public release must remain untouched.
