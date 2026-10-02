# CueScore Current Decision

- Decision ID: `CUESCORE-1.2-BUILD84-APP-STORE-ELIGIBLE-INTERNAL-TESTFLIGHT-20261003`
- Date: 2026-10-03
- Gate: `BUILD 84 VALID / APP_STORE_ELIGIBLE / INTERNAL TESTFLIGHT AVAILABLE / PRODUCT OWNER FINAL SMOKE PENDING`

## Result

- Product OwnerはVersion `1.2`／Build `84` Physical RCでMatch Sharing Sender／Receiver、Single QR、re-share、Native Scanner、Camera permission recovery、Settings-only permission UIをALL PASSと判定した。
- Build 83のprivacy failure、共有IDの早期保存、Receiver recovery flashをBuild 84 Product Source `8783c5e2ef4a73405ea6334c268422f6964fc920`で修正し、Official 101／102のcontractは変更していない。
- Version 1.2 Build 83のReview Submissionは取り下げ済みで、App Versionは`DEVELOPER_REJECTED`。Build 83のInternal TestFlight、`VALID`／`APP_STORE_ELIGIBLE`、release type `MANUAL`は維持する。
- Build 84は通常の`TestFlight & App Store`経路で`VALID`／`APP_STORE_ELIGIBLE`／Internal `IN_BETA_TESTING`へ到達し、Product Ownerが`1.2 (84)`を取得可能。

## Boundary

- Build 84はInternal TestFlightまで。Version 1.2 Review Build差替え、Review再提出、Release、External TestFlight、Build 85へ進まない。
- dirty local mirrorと旧worktreeへ触れず、External GitHubを正本とする。

## STOP

Documentation-only commitとExternal GitHub同期後STOP。次工程はProduct Owner Build 84 Match Sharing Final Smoke。
