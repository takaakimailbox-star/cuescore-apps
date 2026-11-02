# D2 final design — implementation report (2026-11-02)
Base main 387d232752b2a980ad5f37b1accebbd18a13c19d. Branch cloud/d2-final-design. Implementation commit 60b0ecb (local; NOT pushed). Patch: outputs/d2-final/D2_final_design.patch (git format-patch of 60b0ecb).
"Before" = main 387d232 rendered in the cloud Chrome (not an iPhone). No device / VoiceOver verification.

## Measurements (Japanese, state C = both selected; Before -> After)
| width (height) | heading->cards | card (w x h) | avatar | name | Race to | shot clock OFF/ON | top / head / mid / bottom blank | start->tab | scroll (C / clock ON) |
|---|---|---|---|---|---|---|---|---|---|
| 320 (568) | 19 -> 58 | 143x151 -> 143x192 | 48 -> 68 | 20 -> 23 | 22 -> 17 | 62/131 -> 52/121 | - / 19 / 24 / 57 -> 0 / 58 / 51 / 12 | 16 -> 16 | 0 / 0 -> 7 / 76 |
| 375 (667) | 22 -> 68 | 171x151 -> 171x192 | 48 -> 68 | 20 -> 23 | 22 -> 17 | 62/131 -> 52/121 | - / 22 / - / 131 -> 32 / 68 / 60 / 58 | 19 -> 19 | 0 / 0 -> 0 / 0 |
| 390 (844) | 28 -> 85 | 178x151 -> 178x176 | 48 -> 68 | 20 -> 23 | 22 -> 17 | 62/131 -> 52/121 | 59 / 28 / 29 / 198 -> 65 / 85 / 76 / 98 | 24 -> 24 | 0 / 0 -> 0 / 0 |
| 430 (932) | 31 -> 94 | 198x151 -> 198x176 | 48 -> 68 | 20 -> 23 | 22 -> 17 | 62/131 -> 52/121 | 64 / 31 / 32 / 273 -> 93 / 94 / 84 / 139 | 26 -> 26 | 0 / 0 -> 0 / 0 |
Unselected guidance: 15 -> 18pt (1 line at 390/430, 2 lines at 320/375 and English <=399). Before-values of the blank pieces come from the prototype evidence (outputs/d-plan2-prototype on cloud/d-plan2-ui-prototype); "-" = not recorded then.

## Tests
- Node full: 1253/1254. Remaining: 850 (TZ=UTC child test; reporter-format environment difference, same test as the previous 846; child run alone passes 13/13). Not "all PASS".
- New product-level Chrome (no injection) d2-final: 1422/1422 (ja/en/zh-Hans x 320/375/390/430 x A both unselected(forced) / B P1 selected / C both selected / D JPA 9-Ball (Skill Level) / E shot clock ON; plus long names 459).
- Small-screen reach (320 / 375, shot clock ON): 18/18 - after scrolling to the end every control is fully visible above the footer.
- Regression: setup-card-layout 756/756 (3 langs x 320/390), initial-players 47/47 x 3 languages, d-plan-setup 918/918, long-name 12/12, setup functions PASS, numeric focus 8/8, numeric menus 88/88 + 176/176, reason ARIA 10/10 (en, zh-Hans), tab selection 120/120, history tab 60/60, Home tab exit / player hub hit area PASS. Native web build PASS.
- Environment notes: ja in setup-reason-aria is skipped (that old test relies on browser-language detection, unavailable in the cloud Chrome); one numeric-menu "vertical balance" check at zh-Hans/430 that already failed on main now passes.

## VoiceOver / targets (attributes verified; actual reading NOT verified)
- Round (i): `content:"i" / ""` (empty alternative text) -> decorative. Card button name = existing approved label only.
- Footer reason: not display:none; 1px clipped box in the accessibility tree; aria-label == approved reason text; aria-description == the card label (checked in every unselected state). No new wording.
- All controls >=44pt, horizontal overflow 0, JS exceptions 0 in all cells.

## Evidence
outputs/d2-final/: d2-final-*.json/log, small-screen-reach.json, r-*.log (regressions), node-*.log, shots/, shots-long/, compare/compare_*.png (top = main, bottom = D2 product), D2_final_design.patch. Docs: docs/implementation/CueScore_D2_Final_Design_Implementation_2026-11-02.md.
