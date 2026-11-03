# D2 card alignment repair (Build 99 STOP) — 2026-11-03
Base: main 6c3eaec7df2040ef47662d8cb06c26a77eccc4e4. Branch cloud/d2-card-alignment-repair. No build numbering, no Archive; Mac-local Build 99 commit c26cbbd… untouched.
## Defect
Left / right player cards lose the same top / height / Race-to row when ONE guidance label wraps: "プレーヤーを選択" (P1, 8 characters) is longer than "対戦相手を選択" (P2). The two-line equalisation existed only for fixed widths (<=379px, English <=399px), but the wrap width depends on the font (cloud Chrome: ja 380-385pt; Mac: 390pt). Reported: left 191pt / right 176pt, height diff 15pt, top diff 7.6pt (ja / 390pt, both unselected).
## Reachability (not a forced-test-only case)
Official 103/104: the main player may be 0 and no other Player is promoted automatically; primaryPlayerV1() is null then and initializePrimaryMatchSetupV1() returns false. With the main player deleted and >=2 players left, the start screen has P1 AND P2 unselected through normal use (verified with isolated data: 3 registered players, none is main) and "P1 unselected / P2 selected" follows after one pick. The auto-selection / main-player rules are NOT changed and P1 is not forced.
## Repair (match-setup-ux-v1.js +16 lines, match-setup-ux-v1.css +3 lines)
- `labelLines(n)`: real line count of each guidance label (Range over the text node, independent of the box height).
- `alignNames()` (run on every setup refresh and on resize): toggles `cue-name-wrap-v1` on the card grid when either label wraps.
- CSS: with that class both name boxes get the same two-line height (min-height 44px; selected names stay centred, line-height 44px). Nothing changes when both labels fit on one line (approved 176pt cards at 390pt are untouched).
Unchanged: avatar 68, selected name 23, guidance 18, Race to 17, dashed unselected card, solid selected card, no blue-grey note, D2 gaps, shot clock, start button, footer reason (VoiceOver text), Score 1/2 registration, Player IDs, start condition.
## Tests
New: tests/d2-card-alignment.test.mjs (structure + pins of the main-player rules), tests/browser/d2-card-align.mjs (natural main-0 state; width sweep x letter-spacing 0 / 1.2px (other fonts' glyph widths) x ja / en / zh-Hans; negative control: fails on unfixed main with 191 / 176pt). No existing test or assertion changed. Change map: tests/fixtures/p2/version-d2-card-alignment-test-change-map.json.
