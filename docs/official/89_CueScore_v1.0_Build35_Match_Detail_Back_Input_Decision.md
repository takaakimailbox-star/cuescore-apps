# Build 35 Match Detail Back Input Decision

Date: 2026-09-02

Build 34 is not accepted for Match Detail Back. A real iPhone confirmed that the visible top-left Back control could fail before the close contract was invoked.

Build 35 adopts the rendered `#recordDetailBackBtn` as the single input gateway. A valid primary `pointerup` and the click fallback both request the current `window.closeFormalMatchDetailV2()` contract. Edge Swipe Back continues to activate the same button, so it reaches the same close and exact-origin restoration path.

The fix does not change scoring, saved-data schemas, analytics, or Match Card C. Match Card C remains a separate batch.

Acceptance remains pending until all five requested origins pass on a real iPhone. Distribution stops at Internal TestFlight; no external distribution, App Review submission, or public release is authorized.
