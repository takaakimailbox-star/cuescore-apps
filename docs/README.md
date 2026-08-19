# CueScore Official Documentation

This directory contains the official specifications and adopted UI references
for CueScore Apps. Rotation Scoreboard is retained in the official archive as
the initial reference implementation and historical product context.

## Single Source of Truth

The following seven documents are the current official specification set:

1. `official/01_CueScore_Product_Architecture_v1.0.docx`
2. `official/02_CueScore_Design_System_v2.1_Official_Release.docx`
3. `official/03_CueScore_UI_Kit_v1.0.docx`
4. `official/04_CueScore_UI_Components_v1.1_Official_Release.docx`
5. `official/05_CueScore_Development_Workflow_v1.0.docx`
6. `official/06_CueScore_Documentation_Standard_v1.0_Official_Release.docx`
7. `official/07_CueScore_Official_Design_Decision_Log_v2.0_Official_Release.docx`

The App Store v1.0 official release package is managed separately under
`official/app-store-v1.0/`:

- `public/`: Privacy Policy, Terms of Use, and Support source documents.
- `submission/`: App Store Description, Keywords, Review Notes, and Release Notes.
- Privacy Policy、Terms of Use、Supportの正式URLと公開メールは2026-08-13に確定済み。App Review連絡担当者情報と実提出ビルドでの最終一致は未確認であり、推測で完了扱いにしない。

Design System v2.1 is the current official release and successor to v2.0.
Earlier releases remain in Git history and the official archive.

Official Design Decision Log v2.0 is the current official release and successor
to v1.9. Earlier versions remain in the official directory as preceding releases.

Adopted RC decision addenda that supplement the latest Decision Log:

- `official/08_CueScore_v1.0RC_GameResult_Statistics_Spec.docx`
- `official/09_CueScore_v1.0RC_Player_Analytics_Discipline_Statistics_Spec.md`
- `official/10_CueScore_v1.0RC_UI_Unification_PlayerDetail_Bugfix_Decision.md`
- `official/11_CueScore_v1.0RC_JPA9_MatchPoint_Decision.md`
- `official/12_CueScore_Later_Match_Sharing_Decision.md`
- `official/13_CueScore_v1.0FinalRC_GameResult_Close_Decision.md`
- `official/14_CueScore_v1.0FinalRC_GameResult_MatchDetail_6Disciplines_Decision.md`
- `official/15_CueScore_v1.0FinalRC_GameResult_MatchDetail_6Disciplines_Spec.md`
- `official/16_CueScore_v1.0FinalRC_GameResult_MatchDetail_CommonLayout_Decision.md`
- `official/17_CueScore_v1.0FinalRC_GameResult_MatchDetail_CommonLayout_Spec.md`
- `official/18_CueScore_v1.0FinalRC_JPA9_Result_Detail_Metrics_Refinement_Decision.md`
- `official/19_CueScore_v1.0FinalRC_JPA9_Result_Detail_Metrics_Refinement_Spec.md`
- `official/20_CueScore_v1.0FinalRC_6Disciplines_RaceTo_Display_Decision.md`
- `official/21_CueScore_v1.0FinalRC_6Disciplines_RaceTo_Display_Spec.md`
- `official/22_CueScore_v1.0FinalRC_9Ball_10Ball_Masuwari_Judgement_Fix_Decision.md`
- `official/23_CueScore_v1.0FinalRC_9Ball_10Ball_Masuwari_Judgement_Fix_Spec.md`
- `official/24_CueScore_v1.0FinalRC_Restore_QuotaExceeded_Safety_Decision.md`
- `official/25_CueScore_v1.0FinalRC_Restore_QuotaExceeded_Safety_Spec.md`
- `official/26_CueScore_v1.0_PostBuild2_ManualTurnChange_UI_Unification_Decision.md`
- `official/27_CueScore_v1.0_PostBuild2_ManualTurnChange_UI_Unification_Spec.md`
- `official/28_CueScore_v1.0_Build4_Player_Analytics_Renewal_Decision.md`
- `official/29_CueScore_v1.0_Build4_Player_Analytics_Renewal_Spec.md`
- `official/30_CueScore_v1.0_Build5_Player_Origin_Analytics_Decision.md`
- `official/31_CueScore_v1.0_Build5_Player_Origin_Analytics_Spec.md`
- `official/32_CueScore_v1.0_Build6_Integrated_Player_Detail_Decision.md`
- `official/33_CueScore_v1.0_Build6_Integrated_Player_Detail_Spec.md`
- `official/34_CueScore_v1.0_Build7_Masuwari_Rate_TwoLevel_Player_UI_Decision.md`
- `official/35_CueScore_v1.0_Build7_Masuwari_Rate_TwoLevel_Player_UI_Spec.md`

Product Vision v1.0 Release Candidate is intentionally excluded. It must not be
used as an official source unless a future Official Release is approved and
this index is updated.

## UI Kit and UI Components

Both documents are authoritative and are used together:

- **UI Kit v1.0** defines component classification, layout patterns, screen
  templates, and the shared UI library.
- **UI Components v1.1** defines component contracts, states, interactions,
  accessibility, prohibited behavior, and acceptance criteria.
- **Design System v2.1** is authoritative for shared tokens, dimensions,
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
