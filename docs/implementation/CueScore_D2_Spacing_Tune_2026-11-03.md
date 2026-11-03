# D2 spacing tune (PO 2026-11-03) — match-setup vertical gaps
Base: cloud/d2-final-design 13c2e773705b5253668b4506172f724ffe78688a (main 387d232 unchanged). Branch cloud/d2-spacing-tune. Local only; not pushed. No build numbering / Archive / ASC.
Change (match-setup-ux-v1.css only, 4 lines in the D2 block):
- heading -> cards: clamp(18px,10vh,96px) -> clamp(24px,6vh,60px)  (390pt: 85 -> 52pt)
- cards -> shot clock: clamp(16px,9vh,88px) -> clamp(20px,5.3vh,56px)  (390pt: 76 -> 45pt)
- top spacer cap: clamp(0px,10vh,96px) -> clamp(0px,16vh,150px); bottom spacer weight 1.2 -> 1 (top : bottom = 1 : 1) so the tightened space is shared above and below instead of piling up under the shot clock.
Unchanged: avatar 68px, selected name 23px, guidance 18px, Race to 17px, in-card (i), dashed unselected card, no blue-grey note, visually folded footer reason (VoiceOver text kept), shot clock, start-button gap (24pt at 390), Score 1/2 registration, Player IDs, start condition.
Tests: d-plan-initial-players.test.mjs pin updated (clamp(24px,6vh,60px)); browser d2-final.mjs now asserts the new gap formulas, the 390pt targets (45-55 / 40-50pt) and a top:bottom blank ratio <= 1.5; d-plan-setup.mjs heading-gap floor C+30 -> C+20 (320pt = +24). Change map: tests/fixtures/p2/version-d2-spacing-test-change-map.json.
