# CueScore Current Status

- Updated: 2026-10-03
- Public Version / Build: `1.1 (79)`
- Current project Version / Build: `1.2 (84)`
- Gate: `READY FOR PRODUCT OWNER APP REVIEW RESUBMISSION — VERSION 1.2 BUILD 84`
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
- Distribution: Build 84 is available through Internal TestFlight; Build 83 remains immutable in its historical TestFlight state; Version 1.2 and its sole review item are `READY_FOR_REVIEW`; Release `NOT STARTED`
- App Store Connect: Build 84 ID `51ee69a0-e238-4382-9cbb-8529f4d0a682`; `VALID`; `IN_BETA_TESTING`; `usesNonExemptEncryption=false`; audience `APP_STORE_ELIGIBLE`
- Internal group: `CueScore Internal Testers`; Build 84 included through `hasAccessToAllBuilds=true`
- Candidate state: Build 84 Match Sharing runtime fix is Product Owner Final Accepted and selected for Version 1.2 Review. Review Submission `935f4971-9fb9-43a9-ae28-7292bd693c7d` contains Version 1.2 only, has no submitted date, and is `READY_FOR_REVIEW`; release remains `MANUAL`
- Audience: `APP_STORE_ELIGIBLE`; Internal Testing Only was OFF
- Canonical instruction: `docs/handoff/CURRENT_DECISION.md`
- Canonical report: `docs/handoff/CURRENT_REPORT.md`

Detailed evidence: `docs/release/CueScore_v1.2_Build84_App_Review_Resubmission_Preparation_2026-10-03.md` and `docs/CURRENT_STATE.md`.
