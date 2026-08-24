# CueScore v1.0 Build 9 — Foul Rate / Metric Trend Popup Specification

- Status: Official Specification
- Adopted: 2026-08-24
- Published: 2026-08-25
- Approval: Product Owner

## UI contract

- 勝率 remains in the compact summary area and has its own `>` action.
- Supported major metrics use readable cards with `>` actions; no horizontal scrolling is introduced at 390px portrait.
- A tap opens only that metric's trend modal. Its title is `<指標名>の推移`.
- Close or backdrop dismissal returns to the same Player and discipline context. No selector page or additional navigation depth is added.
- 3 Cushion continues to show only its established metrics and has no foul-rate substitute.

## Precision

- 勝率、シュート率、ブレイクイン率、マス割り率: `0.0%`
- ファール率: `0.00%`
- Missing/ineligible: `—`

## Foul-rate eligibility

For 9-Ball and 10-Ball, a completed rack requires an explicit `rackResults` boundary or `rack_end`. For Rotation and JPA 9-Ball, it requires `rack_completed`, `rack_end`, or the explicit final-rack boundary at `game_end`. For 14-1, it requires an explicit rerack or three-foul boundary; an incomplete rack at match end is excluded.

Within such a completed rack, the target Player must have an explicit playing-opportunity event such as break ownership/result, shot, pocket, safety, foul, player switch, or the applicable 14-1 three-foul event. Being named in the match is insufficient. If the opponent runs out before any such target event, the rack is excluded from that Player's denominator.

Among participated completed racks, any foul or break-foul evidence for the target Player marks that rack as one foul rack. Multiple foul events in the same rack still add one numerator unit. Records without enough rack, participation, and foul attribution evidence are ineligible as a whole for this metric.

## Trend and compatibility

Trend points use only eligible records, preserve existing chronological semantics, and never synthesize missing points. Player-first navigation, one-level Back/Swipe Back, fixed-discipline history, Match Detail/Analysis, scoring, Undo, photo flows, Backup/Restore schema, and all unrelated analytics contracts remain unchanged.
