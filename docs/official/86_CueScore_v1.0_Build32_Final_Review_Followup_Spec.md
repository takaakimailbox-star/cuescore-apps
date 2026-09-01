# CueScore v1.0 Build 32 Final Review Follow-up Spec

- Date: 2026-09-01
- Version / Build: 1.0 / 32
- Decision: Official 085

## UI

- At 390×844, Home logo is shifted 30px downward from Build 31.
- Home logo height remains 42px; New Match and Bottom Navigation retain their Build 31 positions.
- Home navigation icon uses a thin circular outline and three asymmetrical perspective ellipses; no color, gradient, shadow, or photographic effect.
- New Match top/main content receives a 30px structural inset. Six discipline tabs remain one row and the start control remains safely above Bottom Navigation.

## Player Back Navigation

- Player journey `show` and `hide` own `.hidden` and `aria-hidden` together.
- A visible journey must have `aria-hidden=false` and accept pointer input.
- Discipline history Back returns to the same Player Hub discipline/tab context.
- Opponent match list Back returns to opponent records; opponent records Back returns to the same Player Hub discipline.
- Match Detail Back returns to its exact opening list.

## Protected Contracts

Scoring, winner, Race to, JPA, Break Input, 14-1, Undo, GameSet, recovery, identifiers, schema, Backup / Restore, analytics formulas/SSOT, History, Match Detail, Build 30 edge exclusions, and editable selection remain unchanged.
