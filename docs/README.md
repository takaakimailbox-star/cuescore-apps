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
7. `official/07_CueScore_Official_Design_Decision_Log_v2.16_Official_Release.docx`

The App Store v1.0 official release package is managed separately under
`official/app-store-v1.0/`:

- `public/`: Privacy Policy, Terms of Use, and Support source documents.
- `submission/`: App Store Description, Keywords, Review Notes, and Release Notes.
- Revision 2（2026-09-20）はBuild 77のFree／CueScore Pro境界、StoreKit 2、Non-Consumable、Japan-only launchへ整合済み。Privacy Policy、Terms of Use、Supportの正式URLと公開メールを維持する。
- App Review連絡担当者情報、提出対象Build、初回CueScore Pro IAPの同一submission、およびApp Privacy回答はApp Store Connectの実状態を最終Evidenceとし、推測で完了扱いにしない。
- Final submission fix record: `implementation/CueScore_v1.0_Final_Submission_Fix_Japan_Only_2026-09-20.md`
- Final re-audit: `release/CueScore_v1.0_Final_Release_Readiness_Audit_2026-09-20.md`

Design System v2.1 is the current official release and successor to v2.0.
Earlier releases remain in Git history and the official archive.

Official Design Decision Log v2.16 is the current official release and successor
to v2.15. Earlier versions remain in the official directory as preceding releases.
v2.16 adds Decision 040 (Native camera permission localization) and leaves Decisions 001〜039 unchanged.
v2.15 adds Decision 039 (Localization U11 correction) and leaves Decisions 001〜038 unchanged.
v2.14 adds Decision 038 (Localization U4/U11 approval) and leaves Decisions 001〜037 unchanged.
v2.13 adds Decision 037 (Localization P4 PO approval) and leaves Decisions 001〜036 unchanged.
v2.12 adds Decision 036 (Localization P4 review policy) and leaves Decisions 001〜035 unchanged.
v2.11 adds Decision 035 (Localization U6 dialog decision) and leaves Decisions 001〜034 unchanged.
v2.10 adds Decision 034 (Localization P1 formalization) and leaves Decisions 001〜033 unchanged.
v2.9 adds Decision 033 (Dynamic Type deferral) and leaves Decisions 001〜032 unchanged.

Adopted RC decision addenda that supplement the latest Decision Log:

