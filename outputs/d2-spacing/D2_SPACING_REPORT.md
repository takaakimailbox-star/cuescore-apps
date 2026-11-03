# D2 spacing tune — report (2026-11-03)
Base cloud/d2-final-design 13c2e77 (main 387d232 unchanged). Branch cloud/d2-spacing-tune; implementation commit ab9ed80 (local, NOT pushed). Patch: outputs/d2-spacing/D2_spacing_tune.patch.
Before = the D2 implementation (13c2e77) and After = this change, both rendered by the same test (d2-final.mjs) in the cloud Chrome (not an iPhone).

## Measured gaps (Japanese; pt; Before -> After)
| width (height) | state | heading->cards | cards->shot clock | top blank | bottom blank | start->tab | scroll needed |
|---|---|---|---|---|---|---|---|
| 320 (568) | C both selected | 58 -> 35 | 51 -> 30 | 0 -> 18 | 12 -> 37 | 16 -> 16 | 7 -> 0 |
| 320 (568) | shot clock ON | 58 -> 35 | 51 -> 30 | 0 -> 0 | -57 -> -13 | 16 -> 16 | 76 -> 32 |
| 375 (667) | C | 68 -> 41 | 60 -> 35 | 32 -> 61 | 58 -> 80 | 19 -> 19 | 0 -> 0 |
| 375 (667) | shot clock ON | 68 -> 41 | 60 -> 35 | 1 -> 26 | 20 -> 45 | 19 -> 19 | 0 -> 0 |
| 390 (844) | C | 85 -> 52 | 76 -> 45 | 65 -> 105 | 98 -> 124 | 24 -> 24 | 0 -> 0 |
| 390 (844) | shot clock ON | 85 -> 52 | 76 -> 45 | 34 -> 70 | 60 -> 89 | 24 -> 24 | 0 -> 0 |
| 430 (932) | C | 94 -> 57 | 84 -> 49 | 93 -> 140 | 139 -> 164 | 26 -> 26 | 0 -> 0 |
| 430 (932) | shot clock ON | 94 -> 57 | 84 -> 49 | 63 -> 105 | 100 -> 129 | 26 -> 26 | 0 -> 0 |
A negative bottom blank means the content is taller than the area (the area scrolls; see "scroll needed").
390pt targets met: heading->cards 52pt (target 45-55), cards->shot clock 45pt (target 40-50), start->tab 24pt. The tightened space is shared above and below (390pt: top 105 / bottom 124pt, ratio 1.18; 430pt: 140 / 164pt). Unchanged and re-verified in every cell: avatar 68, selected name 23, guidance 18, Race to 17pt; blue-grey note absent; shot clock OFF 52 / ON 121pt.

## Tests
- Node full: 1253/1254. Remaining: 850 (TZ=UTC child test; reporter-format environment difference, same as before; child alone 13/13). Not "all PASS".
- Product-level Chrome d2-final (3 languages x 320/375/390/430 x A/B/C/D(JPA 9-Ball)/E(shot clock ON), long names, small-screen reach): 714 + 357 + 459 + 18 = 1548/1548 PASS.
- Regression: setup-card-layout 756/756, d-plan-setup 918/918, initial-players 47/47 x 3 languages, long-name 12/12, setup functions PASS, numeric focus 8/8, numeric menus 88/88 + 176/176, reason ARIA 10/10 (en, zh-Hans), tab selection 120/120, history tab 60/60, Home exit / player hub PASS.
- VoiceOver / targets (attributes verified in the matrix; actual reading NOT verified): footer reason kept in the accessibility tree (aria-label = approved text, aria-description = card label), decorative (i), all controls >= 44pt, horizontal overflow 0, JS exceptions 0.
- 320pt with the shot clock ON still scrolls (32pt, was 76pt); after scrolling to the end every control is fully visible (18/18).

## Evidence
outputs/d2-spacing/: d2-final-*.json/log, small-screen-reach.json, r-*.log, node-final.log, shots/, shots-long/, compare/compare_*.png (top = Before (D2), bottom = After, each column labelled with the measured gaps), D2_spacing_tune.patch.
