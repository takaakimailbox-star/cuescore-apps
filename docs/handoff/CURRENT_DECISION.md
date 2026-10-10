# CueScore Current Decision

- Decision ID: `CUESCORE-RESTORE-PERSISTENCE-SOURCE-FORMALIZED-20261011`
- Date: 2026-10-11
- Previous Decision（継続・変更なし）: `CUESCORE-RESTORE-FIX-SOURCE-FORMALIZED-20261010`（初回Break prompt／未確定入力のRestore復元、Back UX B案）。さらに前: `CUESCORE-I18N-PHASE0-OFFICIAL-RELEASE-20261009`（Phase 0 Official Release。Official 107／108、Decision Log v2.7、S-B NOT VERIFIED、Decision Pending U3／U4／U6／U8／U9／U11は維持）
- Gate: `CUESCORE RESTORE PERSISTENCE — SOURCE FORMALIZED`

## Product Owner Decision
- Restore Persistence Root Cause調査を受け、B案の最小修正・回帰検証、およびレビュー後のGitHub正式固定（Product Source commit → Documentation commit → non-force push → read-back）を承認。

## Result
- Product Source commit `356d730852642c274e7f3fd6216e68a726e5e869`（`fix: persist pending break prompt state`）。Documentationは別commit。
- 範囲外: prompt を開いた後の球・Scratch・breaker 変更の保存（異常終了でその変更は失われうる）。

## Boundary / STOP
- P1統合、C5追加runtime、S-B有効化（flag=false維持）、P2、Build番号変更、Archive／Upload／TestFlight／App Store Connect／Release、Score RC変更は承認されていない。P1は`IMPLEMENTATION IN PROGRESS`／未統合。
- C5は未完了のまま次Gateに維持。Product Owner Physical PASSは未記録。Official仕様、Match／Snapshot schema、QR／Backup、IAP、Free／Proは変更しない。
