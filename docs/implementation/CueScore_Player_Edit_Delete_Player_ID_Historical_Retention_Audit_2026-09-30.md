# CueScore — Player Edit Delete / Player ID / Historical Match Retention Audit

- Date: 2026-09-30 (JST)
- Gate: Investigation / Design only
- GitHub `main` baseline: `88f0eda30eb3b1437e6c24401e9bbd922d19d969`
- Classification: **B — History preserved but derived identity / presentation has gaps**
- Product source changes in this audit: **0**

## 1. Conclusion

The missing Player Edit delete action is an implementation regression, not a later adopted design change. The actual editor button and delete handler remain in source, but the legacy global rule `.player-editor-delete { display: none !important; }` still suppresses the button. A separate delete action is currently rendered in Player Detail, which conflicts with Official 037's rule that deletion is shown only in existing Player Edit. Official 077 / 078 also require Edit to retain the delete action.

Player ID is real, stable application data and must remain in storage and runtime references. Its visible UUID row in Player Edit was introduced by the Primary Player implementation (`1fb2bcc`) and documented in an implementation report, but no current Official Decision requires it to be user-visible. Removing only the visible row and its population code is compatible with Official 101 / 102, Backup / Restore, Match Sharing, analytics routing and debugging through source/dev tools.

Deleting a Player removes only the Player Library record. It does not rewrite or remove completed Match records. Therefore the required 10-Match scenario retains all ten Matches, names, scores, events, progress and `sharedMatchId`; Player A retains 10 games and the same wins / win rate / discipline results / trends / opponent grouping. However, current behavior has gaps that prevent classification A:

1. completed Match records do not snapshot Player avatar; deleting Player B changes its historical avatar to the neutral default;
2. deleted Player identities remain selectable in several record-derived global Analytics / Ranking / VS surfaces even though the Player is absent from Player Library and Player Detail;
3. `recordsForRegisteredPlayer` falls back by name whenever a record's `registeredPlayerId` no longer exists, so a newly registered Player with the same name can inherit the deleted Player's old records;
4. an in-progress snapshot can retain the deleted ID and later complete with that historical reference;
5. the per-delete safety snapshot is stored internally but no user-facing restore route for `rotationScoreboard.beforeDelete.*` was found.

## 2. Evidence baseline and authority

Fresh fetch / read-back:

- local `HEAD`: `88f0eda30eb3b1437e6c24401e9bbd922d19d969`
- `origin/main`: `88f0eda30eb3b1437e6c24401e9bbd922d19d969`
- repository main read-back: `88f0eda30eb3b1437e6c24401e9bbd922d19d969`

Applied authority:

- Official 037: Player deletion appears only in existing Player Edit; confirmation, destructive backup and historical retention are unchanged.
- Official 054 / 055: individual Player deletion backs up only the deleted entity; historical Matches referencing a deleted Player remain displayable and are not blanket orphan-rejected.
- Official 077 / 078: Registration hides delete; Edit retains the existing delete action.
- Decision Log v2.5 Decision 030: Match Sharing uses symmetric receiver-local mapping and internal local IDs are not normally displayed; it does not supersede Player deletion.
- Official 101 / 102: sender local Player ID is not transported; receiver mapping is explicit; `sharedMatchId` is retained but not shown in normal UI.
- `CURRENT_STATE`: records the move of Player delete from the viewing surface to Player Edit.

No later Official Decision was found that intentionally removes Player Edit deletion or requires a visible Player UUID.

## 3. Delete UI root cause

Current source contains all three parts of the editor delete route:

- DOM button: `#playerEditorDeleteBtn` / `このプレーヤーを削除`
- mode rule: `openPlayerEditor` removes `.hidden` for an existing Player
- handler: `deletePlayerEditor` → `deletePlayerByIdV1`

The button is still invisible because `index.html` contains a global `display:none !important` rule introduced in initial commit `086b56d` when delete was moved to the editor header. The later header route was removed, and later modal/full-screen CSS styles the body button but cannot override the earlier `!important` rule. Current structural tests assert the class toggle, not computed visibility, so they pass while the physical UI fails.

Current source also renders `data-player-detail-delete` in the final inline Player Detail renderer and wires it to the same handler. This is an Official mismatch: the action is in Player Detail while the required Player Edit action is suppressed. `tests/build8-iphone-review.test.mjs` only checks `player-detail-build6.js`, so it misses the later inline renderer; `tests/delete-workflows.test.mjs` explicitly expects the current Player Detail action. These tests encode conflicting implementation expectations, not conflicting Official Decisions.

## 4. Player ID visible UI

Source path:

