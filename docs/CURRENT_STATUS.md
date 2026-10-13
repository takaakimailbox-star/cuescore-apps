# CueScore Current Status

- Updated: 2026-10-13
- Public Version / Build: Japan public catalog still reports `1.1 (79)`; Version `1.2 (84)` release executed and ASC is `READY_FOR_SALE`, public propagation pending
- Current project Version / Build: `1.2 (84)`
- Gate: `RELEASE EXECUTED / ASC READY_FOR_SALE / PUBLIC PROPAGATION PENDING`（Version 1.2 Build 84 release gate。変更なし）
- Localization Gate: `CUESCORE I18N PHASE 0 — OFFICIAL RELEASE PUBLISHED`（Decision 031 / Official 107・108 / Decision Log v2.7、2026-10-09）。P1: `NOT STARTED`／Localization Implementation: `NOT STARTED`／Glossary: `DRAFT / PENDING`（Official 109未作成）／Product source: `UNCHANGED`。S-B（保存済み中断試合での言語切替）は`NOT VERIFIED`（P1 runtime証明が条件）。Decision Pending: U3／U4／U6／U8／U9／U11
- Settings Design Gate: `CUESCORE SETTINGS UNIFIED DESIGN — OFFICIAL DECISION PUBLISHED`（Decision 032 / Official 110・111 / Decision Log v2.8、2026-10-12。CF-1 B案）。Implementation: `NOT STARTED`／Product source: `UNCHANGED`／P1: 未完成・未commit／Official 109: 未作成（Glossary予約）。
- Dynamic Type Gate: `CUESCORE DYNAMIC TYPE — DEFERRED DECISION FORMALIZED`（Decision 033 / Official 112 / Decision Log v2.9、2026-10-12）。自動連動: `DEFERRED（Later）`／Official 111（AC-SU-10 を含む）: 保全・改変なし／実際の iOS Dynamic Type 対応: PASS ではない／Design System アクセシビリティ要件: 不変／Product source: `UNCHANGED`／P1: 未完成・未commit。
- Localization P1 Formalization Gate: `CUESCORE I18N P1 — DECISION 034 OFFICIAL PUBLISHED / SOURCE FORMALIZATION PENDING`（Decision 034 / Official 113・114 / Decision Log v2.10、2026-10-13）。U9: RESOLVED（PO の実機 Visual Acceptance 記録を採用、A／B／C 分離）／S-B: `flag=false`（Later）／L-RES-10: 確認済み範囲を条件付き受入。P1 source は main 未反映・正式固定は別 Gate／Product source: `UNCHANGED`
- Localization P1 Source Gate: `CUESCORE I18N P1 — SOURCE FORMALIZED / GITHUB MAIN SYNCHRONIZED`（P1 source＋Settings R、2026-10-13）。Commit A `51e47011…`（P1）／B `39a61a1d…`（Settings R）／C（docs）。S-B: `flag=false`／Full Node A 692・A＋B 702 PASS／Native parity 一致／`ios/` 変更 0。P1 全体の PO Physical Acceptance は未宣言。P2 実装・S-B 有効化・Build は別 Gate
- Restore Persistence Gate: `CUESCORE RESTORE PERSISTENCE — SOURCE FORMALIZED`（2026-10-11）。Break prompt 表示時の snapshot 保存（異常終了耐性）の最小修正。Product Source Commit: `356d730852642c274e7f3fd6216e68a726e5e869`。Full Node 638/638（P1統合版 660/660）。C5追加runtime未完了、P1未統合（`IMPLEMENTATION IN PROGRESS`、S-B flag=false）、Physical PASS未記録、Build／Release変更0。
- Restore Fix Gate: `CUESCORE RESTORE FIX — SOURCE FORMALIZED / PHYSICAL REVIEW PENDING`（2026-10-10）。初回Break prompt／未確定入力のRestore復元＋Back確認ダイアログ（B案、Visual Accepted）。Product Source Commit: `74928978c80a505f59ba9e0c4f56fb9ff256984d`。Full Node 633/633。Physical PASS未記録、P1未統合（P1: `IMPLEMENTATION IN PROGRESS`、S-B flag=false）、Build／Release変更0。
- Build 84 distribution baseline: `b076e5e8b25be7a91c1e3e373923be70119a0d80`
- Version 1.2 RC Product Source Commit: `810a9e134c5de1e033eb644027c37f51834fd6d4`
- Player List Fix Product Source Commit: `7e2beb0ade0685ff331fa808273e00e6f832bd2c`
- Build 81 Source Commit: `79a031a0a656b3ea486dcf28a0def5a1243576ba`
- Player UX Accepted Product Source Commit: `a0971212b13fa09ace7bbb2b0ab2571a0cd7497b`
- Build 82 Source Commit: `7c7ba922c2ba0603757aa1a4f832324b5833dafe`
- Few-Players Content-Fit Product Source Commit: `f2cd1c769c96c1104caf33944eb35d65372f4a0e`
- Build 83 Source Commit: `1fc69c80370620b4db0448ecbcea1f5d28f003ca`
- Build 84 Match Sharing Product Source Commit: `8783c5e2ef4a73405ea6334c268422f6964fc920`
- Public availability: Version 1.1 / Build 79 remains Ready for Distribution and unchanged
- Source candidate: Match Sharing v1 plus Player Delete / Player ID / historical identity / in-progress delete protection
- Cache identity: `2.0-build84-match-sharing-fix-v1`（Build-linked app-shell identity）
- Formal status: Official 101 / 102 and Decision Log v2.6 Decision 030 record implementation COMPLETE, automated verification PASS, Product Owner physical acceptance PASS, and Version 1.2 RC integration; historical design-gate text is retained
- Fresh Build 84 evidence: dedicated `13/13`; Match Sharing `122/122`; related focused `67/67`; Full Node `609/609`; native foundation `6/6`; runtime Sender／Receiver E2E、native parity、Release Simulator Build、Release device Archive `PASS`
- Physical result: Product Owner TestFlight Build 84 Final Smoke `4/4 PASS`。cold launch → Home、Single QR共有、Back後の再共有、Camera ONでのReceiver Scannerを確認済み。Camera denied UIとSettings recoveryは先行Physical RCでPASS済み
- Build 84 Physical RC: Sender、Single QR、re-share、Receiver Native Scanner、Camera permission recovery、およびSettings-only permission UIをProduct OwnerがALL PASS
- Distribution: Version 1.2 / Build 84 Manual Release request returned HTTP 201; ASC Version 1.2 is `READY_FOR_SALE`; Japan public catalog still reports Version 1.1, so Version 1.2 public propagation is pending
- App Store Connect: Build 84 ID `51ee69a0-e238-4382-9cbb-8529f4d0a682`; `VALID`; `IN_BETA_TESTING`; `usesNonExemptEncryption=false`; audience `APP_STORE_ELIGIBLE`
- Internal group: `CueScore Internal Testers`; Build 84 included through `hasAccessToAllBuilds=true`
- Candidate state: Build 84 Match Sharing runtime fix is Product Owner Final Accepted and Apple-approved. Review Submission `935f4971-9fb9-43a9-ae28-7292bd693c7d` is `COMPLETE`; Version 1.2 / Build 84 release was executed at `2026-10-04 14:10:59.784 JST`; ASC is `READY_FOR_SALE`; public Version 1.2 display remains NOT YET VERIFIED
- Physical iPhone identity cleanup: legacy `CueScore Stage5B` LocalStorageをMac内専用Evidenceへ退避してread-back後に`.stage5b`だけをuninstall。Physical RCは同一`.rc12`へuninstallなしで上書きし、`Score RC`＋PO採用RC iconへ更新。RC LocalStorage metadataは前後一致。最終inventoryは`CueScore Apps`と`Score RC`の2 apps、Score DEVなし。Product OwnerはDisplay Name、採用icon、既存RC data保持をPhysical iPhoneでALL PASS。RC environment/config commitは`c6d5763e17bd60aee02892c3a43c5632c37e4df5`。
- Audience: `APP_STORE_ELIGIBLE`; Internal Testing Only was OFF
- Canonical instruction: `docs/handoff/CURRENT_DECISION.md`
- Canonical report: `docs/handoff/CURRENT_REPORT.md`

Detailed evidence: `docs/release/CueScore_v1.2_Build84_Manual_Release_2026-10-04.md`, `docs/release/CueScore_v1.2_Build84_Apple_Approval_Final_PreRelease_Audit_2026-10-04.md`, and `docs/CURRENT_STATE.md`.
