# CueScore Apps 1.2 (80) RC Physical Smoke Findings #2 Evidence

- Date: 2026-09-30
- Baseline: `88f0eda30eb3b1437e6c24401e9bbd922d19d969`
- Candidate: Version `1.2`, Build `80`
- Gate: `READY FOR PRODUCT OWNER 1.2 (80) RC PHYSICAL RETEST #2`

## Physical findings

The five Product Owner screenshots are preserved without image modification under `outputs/match-sharing-rc-1.2-80/physical-smoke-findings-2-2026-09-30/`.

The screenshots establish:

- Match deletion completed and returned to History.
- Scanning the deleted Match reached mapping instead of the early duplicate state.
- Player 1 used existing local Player `ゆな`.
- Player 2 selected `＋ 新しいプレーヤーとして追加` with name `たくみ`.
- Final Confirmation then showed the generic import failure.

## Root cause

The deleted Match was not retained in the active saved Match collection. `deleteHistoricalRecordV35` writes the active collection without the deleted record. Its deletion backup is stored separately and is not read by the Stage 2 duplicate helper. Therefore a deletion backup alone does not make the QR a duplicate.

The exact failing route was a Player constraint: the first import had already created local Player `たくみ`, Match deletion intentionally left Players intact, and the second flow attempted to create another new Player named `たくみ`. Stage 3 correctly rejected this as `DUPLICATE_PLAYER_NAME` before storage writes. This reproduces the screenshot stop point with Match writes `0`, Player writes `0`, and no partial state.

## Correction and contract

- The mapping `次へ` boundary now validates pending new Player drafts against the receiver's current local Player collection.
- A same-name pending Player stays on mapping and shows: `同じ名前のプレーヤーが登録されています` / `既存のプレーヤーを選んでください`.
- The app does not auto-map by name and does not auto-create a Player.
- After explicit existing-Player mapping, a deleted Match can be imported again with the same `sharedMatchId` and a new receiver-local Match ID.
- After re-import, the same QR is duplicate again.
- If a deletion backup is restored into the active collection, the QR is duplicate again.
- Free-hidden active Matches and restored active Matches remain duplicate sources. A backup-only record is not an active duplicate source.
- The transaction's initial and final duplicate gates remain unchanged.

The product currently has deletion backup / Restore behavior, but no direct individual-Match Undo UI. Tests model the required Undo/Restore identity rule by returning the deleted record to the active collection.

## Avatar compliance

- Match Preview top summary now shows a neutral/default avatar left of each shared Player name.
- Mapping before selection and pending-new mapping use neutral/default avatar.
- Existing mapping uses only the receiver-local Player avatar and name.
- Final Confirmation uses receiver-local avatar for existing mapping and neutral/default avatar for pending new.
- Sender avatar is not transferred or rendered.

## Delete success feedback

The common accessible toast now supports an omitted secondary line. Match deletion shows only `✓ 試合を削除しました`. Deletion backup creation, active collection write, History refresh, analytics refresh, `role=status`, `aria-live=polite`, and focus behavior are unchanged.

## Tests and visual audit

- Stage 3 + Stage 5B focused: `48/48 PASS`
- Stage 5A + Stage 5B: `38/38 PASS`
- Match Sharing Stage 1–5B: `109/109 PASS`
- Full Node: `567/567 PASS`
- Release Simulator Build: PASS
- Native asset parity: PASS
- `git diff --check`: PASS

Lifecycle coverage includes import → active delete → existing-Player re-import, new local Match ID, post-reimport duplicate, backup-only non-duplicate, restored duplicate, Free-hidden duplicate, six disciplines, and zero partial writes.

At 390×844 and 360×780: clipping `0`, horizontal overflow `0`, controls below 44pt `0`, unintended Match Sharing badges `0`. Evidence is in `outputs/match-sharing-stage5b/`, including `06_Delete_Success_Toast_390x844.png` and `Visual_Audit.json`.

## Device build and install

- Release device Build/sign: PASS
- App: `CueScore RC 1.2`
- Bundle ID: `com.takaakimailboxstar.cuescoreapps.rc12`
- Version / Build: `1.2 (80)`
- Executable SHA-256: `4fbdcee2790940a41879a4f5c7a16db6423c6b1fdfe94eca58f22675e4e878fd`
- Physical iPhone 16e install/read-back: PASS
- Public app read-back: `CueScore Apps`, `com.takaakimailboxstar.cuescoreapps`, `1.1 (79)`

Physical behavior of this refreshed candidate remains `NOT VERIFIED` until Product Owner retest #2.

## Boundary

- Commit / push: NOT PERFORMED
- Archive / Upload / TestFlight / App Store Connect / Release: NOT PERFORMED
- Schema / Backup format / Free-Pro policy / Version / Build: unchanged
- Public app and public data container: unchanged
