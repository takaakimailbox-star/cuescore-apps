# Build 35 Match Detail Back Input Specification

Date: 2026-09-02

## Input contract

- DOM target: `button#recordDetailBackBtn.match-detail-back-v1`.
- The target has an explicit 48-point hit area, `pointer-events:auto`, foreground stacking, and `touch-action:manipulation`.
- A short primary pointer sequence with less than 18 points movement requests close on `pointerup`.
- `click` is the accessibility, keyboard, and programmatic fallback.
- A short latch suppresses duplicate close requests from a single physical gesture.
- Every request resolves `window.closeFormalMatchDetailV2` at event time; the Build 34 exact-origin wrapper therefore remains authoritative.
- Edge Swipe Back invokes this same button and must not create a second close route.

## Verification

Automated checks cover the rendered target, listener registration, styling, wrapper convergence, and bounded in-memory event trace. Real-iPhone acceptance must cover Personal Best, Recent Matches, All Matches, Opponent, and Global History, including player, discipline, opponent, filters, and scroll restoration.
