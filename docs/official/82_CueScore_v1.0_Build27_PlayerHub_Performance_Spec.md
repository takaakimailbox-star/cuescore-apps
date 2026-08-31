# CueScore v1.0 Build 27 Player Hub / Performance Specification

Version: 1.0 / Build 27  
Date: 2026-08-31

## Player Hub

- The bottom-navigation Player root is the sole Player Hub.
- Row body opens Player Information.
- A separate pencil button opens Player Edit.
- The header plus button opens Player Register.
- Register and Edit remain full-screen and must not autofocus a text field.
- The Settings duplicate Player Management entry is absent.
- Normal iPhone portrait targets at least ten visible 56-point rows where available.
- Avatar: 38 points. Name: one line. Optional memo: one truncated line. Main-player indicator remains visible.
- Information and edit controls must remain distinct and width-safe at 390 points.

## New Match performance

- Each of the six discipline buttons must reflect selected state immediately through the existing renderer.
- While Match Setup is visible, a discipline change must not rerun setup initialization.
- While Match Setup is visible, a discipline change must not reread the active-match snapshot.
- Existing selection state, rules, Race values, swipe support, and active-match replacement/resume behavior remain authoritative.

## Protected boundaries

No changes to scoring, winners, Player/Match IDs, saved-data or backup schema, analytics formulas/aggregate SSOT, Break Input, 14-1 rerack, JPA rules, or active-match recovery.

## Distribution boundary

Normal App Store Connect upload and existing Internal TestFlight distribution are allowed. App Review, `審査用に追加`, External TestFlight, and public release are prohibited.
