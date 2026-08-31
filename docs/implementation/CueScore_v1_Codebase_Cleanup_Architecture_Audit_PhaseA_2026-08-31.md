# CueScore v1 Codebase Cleanup / Architecture Audit — Phase A

- Date: 2026-08-31
- Target branch: `codex/navigation-phase2-6-20260830`
- Target commit: `4a11af1` (`feat: consolidate player hub for build 27`)
- Scope: audit and report only
- Runtime changes: none
- Build / upload / App Store Connect changes: none

## 1. Executive summary

CueScore v1 is functionally shippable, but its web runtime has accumulated multiple historical UI generations in one document and several later-loaded compatibility/override layers. The largest risk is not the scoring or saved-data model itself; it is the number of overlapping renderers, listeners, observers, and hidden legacy views that remain active around otherwise-correct core behavior.

The recommended direction is **not a full rewrite before v1.0**. Keep the verified scoring, persistence, migration, backup, analytics formulas, and native wrapper contracts. Perform a staged extraction after the release candidate is fixed:

1. remove only high-confidence unreachable UI and its isolated runtime work;
2. eliminate repeated record/library reads in Player Hub;
3. consolidate Player detail and navigation lifecycle ownership;
4. separate deferred cloud/CSV code from the v1 production entry point;
5. split the monolithic document into owned modules after behavior-locking tests exist.

This sequence offers most of the maintainability and performance benefit without placing saved data or scoring behavior at rewrite-level risk.

## 2. Repository and delivery structure

### Runtime source of truth

The application is a Capacitor iOS wrapper around a large HTML/CSS/JavaScript application.

- Primary document: `index.html` (about 1.50 MB)
- Inline layers: 26 `<style>` blocks and 40 `<script>` blocks
- External runtime styles: `analysis-final-rc.css`, `analysis-build4.css`, `player-detail-build6.css`, `ui-revision-v12.css`, `player-detail-build8.css`
- External runtime scripts: `demo-data.js`, `analysis-final-rc.js`, `analytics-build4-metrics.js`, `analysis-build4.js`, `player-detail-build6.js`, `ui-revision-v12.js`, `final-ui-build18.js`, `navigation-shell-phase1.js`, `navigation-phase2-6.js`
- Native staging directory: `native-web/`
- iOS copied web bundle: `ios/App/App/public/`
- Native build assembly: `scripts/build-native-web.mjs`

`native-web/` and `ios/App/App/public/` are build products/copies, not independent architecture sources. They must not be hand-cleaned as though duplicate source files; any tracking-policy change should be a separate build-process decision.

### Non-application top-level content

- `website-archive/` (about 3.7 MB) is explicitly documented as a non-public CueScore website archive. It is not referenced by the application or native build. Preserve as an archive or move to a dedicated website/archive repository; do not silently delete it.
- `numup/`, `prachit/`, and `pracone/` are three small standalone privacy/support site packages (about 12 KB each). No CueScore source or build references were found. Their ownership/publishing destination is not documented in this repository, so classify them as **Needs Investigation**, not immediate deletion.

## 3. Current architecture findings

### 3.1 Monolithic document plus chronological patch layers

`index.html` contains markup, visual styles, storage, migrations, scoring, records, backup/restore, cloud synchronization, analytics, settings, navigation, and multiple generations of the same screens. Later external files then wrap or override functions declared earlier.

A heuristic CSS scan found approximately 4,994 selector occurrences, 3,183 unique selector strings, and 920 selectors occurring more than once. Examples with many definitions include `.player-info-content`, `.player-info-screen`, `.menu`, `.cue-home-start-v2`, and `.player-management-row-v1`. Counts are diagnostic rather than a standards-compliant CSS parse, but they accurately indicate heavy cascade ownership overlap.

### 3.2 Renderer override chains

`renderFormalPlayerDetailV1` is assigned/wrapped multiple times in `index.html`, `player-detail-build6.js`, and `navigation-phase2-6.js`. The active Player Hub renderer calls the previous renderer before replacing its result. This preserves compatibility, but means historical render work can remain in the call path.

Likewise, the original Player Library renderer and open/show functions are replaced later in `index.html`, while listeners installed by the earlier implementation remain registered. Capture-phase handlers and `stopImmediatePropagation()` currently prevent some older behavior from surfacing; this is masking rather than removing the duplicate ownership.

### 3.3 Global observers and listeners

The loaded runtime contains multiple `MutationObserver` instances, including broad observers on `document.body` from navigation and accessibility/UI layers. Several observe subtree mutations and class/style attributes. Other observers independently reconcile Player detail, History, analysis roots, and modal state.

Static occurrence counts also show substantial listener/observer density:

| File/layer | `addEventListener` occurrences | `MutationObserver` occurrences |
|---|---:|---:|
| `index.html` | 326 | 11 |
| `navigation-phase2-6.js` | 8 | 1 |
| `ui-revision-v12.js` | 6 | 4 |
| `player-detail-build6.js` | 7 | 1 |
| `final-ui-build18.js` | 3 | 1 |
| `analysis-final-rc.js` | 2 | 1 |
| `analysis-build4.js` | 2 | 1 |
| `navigation-shell-phase1.js` | 2 | 1 |

