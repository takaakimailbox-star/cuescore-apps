# CueScore Apps — TestFlight Build 8 Internal Distribution Record

Date: 2026-08-24 (JST)  
Status: Internal TestFlight distribution PASS / physical-iPhone verification pending

## Scope and authority

- Product Owner adopted Pattern A and authorized Build 8 finalization and TestFlight Internal Only distribution.
- Distribution was limited to the existing internal group `CueScore Internal Testers`.
- Export compliance used the established formal answer `上記のアルゴリズムのどれでもない`.
- App Store Review submission, external testing, public release, pricing, regions, and other public-store configuration were outside scope and were not performed.

## Final report

1. **Start local HEAD** — `9b2978fec839bb95501a463c2940d3a4d3316eb4`.
2. **Start `origin/main`** — `3286992b739eaf17f36671214a2433d34d95181b`.
3. **Start worktree** — clean; local `main` was two commits ahead of `origin/main`.
4. **Pattern A code-change need** — YES. The audit found one contract gap: Match Analysis opened from discipline-fixed match history returned to Player information instead of its originating history.
5. **Navigation/context change** — Match Analysis now retains Player ID, discipline ID, Match ID, viewer Player ID, and origin. Back and Swipe Back return to the same discipline-fixed history; existing Match Detail and Rival Analysis return contracts remain unchanged.
6. **Changed files** — the complete Build 8 chain from the starting remote includes `index.html`, analytics and Player-detail source files, iOS project/Info.plist, service worker, tests, Official 036–039, proposal, implementation records, and state documentation. Pattern A finalization itself changed `index.html`, `tests/build8-iphone-review.test.mjs`, `docs/proposals/CueScore_Player_First_Analytics_Navigation_Proposal_2026-08-24.md`, `docs/implementation/CueScore_Build8_Candidate_iPhone_Review_Implementation_2026-08-23.md`, and `docs/CURRENT_STATE.md`; Build Number finalization changed the Xcode project and native foundation test.
7. **Final automated tests** — `207 pass / 0 fail / 0 skipped`.
8. **Simulator Debug** — `BUILD SUCCEEDED`.
9. **Simulator Release** — `BUILD SUCCEEDED`.
10. **Asset consistency** — source, generated native bundle, and Xcode copied `index.html` all matched SHA-256 `b24a84f227c30985cd723ed3df9ecf4e7e1d9bb4257f3c517acc100061274f4b` after native build/copy.
11. **Documentation updates** — Pattern A adoption and verification were recorded in the proposal, Build 8 implementation record, and `docs/CURRENT_STATE.md`; this distribution record captures Archive through internal availability. Existing Official 036–039 were sufficient, so no redundant Official document was added.
12. **Deferred confirmation** — Pattern B, label changes, Analysis Home/tabs, major navigation restructuring, Match Detail analysis entry, whole-card Detail entry, Rival redesign, stronger scroll restoration, legacy analysis removal, and advanced analysis classification remain deferred.
13. **Final local source commit SHA** — `b63aca2686b05b1bc5a6489f86a2f5fedc648e4e` (`build: set TestFlight build number 8`). Pattern A fix commit: `02401628ee9579eb3c8ac9b5c8244d268ed29dde`.
14. **Push result** — complete Build 8 candidate chain pushed successfully to `origin/main`.
15. **Final `origin/main` SHA before distribution documentation** — `b63aca2686b05b1bc5a6489f86a2f5fedc648e4e`; it matched the Archive source commit.
16. **Local/remote sync state before distribution documentation** — local `HEAD` and `origin/main` matched and the worktree was clean.
17. **Build Number 8** — Marketing Version `1.0`, Build Number `8`, Bundle ID `com.takaakimailboxstar.cuescoreapps`, Team `U26DF88PRW`, iPhone only, portrait only, and minimum iOS 15.0 confirmed from effective settings and Archive metadata.
18. **Signed Release Archive** — PASS. Organizer archive: `/Users/Ludique/Library/Developer/Xcode/Archives/2026-08-24/App 2026-08-24, 8.05.xcarchive`; verified arm64, signing identity, Team, App Icon, and Capacitor/Cordova privacy manifests. A matching verification archive also exists at `/private/tmp/CueScore-Build8.xcarchive`.
19. **App Store Validate** — PASS. Xcode result: `App 1.0 (8) validated`; all validation checks passed before upload.
20. **TestFlight upload** — PASS. Xcode Organizer method: `TestFlight Internal Only`; Xcode result: `App 1.0 (8) uploaded`.
21. **Apple processing** — PASS. App Store Connect displayed Build 8 with upload date `2026年8月24日 8:20` JST.
22. **Internal group distribution** — PASS. The existing internal group `CueScore Internal Testers` contains Build 8; no new group and no external group were created.
23. **App Store Connect status** — `テスト中`; Build 8 is internally testable through TestFlight.
24. **Required physical-iPhone verification** — Take Photo, Photo Library/Choose File return, Player creation/edit return, Player deletion location, one-level Back and interactive Swipe Back, Match Detail/Analysis and Rival origins, break-result rack position, 3 Cushion controls/inning display, all six disciplines, normal/sample data, Backup/Restore, Undo, GameSet restoration, portrait layout, and overflow remain pending Product Owner confirmation. None is promoted to physical-device PASS by this record.
25. **Release boundary** — App Store Review was not submitted; external testers, public release, pricing, distribution regions, App Privacy, EU trader status, and public screenshots were not changed or finalized. Work stops at internal distribution and awaits Product Owner physical-iPhone testing.

## Build-number control

- Build Numbers `1`–`8` must not be reused.
- Any later TestFlight distribution must use Build Number `9` or greater.

