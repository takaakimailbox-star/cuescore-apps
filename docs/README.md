# CueScore Official Documentation

This directory contains the official specifications and adopted UI references
for CueScore Rotation Scoreboard.

## Single Source of Truth

The following seven documents are the current official specification set:

1. `official/01_CueScore_Product_Architecture_v1.0.docx`
2. `official/02_CueScore_Design_System_v2.0_Official_Release.docx`
3. `official/03_CueScore_UI_Kit_v1.0.docx`
4. `official/04_CueScore_UI_Components_v1.0_Official_Release.docx`
5. `official/05_CueScore_Development_Workflow_v1.0.docx`
6. `official/06_CueScore_Documentation_Standard_v1.0_Official_Release.docx`
7. `official/07_CueScore_Official_Design_Decision_Log_v1.0_Official_Release.docx`

Design System v2.0 is the official successor to Design System v1.0, whose
source file is not present in the current official archive.

Product Vision v1.0 Release Candidate is intentionally excluded. It must not be
used as an official source unless a future Official Release is approved and
this index is updated.

## UI Kit and UI Components

Both documents are authoritative and are used together:

- **UI Kit v1.0** defines component classification, layout patterns, screen
  templates, and the shared UI library.
- **UI Components v1.0** defines component contracts, states, interactions,
  accessibility, prohibited behavior, and acceptance criteria.
- **Design System v2.0** is authoritative for shared tokens, dimensions,
  colors, typography, motion, and cross-screen visual rules.

## Adopted UI References

Officially adopted UI images belong in:

`assets/adopted-ui/`

No adopted UI images were included when this documentation set was created.
Images must be explicitly approved before being added as official references.

## Conflict Resolution

When sources conflict:

1. use the latest applicable Official Design Decision Log entry;
2. use the latest applicable Official Release specification;
3. apply the documented responsibility split between Design System,
   UI Components, and UI Kit;
4. use officially adopted UI references;
5. consult the current implementation only when official sources are silent.

Drafts, proposals, review copies, Release Candidates, and unapproved chat
decisions are not official specifications.

## Updating Official Documentation

An official-document update must:

1. retain the previous version in Git history;
2. use a clearly identified Official Release file;
3. update version, status, publication date, approval record, and revision
   history inside the document;
4. update this index in the same change;
5. record affected decisions and implementation impact;
6. avoid placing Draft or Release Candidate files in `official/`.
