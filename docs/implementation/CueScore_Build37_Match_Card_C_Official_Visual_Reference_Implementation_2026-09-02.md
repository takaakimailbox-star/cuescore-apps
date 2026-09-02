# Build 37 Match Card C Official Visual Reference Implementation

Date: 2026-09-02
Baseline: `8444746401b09e9d3146041ed73990cb2e358e12`

## Visual source of truth

The supplied completed-design image is preserved at `docs/assets/adopted-ui/CueScore_MatchCard_C_Official_Visual_Reference_2026-09-02.png`. Build 37 replaces the remaining Build 36 approximations with the image's explicit information order and density.

## Resolved differences

- Recent restored the opponent avatar and now presents date, avatar, name, result, score, and chevron in one 56px row.
- Discipline All Matches no longer removes the discipline icon or moves Race beside the date. It uses the official first-row date/result and second-row avatar/name/icon/Race/score/chevron structure.
- Opponent-specific retains the discipline icon while omitting the already-known opponent identity. Dates use compact month/day/weekday/time and every score right edge aligns.
- Global History retains two player identities, two avatars, discipline icon, Race/target, score, and chevron at the same 56px card height.
- All four contexts use `CueScoreMatchCardC.classes(context)` and the Build 37 shared C token family. Asset query versions explicitly invalidate older cached Build 36 CSS/JS.

## 390×844 visual acceptance

Screenshots:

- `docs/assets/adopted-ui/build37-match-card-c/01_Recent_390x844.jpg`
- `docs/assets/adopted-ui/build37-match-card-c/02_AllMatches_390x844.jpg`
- `docs/assets/adopted-ui/build37-match-card-c/03_Opponent_390x844.jpg`
- `docs/assets/adopted-ui/build37-match-card-c/04_GlobalHistory_390x844.jpg`

Measured results:

- Recent: 3 cards, all 56px; opponent profile avatars resolved; horizontal overflow 0.
- 9-Ball All Matches: 8 records, all 56px; 6 complete cards visible above Bottom Navigation; horizontal overflow 0.
- Opponent-specific: 2 records, both 56px; repeated identity absent; discipline icons present; score right edge identical at x=345; horizontal overflow 0.
- Global History: first 10 measured cards all 56px; 9 complete cards visible above Bottom Navigation; both identities/avatars retained; horizontal overflow 0.
- Runtime console errors: 0.

## Functional protection

Build 35 pointer input, `closeFormalMatchDetailV2()`, edge-swipe convergence, exact origin, filters, and scroll restoration were not modified. Browser regression confirmed Global History → Match Detail → Back returns to Global History with one tap. Physical-iPhone acceptance remains pending and is not reported as PASS.

## Verification and distribution

- Automated suite: 333 passed, 0 failed, 0 skipped.
- Native web generation and Capacitor iOS sync: passed.
- Marketing Version: 1.0. Build Number: 37.
- iOS Simulator Debug and Release builds both succeeded.
- Source/archive commit: `d0d0aa4`.
- Signed archive: `/private/tmp/CueScore-Build37.xcarchive`.
- App Store Connect Delivery UUID `76534b77-ae7e-40e3-bb87-2411e8940315`; processing/import `VALID`; `usesNonExemptEncryption=false`.
- Build 37 is Ready to Submit and associated with the internal `CueScore Internal Testers` group.
- GitHub `main` push of the source plus supplied/reference screenshots awaits explicit approval because those images will be transmitted to the repository remote.
- No App Review submission, review-build attachment, External TestFlight, or public release is authorized.
