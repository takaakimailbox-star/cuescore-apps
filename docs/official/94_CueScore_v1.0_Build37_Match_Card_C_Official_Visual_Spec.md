# Build 37 Match Card C Official Visual Specification

Date: 2026-09-02

- Shared card: fixed 56px height, 12px radius, 16px horizontal padding, 4px visual row rhythm, 20px bold tabular score, 12px Race/target, 28px opponent avatar where identity is required.
- Recent: one compact horizontal row containing date, opponent avatar, opponent name, result badge, aligned score, and trailing chevron.
- Discipline all matches: first row date/weekday/time and result badge; second row opponent avatar/name, discipline icon, Race/target, aligned score, and chevron.
- Opponent-specific: repeated opponent identity is omitted; date/weekday/time, result badge, discipline icon, Race/target, score, and chevron remain.
- Global History: date/time, discipline icon, Race/target, both player identities and avatars, score, and chevron remain in the shared density.
- Win uses `#1E8E3E` on `#E6F4EA`; loss uses `#D93025` on `#FDE7E9`.
- Long identities ellipsize, scores never wrap, and horizontal overflow is zero at 390px.
- The existing card/chevron Match Detail entry and Build 35 Back contract remain unchanged.
