# CueScore v1.0 Build 25 Match Setup / Player Editor Decision

- Status: Official RC addendum
- Date: 2026-08-31
- Approval: Product Owner implementation instruction
- Supersedes: Official 075–076 only for the New Match discipline step and Player Registration / Edit presentation

## Decision

Build 25 adopts the focused UI corrections found during Build 24 physical-iPhone review.

1. New Match follows `新しい試合 → 対戦設定 → 試合開始`; the dedicated discipline-selection page is removed.
2. The existing six-discipline icon-and-label selector is integrated at the top of match setup. Tap is primary; a horizontal swipe changes one neighboring discipline.
3. The selected discipline remains visually and accessibly explicit. Existing Player, opponent, target, discipline-specific, and Break state are preserved according to existing validity rules.
4. Player Registration and Player Edit use one shared full-screen layout contract instead of a modal presentation.
5. Registration and Edit open without focusing an input or automatically showing the keyboard. Input focus starts only after the user taps a field.
6. Registration uses `登録` without a delete action; Edit uses `保存` and retains the existing delete action.

## Boundaries

Home keeps the Build 24 New Match position and does not restore recent matches. Scoring, winner calculation, discipline rules, Break Input, Player ID / Match ID, saved-data schema, Backup / Restore, analytics formulas, aggregate SSOT, Race to semantics, 14-1 rerack, 3 Cushion, JPA 9-Ball, Match Result / Detail calculations, cloud sync, and App Store metadata are unchanged.

Build 24 is not reused. Build 25 may be distributed to Internal TestFlight for Product Owner review. `審査用に追加`, App Review submission, External TestFlight, and general release remain prohibited until separate approval.
