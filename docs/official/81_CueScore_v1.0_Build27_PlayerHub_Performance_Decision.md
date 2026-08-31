# CueScore v1.0 Build 27 Player Hub / Performance Decision

Date: 2026-08-31  
Status: Adopted for Internal TestFlight review

Build 27 consolidates Player browsing and management into the bottom-navigation Player Hub. Row content opens Player Information, the independent pencil control opens Player Edit, and the header plus control opens Player Register. The duplicate Settings Player Management entry is removed.

New Match discipline changes must not repeat setup initialization or active-match snapshot parsing once Match Setup is already visible. This is a presentation-path optimization only; scoring, discipline rules, Race to, Break, saved-data identity/schema, analytics, and recovery remain unchanged.

Build 27 may be uploaded through the normal App Store Connect distribution path and added to the existing internal TestFlight group for physical-iPhone review. App Review submission, `審査用に追加`, External TestFlight, and general release are not authorized.
