# D plan — initial players (Score 1 / Score 2) and match-setup card style (2026-11-01)
Base: main 168ccfd8c5e9ae72db9976500ce4a6d84a493453. Branch cloud/d-plan-initial-players (local; not pushed). No build numbering, no Archive, no upload.

## 1. New-install identification (audit result)
- Player library key `rotationScoreboard.players.v1` is absent ONLY when no Player was ever saved: save, delete-one, delete-all-players, delete-all-data (writes "[]"), backup restore (writes the key) and the corrupted-data path (key kept, copy preserved) all leave it present. The first seeding writes it, so a second launch is blocked by the same key.
- The app writes 8 default keys at every boot (4 discipline settings, breakRuleDefault.v3, matchCategories/matchSeasons "[]", language when chosen). Any OTHER CueScore key (records, in-progress match, selected discipline, dashboard player, cloud keys...) is treated as proof of earlier use -> nothing is added.
- Demo mode uses its own namespace (`cuescore-demo.*`); seeding is skipped while demo is active.
- No new persistent marker and no new schema were added.
- RESIDUAL (cannot be identified from storage): an existing install that was opened but never used (no player, no history, no other key) looks identical to a new install and receives Score 1/2 once. No stored data is touched; both players can be renamed / deleted like any other.

## 2. Implementation (index.html, match-setup-ux-v1.css only)
- `seedInitialPlayersV1()` runs before the first library read: Score 1 (main player) and Score 2, independent `makePlayerId()` IDs, default avatar, ordinary player records. Names are fixed ASCII (no i18n key, identical in ja / en / zh-Hans).
- `applyInitialSecondPlayerV1()`: on that first launch Score 2 is selected as the second player (same field updates as picking it in the library), consumed once. Later launches use the existing rule (main player auto-selected for P1; P2 chosen by the user). Start condition (final-ui-build18.js) is unchanged.
- CSS: unselected card and avatar ring = light-grey dashed; selected card = solid, Player name 20px; discipline-to-card gap `clamp(12px,3.2vh,30px)` (was `clamp(6px,1.8vh,18px)`). No red anywhere. C-plan guidance note / footer reason and their approved wording are unchanged.

## 3. Differences from the approved D image (NOT implemented — need a PO / Score decision)
1. Colour avatars (blue Score 1 / pink Score 2) and photo-style avatars: the current contract (Official avatar reset v4) forces every Player to the default silhouette. Score 1/2 use it.
2. The "x" badge on a selected avatar (clear selection): not in the written spec; it would let P1 be cleared and make the unreachable P1-unselected states reachable.
3. The image shows no guidance text for unselected cards; the approved C-plan note and footer reason were kept (the written spec says to keep the C-plan composition).
4. Deletion rules are unchanged (verified in index.html deletePlayerByIdV1): the ONLY block is for a participant of an in-progress / suspended match. There is no main-player guard, so Score 1 (main) and Score 2 can be deleted like any other Player; completed matches are kept.
