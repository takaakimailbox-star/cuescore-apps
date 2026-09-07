# Cue Series Web — Phase G Implementation

Date: 2026-09-07

## Result

- Added the Cue Series landing page at the GitHub Pages root.
- Preserved the complete CueScore product page at `/cuescore/`.
- Preserved the existing CueScore App Store URLs at `/support.html`, `/privacy.html`, and `/terms.html` without changing their official source documents.
- Added CueSnapi product, Support, and Privacy pages in Japanese and English.
- Added Japanese and English Cue Series entry pages.

## Formal CueSnapi assets

- App icon copied unchanged from the Build 31 adopted App Icon asset.
- Product screenshot copied unchanged from `CueSnapi_PhaseF_Home_iPhone17e.png`.
- No generated UI mock or reconstructed app screen is used.
- Public status is stated as TestFlight development; no App Store download claim or link is shown.

## Privacy basis

- Current Swift sources were checked for photo selection, StoreKit, local `UserDefaults` storage, and network/analytics SDK usage.
- CueSnapi pages describe on-device photo analysis and storage, StoreKit purchase handling, and no advertising tracking for Version 1.0.

## Verification

- Automated Node test suite: 386 passed, 0 failed.
- New-site link and asset resolution tests cover all eight Japanese/English entry, product, Support, and Privacy pages.
- Browser QA at 390×844 and 1440×900: no horizontal overflow.
- Formal CueSnapi images loaded successfully; browser console warnings/errors: 0.
- Existing CueScore website and legal-document tests remain passing.

## Release boundary

- GitHub Pages publishing is in scope for Phase G.
- No App Store Connect metadata was changed and no App Review submission was performed.
