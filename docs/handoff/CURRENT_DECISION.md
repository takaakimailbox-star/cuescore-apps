# CueScore Current Decision

- Decision ID: `CUESCORE-GITHUB-HANDOFF-ENABLE-20260914`
- Date: 2026-09-14
- Status: Approved for this Gate
- Scope: formally enable the CueScore GitHub handoff foundation

## Objective

Make `Codex → GitHub → ChatGPT` the standard CueScore handoff route by committing and publishing the already-approved documentation foundation to GitHub `main`.

## Authorized work

- Inspect the complete working tree and compare current HEAD with GitHub `origin/main`.
- Commit only the handoff foundation files created or updated in the preceding Gate.
- Push the handoff checkpoint when the base is safe and unchanged.
- Confirm the eight required handoff files are available from GitHub.
- Record formal GitHub handoff activation in the canonical report and the short Japanese report entry page.
- Report the resulting commit SHA and STOP.

## Protected scope

- Do not create CueScore Dev.
- Do not change product code, Xcode project or scheme, StoreKit, Bundle, Signing, Product ID, price, Version, or Build.
- Do not synchronize local main, change branch, clean worktrees, operate an iPhone, Build, upload to TestFlight, operate App Store Connect, submit to App Review, or publish the product.

## Completion condition

The handoff-only changes are present on GitHub `main`, all required paths resolve there, the canonical report marks the Gate PASS, and execution stops before any CueScore Dev work.
