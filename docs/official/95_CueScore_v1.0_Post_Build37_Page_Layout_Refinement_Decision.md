# CueScore v1.0 — Post-Build 37 Page Layout Refinement Decision

**Status:** Adopted  
**Decision date:** 2026-09-02  
**Baseline:** `bab4fde7b52a8e82dd6ef06ae445fd52b51a99df`

## Decision

The Product Owner adopts a shared page hierarchy for discipline all-matches, opponent records, and opponent-specific history:

1. existing top bar;
2. a 52px context or three-column summary block;
3. a 22px section/month heading;
4. the existing Match Card C or opponent-record list.

The Player Information analysis tab ends naturally at Self Best. The redundant `詳しい分析` and `対戦相手分析` links are removed from that tab only; analytics data, formulas, and destination implementations remain intact.

## Protected contracts

- Build 37 Match Card C rendering, 56px geometry, and `CueScoreMatchCardC.classes(context)` SSOT.
- Build 35 Match Detail close/exact-origin Back and edge-swipe contract.
- Existing statistics sources and calculations.
- Recent Matches, Global History, bottom navigation, persistence, backup/restore, and scoring.

Physical-iPhone visual and interaction acceptance remains pending until Product Owner confirmation.
