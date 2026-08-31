# CueScore v1.0 Build 24 iPhone Review Fixes Decision

- Status: Official RC addendum
- Date: 2026-08-31
- Approval: Product Owner implementation instruction
- Supersedes: Official 066–068 and 073–074 only where Home recent matches are required

## Decision

Build 24 adopts the six focused corrections found in the Build 23 physical-iPhone review.

1. Home contains branding, resume when present, and `新しい試合`; recent matches are removed.
2. New Match follows `新しい試合 → 種目選択 → 対戦設定 → 試合開始` for all six disciplines.
3. Player Hub uses an icon-based horizontal discipline selector.
4. Settings Player Management uses a person-and-gear icon.
5. Settings Player Management opens Player Editor directly; the Player tab continues to open read-only Player Hub.
6. Global History places the discipline icon immediately before Race to.

## Boundaries

Scoring, winner calculation, discipline rules, Player ID / Match ID, saved-data schema, Race to persistence, Backup / Restore semantics, analytics formulas, aggregate SSOT, Break Input, 14-1 rerack, Practice, monetization, cloud sync, and App Store metadata are unchanged.

Build 23 must not be submitted. Build 24 may be distributed to Internal TestFlight for Product Owner review. `審査用に追加` and App Review submission remain prohibited until separate approval.

