# CueScore Apps — TestFlight Build 9 Internal Distribution Record

Date: 2026-08-25 (JST)  
Status: Internal TestFlight distribution PASS / physical-iPhone verification pending

## Scope and authority

- Product Owner approved the Build 9 candidate for push, signed Archive, Validate, and TestFlight Internal Only distribution.
- Distribution was limited to the existing internal group `CueScore Internal Testers`.
- Export compliance used the established CueScore Apps answer `上記のアルゴリズムのどれでもない`.
- App Store Review, external TestFlight, public release, pricing, and territory changes were outside scope and were not performed.

## Final report

1. **Start local HEAD** — `5a0877e840292a976bcdd0affaef1f870c4065ea` (`feat: add foul-rate metric trend popups`).
2. **Start `origin/main`** — `dddba7e58ed63524aa41b79da6c4068e3ae56381`.
3. **Start worktree** — clean; local `main` was one intended commit ahead, with no merge/rebase or unrelated file.
4. **Pushed commit SHA** — `5a0877e840292a976bcdd0affaef1f870c4065ea`.
5. **Final `origin/main` before distribution documentation** — `5a0877e840292a976bcdd0affaef1f870c4065ea`; it matched the exact Archive source.
6. **Local/remote synchronization** — local `HEAD` and `origin/main` matched after fetch; ahead count was zero and the worktree remained clean.
7. **Build Number** — `9` in both distributable Xcode configurations and in the Organizer Archive.
8. **Marketing Version** — `1.0`.
9. **Final automated tests** — `216 pass / 0 fail / 0 skipped`.
10. **Simulator Debug** — `BUILD SUCCEEDED` for the unchanged final Build 9 candidate.
11. **Simulator Release** — `BUILD SUCCEEDED` for the unchanged final Build 9 candidate.
12. **Asset consistency** — source, `native-web`, and Xcode bundled `index.html` matched SHA-256 `c22e45e2d5d228e4e29896772255e915606ec4f097ccbcd49b5a3bab2341af1f`.
13. **Signed Release Archive** — PASS. Organizer archive: `/Users/Ludique/Library/Developer/Xcode/Archives/2026-08-25/App 2026-08-25, 6.59.xcarchive`; verified Version `1.0`, Build `9`, Bundle ID `com.takaakimailboxstar.cuescoreapps`, Team `U26DF88PRW`, arm64, iPhone only, portrait configuration, iOS 15.0 minimum, signing, App Icon, and privacy manifests.
14. **App Store Validate** — PASS. Xcode result: `App 1.0 (9) validated`; validation completed before upload.
15. **TestFlight upload** — PASS. Xcode Organizer method: `TestFlight Internal Only`; Xcode result: `App 1.0 (9) uploaded`.
16. **Apple processing** — PASS. App Store Connect displayed Build 9 with upload date `2026年8月25日 7:03` JST.
17. **Export compliance** — PASS. The established answer `上記のアルゴリズムのどれでもない` was saved without changing the approved determination.
18. **Internal tester group** — PASS. Existing internal group `CueScore Internal Testers` contains Build 9; no new or external group was created.
19. **App Store Connect status** — `テスト中`; Build 9 is available for internal TestFlight testing.
20. **Documentation updates** — `docs/CURRENT_STATE.md` and this Build 9 distribution record document the pushed source, gates, distribution status, and physical-device pending state.
21. **Remaining physical-iPhone checks** — metric `>` drill-ins, correct popup titles and context return, touch/animation, foul-rate denominator/numerator rules, one-foul-rack counting, missing evidence `—`, 3 Cushion exclusion, rate precision, Take Photo, Photo Library/Choose File, Player deletion, Back/Swipe Back, current-rack position, 3 Cushion controls/innings, six discipline details, Backup/Restore, and normal/sample data remain pending Product Owner confirmation. None is promoted to physical-device PASS here.
22. **Release boundary** — App Store Review was not submitted; external TestFlight and public release were not enabled; pricing and territories were not changed. Work stops at internal distribution and awaits Product Owner physical-iPhone review.

## Build-number control

- Build Numbers `1`–`9` must not be reused.
- Any later TestFlight distribution must use Build Number `10` or greater.

