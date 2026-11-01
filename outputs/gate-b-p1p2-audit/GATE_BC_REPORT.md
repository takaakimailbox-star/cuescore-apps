# CueScore 1.4 — Gate B/C report (P1/P2 unselected-UI audit, Build 97 handoff) — 2026-11-01
Branch cloud/tab-selection-fix-build97. Base main 7d2074f3ff790371f3420a31839153d81021c414 (unchanged). Pushed tip d5a69d3 (Gate A, PASS). New local commit(s) from this gate: NOT pushed.
No product source changed in this gate. Scripts: tests/browser/unselected-player-audit.mjs (read-only audit), tests/browser/unselected-player-prototype.mjs (isolated Before/After; DOM injected in the throw-away browser only).

## 1. Verdict
Gate B: PASS (audit complete, 432/432 measurements, 0 JS exceptions, 0 stored-data change). Findings: 2 DESIGN GAPs, both only in states a user cannot reach by normal operation. No FAIL.
Gate C: handoff prepared (section 9). Node 1247/1250 is NOT all-PASS; the 3 are environment, same on unmodified main.

## 2. What was audited (language fixed: cueScore.language.v1 seeded per run; every shown message equals the approved catalog text of that language: 432/432)
3 languages x 4 widths (320/375/390/430) x 6 disciplines x registered players 0 / 1 / 2 states.
- natural: 0 players, 1 player, 2 players with P1 auto-selected & P2 empty (A), both selected.
- FORCED (selection nulled in the test browser; initializePrimaryMatchSetupV1 disabled there only): B = P1 empty / P2 selected, C = both empty (>=2 registered).

## 3. Reachability (code + spec + measurement)
refresh() in final-ui-build18.js re-applies the primary player to P1 whenever >=1 player is registered and P1 is not selected, and P1 cannot be removed manually. So with >=1 registered player P1 is always selected. B and C (with >=2 players) are NOT reachable by normal operation. This matches docs/implementation/CueScore_MatchSetupUX_7_Terms_Translation_QA_and_P4_Package_2026-10-30.md section 2 ("reason.p1/both: not reachable in the current operation"). P1 auto-selection was not touched.
With 0 or 1 registered players the existing add-player guide has priority: footer reason and card note stay hidden (72/72 each). Start button disabled.

## 4. Results by state (n = 72 each: 3 lang x 4 widths x 6 disciplines)
| State | Kind | Footer reason | Card note | Start | Result |
|---|---|---|---|---|---|
| A: P1 selected, P2 empty (>=2 players) | natural | reason.p2, tap -> P2 picker (slot 2) | reason.p2 under the P2 card, 10pt below card, aria-hidden=true | disabled | PASS 72/72 (note text == footer text 72/72) |
| both selected | natural | hidden | hidden | enabled | PASS 72/72 |
| 0 players | natural | hidden (guide priority) | hidden | disabled | PASS 72/72 |
| 1 player | natural | hidden (guide priority) | hidden | disabled | PASS 72/72 |
| B: P1 empty, P2 selected | FORCED | reason.p1 (exact approved text), slot 1 | none | disabled | footer PASS 72/72; presentation DESIGN GAP-1 |
| C: both empty | FORCED | reason.both (exact approved text), slot 1 | reason.p2 text under P2 card | disabled | DESIGN GAP-2: note != footer 72/72 |
Common to every state: avatar->name 4pt and name->Race to 10pt (+-0.6) in both cards; no horizontal overflow, no tap target <44pt; no JS exceptions; localStorage item count unchanged within each run; start->tab-bar gap 16 / 19 / 24 / 26pt at 320 / 375 / 390 / 430 (standard 390 = spec ~24pt; small screens use the approved variable margin); note wraps to max 3 lines.

## 5. Findings
DESIGN GAP-1 (B, forced only): P1 unselected shows the footer reason but no card note; P2 has one. Visual rule differs between P1 and P2.
DESIGN GAP-2 (C, forced only): card note comes from oppNote(!name(2)) and always uses reason.p2 ("select an opponent") while the footer uses reason.both ("select players"): two different messages for one state; the note also points only at the P2 card.
Latent (code reading, forced only, NOT measured by a tap): tapping the disabled Start button opens the picker for slot 2 whenever >=1 players exist (final-ui-build18.js start click handler), which would be wrong when only P1 is missing. The footer reason tap routes correctly (slot 1).
Not violations: the formal C-plan spec defines the guidance only for the opponent card; approved wording/hashes are unchanged (P4-APPROVED kept; no independent human review done, NOT P4-REVIEWED).

## 6. Minimal improvement candidates (isolated prototype, NOT implemented, NOT approved)
- B: note under the P1 card with reason.p1 (same blue-grey style).
- C: ONE shared note spanning both cards with reason.both (no duplicate), hide the P2-only note.
- Keep add-player guide priority, footer unchanged, aria-hidden on the note (footer is the single VoiceOver source).
Prototype measurement (24 Before/After pairs, 3 lang x 4 widths x B/C): after text == approved text of that language 24/24; note directly under the card(s) at 10pt 24/24; name->Race to stays 10pt 24/24; no overflow, no extra scroll (0) and start->tab gap unchanged 24/24. C shared note: 30-36pt high (1-2 lines). B half-width P1 note: 46-54pt (3 lines) and 73pt (4 lines, en 375/390) -> if implemented, consider a full-width note for B. After-state: footer and note agree in C (both = reason.both).
Implementation of any of this = next Implementation Gate (PO / Score decision). Do not include in Build 97 before that.

## 7. NOT VERIFIED
VoiceOver actual reading and iPhone device behavior (only ARIA attributes checked: footer aria-label == reason text and aria-description present 144/144; note aria-hidden=true 144/144). Native app real touch. A tap-through of the disabled Start button in forced B.

## 8. Node
Full Node on the changed tree: 1247/1250 (outputs/cloud-tab-select-fix-2026-11-01/node-full.log). Unmodified main: 1245/1248, same 3 failing tests (outputs/gate-b-p1p2-audit/node-baseline-unmodified-main.log): 607/608 need ios/App/App/public produced by `cap sync` (6/6 PASS when mirrored from native-web), 846 reporter-format check (child run 13/13 PASS). No skip added, no assertion weakened.

## 9. Gate C — Build 97 handoff
Confirmed source (already approved): C-plan layout (7d2074f on main), History tab fix (1b1d8cc on main), tab-selection fix eb15ef1 (branch). Evidence: this folder and outputs/cloud-tab-select-fix-2026-11-01 (720/720, 360/360, 1512/1512, 8/8).
Exclude from Build 97 until an Implementation Gate: all P1/P2 unselected-UI candidates above; Decision 049 / Official 140-142 stay unissued candidates.
Mac-only remaining: set build number 97 (index.html / sw.js / project), `npm run native:sync`, Xcode 27.1 Archive, Export, signing. Handoff by Git only (branch/patch); no signing material, certificates or secrets move to the cloud or into the repo. Re-run before Archive: `npm test` plus native tests after cap sync, and the tab-state browser test on the Archive tree.
Not done: build numbering, Archive, TestFlight, ASC, App Review, release, push of new commits, PR, merge.
