# CueScore Current Decision

- Decision ID: `CUESCORE-1.2-BUILD84-MANUAL-RELEASE-20261004`
- Date: 2026-10-04
- Gate: `RELEASE EXECUTED / ASC READY_FOR_SALE / PUBLIC PROPAGATION PENDING`

## Product Owner Decision

- Version `1.2`／Build `84`だけをManual Releaseする。
- Release後にASC authoritative stateと日本App Store公開ページをread-only確認する。
- Product source、Build 85、Archive／Upload、TestFlight、metadata、screenshots、Privacy、CueScore Pro、price／availability、Score RC、Version 1.1を変更しない。

## Result

- Release直前identityは全件一致。Apple公式APIはManual Release requestをHTTP `201 Created`で受理した。
- Version 1.2はrelease後`READY_FOR_SALE`。Version 1.2 → Build 84、JPN only、CueScore Pro `JPY 980`を維持。
- 日本App Store公開カタログは直後もVersion 1.1を返したため、Version 1.2 public propagationは`NOT YET VERIFIED`。

## Boundary / STOP

- 公開Version 1.2表示を推測でPASSにせず、`RELEASE EXECUTED / PUBLIC PROPAGATION PENDING`としてSTOPする。
- Product source、Build 85、Archive／Upload、TestFlight、metadata等、Score RC、Version 1.1を変更しない。
- Documentation／EvidenceだけをExternal GitHub mainへnon-force pushする。
