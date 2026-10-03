# CueScore Apps Physical iPhone App Identity Cleanup Evidence

- Date: 2026-10-03
- Baseline / External GitHub main: `94aeec84595ffa25049fd7ab32800093850f3059`
- Branch: `codex/build84-match-sharing-fix`
- Device: physical iPhone 16e (`00008140-00020C523E69801C`)
- RC environment/config commit: `c6d5763e17bd60aee02892c3a43c5632c37e4df5`
- Result: `PRODUCT OWNER SCORE RC IDENTITY PHYSICAL ACCEPTANCE — ALL PASS`

## Conclusion

Legacy `CueScore Stage5B`のLocalStorageを承認済みのMac内専用Evidence領域へ退避し、read-back後に対象Bundleだけをuninstallした。Physical RCはBundle IDを維持したまま`Score RC`と採用RC iconへ切り替え、uninstallなしで上書きinstallした。production／TestFlight版、App Review、App Store Connectには触れていない。

## Stage5B archive and deletion

- Pre-delete identity: `CueScore Stage5B` / `com.takaakimailboxstar.cuescoreapps.stage5b` / `1.1 (79)`。
- Classification: 役割を終えたlegacy Stage 5B test。現在のPhysical検証は`.rc12`環境で代替でき、current workflow dependencyは0。
- Archive location: `/Users/Ludique/Documents/Codex/device-evidence/CueScore/2026-10-03/Stage5B-before-delete/RawLocalStorage`。repository外、Mac内CueScore専用Evidence領域。
- `localstorage.sqlite3`: 49,152 bytes / SHA-256 `ba86cc5ca044bc12e469403630a7a7043cc3c6c4fad033045e4fecf9735caeee`
- `localstorage.sqlite3-shm`: 32,768 bytes / SHA-256 `9cb3536780ac673f9aaf38af6b7c9df14091822a789e975d951233ab14e42096`
- `localstorage.sqlite3-wal`: 0 bytes / SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- Archive read-back: SQLite `PRAGMA quick_check = ok`。LocalStorage key数9、credential-like key name 0、raw value表示0。read-back前後の3ファイルSHA-256一致。
- Uninstall: archive確認後、`com.takaakimailboxstar.cuescoreapps.stage5b`だけをuninstall。final inventoryでabsentを確認。
- Raw archiveはrepositoryへ追加せず、外部サービス／cloudへuploadしていない。

## Score RC identity

- Before: `CueScore RC 1.2` / `com.takaakimailboxstar.cuescoreapps.rc12` / `1.2 (84)`。
- After: `Score RC` / `com.takaakimailboxstar.cuescoreapps.rc12` / `1.2 (84)`。
- Icon: Product Owner採用の「RC badgeがCueScore logo右下へ重なる案」を専用`AppIconRC`として使用。RC icon SHA-256 `1e9da867ea7fef4e37f2d261843b59581bb5a32b7d43d6fae4cd9c4c7080ee9`。
- Production iconは変更なし。SHA-256 `49b2aa25427930af44eb9f4d90fe00265c0396fe3af6f81e8d05ef7571b072d3`。
- Release device Build / sign: PASS。Apple Development署名、Team `U26DF88PRW`、application identifier `U26DF88PRW.com.takaakimailboxstar.cuescoreapps.rc12`。
- Executable SHA-256: `ad131426a2a51cf709e81cd937e3b0701ccbe3562a65e488fce134a32afb1a28`。
- `Package.resolved` SHA-256: `1e68bbcd65eea223108220becced97a2d9eb05c79aaaa88e6f879078b8a6a0aa`。
- `.storekit`: 0。
- Install: existing `.rc12`へuninstallなしでoverwrite install。

## RC data preservation

Install前後のRC LocalStorage database／SHM／WALについて、relative path、size、modification dateをmetadata-onlyで比較した。

- Before metadata SHA-256: `36b1dade4495618d5b59634ee798aadd23533786b4c0b955bc94097658b272d0`
- After metadata SHA-256: `36b1dade4495618d5b59634ee798aadd23533786b4c0b955bc94097658b272d0`
- Database: 139,264 bytes / `2026-10-02T13:46:51.000Z`
- SHM: 32,768 bytes / `2026-10-02T21:45:34.000Z`
- WAL: 0 bytes / `2026-10-02T21:45:28.000Z`

前後一致により、RC data container内の既存LocalStorage保持を確認した。raw RC user dataはEvidenceへ複製していない。

## Verification

- RC identity dedicated + native foundation: `10/10 PASS`。
- Full Node: `613/613 PASS`、FAIL 0、SKIPPED 0。
- Native source / native-web / iOS public / built `index.html` SHA-256: `4f8840d5d9c09c67944cfe7b2ba3f4f56d3ea13b02574b0ced8e76c19a9f1da3`で一致。
- Release Simulator Build: PASS。
- Release device Build / sign / overwrite install: PASS。
- `git diff --check`: PASS。

## Final physical inventory

1. `CueScore Apps` / `com.takaakimailboxstar.cuescoreapps` / `1.2 (84)` — protected production／TestFlight candidate、変更0。
2. `Score RC` / `com.takaakimailboxstar.cuescoreapps.rc12` / `1.2 (84)` — canonical Physical RC。

`CueScore Stage5B`は削除済み。`Score DEV`は作成していない。

## Product Owner Physical Acceptance

Product OwnerはPhysical iPhone上で次の3項目を確認し、すべてPASSと判定した。

1. Display Nameが`Score RC`。
2. CueScore logo右下へRC badgeが重なる採用icon。
3. `Score RC`を開いた際に既存RC dataが保持されている。

判定: `PRODUCT OWNER SCORE RC IDENTITY PHYSICAL ACCEPTANCE — ALL PASS`。

## Physical screenshot

Product Owner提供`IMG_3849.PNG`はチャット上で確認済みで、旧3-app inventoryを示す。originalの既知情報は1170×2532、SHA-256 `b1c9ac8ab99bc22c649a2a593568fa3d8b16a891474b7d7a1052d58c9bbc39c2`。Evidence作成時点でfilesystem上の原本へ再アクセスできなかったため、repository copyは作成していない。これはProduct Ownerによる最終`Score RC`ホーム画面確認を妨げない。

## Boundary / STOP

- Source change scopeはRC専用xcconfig、Info.plist、AppIcon set、identity test、Evidence／handoffのみ。
- Production Bundle ID、production AppIcon、Build 84 product source、TestFlight、App Store Connect、App Reviewへ変更0。
- RC environment/configは専用commitへ固定し、Documentation／EvidenceとともにExternal GitHub mainへnon-force pushする。Build 85、Archive／Uploadは未実施。
- Product Owner physical review: ALL PASS。
