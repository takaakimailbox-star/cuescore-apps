# CueScore v1.0 Build 25 Match Setup / Player Editor Specification

- Status: Official RC addendum
- Date: 2026-08-31
- Decision: Official 077

## New Match and discipline selector

- `新しい試合` opens the existing match setup directly, subject to the existing active-match safeguard.
- Match setup begins with a horizontally scrollable tablist containing 9-Ball, 10-Ball, Rotation, 14-1, JPA 9-Ball, and 3 Cushion.
- Each item displays its existing official icon and label. The selected item has a distinct border/background and `aria-selected=true`.
- Tapping an item selects it directly. A dominant horizontal pointer/touch swipe of at least 52 points selects exactly one adjacent item and keeps it in view.
- At the first and last item, an outward swipe does not wrap.
- Existing selected Players, opponent, target values, discipline-specific settings, and Break state are retained; only values invalid under existing rules may use the existing safe normalization.

## Player Registration / Edit

- Both modes use the same full-viewport screen, header, scroll body, and bottom action layout.
- Header is a standard `戻る` control plus the mode title; no modal `×` is rendered.
- Shared body retains the existing avatar/photo selector, required name, optional memo, and main-Player toggle.
- Registration title / CTA are `プレーヤー登録` / `登録`, and delete is hidden.
- Edit title / CTA are `プレーヤー編集` / `保存`, and the existing delete action remains available.
- Opening either mode blurs any input and focuses only the non-input screen container. Keyboard presentation begins only after a user field tap.
- Back preserves the existing unsaved-data behavior and returns to Player Management.

## Acceptance

- Complete automated suite: 0 fail / 0 skipped.
- 390×844: direct setup route, six-item selector, selected visibility, tap switching, horizontal overflow 0, full-screen Registration / Edit, no initial input focus, working Back, console error 0.
- Source, native-web, and Xcode copied assets are byte-identical.
- Simulator Debug and Release both succeed.
- Version 1.0 / Build 25 may be archived and uploaded for Internal TestFlight; App Review is not submitted.
