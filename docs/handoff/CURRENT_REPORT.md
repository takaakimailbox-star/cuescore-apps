# CueScore Current Report

> **Current-state sync note (Docs-only Gate 001, 2026-10-22; not a Decision).** The report below is the Decision 043 Gate snapshot (baseline `9979b3d`) and is kept unchanged as history. Current state of record, as of main `bfdd4e1ea9f139a6864544c4c1a145897de1793e`:
> - Latest formal Decision: Decision 044 / Official 131 / Decision Log v2.20 (documentation only). Subsequent records: P6 final acceptance closeout (`635f6b0`) and P6 formal acceptance, PASS 31/31 (`bfdd4e1`).
> - The snapshot sentence "P6 as a whole is not PASS and P7 is not started" is superseded for P6: P6 is formally accepted PASS 31/31. P7 remains NOT started.
> - Unchanged boundaries: Build 83 RCA STOP; Build 84 binary identity NOT VERIFIED; public update safety / overwrite update / TestFlight / ASC / Release not approved; S-B `flag=false`; Dynamic Type Deferred.
> - This sync changed documentation only (4 files: `docs/Development_Orchestrator_SSOT.md`, `docs/handoff/CURRENT_DECISION.md`, `docs/handoff/CURRENT_REPORT.md`, `docs/README.md`). Product source, Native, catalog, tests and Official specifications are unchanged.
> - Gate 007 (2026-10-23, main `d0f2628`; not a Decision): the Gate 001 sync above is reflected as commit `7bab1ae`; the Player Hub tab hit-area fix (DS-REQ-018, CSS-only `::before{inset:-1px 0}`) is reflected as `d0f2628`. Web/PWA cache bump is a separate gate. All boundaries above are unchanged.

- App: CueScore Apps
- Decision ID: `CUESCORE-I18N-AC13-VOICEOVER-RELEASE-REQUIREMENT-DECISION-043-20261021`
- Date: 2026-10-21
- Previous Decision: `CUESCORE-I18N-GLOSSARY-FINALIZATION-DECISION-042-20261018`
- Preserved decision lineage: `CUESCORE-I18N-NATIVE-CAMERA-DECISION-040-20261018`、`CUESCORE-I18N-U11-CORRECTION-DECISION-039-20261017`、`CUESCORE-I18N-P1-FORMALIZATION-DECISION-034-20261013`、`CUESCORE-DYNAMIC-TYPE-DEFERRED-DECISION-20261012`、`CUESCORE-SETTINGS-UNIFIED-DESIGN-OFFICIAL-DECISION-20261012`、`CUESCORE-I18N-PHASE0-OFFICIAL-RELEASE-20261009`。
- Baseline / External GitHub main（作業開始時）: `9979b3d51dc26c614a432312d62413402c18a8f7`
- Product Source commit: 変更なし
- Gate result: `CUESCORE I18N — AC-13 VOICEOVER RELEASE REQUIREMENT REVISED / DOCUMENTATION ONLY`

## Result

Decision 043／Official 108 v1.1・130／Decision Log v2.19で、AC-13のVoiceOver実音声聴取だけをP5／P6／リリース必須条件から外した。AC-13番号と31項目、静的／DOM・翻訳・`lang`・動的文言・フォーカス要件は維持した。

直前のP6台帳へ本Decisionだけを適用した集計はPASS 28／BLOCKED 1／NOT VERIFIED 2。VoiceOver実音声以外の残項目は変更していないため、P6全体PASSとP7開始は宣言しない。

## Evidence

`docs/official/130_CueScore_Localization_AC13_VoiceOver_Release_Requirement_Decision.md`、`docs/implementation/CueScore_Localization_AC13_VoiceOver_Release_Requirement_Decision_043_Official_Release_2026-10-21.md`、文書整合テスト、Decision Log v2.19の全ページrender。

## Boundary / STOP

