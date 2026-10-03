# CueScore Current Decision

- Decision ID: `CUESCORE-SCORE-RC-IDENTITY-SOURCE-FORMALIZATION-20261003`
- Date: 2026-10-03
- Gate: `SCORE RC IDENTITY / PHYSICAL ACCEPTED / SOURCE FORMALIZED`

## Product Owner Decision

- Stage5B `.stage5b`のLocalStorage database／WAL／SHMをMac内CueScore専用Evidence領域へ退避し、read-back後に対象appだけをuninstallする。
- RCはDisplay Nameを`Score RC`へ変更し、Bundle ID `.rc12`を維持する。同一Teamでuninstallなしのoverwrite installとし、既存RC dataを保持する。
- RC iconは「RC badgeがCueScore logo右下へ重なる案」を採用する。production iconは変更しない。
- Score DEVは作成せず、Stage5Bを改名／再利用しない。

## Implemented Result

- Stage5B archive／read-back／uninstall: PASS。
- Score RC Build／sign／overwrite install: PASS。
- RC LocalStorage metadataはinstall前後一致。
- Final device inventoryは`CueScore Apps`と`Score RC`の2 apps。
- Product Ownerは`Score RC`のDisplay Name、右下overlap RC icon、既存RC data保持をPhysical iPhoneでALL PASSと判定した。
- RC environment/config commit: `c6d5763e17bd60aee02892c3a43c5632c37e4df5`。

## Boundary / STOP

- Production `CueScore Apps`、Build 84、TestFlight、App Store Connect、App Reviewを変更しない。
- Build 85、Archive／Uploadへ進まない。
- RC configurationとDocumentation／Evidenceの2 commitsだけをExternal GitHub mainへnon-force pushし、その後STOPする。