Occurrences do not equal simultaneously active callbacks in every state, but the broad observers all receive mutation records and increase regression/debugging cost.

## 4. Dead, obsolete, and duplicate candidates

### Safe-to-remove candidates (high confidence, after focused regression tests)

| Candidate | Evidence | Required guardrail |
|---|---|---|
| Legacy Home menu buttons `legacyNewGameBtn`, `legacyPlayerManagementBtn`, `legacyRecordsBtn`, `legacySettingsBtn`, `legacyOpenRankingsBtn` | Each exists as a declaration with no JavaScript reference; the current Home/navigation supplies the active routes | Home, New Match, Player, History, Settings navigation tests |
| Hidden empty `playerInfoScreen` shell | Forced hidden by later CSS and used primarily as a defensive screen-to-hide target | Player Library and global-back tests |
| Obsolete production transition diagnostics | Diagnostic observers/measurements from earlier rebuild phases remain in runtime | Confirm no test or support workflow consumes their globals/logs |
| `nav-analytics.svg` as a service-worker pre-cache item and `.nav-analytics-v1` rule | Current four-tab navigation is Home/Player/History/Settings; no live element reference was found | Offline launch and Analytics internal-entry tests; retain the asset if another packaged page uses it |

### High-confidence obsolete behavior, but coupled to shared helpers

The old Home dashboard is hidden in the current v1 UI, yet `renderHomeDashboardV50` still initializes on load/pageshow/storage and is invoked from save and derived refresh paths. It reads and filters records, aggregates results, builds choice UI, and writes a dashboard preference. Remove the renderer, hidden dashboard markup, and its isolated listeners together, but **do not remove `getFilteredRecordsV53` merely because the dashboard uses it**: current analytics also depends on that helper.

### Duplicate behavior requiring controlled consolidation

- Old and current Player Library render/open/show implementations coexist.
- The Player Library list and back controls have listeners from multiple generations.
- Player detail is a chain of multiple `renderFormalPlayerDetailV1` wrappers.
- History, analysis, modal, accessibility, navigation shell, and current navigation layers each reconcile some shared screen state.

These are not safe one-line deletions. First establish a single owner for each screen lifecycle, then remove upstream wrappers/listeners in dependency order.

## 5. Future/deferred code classification

### Cloud synchronization

The v1 release profile sets `cloudSync:false`, and cloud UI uses `data-release-feature="cloud-sync"` plus `hidden`. Official v1 material also states that automatic cloud synchronization is not offered in Version 1.0. Nevertheless, the Supabase/cloud implementation, state rendering, storage reads, listeners, dirty-state logic, and post-save hooks are loaded in production.

Classification: **Deferred feature; exclude from the v1 runtime entry point in a later cleanup, not by ad-hoc deletion.**

Risk: match completion intentionally treats local persistence as authoritative, then calls optional cloud dirty/autosave helpers asynchronously. The boundary should become an explicit no-op adapter for v1 before removing the cloud module. Backup/restore and local save must remain untouched.

### CSV export

CSV export UI is hidden and release access is false, but export generation and handlers remain loaded. Official v1 material says CSV import/export is not included.

Classification: **Deferred feature; suitable for module-level exclusion after tests confirm backup/export boundaries.**

### Official Demo Data

`ENABLE_SAMPLE_DATA_UI` is false for the Settings presentation, but `demo-data.js` is still loaded and its API participates in resolving active storage keys. The release profile explicitly sets `officialDemoData:true`, and tests/documentation rely on the behavior.

Classification: **Keep for now / Needs product decision.** It is not dead code merely because the visible Settings section is disabled.

### Analytics/ranking/vs screens

Some historical analytics/ranking/vs views are hidden or superseded, but current Player Hub routes still call existing analysis and opponent-history entry points. Treat these as architectural overlap, not wholesale dead code, until route-level coverage proves which renderer owns every destination.

## 6. Required compatibility code — do not remove for v1

- Backup schema v1/v2 migration and validation.
- Legacy saved match/name matching used to associate older records with registered players.
- Stored in-progress match fallbacks and current event/record normalization.
- Avatar normalization/migration and dynamically referenced avatar manifest assets.
- Native bundle copies produced by the build script.
- Capacitor filesystem/share/native configuration.
- Scoring rules, analytics formulas, eligibility rules, and saved-data keys/schema.

The avatar PNG set must not be classified as unused from a literal filename scan: filenames are selected dynamically through a manifest.

## 7. Performance audit

### High priority: Player Library / Player Hub record indexing

The current `renderPlayerLibrary` reads the full player list and calls `recordsForRegisteredPlayer(player)` for every player. That helper rereads Player Library and match records for each call, filters/sorts records, and can invoke `playerSideInRecord`, which itself rebuilds known player IDs through another library read.

Impact grows with both player count and record count. The current Player Hub renderer calls the same record helper again and filters by discipline. This is the clearest static hot path associated with Player navigation.

