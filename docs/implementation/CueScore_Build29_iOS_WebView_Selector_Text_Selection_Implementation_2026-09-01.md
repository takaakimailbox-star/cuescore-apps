# CueScore Build 29 — iOS WebView Selector / Text Selection Follow-up

- Date: 2026-09-01
- Version: 1.0
- Build: 29
- Source/archive commit: `0ae5739`

## Scope

Only the Build 28 physical-iPhone findings were addressed: the 9-Ball selector delay and global text selection/callout. No cleanup, unrelated UI, feature, scoring, saved-data schema, analytics, or App Store metadata change was made.

## P0 9-Ball selector

The physical-iPhone symptom remains open until Build 29 is measured on that device. Static path inspection found overlapping selector ownership: preference state/render, active-match guard, setup opening, and Phase 2–6 swipe/click assistance. The Phase 2–6 capture listener synchronously requested smooth centering during click dispatch, while compatibility mouse handlers duplicated pointer handling on iOS.

Build 29 removes the compatibility mouse pair and changes selector tap scrolling to a post-dispatch animation-frame adjustment, only when the selected button is outside the visible container, using non-animated nearest alignment.

In-memory/console instrumentation records:

- touchstart / touchend
- pointerdown / pointerup
- click capture
- handler start
- discipline state update
- state restoration skipped (the selector path has no restoration call)
- active-match snapshot read or active-setup skip
- localStorage completion and duration
- render completion and duration
- UI paint and selected/aria-selected result
- optional scroll adjustment completion

Instrumentation does not create a localStorage key and does not change the saved-data schema. Because the registered iPhone was offline during implementation, the 30-second physical-device stall has not yet been re-measured. Build 29 must not be described as fixing P0 until that confirmation and trace review pass.

## P1 global text selection

Non-editable UI now uses `user-select:none`, `-webkit-user-select:none`, and `-webkit-touch-callout:none`. Capture-phase `selectstart` and `contextmenu` are also prevented outside editable targets. `input`, `textarea`, and supported `contenteditable` targets explicitly retain text selection and native callout behavior.

The automated contract passes. Physical-iPhone long-press behavior remains a Build 29 confirmation gate.

## Verification and distribution

- Full automated test: 297 pass / 0 fail / 0 skipped.
- Native generated/copied asset equality: PASS.
- Simulator Debug: BUILD SUCCEEDED.
- Simulator Release: BUILD SUCCEEDED.
- Signed archive: `/private/tmp/CueScore-Build29.xcarchive`.
- Normal App Store Connect upload: succeeded without errors.
- Export compliance: existing answer `上記のアルゴリズムのどれでもない` saved.
- Internal group: `CueScore Internal Testers` (1 tester).
- Internal TestFlight status: `テスト中`.
- App Store Version 1.0 remains `提出準備中`; `審査用に追加` was not clicked.
- App Review, External TestFlight, and public release were not performed.