- `official/95_CueScore_v1.0_Post_Build37_Page_Layout_Refinement_Decision.md`
- `official/96_CueScore_v1.0_Post_Build37_Page_Layout_Refinement_Spec.md`
- `official/91_CueScore_v1.0_Build36_Match_Card_C_Fidelity_Decision.md`
- `official/92_CueScore_v1.0_Build36_Match_Card_C_Fidelity_Spec.md`
- `official/93_CueScore_v1.0_Build37_Match_Card_C_Official_Visual_Reference_Decision.md`
- `official/94_CueScore_v1.0_Build37_Match_Card_C_Official_Visual_Spec.md`
- `official/89_CueScore_v1.0_Build35_Match_Detail_Back_Input_Decision.md`
- `official/90_CueScore_v1.0_Build35_Match_Detail_Back_Input_Spec.md`
- `official/87_CueScore_v1.0_Build34_Match_Card_C_Back_Navigation_Decision.md`
- `official/88_CueScore_v1.0_Build34_Match_Card_C_Back_Navigation_Spec.md`

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
- `official/36_CueScore_v1.0_Build8_iPhone_Review_Decision.md`
- `official/37_CueScore_v1.0_Build8_iPhone_Review_Spec.md`
- `official/38_CueScore_v1.0_Build8_Average_Fouls_Per_Rack_Decision.md`
- `official/39_CueScore_v1.0_Build8_Average_Fouls_Per_Rack_Spec.md`
- `official/40_CueScore_v1.0_Build9_Foul_Rate_Metric_Trend_Popup_Decision.md`
- `official/41_CueScore_v1.0_Build9_Foul_Rate_Metric_Trend_Popup_Spec.md`
- `official/42_CueScore_v1.0_Analytics_Scope_Trend_Axis_Decision.md`
- `official/43_CueScore_v1.0_Analytics_Scope_Trend_Axis_Spec.md`
- `official/44_CueScore_v1.0_Build11_Back_Performance_Opponent_Records_Decision.md`
- `official/45_CueScore_v1.0_Build11_Back_Performance_Opponent_Records_Spec.md`
- `official/46_CueScore_v1.0_UI_Navigation_Revision_Decision.md`
- `official/47_CueScore_v1.0_UI_Navigation_Revision_Spec.md`
- `official/48_CueScore_v1.0_iPhone_UI_Back_Fix_Decision.md`
- `official/49_CueScore_v1.0_iPhone_UI_Back_Fix_Spec.md`
- `official/50_CueScore_v1.0_Global_Back_AppIcon_Decision.md`
- `official/51_CueScore_v1.0_Global_Back_AppIcon_Spec.md`
- `official/52_CueScore_v1.0_Remove_Opponent_VS_Row_Decision.md`
- `official/53_CueScore_v1.0_Remove_Opponent_VS_Row_Spec.md`
- `official/54_CueScore_v1.0_Trends_Backup_Migration_Decision.md`
- `official/55_CueScore_v1.0_Trends_Backup_Migration_Spec.md`
- `official/56_CueScore_v1.0_Release_Candidate_Public_Sample_UI_Decision.md`
- `official/57_CueScore_v1.0_Release_Candidate_Public_Sample_UI_Spec.md`
- `official/58_CueScore_v1.0_Break_Input_Immediate_Decision.md`
- `official/59_CueScore_v1.0_Break_Input_Immediate_Spec.md`
- `official/60_CueScore_v1.0_Final_UI_Data_Consistency_Decision.md`
- `official/61_CueScore_v1.0_Final_UI_Data_Consistency_Spec.md`
- `official/62_CueScore_v1.0_Match_History_List_UI_Simplification_Decision.md`
- `official/63_CueScore_v1.0_Match_History_List_UI_Simplification_Spec.md`
- `official/64_CueScore_v1.0_History_Card_Readability_Decision.md`
- `official/65_CueScore_v1.0_History_Card_Readability_Spec.md`
- `official/66_CueScore_Product_Architecture_v2.0_Navigation_Information_Architecture_Official_Release.md`
- `official/67_CueScore_v1.x_Navigation_Architecture_Decision.md`
- `official/68_CueScore_v1.x_Navigation_Information_Architecture_Spec.md`
- `official/69_CueScore_v1.0_Compact_Discipline_History_Card_Decision.md`
- `official/70_CueScore_v1.0_Compact_Discipline_History_Card_Spec.md`
- `official/71_CueScore_v1.0_Cloud_Sync_Row_Hidden_Decision.md`
- `official/72_CueScore_v1.0_Cloud_Sync_Row_Hidden_Spec.md`
- `official/73_CueScore_v1.0_Navigation_Phase2-6_Decision.md`
- `official/74_CueScore_v1.0_Navigation_Phase2-6_Spec.md`
- `official/75_CueScore_v1.0_Build24_iPhone_Review_Fixes_Decision.md`
- `official/76_CueScore_v1.0_Build24_iPhone_Review_Fixes_Spec.md`
- `official/77_CueScore_v1.0_Build25_Match_Setup_Player_Editor_Decision.md`
- `official/78_CueScore_v1.0_Build25_Match_Setup_Player_Editor_Spec.md`
- `official/97_CueScore_v1.0_Free_Pro_Monetization_Decision.md`
- `official/98_CueScore_v1.0_Free_Pro_Monetization_Spec.md`
- `official/99_CueScore_JPA9_Dead_Ball_UI_Decision.md`
- `official/100_CueScore_JPA9_Dead_Ball_UI_Spec.md`
- `official/101_CueScore_Match_Sharing_v1_Decision.md`
- `official/102_CueScore_Match_Sharing_v1_Spec.md`
- `official/103_CueScore_Player_Delete_Identity_Decision.md`
- `official/104_CueScore_Player_Delete_Identity_Spec.md`
- `official/105_CueScore_Player_UX_Finalization_Decision.md`
- `official/106_CueScore_Player_UX_Finalization_Spec.md`
- `official/107_CueScore_Localization_Decision.md`
- `official/108_CueScore_Localization_Spec.md`
- `official/110_CueScore_Settings_Unified_Design_Decision.md`
- `official/111_CueScore_Settings_Unified_Design_Spec.md`
- `official/112_CueScore_Dynamic_Type_Deferral_Decision.md`
- `official/113_CueScore_Localization_P1_Formalization_Decision.md`
- `official/114_CueScore_Localization_P1_Acceptance_Spec.md`
- `official/115_CueScore_Localization_U6_Dialog_Decision.md`
- `official/116_CueScore_Localization_U6_Dialog_Spec.md`
- `official/117_CueScore_Localization_P4_Review_Policy_Decision.md`
- `official/118_CueScore_Localization_P4_Review_Policy_Spec.md`
- `official/119_CueScore_Localization_P4_PO_Approval_Decision.md`
- `official/120_CueScore_Localization_P4_PO_Approval_Spec.md`
- `official/121_CueScore_Localization_U4_U11_Approval_Decision.md`
- `official/122_CueScore_Localization_U4_U11_Approval_Spec.md`
- `official/123_CueScore_Localization_U11_Correction_Decision.md`
- `official/124_CueScore_Localization_U11_Correction_Spec.md`
- `official/125_CueScore_Localization_Native_Camera_Decision.md`
- `official/126_CueScore_Localization_Native_Camera_Spec.md`

