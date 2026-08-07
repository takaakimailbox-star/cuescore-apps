# CueScore Apps Development Instructions

## Official Sources

Before changing implementation, review:

- `docs/README.md`
- the relevant files in `docs/official/`
- the relevant references in `docs/assets/adopted-ui/`, when present

The documents listed by `docs/README.md` are the official specification set for
this repository. Drafts, review copies, Release Candidates, chat discussions,
and files outside that set are not authoritative.

## Conflict Resolution

When sources conflict, apply this order:

1. the latest applicable entry in the Official Design Decision Log;
2. the latest applicable Official Release specification;
3. the documented division of responsibility between Design System,
   UI Components, and UI Kit;
4. officially adopted UI references;
5. the current implementation.

The Documentation Standard governs document structure and publication. The
Design System governs shared tokens and visual rules. UI Components governs
component contracts, states, interactions, accessibility, prohibited behavior,
and acceptance criteria. UI Kit governs component classification, layouts,
templates, and the shared library.

If the official sources are missing, ambiguous, or contradictory, stop and ask
for a Product Owner decision. Do not invent a specification.

## Implementation Rules

- Preserve existing behavior unless the requested change explicitly modifies it.
- Make the smallest relevant change; do not perform unrelated refactoring.
- Do not add unapproved features or reconstruct existing features from guesses.
- Preserve saved-data compatibility and existing browser storage behavior.
- Preserve PWA installation, offline operation, manifest behavior, icons, and
  Service Worker update behavior.
- Keep the application version in `index.html` and `sw.js` synchronized when a
  release change requires a version update.
- Maintain the iPhone portrait and Safari/Home Screen PWA experience.
- Do not remove or replace existing data, backup, restore, import, export, or
  history behavior without explicit approval.
- Treat adopted UI images as visual references, not as permission to change
  undocumented behavior.

## Verification

Before reporting completion:

- inspect the relevant existing implementation before editing;
- verify the requested flow and nearby regression-sensitive behavior;
- verify PWA/offline behavior when the change can affect caching or startup;
- report changed files and the checks performed;
- disclose any verification that could not be completed.

## Stop Conditions

Stop and request direction when:

- official documents disagree;
- a required behavior is not specified;
- a visual reference does not define interaction or data behavior;
- the change could alter stored-data compatibility;
- the change requires deleting or replacing an existing workflow;
- Product Owner approval is required by an official document.
