# CueScore v1.0 UI Review Screenshots — 2026-08-28

Status: Review only / not adopted
Viewport: 390×844 portrait (30 PNG) / supplementary browser-session captures at 731×720 (11 PNG)
Count: 41 PNG total

## Captured screens

- `001` Home
- `002` Player List
- `003` Player Add
- `004` Avatar Chooser
- `005` Player Info
- `006` Player Edit
- `010`〜`060` all six discipline details
- `010a`〜`060a` all six full-screen trend tops
- `070` Opponent Records
- `071` Opponent-fixed History after VS-row removal
- `072` Match Detail from Opponent-fixed History
- `073` Player Match History
- `080` Interrupted Match choice modal
- `081` 9-Ball Match Setup
- `082` Match Setup Player picker
- `083` Race to picker
- `084`〜`089` all six discipline input screens
- `090` 9-Ball Result
- `100` Settings with Sample Data
- `101` About CueScore
- `102` Terms
- `103` Privacy
- `104` Support
- `105` Settings with Normal Data
- `106` Backup
- `107` Restore

## Capture-size audit

- `001`〜`087`: 30 files verified at exactly 390×844.
- `088`〜`107`: 11 supplementary files are 731×720 because the in-app browser reset its viewport during the final pass. They are retained for UI-content review, but are not represented as 390×844 evidence.

## Not captured

- Five additional discipline Result screens; 9-Ball is the shared Result representative.
- Every lower scroll position and every empty/no-data combination.
- OS-owned Photo Library, Camera and Files pickers.
- Destructive data deletion confirmations.
- Sample Data execution confirmation dialog and global All Match History list because the browser session entered a confirmation wait state during the final capture pass.
- Exact 390×844 recaptures of `088`〜`107`.

These gaps are explicit. This folder must not be promoted to `adopted-ui` without Product Owner approval.
