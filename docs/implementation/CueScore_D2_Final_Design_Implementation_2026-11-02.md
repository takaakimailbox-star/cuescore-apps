# D2 final design — match-setup implementation record (2026-11-02)
Base: main 387d232752b2a980ad5f37b1accebbd18a13c19d. Branch cloud/d2-final-design (local; not pushed). Prototype reused: cloud/d-plan2-ui-prototype 7b0e3367eda0ad251c384520001e814b7c483afb.
No build numbering, no Archive / Export / Upload / ASC, no push, no change to Build 98.

## 1. Product changes (match-setup-ux-v1.css, match-setup-ux-v1.js only; index.html, final-ui-build18.js, shotclock-v1.* untouched)
- Avatar 48 -> 68px; selected Player name 20 -> 23px; unselected guidance 15 -> 18px (bold); Race to number 22 -> 17px, label 12 -> 11px; card padding 10px 8px 8px; swap button top 34px.
- Unselected card and avatar ring: light-grey dashed (kept); selected card: solid. No red / yellow.
- Guidance INSIDE the unselected card: a round decorative (i) (`::before`, `content:"i" / ""`, empty alternative text) + the existing approved card label ("プレーヤーを選択" / "対戦相手を選択", keys p3.b3005c8a / p3.39bd0fa6). No new wording, no translation value or hash change.
- The blue-grey note below the opponent card is removed (JS `oppNote()` + CSS rules deleted).
- Footer reason (above the start button): same approved wording, same aria-label / aria-description (hint = the card label), same tap target logic; it is folded away VISUALLY (1px clipped box, not display:none) because it duplicated the card guidance, so VoiceOver still announces why the match cannot start. Players < 2: the existing add-player guide still shows and the reason stays quiet (unchanged).
- Shot clock card: border #ececea, title 17 -> 15px, supplement 12 -> 11px, padding 3px 12px (OFF 62 -> 52pt, ON 131 -> 121pt). Toggle / time selectors unchanged (>=44pt). Calculation, settings, storage unchanged.
- Spare height spread (vh based) instead of piling up at the bottom: top spacer cap clamp(0,10vh,96px); heading->cards clamp(18px,10vh,96px); cards->shot clock clamp(16px,9vh,88px). Start button -> tab bar unchanged (24pt at 390).
- Narrow widths (<=379px, English <=399px): name boxes are 2 lines high in both cards so the two cards stay aligned; long Player names end with an ellipsis.

## 2. Not implemented (per PO): blue start button, colour / photo avatars, selection-clear x button, new warnings, new game features. Start condition, Score 1/2 initial registration, Player ID, edit / delete, history, schema, Free/Pro, QR/Backup, IAP, score / win / foul are untouched.

## 3. Tests changed (old -> new in tests/fixtures/p2/version-d2-test-change-map.json; no skip, no weakened assertion)
- setup-card-layout.test.mjs: "note below the opponent card" test -> "note is gone, guidance inside the card, footer reason keeps wording + VoiceOver attributes, folded visually (not display:none)".
- d-plan-initial-players.test.mjs: D card style test -> D2 values (still asserts dashed / solid / neutral colours / no red).
- Browser: setup-card-layout.mjs (note assertion), d-plan-setup.mjs (23pt, gap, footer reason kept). New: tests/browser/d2-final.mjs (1422 checks), tests/browser/d2-small-screen-reach.mjs (18 checks).

## 4. Known limits
- 320pt wide: the setup area scrolls (C 7pt; shot clock ON 76pt). After scrolling to the end every control is fully visible above the footer (verified).
- Not verified: iPhone device, VoiceOver reading, large text sizes.