Recommended correction: create one immutable render snapshot containing players, records, known-player IDs, and a records-by-player index; pass that context to selection, list, detail, and analytics helpers. Preserve current matching semantics exactly and validate against legacy-name fixtures.

### High priority: hidden Home dashboard work

The hidden dashboard continues to aggregate on lifecycle/storage/save events. Removing that isolated obsolete work should reduce background computation and storage churn without touching scoring.

### Medium priority: broad observer consolidation

Replace body-wide mutation reconciliation with explicit screen lifecycle events/state transitions. Keep at most one narrowly scoped fallback observer during migration. This is primarily an architectural stability improvement; timing gains will depend on how frequently screens mutate.

### 9-Ball follow-up

The Build 27 change already prevented duplicate setup initialization while the setup screen is active and avoided redundant active-match snapshot parsing in that path. Current inspection did not find a new heavy branch unique to 9-Ball: discipline selection mainly updates rule/race/setup state shared with the other disciplines.

At 390×844 in the local browser audit, Home, Player, History, Settings, and New Match navigation rendered without console errors. Automated interaction settlement for the four primary tabs was roughly 284–300 ms. The New Match automation call settled around 3.06 s, but that measurement includes browser-tool settling and cannot be treated as visible user-perceived paint time. The previously reported physical-iPhone-only freeze remains unproven locally; physical-device validation is still required before claiming it eliminated.

## 8. Text selection audit

At 390×844, computed `user-select` was `auto` for the body, Home heading, and New Match control. General application chrome and controls are therefore selectable. Only isolated surfaces currently declare `user-select:none`.

Recommended Phase B behavior:

- apply no-selection to app chrome, tab/navigation controls, buttons, cards, game controls, and drag/touch surfaces;
- preserve selection for `input`, `textarea`, `select`, editable content, legal pages, support/privacy/terms text, record details where copying is useful, and accessibility-driven text interactions;
- include `-webkit-user-select` for the iOS web view;
- verify long-press, VoiceOver focus, form editing, and legal-text copying on a physical iPhone.

Do not apply a blanket `body { user-select: none; }` rule without explicit exceptions.

## 9. Cleanup proposal by risk

### Phase B1 — low risk, release behavior locked

1. Add characterization tests for Home routes, Player management/selection, Player Hub tabs, old saved records, backup migration, and result-save navigation.
2. Remove declaration-only legacy Home buttons.
3. Stop and remove the hidden Home dashboard renderer/listeners while retaining shared record-filter helpers.
4. Remove confirmed obsolete diagnostic observers and the unused Analytics tab pre-cache entry.
5. Add scoped text-selection policy with editable/legal exceptions.

### Phase B2 — medium risk, performance-focused

1. Introduce one read-only player/record snapshot and indexes per render/navigation transaction.
2. Make Player Library and Player Hub consume the snapshot without changing record association semantics.
3. Measure with small, representative, and large legacy datasets on Simulator and physical iPhone.
4. Collapse duplicate Player Library listeners and give its back/list controls one owner.

### Phase B3 — medium/high risk, architecture-focused

1. Define one navigation state machine/lifecycle API.
2. Replace Player detail wrapper chains with one renderer and explicit subroutes.
3. Consolidate broad observers into explicit events plus one temporary narrow fallback.
4. Separate screen-specific CSS ownership and remove superseded selectors only after screenshot comparisons.

### Phase B4 — deferred-feature packaging

1. Move cloud and CSV implementations behind separate module entry points.
2. Ship v1 with tested no-op adapters and without loading deferred UI/runtime code.
3. Keep Official Demo Data until its product role and storage-key contract are explicitly retired or separated.

### Phase B5 — source decomposition

Split `index.html` by stable domain boundaries: storage/migrations, scoring engines, match state, player records/indexes, backup, screen renderers, navigation, and release feature adapters. Use extraction rather than semantic rewrite, with tests run after every boundary move.

## 10. Rewrite recommendation

### Recommendation: no full rewrite

A full rewrite before or immediately after v1 would put the most valuable and difficult-to-reconstruct behavior at risk: multi-discipline scoring, old-record association, in-progress restoration, backup migration, analytics eligibility/formulas, and iOS web-view behavior. The present problems are primarily duplicated presentation/lifecycle ownership and inefficient data access, both of which can be repaired incrementally.

Reconsider a new shell only after:

- current saved-data and backup contracts have golden fixtures;
- every discipline has scoring replay tests;
- Player/History/Analytics routes have characterization tests;
- the existing runtime has a single navigation owner;
- performance baselines exist on physical devices.

Even then, reuse the verified domain/storage layer rather than rewriting it with the UI.

## 11. Phase A decision gate

No deletion, refactor, text-selection change, build-number change, archive, upload, TestFlight action, App Store Connect modification, or App Review submission was performed in this phase.

Before Phase B begins, Product Owner approval is required for:

1. the staged cleanup order above;
2. removal of the hidden Home dashboard behavior;
3. scoped text-selection behavior;
4. whether Official Demo Data remains a production-supported capability;
5. whether the website archives and unrelated privacy/support packages stay in this repository or move elsewhere.

**STOP: Phase A audit complete. Await Phase B approval.**
