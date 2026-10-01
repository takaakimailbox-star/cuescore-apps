# CueScore Current Status

- Updated: 2026-10-01
- Public Version / Build: `1.1 (79)`
- Current project Version / Build: `1.2 (80)`
- Gate: `PLAYER LIST OVERLAP FIX COMPLETE / SIMULATOR PASS / PRODUCT OWNER RE-TEST REQUIRED`
- Archive baseline: `d1ba8b7fa8821e7f93a10b3b54dde0984b5e703e`
- Version 1.2 RC Product Source Commit: `810a9e134c5de1e033eb644027c37f51834fd6d4`
- Player List Fix Product Source Commit: `7e2beb0ade0685ff331fa808273e00e6f832bd2c`
- Public availability: Version 1.1 / Build 79 remains Ready for Distribution and unchanged
- Source candidate: Match Sharing v1 plus Player Delete / Player ID / historical identity / in-progress delete protection
- Cache identity: `2.0-build80-match-sharing-player-identity-v1`
- Formal status: Official 101 / 102 and Decision Log v2.6 Decision 030 record implementation COMPLETE, automated verification PASS, Product Owner physical acceptance PASS, and Version 1.2 RC integration; historical design-gate text is retained
- Fresh fix evidence: Player list/Navigation `15/15`; Player Delete `11/11`; Match Sharing `109/109`; Full Node `583/583`; 390×844 Visual; native/built parity; Release Simulator Build `PASS`
- Distribution: existing Archive / Apple Upload / Internal TestFlight Build 80 remains available but contains the pre-fix source; Player List physical verification `FAIL`; corrected source Product Owner re-test `PENDING`; External TestFlight / App Store Version 1.2 / App Review / Release `NOT STARTED`
- App Store Connect: Build ID `0851e2bb-b9dc-47b3-bab6-04d3f687e200`; `VALID`; `IN_BETA_TESTING`; `usesNonExemptEncryption=false`; audience `INTERNAL_ONLY`
- Internal group: `CueScore Internal Testers`; Build 80 included; 1 internal tester
- Audience deviation: requested `APP_STORE_ELIGIBLE` was not satisfied and cannot be changed after upload; no Build 81 or replacement upload was attempted
- Canonical instruction: `docs/handoff/CURRENT_DECISION.md`
- Canonical report: `docs/handoff/CURRENT_REPORT.md`

Detailed evidence: `docs/implementation/CueScore_1.2_Build80_Player_List_Bottom_Navigation_Overlap_Fix_2026-10-01.md`, `docs/implementation/CueScore_1.2_Build80_Internal_TestFlight_2026-10-01.md`, and `docs/CURRENT_STATE.md`.