CueScore Localization（3言語対応: ja / en / zh-Hans）status:

- Phase 0 Official Specification Published（2026-10-09）: Decision 031 / Official 107 / Official 108 / Official Design Decision Log v2.7. Evidence: `implementation/CueScore_Localization_Phase0_Official_Release_2026-10-09.md`.
- P1 Implementation: NOT STARTED. Localization Implementation: NOT STARTED. Product source: UNCHANGED. Version 1.2 Build 84 release state: unchanged.
- Conditional specification (Official 108): saved-interrupted-match language switching (S-B) takes effect only after the P1 runtime proof (C1〜C6, T-SW-1〜10); NOT VERIFIED until then.
- Glossary: DRAFT / PENDING. Official 109 is not created. The draft is kept outside `official/` at `proposals/CueScore_Localization_Glossary_DRAFT_2026-10-08.md` and is not an official specification.
- Open Decision Pending items: U3, U4, U6, U8, U9, U11 (see Official 108 §17).

Settings Unified Design status:

- Decision 032 / Official 110 / Official 111 / Official Design Decision Log v2.8 (published 2026-10-12). Settings is unified into three cards (plan / data management / app info). Limited scope: Settings, 言語 / Language, About CueScore, 利用規約, プライバシーポリシー. Decision 014 is not modified; Decision 032 supersedes it only within that scope. Official 84 is not modified; its 62px data-row rule is superseded only for Settings at viewport height 830px or less (data rows 56px or more at 830px or less, 62px or more at 831px or more). Official 109 stays reserved for the Glossary. Evidence: `implementation/CueScore_Settings_Unified_Design_Official_Release_2026-10-12.md`.
- Implementation: NOT STARTED. Product source: UNCHANGED. P1 is unfinished and uncommitted.

Dynamic Type deferral status:

- Decision 033 / Official 112 / Official Design Decision Log v2.9 (published 2026-10-12). Automatic linking of the app text size to iOS Dynamic Type (Larger Text) is not implemented in the current v1.2 line and i18n P1; it is Later / Deferred, and any future work is decided by a separate Decision. Official 111 (including AC-SU-10) is preserved unchanged; Decision 033 only distinguishes AC-SU-10a (automatic linking: DEFERRED, not PASS) from AC-SU-10b (safe display when text is enlarged: PASS for the CSS pseudo-enlargement, 36 conditions; NOT VERIFIED under real iOS Dynamic Type). The Design System v2.1 accessibility requirements (Dynamic Type 200%, DS-REQ-033/034) are not removed or weakened. Larger Text support must not be declared as supported in the App Store until it is implemented and verified. Evidence: `implementation/CueScore_Dynamic_Type_Deferral_Official_Release_2026-10-12.md`.

