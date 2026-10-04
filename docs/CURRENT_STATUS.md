# CueScore Current Status

- Updated: 2026-10-04
- Public Version / Build: Japan public catalog still reports `1.1 (79)`; Version `1.2 (84)` release executed and ASC is `READY_FOR_SALE`, public propagation pending
- Current project Version / Build: `1.2 (84)`
- Gate: `RELEASE EXECUTED / ASC READY_FOR_SALE / PUBLIC PROPAGATION PENDING`
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
