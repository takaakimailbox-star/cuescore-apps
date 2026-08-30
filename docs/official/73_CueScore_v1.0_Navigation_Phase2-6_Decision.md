# CueScore v1.0 Navigation Phase 2–6 Decision

- Status: Official Release
- Published: 2026-08-30
- Approval: Product Owner implementation instruction

## Decision

CueScore v1.0 adopts a Player-centered navigation model. Player opens a read-only Player Hub with one discipline selector and the three fixed tabs `成績 / 試合 / 分析`. Player registration and editing belong only to Settings. Home is limited to an interrupted match, a new-match entry, and the three most recent saved matches.

Existing Match Detail, match-history, opponent-record, trend, analytics-calculation, scoring, persistence schema, backup/restore, and telemetry contracts remain the single sources of truth. The navigation change must not duplicate those calculations or mutate saved data.

The disabled cloud-sync row remains hidden for v1.0. App Review submission remains outside this implementation decision.

## Supersession

This decision implements the Phase 2–6 portion of Official documents 66–68 and supersedes earlier v1.0 screen placement where Player management appeared in the browsing journey or Home exposed the legacy discipline/menu grid.