- `#playerEditorIdV1` contains visible label `Player ID` and a `<code>` element.
- `openPlayerEditor` sets `hidden=false` and writes `player.id` for existing Players.
- the row is therefore visible and exposed to the accessibility tree in Edit; Registration keeps it hidden.

Origin:

- introduced by commit `1fb2bcc` (`Add primary player settings`);
- implementation report states that immutable Player ID is displayed in Edit;
- not found as a current Official visible-UI requirement;
- no other normal user-facing `Player ID` label was found.

Decision: visible UI can be removed later without deleting or changing the actual Player ID. Keep `player.id`, Match `registeredPlayerId`, Backup / Restore normalization, Match Sharing receiver mapping and runtime navigation intact. No current automated test requires this UUID row to remain visible.

## 5. Current Player deletion transaction

`deletePlayerByIdV1` performs:

1. exact Player lookup by local ID;
2. confirmation: `「name」を削除しますか？` plus `このプレーヤーを削除しても、過去の試合履歴は残ります。`;
3. internal destructive snapshot containing the deleted Player only (`backupScope: deleted-player-only`, `matchRecords: []`);
4. Player Library rewrite excluding that ID;
5. clearing any live Match Setup slot that currently selects that Player;
6. refresh of derived views and cloud-dirty marking;
7. toast that historical Match history is retained.

It does not modify completed Match records, scores, event logs, analysis, progress, local Match IDs, `registeredPlayerId` references or `sharedMatchId`.

## 6. Required 10-Match scenario

Isolated fixture: Player A and Player B, ten completed Matches, Player A wins six. Player B is deleted from a copied Player collection; no Product Owner data is used.

### Match History / Detail

- Match count: 10 → 10, PASS.
- Stored Player B name: retained in every Match, PASS.
- scores, event log, analysis and progress: byte-for-byte Match collection unchanged, PASS.
- Match Detail remains openable from the active Match record, PASS by source contract and focused regression coverage.
- Player B avatar: becomes the neutral default because normal completed Match save stores no avatar snapshot and Match Detail resolves avatar only from current Player Library. This is a presentation gap, not Match loss.

### Remaining Player A

- total games: 10, PASS.
- wins: 6, PASS.
- win rate: 60%, PASS.
- discipline filters, trends and metrics: still consume the same ten records, PASS for the fixture/source contract.
- opponent / VS group for Player B: 10 Matches under the stored Player B ID/name, PASS.
- Free: the same global newest-20 access policy applies; deletion does not remove stored Matches or change the boundary. The ten-Match fixture is fully eligible.

### Deleted Player B

- absent from Player Library and cannot open registry-backed Player Detail, PASS / expected.
- registry-backed Player B Analytics is no longer reachable, expected.
- record-derived global Dashboard / Analytics / Ranking / VS choices can still include Player B as a historical participant. This is internally consistent with immutable Matches but not consistent across all Player surfaces and needs a PO decision.

### Main Player

- deletion is currently allowed with the same confirmation.
- if the Main Player is deleted, no replacement is required and the library can validly contain zero Main Players.
- existing normalization prevents more than one Main Player but explicitly permits zero.

### In-progress Match

- an immediately selected Match Setup slot is cleared by the delete handler.
- a previously persisted in-progress snapshot is not rewritten by Player deletion. If resumed, it keeps snapshot names and the old selected local ID; its avatar falls back to neutral and completion may save a historical `registeredPlayerId` that no longer exists in Player Library.
- no score/event loss was found, but the identity lifecycle is not explicitly gated.

### Demo Data

- storage keys and delete backup prefix are Demo-aware, so Demo deletion remains isolated from normal data.
- current Match Sharing export/import remains disabled in Demo.

## 7. Backup / Restore

- normal full Backup after Player deletion contains the remaining Player collection and all ten Matches; Restore accepts historical Matches whose Player ID is no longer registered.
- `sharedMatchId` is preserved by Backup / Restore and remains visible to duplicate lookup.
- the individual pre-delete snapshot contains only the deleted Player and no Matches, as Official 054 / 055 require.
- source search found creation of `rotationScoreboard.beforeDelete.*` snapshots but no user-facing route that restores one of those individual safety snapshots. This does not break ordinary Backup / Restore, but the recovery value of the internal destructive snapshot is incomplete from a user perspective.

## 8. Match Sharing

