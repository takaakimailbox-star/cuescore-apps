# CueScore Current Report

- App: CueScore Apps
- Decision ID: `CUESCORE-1.2-BUILD84-MANUAL-RELEASE-20261004`
- Date: 2026-10-04
- Baseline / External GitHub main: `01151b9a20f00102bad19c8f60b3f972c932e809`
- Product source: `8783c5e2ef4a73405ea6334c268422f6964fc920`
- Gate result: `RELEASE EXECUTED / ASC READY_FOR_SALE / PUBLIC PROPAGATION PENDING`

## Result

Product Owner承認に基づき、Version `1.2`／Build `84`だけをManual Releaseした。Apple公式APIはHTTP `201 Created`を返し、release後のApp Store ConnectはVersion 1.2を`READY_FOR_SALE`と報告している。日本App Store公開カタログは直後もVersion 1.1のため、public propagationは未確認として保全した。

## Evidence

- Submission: `935f4971-9fb9-43a9-ae28-7292bd693c7d` / `COMPLETE` / 1 item / Version 1.2 item `APPROVED`。
- Release: requested `2026-10-04 14:10:59.784 JST`、HTTP `201 Created`。
- Version／Build: Version 1.2 `READY_FOR_SALE`／Build 84 ID `51ee69a0-e238-4382-9cbb-8529f4d0a682`／`VALID`／`APP_STORE_ELIGIBLE`。
- Availability: App／CueScore ProともJPN only、`availableInNewTerritories=false`。CueScore Pro `APPROVED`／`NON_CONSUMABLE`／`JPY 980`。
- Metadata: What's New一致、Review Notesあり、iPhone 6.5-inch screenshots `6/6 COMPLETE`。public App Store privacyは`データの収集なし`。
- Public catalog: 最終確認`2026-10-04 14:16:38 JST`時点でVersion 1.1。Version 1.2 public display／What's Newは`NOT YET VERIFIED`。Privacy `データの収集なし`、CueScore Pro `¥980`、screenshots 6件は表示維持。
- Release Evidence: `docs/release/CueScore_v1.2_Build84_Manual_Release_2026-10-04.md`。

## Boundary / STOP

Documentation／EvidenceだけをExternal GitHub mainへnon-force pushする。Product source、Score RC変更0。Build 85、Archive／Upload、TestFlight、metadata／screenshots／Privacy／IAP／price／availability、Version 1.1直接操作は未実施。`RELEASE EXECUTED / PUBLIC PROPAGATION PENDING — STOP`とする。
