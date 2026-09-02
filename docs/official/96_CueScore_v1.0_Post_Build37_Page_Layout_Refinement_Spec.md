# CueScore v1.0 — Post-Build 37 Page Layout Refinement Spec

**Status:** Adopted  
**Decision:** `95_CueScore_v1.0_Post_Build37_Page_Layout_Refinement_Decision.md`

## Shared layout

- Page horizontal inset: 16px.
- Top bar to first context/summary block: 20px.
- Context/summary block: 52px at the standard content size.
- Context/summary to section heading: 32px.
- Section/month heading: 22px, weight 700, line-height 28px.
- Heading to first row: 12px; row gap: 8px.
- No horizontal overflow at 390px.

## SummaryStatsBar

Discipline all-matches and opponent-specific history use one semantic, three-column bar sourced from the existing screen summary. Columns are `試合`, `勝敗`, `勝率`; labels and values form accessible groups and separators are decorative. The bar is 52px, surface-colored, subtly bordered, 16px radius, with no shadow.

## Opponent records context

Opponent records uses a transparent 52px context header. It shows the selected player's existing 36px avatar and one-line name on the left, and the existing discipline icon and label on the right. The list heading is `対戦相手`. Existing opponent-row data and navigation remain unchanged.

## Analysis tab simplification

The visible sequence is `今の状態 → 主要指標 → 推移 → 今回のポイント → 自己ベスト`. `詳しい分析` and `対戦相手分析` are not rendered in the Player Information analysis tab. Underlying analytics and opponent data are retained.

## Current-main precedence

Build 37 superseded the older reference document's Build 36 card heights. All applicable Match Card C contexts remain 56px. This page-layout work must not alter card markup, visual SSOT, tap targets, Match Detail routing, or exact-origin restoration.