- imported Match remains in the normal full saved collection after its mapped local Player is deleted.
- imported Match keeps both local `registeredPlayerId` values, local Match ID and `sharedMatchId`; only the Player registry record is removed.
- duplicate lookup is based on active completed Match `sharedMatchId`, not Player existence, name, visible Free history or the mapping screen. The same QR remains rejected while the Match remains active.
- Player deletion alone cannot enable a duplicate import and creates no second Match.
- if the Match itself is later deleted, current adopted behavior permits re-import with explicit mapping; a backup-only deleted Match is not an active duplicate source.
- sender IDs and sender avatars remain omitted; deletion does not alter Official 101 / 102 transport privacy.

## 9. Test evidence

Focused source tests:

- command scope: delete workflows, Official Build 8 placement, Player Detail compatibility, Build 15 Backup migration, Match Sharing Stage 2 / 3 / 5B
- result: **79 PASS / 0 FAIL / 0 skipped**

Isolated 10-Match fixture:

| Check | Result |
| --- | --- |
| Player count decreases by 1 | PASS |
| Match count remains 10 | PASS |
| Match collection is not rewritten | PASS |
| Match Detail facts / events / progress remain | PASS |
| Player A games / wins / win rate = 10 / 6 / 60% | PASS |
| Player A opponent group retains 10 Matches | PASS |
| deleting non-Main preserves one Main | PASS |
| deleting Main permits zero Main | PASS |
| imported `sharedMatchId` retained | PASS |
| duplicate lookup after Player deletion | PASS |
| full Backup-style round-trip retains 1 Player / 10 Matches / shared ID | PASS |
| new same-name Player does not inherit deleted identity history | **FAIL — inherits all 10 via orphan-name fallback** |
| deleted Player historical avatar preserved | **FAIL — neutral default** |
| direct user recovery from individual pre-delete snapshot | **NOT VERIFIED / no route found** |
| physical iPhone delete UI | NOT TESTED in this Investigation Gate; PO screenshot already proves Editor delete absent |

Test-gap finding: the existing Build 8 placement test reports PASS while current inline Player Detail still renders delete and CSS hides Editor delete. It is not a reliable visual/contract gate for this issue.

## 10. Options (not adopted)

### Option 1 — hard delete Player; immutable Matches; repair identity resolution (recommended)

- keep current Player record removal and never rewrite Match facts or `sharedMatchId`;
- restore the existing delete action in Player Edit only and remove it from Player Detail;
- hide the visible UUID row only;
- use exact ID for records that have `registeredPlayerId`; use name fallback only for true legacy records with no ID;
- define deleted participants as historical snapshots for History / Detail / global aggregate display;
- decide whether to snapshot avatar at deletion or intentionally show the neutral default;
- block deletion during an active Match or explicitly preserve a historical participant tombstone for that in-progress session.

Impact: lowest schema/migration/storage risk; compatible with current Backup / Restore and Match Sharing; prevents same-name identity reassignment. The main remaining UI decision is where deleted historical participants may still appear.

### Option 2 — archive / hide Player while retaining registry identity

- add an archived state and exclude archived Players from normal Player pickers while keeping exact ID, name and avatar available to history and analytics.

Impact: strongest identity/avatar continuity, but requires Player schema, Backup / Restore, cloud, Demo, pickers, Main Player rules, Match Sharing mapping eligibility, filters and migration work. Deletion semantics become archive semantics.

### Option 3 — convert every historical participant on delete

- rewrite all affected Matches to remove the registry reference and add a complete immutable participant snapshot before deleting the Player.

Impact: can preserve name/avatar without an archived Player, but performs a large destructive multi-record migration, complicates rollback, Backup / Restore, Free-hidden Matches, in-progress state and tests. `sharedMatchId` could remain, but rewriting imported Matches is unnecessary risk. Not recommended.

## 11. Product Owner decisions needed before implementation

1. Approve Option 1 as the implementation direction, or choose archive semantics.
2. Confirm whether deleted historical participants remain visible in global Ranking / Analytics / VS, or only in History / Match Detail and remaining Player's opponent results.
3. Choose historical avatar behavior: neutral after deletion (current) or preserve a deletion-time snapshot.
4. Choose active-Match rule: block Player deletion while referenced by an in-progress Match, or allow it with explicit historical identity handling.
5. Decide whether internal per-delete safety snapshots need a user-facing recovery action.

## 12. Boundary and next Gate

Changed by this Investigation Gate:

- added this Evidence document only.

Not changed:

- product source, Player schema, Match schema, Backup / Restore implementation, Match Sharing, Version / Build, Official documents.
- no commit, push, build, archive, TestFlight or App Store Connect action.

Next Gate: Product Owner Design Decision, followed by a separately authorized implementation for Player Edit delete restoration, Player ID visible-row removal, exact identity resolution and the adopted deleted-participant presentation policy.
