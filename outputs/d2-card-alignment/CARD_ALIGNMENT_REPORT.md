# D2 card alignment repair — report (2026-11-03)
Base main 6c3eaec7df2040ef47662d8cb06c26a77eccc4e4; branch cloud/d2-card-alignment-repair. Not on main. "Before" = unfixed main rendered in the cloud Chrome (not an iPhone).
## Root cause
One guidance label wraps in ONE card only (P1 "プレーヤーを選択" is longer than P2 "対戦相手を選択"); the two-line equalisation was a fixed-width media rule (<=379 / en <=399), but the wrap width depends on the font -> P1 card taller, tops and Race-to rows differ.
## Natural reachability (isolated data, no user data touched)
Main player 0 + 3 registered (no auto-promotion, Official 104) -> P1 AND P2 unselected on a normal start; "P1 unselected / P2 selected" after one pick. Reproduced without forcing: ja 380 / 385pt: left 191pt / right 176pt, top diff 7.6pt, height diff 15pt, Race-to row diff 15.2pt (the reported values). At 390pt the cloud fonts keep one line (aligned); the Mac fonts wrap there.
## Result
- New browser sweep (natural states, widths 320-430, letter-spacing 0 and 1.2px to emulate other fonts, ja / en / zh-Hans): 162 + 252 = 414/414 PASS; negative control on unfixed main: FAIL 4/36 with 191 / 176pt.
- D2 product matrix (unchanged design values): 543 + 352 + 459 = 1354/1354, small-screen reach 18/18, D-plan UI 918/918, C-plan layout 756/756, initial players 47/47 x 3 languages, tab selection 120/120, history 60/60, Home exit / player hub PASS, numeric focus 8/8, reason ARIA 10/10 (en, zh-Hans), long names 12/12.
- Node: 1255/1256 (+2 new). Remaining: 852 (TZ=UTC child test; reporter-format environment difference, same as before; child alone 13/13).
- Not verified: iPhone device, VoiceOver reading, large text sizes.
## Observation (not changed)
At ja 380pt the wrapped P1 label breaks as "プレーヤーを選 / 択" (one orphan character). This is the existing wrap behaviour; `text-wrap: balance` would improve it but also changes the approved 320 / 375pt look, so it is only a proposal.
## Evidence
outputs/d2-card-alignment/: align-*.json/log, probe-before/after.json (width sweep), d2f-*.json/log, regression logs, node-final.log, shots/ (before / after, compare_card_alignment.png), patch.
