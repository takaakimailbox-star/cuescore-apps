# CueScore Development Orchestrator SSOT

- Status: Active
- Adopted: 2026-09-14
- Owner: Product Owner 貴章
- Parent rule: `/Users/Ludique/Documents/Codex/共通開発基準/共通アプリ開発ルール_v1_2026-09-14.md`

## Purpose

This document is the parent source of truth for how CueScore development work is coordinated. Product behavior and design remain governed by the official specification set indexed in `docs/README.md`.

## Source hierarchy

1. Product Owner's latest approved Decision
2. common app development rule v1
3. this CueScore Orchestrator
4. `docs/README.md` and its official product specification set
5. `docs/CURRENT_STATUS.md`
6. `docs/handoff/CURRENT_DECISION.md`
7. `docs/handoff/CURRENT_REPORT.md`
8. current implementation, tests, and required evidence

When product specifications conflict, use the conflict order in root `AGENTS.md` and `docs/README.md`. Do not use this workflow document to override product specifications.

## Canonical current files

- Current state: `docs/CURRENT_STATUS.md`
- Current instruction: `docs/handoff/CURRENT_DECISION.md`
- Latest execution report: `docs/handoff/CURRENT_REPORT.md`
- Long-term build history: `docs/CURRENT_STATE.md`
- Official product specifications: `docs/README.md`

The Japanese files at repository root are navigation pages only. They must not duplicate the canonical bodies.

## Standard Gate flow

`Decision → baseline → minimal scoped work → focused verification → required regression → report → STOP`

- One Gate has one purpose.
- Do not proceed to a later Gate without a new Decision.
- Do not infer approval for Product ID, Bundle ID, Version, Build, TestFlight, App Store Connect, App Review, release, or publication.
- Preserve user data and existing accepted behavior unless the Decision explicitly changes them.
- Use Simulator first, then a future CueScore Dev app on wireless iPhone when physical-device validation is required. TestFlight is for distribution candidates, not routine iteration.

## Git and handoff

- GitHub `main` is the formal latest state.
- Inspect branch, HEAD, remote main, and working tree before work.
- Preserve unrelated and pre-existing changes.
- Update `CURRENT_DECISION.md` when a new Decision is accepted.
- Update `CURRENT_REPORT.md` at the Gate boundary with Decision ID, date, status, changed files, verification, unresolved items, and STOP reason.
- Commit and push only when the Decision authorizes them.

## Codex context economy

Use this reading order:

`AGENTS → common rule → parent SSOT → CURRENT_STATUS → CURRENT_DECISION → CURRENT_REPORT → required code`

- Do not load all historical reports or evidence by default.
- Start with focused tests appropriate to the changed scope.
- Reuse prior PASS evidence only when the relevant hashes and inputs still match, and record the reason.
- Quality and required verification must not be reduced merely to save context.

## Protected current boundary

### Current boundary (freshness sync, Docs-only Gate 001, 2026-10-22; facts are taken from `docs/CURRENT_STATUS.md` and `docs/CURRENT_STATE.md`, no rule or approval boundary is changed)

- Current project version/build: `1.2 (84)`. Version 1.2 Build 84 release was executed and App Store Connect state is `READY_FOR_SALE`; public propagation was pending at the last recorded status and is NOT re-verified here (see `docs/CURRENT_STATUS.md`).
- Formal Product ID: `com.takaakimailboxstar.cuescoreapps.pro` (unchanged).
- Localization P6: formally accepted, PASS 31/31 (commander judgement, 2026-10-21). P7 is NOT started.
- Still separate and not approved: Build 84 shipped-binary identity (NOT VERIFIED), public-release user-data update safety, overwrite update of the public app, TestFlight / App Store Connect / Release operations, Build 83 Match Sharing root-cause work.
- S-B (language switching of a saved interrupted match) stays `flag=false`; automatic Dynamic Type linking stays Deferred (Later).
- Approval boundaries in this document (Standard Gate flow, Git and handoff) are unchanged.

### Historical boundary (as recorded 2026-09-25; kept unchanged for history)

- Formal version/build: `1.0 (78)`
- Formal Product ID: `com.takaakimailboxstar.cuescoreapps.pro`
- App Review: Version 1.0 and CueScore Pro approved; submission `COMPLETE`
- App Version state: `READY_FOR_SALE` / `READY_FOR_DISTRIBUTION`
- Release type: `MANUAL`
- Public release: complete; Japan App Store availability confirmed by Product Owner on 2026-09-25

These facts are summarized for workflow protection. Their detailed evidence remains in `docs/CURRENT_STATE.md` and `docs/implementation/CueScore_Local_StoreKit_Transaction_Test_Environment_2026-09-14.md`.
