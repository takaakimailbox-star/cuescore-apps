# Build 36 Match Card C Fidelity Reimplementation

Date: 2026-09-02
Baseline: `33755d849860d8c0b8e060a8f10cf2571673de31`

Build 34 partially applied the C label but retained independent layouts, including a three-row 76-point discipline-history card. Build 36 introduces `CueScoreMatchCardC.classes(context)` as the shared context-class helper and one CSS token family for Recent, discipline All Matches, Opponent-specific, Player History, and Global History.

The discipline All Matches card is rebuilt as two layers at 58 points with a 26-point opponent avatar and Race integrated beside the date. Opponent-specific is 48 points. Recent is 52 points. Global History is 62 points and retains the two player identities, small avatars, discipline icon, Race, score, and chevron.

Build 35 Back listeners, `closeFormalMatchDetailV2`, edge-swipe convergence, exact-origin snapshot, and scroll restoration were not changed. Physical-iPhone fidelity and navigation acceptance remain pending after Internal TestFlight installation.

Verification before distribution:

- Full automated suite: 327 passed, 0 failed, 0 skipped.
- Native web generation and Capacitor sync completed; source and copied assets are aligned.
- iOS Simulator Debug and Release builds both succeeded.
- The 390-point CSS contract fixes each card family to a two-layer compact layout, prevents score wrapping, and ellipsizes long identities. Physical-iPhone visual acceptance remains pending and is not reported as PASS.
