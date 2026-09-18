# CueScore Current Status

- Updated: 2026-09-18
- Version / Build: `1.0 (71)`
- GitHub baseline: `5818a1714eda7b971a27dc98eea305f18cdb3b9b`
- Build 70: 製品実装／testはPASSしたが、Archive dependencyがsourceと不一致のため正式受入対象外
- Build 71 scope: Build 70のPro UX／Startup Promise Safetyを変更せず、clean `npm ci`環境とGitHub `Package.resolved`固定で再Build
- Dependency source: `ion-ios-filesystem 1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`、`capacitor-swift-pm 8.0.2`
- Dependency artifact: Archive build graphも同じversion／revisionを使用
- Tests: Pro UX／Promise focused `9 pass`、IAP combined `33 pass`、Full Node `411 pass / 0 fail / 0 skipped`
- Build verification: Release Simulator build／device Archive PASS、Bundle ID `com.takaakimailboxstar.cuescoreapps`、Archive `1.0 (71)`、`.storekit` 0件
- Current gate: `PRE-UPLOAD SOURCE / ARTIFACT GATE PASS`
- TestFlight: Build 71 upload pending
- External TestFlight: not performed
- App Review: not submitted
- Public release: not performed
- Canonical instruction: `docs/handoff/CURRENT_DECISION.md`
- Canonical report: `docs/handoff/CURRENT_REPORT.md`

For long-term history and evidence, use `docs/CURRENT_STATE.md`. Do not expand this file into a build-by-build archive.
