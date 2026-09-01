# CueScore v1.0 Build 31 Final Review UI / Navigation Specification

- Date: 2026-09-01
- Status: Official Specification
- Decision: Official 083

## Home

- CueScore logo remains centered, renders at 42px visual height on 390×844, and sits in the upper Home region.
- `新しい試合` remains a full-width primary action above Bottom Navigation and below the central empty-space region.
- Home tab icon is a monochrome outlined cue ball with three perspective-shaped marks: upper horizontal ellipse, right vertical ellipse, and lower-left angled ellipse.

## Player

- Player root row remains compact with avatar, name/memo, and independent edit target.
- Primary status uses the existing compact neutral `メインプレーヤー` badge beside the name. No badge overlaps the avatar.
- Player Hub selector contains six accessible tab buttons in one row at 390px: 9-Ball, 10-Ball, Rotation, 14-1, JPA 9-Ball, and 3 Cushion.
- Selector buttons display only the adopted discipline icon; `aria-label` provides the discipline name and `aria-selected` provides state.

## Navigation State

- Destinations are exactly Home / Player / History / Settings.
- Before a cross-tab move, the current root/detail is snapshotted in runtime and the source top-level mode is closed.
- After opening the destination, non-destination top-level roots are explicitly hidden and active state is synchronized.
- Cross-tab return restores the saved stable DOM context and scroll position when possible.
- Active-tab retap opens Home top, Player root, History root, or Settings root.
- Match Detail and Player journey overlays close before a different top-level area opens.
- Match Mode hides Bottom Navigation.

## Settings

- Settings root header contains centered `設定` and no Back control.
- At 390×844, header, Data Management, Backup / Restore / Delete, CueScore + Version, About, Terms, Privacy, License, copyright, and Bottom Navigation fit without root scrolling.
- Data rows remain at least 62px in the compact portrait layout. Legal rows remain readable and unchanged in meaning.

## Acceptance

- Complete automated suite: 0 fail / 0 skipped.
- Source, native-web, and iOS copied assets are identical.
- 390×844: horizontal overflow 0 and console error 0 on Home, Player root/Hub, History, and Settings.
- Settings → History/Home/Player and Player/Opponent detail → all top-level tabs show destination content matching the active indicator.
- Player detail cross-tab restore and active Player retap behavior pass.
- Simulator Debug and Release build successfully.
- Build 30 edge-back and text-selection protections do not regress.
- Physical-iPhone verification remains pending until performed on the distributed Internal TestFlight build.
