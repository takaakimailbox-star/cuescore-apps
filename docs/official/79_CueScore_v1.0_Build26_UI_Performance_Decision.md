# CueScore v1.0 Build 26 UI / Performance Decision

Date: 2026-08-31  
Status: Adopted for Internal TestFlight physical-iPhone review

## Decision

Build 26 adopts the focused New Match and Player Management visual clarification plus the measured navigation performance correction requested after Build 24/25 physical-iPhone review.

- New Match remains full screen. Its six-discipline selector is icon-only while the large selected discipline summary remains.
- The outer modal-like card treatment is removed and Back becomes visually subordinate.
- Player browsing remains a statistics journey. Settings management is explicitly titled `プレーヤー管理`, uses edit affordances, and exposes `プレーヤー追加`.
- Navigation performance changes are limited to eliminating duplicate History work, sharing one History record read per render, and coalescing observer reconciliation.

No scoring, winner, identity, saved-data schema, rules, backup/restore, analytics, aggregate SSOT, active-match recovery, or navigation restoration contract changes are adopted.

Build 26 may be distributed to the existing Internal TestFlight group for Product Owner review. App Review submission, `審査用に追加`, External TestFlight, and general release remain prohibited until separately approved.