Localization U6 status:

- Decision 035 / Official 115 / Official 116 / Official Design Decision Log v2.11 (published 2026-10-16). Product Owner decision: `alert`/`confirm`/`prompt` keep the standard dialogs and only the message body is translated (ja/en/zh-Hans); buttons stay with the OS; no wholesale custom-modal replacement; OS button language match is NOT VERIFIED (device check is a later step). U3/U4/U8/U11 remain DECISION PENDING. Documentation-only.

Localization U11 correction status:

- Decision 039 / Official 123 / Official 124 / Official Design Decision Log v2.15 (published 2026-10-17). Product Owner decision: `CFBundleLocalizations` (ja, en, zh-Hans) is included in the permitted U11 native settings (corrects Official 121/122, which are kept as history); the earlier Official-consistency FAIL record is kept. Documentation-only: no native, source or catalog change. Free data protection basis: encrypted full backup of a Mac (not a single-app restore guarantee); device tests prefer an isolated Bundle ID; the Build 84 overwrite update stays a separate gate.

Localization Native camera permission status:

- Decision 040 / Official 125 / Official 126 / Official Design Decision Log v2.16 (published 2026-10-18). Product Owner approved `NSCameraUsageDescription` localization for ja/en/zh-Hans with unsupported OS languages falling back to ja, independently from the in-app manual language. Decision 039's four U11 settings and prior FAIL record remain unchanged; its lproj prohibition is superseded only for the three camera-purpose `InfoPlist.strings` resources. This publication commit is documentation-only; implementation and Simulator evidence are a separate commit.

Localization U4/U11 approval status:

- Decision 038 / Official 121 / Official 122 / Official Design Decision Log v2.14 (published 2026-10-17). Product Owner decisions: U4 (Paywall and Settings plan card) is translated into ja/en/zh-Hans with fact-based wording and the StoreKit displayPrice; the Native development-language fallback policy (en to ja) is approved for P6; P5/P6 are verified first in Simulator/isolated environments; the remaining Glossary terms are prepared as a PO decision package. Product code, ASC, IAP product information and Official 109 are not changed by this Decision.

Localization P4 PO approval status:

- Decision 037 / Official 119 / Official 120 / Official Design Decision Log v2.13 (published 2026-10-17). Product Owner decisions (approval of the P4 PO Final Decision Package): the AI-verified 1,322 keys are adopted with their residual risk; the 9 R3 keys are corrected to the recommended wording and approved only after the correction is verified; sports terms are recorded as CONFIRMED by PO approval record (residual risk kept; Official 109 Glossary is not published); U3 adds a note (en/zh-Hans only) that the legal pages are Japanese; U8 translates only the Backup Share Sheet display strings; the Main badge is kept and only long player names are ellipsized. U4 (Paywall) and U11 (CFBundleDevelopmentRegion) remain DECISION PENDING. Human independent review was not performed. Documentation-only publication; implementation is done in separate commits.

Localization P4 review policy status:

- Decision 036 / Official 117 / Official 118 / Official Design Decision Log v2.12 (published 2026-10-17). Product Owner decision: the P4 translation review may proceed without a mandatory external human reviewer, by AI verification (primary-source research, in-app Official definitions, real-screen checks, key-level evidence with residual risk) and final approval by the Product Owner. A new state `P4-AI-VERIFIED` is introduced; `P4-REVIEWED` keeps its meaning (a named human reviewer) and AI results are never recorded as `P4-REVIEWED`; `P4-APPROVED` still requires the Product Owner. Human independent review is not performed and this must be stated. U3/U4/U8/U11 remain DECISION PENDING. Documentation-only; translation QA, P5 and P3-6 are separate gates.