production source、翻訳catalog、Native、StoreKit、Device Build/install、既存アプリ、Apple Developer、TestFlight／ASC／Release、Build 84上書き、P7には進まない。
- 2026-10-23 Gate 012・013: 隔離Simulator更新リハーサル結果の記録（documentation only）。BLOCKEDはLocal StoreKit（Pro購入・復元・更新後権限）とNative Backup Share Sheet。公開版実機更新はNOT VERIFIED。
- 2026-10-24 Gate 018〜021: Version 1.3／Build 85（main `82b76d2`）を ASC `VALID`・TestFlight 内部配布まで記録（documentation only）。PO実機確認は未実施。
- 2026-10-24 Decision 045／Official 132・133／Decision Log v2.21: 新Homeを正式仕様化（Documentation-only）。実装・検証は別commit。
- 2026-10-24 新Home実装・Build 87 Archive作成（Upload未実施）。Full Node 1179／1179。Native実機タップは未確認。
- 2026-10-24 Gate 024: Build 87（新Home）をUpload、ASC `VALID`、TestFlight内部配布（documentation only）。PO実機確認は未実施。
- 2026-10-24 Gate 025: 新Home種目名の表示修正（`ae6bafd`）とBuild 88採番（`48261b6`）、Device Archive作成（Upload未実施）。実機での解消はNOT VERIFIED。
- 2026-10-24 Gate 026: Build 88（Home種目名表示修正）をUpload、ASC `VALID`、TestFlight内部配布（documentation only）。実機での解消は未確認。
- 2026-10-24 Gate 027: Build 88 PO実機受入6/6 PASS、ASC read-only確認、What's New案、公開阻害性評価（documentation only）。提出は未実施。
- 2026-10-24 Gate 028: App Store提出候補（Version 1.3ドラフト、Build 88、What's New、新Homeスクリーンショット）をASCへ反映（documentation only）。審査提出は未実施。
- 2026-10-25 Gate 029: Version 1.3／Build 88 を App Review へ提出（WAITING_FOR_REVIEW、documentation only）。審査結果・公開は未確定。
- 2026-10-26 Gate 030: Version 1.3／Build 88 一般公開完了（ASC READY_FOR_SALE、公開ストア反映確認、documentation only）。
- 2026-10-27 Decision 046／Official 134・135／Decision Log v2.22: ショットクロックB4を正式仕様化。実装・検証は別commit。
- 2026-10-27 Shot Clock B4 実装（Official 135）: Node 1195/1195、Browser／Simulator検証済み、実機NOT VERIFIED、未配布。
- 2026-10-27 Shot Clock B4 TestFlight: Version 1.4／Build 89 を内部TestFlightへ配布（IN_BETA_TESTING）。PO実機確認待ち。
- 2026-10-27 Race to表示修正（9/10-Ball、main b5b7f14）。UI/UX Pilot P1は隔離成果物のみ。
- 2026-10-28 UI/UX Pilot P1 最終比較資料を作成（製品コード変更なし）。Rotation／14-1「目標 · 2 Fouls」を表示改善候補として記録。
- 2026-10-28 UI Pilot P1 A/B比較Build（Version 1.4／Build 90）を内部TestFlightへ配布。Pilotは未採用・既定OFF。PO実機確認待ち。
- 2026-10-28 手球フリー表示削除（af30cb2）。試合画面UI/UX総合改善は隔離Prototype比較のみ（案A推奨、製品未反映）。
- 2026-10-28 案A（現行B4の高品質化）試験実装 Version 1.4／Build 91 を内部TestFlightへ配布。内部評価用の候補で未確定。PO実機確認待ち。
- 2026-10-29 ショットクロック統合改善 Version 1.4／Build 92 を内部TestFlightへ配布（Decision 047／Official 136・137／Decision Log v2.23）。PO実機確認待ち（チェックリスト: docs/implementation/CueScore_1.4_Build92_PO_Device_ShotClock_Checklist_2026-10-29.md）。
- 2026-10-29 Build 92 の試合開始不能（PO実機FAIL）を修正した Version 1.4／Build 93 を内部TestFlightへ配布（main 39874aa、VALID／IN_BETA_TESTING）。PO実機受入: 試合開始OK／ショットクロック全部OK（CLOSED）。公開準備の整理: docs/implementation/CueScore_1.4_Build93_Acceptance_and_Release_Prep_2026-10-29.md、翻訳承認資料: docs/implementation/CueScore_ShotClock_Translation_P4_Approval_Package_2026-10-29.md。Official／Decisionは変更なし。
- 2026-10-29 ショットクロック21語をPO委任に基づく最終QAでP4-APPROVED（Decision 048／Official 138・139／Decision Log v2.24、6キー修正）。Build 94準備（P1除去、時計の言語切替の鍵修正、Info.plist Export Compliance宣言）をmainへ反映、Version／Build未採番。資料: docs/implementation/CueScore_ShotClock_21_Terms_Final_QA_and_Approval_2026-10-29.md、docs/implementation/CueScore_1.4_Build94_Preparation_and_Data_Retention_2026-10-29.md。
