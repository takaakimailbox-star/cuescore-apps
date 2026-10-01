# CueScore Apps 1.2 (80) — Player List Bottom Navigation Overlap Fix

Date: 2026-10-01
Gate: `IMPLEMENTATION FIX COMPLETE / SIMULATOR VERIFICATION PASS / PRODUCT OWNER RE-TEST REQUIRED`

Player List Fix Product Source Commit: `7e2beb0ade0685ff331fa808273e00e6f832bd2c`

## Conclusion

Product OwnerのInternal TestFlight実機確認で、Player一覧の末尾が固定Bottom Navigationの背面へ入り、iOSのelastic overscroll後に上へ戻るFAILを確認した。実scroll ownerを特定してBottom Navigation clearanceをその要素へ移し、scroll stateの保存・root reset対象も同じ要素へ統一した。

修正後は390×844でPlayer 0／1／7／12件、長いPlayer名、keyboard-equivalent viewport、Home／Player／History／Settingsを検証し、Player末尾、44pt以上の編集操作、scroll安定性、horizontal overflowをPASSした。依頼された試合履歴一覧も同じ観点で確認し、既存の`.records-list` clearanceにより最終試合とNavigationの間に23ptが確保され、同症状は再現しなかった。

## Physical FAIL Evidence

- Original: `IMG_3810.PNG`
- Preserved copy: `outputs/player-list-bottom-navigation/physical-fail-2026-10-01/IMG_3810.PNG`
- SHA-256: `3540c6e3a64cc177d989e0cfaacb6fc97b4663c3871b49503527227c744ef871`
- PASS before fix: Player root／search／count／fixed Bottom Navigation rendering
- FAIL before fix: final Player visibility／final edit access／stable end scroll

## Root Cause

- Bottom Navigation is fixed and uses `--cue-phase1-nav-height: 68px`; that height already includes the bottom Safe Area.
- `.player-library-panel` uses a viewport-height shell and hidden overflow.
- `.player-library-main` is not the scrolling element. The actual Player scroll owner is `.player-library-list` (`#playerLibraryList`, `overflow-y: auto`).
- The previous shell rule placed the Bottom Navigation reserve on `.player-library-main`, so the browser's real maximum scroll range did not include the required reserve.
- On physical iOS, elastic overscroll could temporarily expose lower content, but releasing the gesture returned to the real `maxScroll`, causing the observed “scrollしても戻る” behavior.
- Navigation state also snapshotted/reset `.player-library-main`, not the actual list, which could not reliably preserve or reset the Player scroll position.

## Fix

- Put the inset on `.player-library-list`, the only Player scroll owner.
- Reuse the current Navigation token and reserve:
  `calc(var(--cue-phase1-nav-height) + 18px + env(safe-area-inset-bottom))`.
- Apply the same value to `padding-bottom` and `scroll-padding-bottom`.
- Add `overscroll-behavior-y: contain` to keep root-page bounce from leaking to an ancestor.
- Store and reset `#playerLibraryList` scroll state, not `.player-library-main`.
- Version the changed Navigation shell assets as `2.0-build80-player-list-bottom-inset-v1` in both HTML loading and Service Worker app-shell entries. The product cache identity, Version, and Build remain unchanged.
- Bottom Navigation position and height are unchanged.

The 68px Navigation token already represents the shell height including the device safe area. The additional `env(safe-area-inset-bottom)` remains in the existing root clearance contract for environments that expose the inset separately; computed browser evidence for the 390×844 audit is 86px (`68 + 18 + 0`).

## 390×844 Visual Evidence

| Scenario | scrollHeight | clientHeight | maxScroll / final scrollTop | Final content bottom | Navigation top | Gap | Result |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Player 0 | 230 | 230 | 0 / 0 | n/a | 776 | n/a | PASS |
| Player 1 | 142 | 142 | 0 / 0 | 196 | 776 | 580 | PASS |
| Player 7 | 877 | 703 | 174 / 174 | 757 | 776 | 19 | PASS |
| Player 12 | 1442 | 703 | 739 / 739 | 757 | 776 | 19 | PASS |
| History 12 | 820 | 666 | 154 / 154 | 753 | 776 | 23 | PASS |

- Player 7／12: final edit target `44×56`, action opens Player Edit, scrollTop is stable after release.
- Player 12 keyboard-equivalent 390×560: final content bottom 473, Navigation top 492, gap 19; PASS.
- Long Player name: horizontal overflow 0.
- Home／Player／History／Settings: Navigation height 68, selected tab visible, horizontal overflow 0.
- History 0／1／12件: PASS. The actual History scroll owner is `.records-list`; its existing Navigation reserve remains effective.

Evidence:

- `outputs/player-list-bottom-navigation/Player_7_Normal_390x844.png`
- `outputs/player-list-bottom-navigation/Player_7_Final_390x844.png`
- `outputs/player-list-bottom-navigation/Player_12_Final_390x844.png`
- `outputs/player-list-bottom-navigation/History_12_Final_390x844.png`
- `outputs/player-list-bottom-navigation/Visual_Audit.json`

## Automated Verification

- Player list / Navigation focused: `15/15 PASS`
- Player Delete dedicated: `11/11 PASS`
- Match Sharing focused: `109/109 PASS`
- Full Node: `583/583 PASS`, `0 FAIL`, `0 SKIPPED`
  - Previous `578` plus 5 new Player-list/Navigation contract tests.
- `git diff --check`: PASS.

The fix does not alter Player Delete, Player ID, historical identity, in-progress delete protection, Match Sharing, schema, storage, or Bottom Navigation geometry.

## Native Sync / Build

- Formal workflow: source → native-web → Capacitor iOS public.
- Source／native-web／iOS public SHA-256:
  - `index.html`: `b3c28ddc51ec9c45ed0b9dd6c397621654e5667512675258dc9236bb2ce1ec25`
  - `navigation-shell-phase1.css`: `50db38b9626c5c08059ce381d079fbb7ab1a609d7d3809c9c47a4bd5f7082b16`
  - `navigation-shell-phase1.js`: `b533da9cec2d23f070da2eeb42f903d09c73385bdb9047c511ee34077e6566d4`
- Release Simulator Build: PASS.
- Built App: Bundle ID `com.takaakimailboxstar.cuescoreapps`, Version `1.2`, Build `80`, `.storekit` 0.
- Built executable SHA-256: `c68fc4647b0c73f0d36210b75a620a6114a9bca19bf28d56757e2e733e9e07f2`.
- Built App public assets match the source hashes above.

## Boundary / STOP

- Existing Internal TestFlight Build 80 is immutable and still contains the pre-fix source. This simulator PASS is not a physical PASS.
- Product Owner re-test requires a separately approved distributable build after commit/push and build-number decision.
- Build 81: NOT CREATED.
- commit / push: NOT PERFORMED.
- Archive / Upload / TestFlight / App Store Connect: NOT PERFORMED in this Gate.
- Public Version 1.1: unchanged.
