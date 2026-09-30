# CueScore Apps 1.2 (80) RC Early Duplicate UX Fix Evidence

- Date: 2026-09-30
- Repository baseline: `88f0eda30eb3b1437e6c24401e9bbd922d19d969`
- Candidate: Version `1.2`, Build `80`
- Gate: `READY FOR PRODUCT OWNER 1.2 (80) RC EARLY DUPLICATE RETEST`

## RC physical smoke finding

Product Owner physical iPhone smoke confirmed that a repeated QR remained protected from a second write, but duplicate detection reached the user only after Player mapping and Final Confirmation. The Final Confirmation then showed the generic red transaction failure text.

- Data integrity: PASS — duplicate Match write `0`, partial Player write `0`
- UX finding: duplicate detection was too late and appeared as a generic transaction failure
- Original screenshot: `outputs/match-sharing-rc-1.2-80/early-duplicate-finding-2026-09-30/IMG_3792.PNG`
- Original / saved SHA-256: `675924edc6d91647a16f447673577b9b6bee773af9e2b5aee76b814573623832`

The screenshot is preserved without image modification.

## Root cause and routing correction

The Receiver decoder already supported an early check through a record array, while production Scanner wiring did not explicitly inject the Stage 2 full-saved-collection lookup. The final transaction correctly rechecked duplicate identity, but its UI catch rendered every failure through the generic Final Confirmation error path.

The correction is deliberately narrow:

1. Production Scanner injects `findDuplicateSharedMatchIdV1` after decode and validation.
2. The lookup uses `sharedMatchId`, not name, score, date, or the visible History list.
3. A duplicate immediately renders the adopted dedicated state and never enters Player mapping.
4. `他の試合を読み取る` performs the established full Scanner close/re-entry route, which clears the previous session and starts a fresh Camera session.
5. The Stage 3 transaction's initial and final duplicate checks remain intact as integrity/race gates.
6. A duplicate discovered by the final race gate routes to the same dedicated state and no longer publishes the generic red confirmation error.

Dedicated copy remains:

- Header: `この試合はすでに取り込み済みです`
- Body: `同じ試合が試合履歴に保存されています。`
- Action: `他の試合を読み取る`
- Back: History

## Automated evidence

- Stage 5A + 5B dedicated: `35 PASS / 0 FAIL / 0 SKIPPED`
- Match Sharing Stage 1–5B focused: `103 PASS / 0 FAIL / 0 SKIPPED`
- Full Node regression: `561 PASS / 0 FAIL / 0 SKIPPED`
- Early duplicate before mapping: PASS
- Duplicate in Free-hidden full collection: PASS
- Duplicate preserved through Restore merge: PASS
- Early duplicate writes: Player `0`, Match `0`
- Retry starts a fresh Camera session and accepts a different QR: PASS
- Final duplicate race gate retained: PASS
- Final duplicate partial state: Player `0`, Match `0`
- Source / `native-web` / iOS public asset identity: PASS
- `git diff --check`: PASS

Asset SHA-256:

- `index.html`: `2b0dabd5e481524d4a682ffc6853e79b4881657f1685f1e7b6c8be10b16027f0`
- `match-sharing-receiver-v1.js`: `45041f532307211dfb708cbb9e283e1d7d3e3247960cb74e15023b0eb9c5f306`
- `match-sharing-ui-v1.js`: `0d6c0219421d65d51ab29d65fc5c44c91fd424733de991b3b311295265b90f35`

## Build evidence

- Release Simulator Build: PASS
- Product Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Version / Build: `1.2 (80)`
- `.storekit`: `0`
- Release Simulator executable SHA-256: `ab2dd6e677665fe87534fee0f96c206d2ebfd3b0fb64b15ba6dead215f738865`
- Physical RC artifact: BUILD / SIGN PASS
- Physical RC display name: `CueScore RC 1.2`
- Physical RC temporary Bundle ID: `com.takaakimailboxstar.cuescoreapps.rc12`
- Physical RC executable SHA-256: `84cc20b31ad28fcce35e97663ba703778ff83055731eac75d80409b1b9d61b86`
- Physical RC install/read-back: PASS — physical iPhone 16e
- Installed RC: `CueScore RC 1.2` / `com.takaakimailboxstar.cuescoreapps.rc12` / `1.2 (80)`
- Public app retained: `CueScore Apps` / `com.takaakimailboxstar.cuescoreapps` / `1.1 (79)`
- RC and public app coexist with separate Bundle IDs and containers

## Product Owner retest

Physical behavior is not inferred from automated tests. After the refreshed RC is installed, Product Owner checks only:

1. Read the same duplicate QR.
2. Confirm Player mapping is not shown.
3. Confirm the dedicated duplicate state appears immediately.
4. Tap `他の試合を読み取る`.
5. Confirm Camera preview restarts.
6. Confirm a different QR can be read.

Status: `NOT VERIFIED — PRODUCT OWNER PHYSICAL IPHONE RETEST REQUIRED`.

## Boundary

- Version / Build change: 0
- Schema / Backup / Free-Pro / mapping change: 0
- Commit / push: NOT PERFORMED
- Archive / Upload / TestFlight / App Store Connect: NOT PERFORMED
- Public Version `1.1 (79)`: unchanged