Localization P1 formalization status:

- Decision 034 / Official 113 / Official 114 / Official Design Decision Log v2.10 (published 2026-10-13). Product Owner decisions: (1) U9 is closed by adopting the real-device Visual Acceptance records (A: PO-confirmed, B: independently confirmed, C: unconfirmed are kept separate); (2) S-B stays off for P1 (`LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false`, no language change while a saved interrupted match exists, enabling is Later / a separate Gate); (3) L-RES-10 is accepted conditionally for the confirmed range, remaining items stay NOT VERIFIED and are carried to later phases. Official 107 / 108 / 110 / 111 / 112 are unchanged; Official 109 stays reserved.
- This was a Documentation-only publication (at publication time the P1 source was not on main yet). Evidence: `implementation/CueScore_Localization_Decision_034_Official_Release_2026-10-13.md`.
- P1 source formalization (2026-10-13, a later Gate): the P1 source (i18n core, catalogs, Settings language row) and Settings Unified Design R are now on main (`implementation/CueScore_i18n_P1_Source_Formalization_2026-10-13.md`). S-B stays off (`flag=false`); this is not a declaration of the Product Owner Physical Acceptance of the whole P1. P2 implementation, S-B enabling and any Build / TestFlight / Release are separate Gates.

Player UX finalization status:

- Version 1.2 Build 84 App Review resubmission evidence: `release/CueScore_v1.2_Build84_App_Review_Resubmission_2026-10-03.md` (`WAITING_FOR_REVIEW`; Version 1.2 / Build 84; one submitted item; CueScore Pro item 0; MANUAL release)
- Version 1.2 Build 84 App Review resubmission preparation evidence: `release/CueScore_v1.2_Build84_App_Review_Resubmission_Preparation_2026-10-03.md` (Product Owner Final Smoke ALL PASS; Build 84 selected; historical pre-submit state)
- Version 1.2 Build 84 Final App Store Eligible Candidate / Internal TestFlight evidence: `implementation/CueScore_1.2_Build84_Final_App_Store_Eligible_Internal_TestFlight_2026-10-03.md` (`VALID` / `APP_STORE_ELIGIBLE` / `IN_BETA_TESTING`; historical distribution evidence)
- Version 1.2 App Review submission evidence: `release/CueScore_v1.2_App_Review_Submission_2026-10-02.md` (`APP REVIEW SUBMITTED — WAITING FOR REVIEW`; Version 1.2 / Build 83; one submitted item; MANUAL release)
- Machine-readable submission evidence: `release/evidence/CueScore_v1.2_App_Review_Submission_2026-10-02.json`
- Version 1.2 App Store submission preparation evidence: `release/CueScore_v1.2_App_Store_Submission_Preparation_2026-10-02.md` (`READY FOR PRODUCT OWNER APP REVIEW SUBMISSION`; Build 83 Final Smoke `9/9 PASS`; Version 1.2 and sole review item `READY_FOR_REVIEW`; not submitted; MANUAL release)
- Machine-readable evidence: `release/evidence/CueScore_v1.2_App_Store_Submission_Preparation_2026-10-02.json`
- Version 1.2 Build 83 Final App Store Eligible Candidate / Internal TestFlight evidence: `implementation/CueScore_1.2_Build83_Final_App_Store_Eligible_Internal_TestFlight_2026-10-02.md` (`VALID` / `APP_STORE_ELIGIBLE` / `IN_BETA_TESTING`; Product Owner final smoke pending; Build 82 superseded; App Store Version 1.2 not created)
- Version 1.2 Build 82 App Store Eligible / Internal TestFlight evidence: `implementation/CueScore_1.2_Build82_App_Store_Eligible_Internal_TestFlight_2026-10-02.md` (`VALID` / `APP_STORE_ELIGIBLE` / `IN_BETA_TESTING`; superseded pre-content-fit artifact; App Store Version 1.2 not created)
- Player sort、custom Delete dialog、success／blocked NotificationはProduct Owner Physical PASS。
- Resume Match modalのtouch yellow focus修正後、最下段CancelがBottom Navigation背面へ隠れるPhysical layout findingを確認。全3action表示、Navigation inset、modal内部scroll、backdrop ownershipを実装し、automated／390×844 Visual／native parity／Release Simulator Build／Physical RC overwrite refresh PASS。Product Owner physical re-testも5/5 PASS。
- Accepted Product Source commit: `a0971212b13fa09ace7bbb2b0ab2571a0cd7497b`。
- Physical Acceptance Evidence: `implementation/CueScore_1.2_Build81_Player_UX_Physical_Acceptance_2026-10-01.md`
- Evidence: `implementation/CueScore_1.2_Build81_Interrupted_Match_Modal_Bottom_Navigation_Fix_2026-10-01.md`
- Evidence: `implementation/CueScore_1.2_Build81_Resume_Match_Modal_Focus_Fix_2026-10-01.md`

Match Sharing v1 formal design status:

- Design / Technical Feasibility: complete
- Formal Specification: complete
- Old Receiver Flow implementation / Product Owner physical E2E: PASS; historical Evidence preserved
- Symmetric Player Mapping / Receiver UX Amendment: Product Owner ADOPTED / Formal Amendment complete
- Revised source implementation: complete; automated verification PASS; Version 1.2 RC Product Source commit `810a9e134c5de1e033eb644027c37f51834fd6d4`
- Revised physical E2E: Product Owner PASS for the accepted symmetric Receiver flow; later RC refinements and Player Delete change retain their separately recorded verification boundaries
- Formal status sync: Official 101 / 102 and Decision Log v2.6 preserve the pre-implementation Design Gate as history and record the later implementation complete, Product Owner physical acceptance, and Version 1.2 RC integration
- Version 1.2 Build 80 Internal TestFlight evidence: `implementation/CueScore_1.2_Build80_Internal_TestFlight_2026-10-01.md` (`VALID` / `IN_BETA_TESTING`; Product Owner physical verification pending; audience `INTERNAL_ONLY`, not `APP_STORE_ELIGIBLE`)
- Decision 12 remains the historical Later / Deferred registration; Official 101 / 102 are the adopted successor Decision and Specification.
- UI Prototype acceptance evidence: `implementation/CueScore_Match_Sharing_v1_UI_Prototype_PO_Acceptance_2026-09-27.md`
- Symmetric amendment evidence: `implementation/CueScore_Match_Sharing_v1_Symmetric_Player_Mapping_Amendment_2026-09-29.md`

JPA 9-Ball Dead Ball UI implementation evidence:

- `implementation/CueScore_JPA9_Dead_Ball_UI_Prototype_2026-09-25.md`
- `implementation/CueScore_JPA9_Dead_Ball_UI_Implementation_2026-09-26.md`
- `implementation/CueScore_Build79_JPA_Dead_Ball_Internal_TestFlight_2026-09-26.md` (`BLOCKED`: released Version 1.0 train closed)
- `implementation/CueScore_Build79_v1.1_JPA_Dead_Ball_Internal_TestFlight_2026-09-26.md` (`IN_BETA_TESTING`)
- `implementation/CueScore_Build79_Product_Owner_Physical_iPhone_Acceptance_2026-09-26.md` (`ALL PASS`)

Version 1.1 App Store submission preparation evidence:

- `release/CueScore_v1.1_App_Store_Submission_Preparation_2026-09-26.md` (`READY FOR PRODUCT OWNER APP REVIEW SUBMISSION`; not submitted)
- `release/evidence/CueScore_v1.1_App_Store_Submission_Preparation_2026-09-26.json`
- `release/CueScore_v1.1_App_Review_Submission_2026-09-26.md` (`APP REVIEW SUBMITTED — WAITING FOR REVIEW`)
- `release/evidence/CueScore_v1.1_App_Review_Submission_2026-09-26.json`

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
