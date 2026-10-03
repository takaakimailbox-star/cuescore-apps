# CueScore Current Decision

- Decision ID: `CUESCORE-1.2-BUILD84-APP-REVIEW-RESUBMISSION-20261003`
- Date: 2026-10-03
- Gate: `APP REVIEW RESUBMITTED — WAITING FOR REVIEW`

## Result

- Product OwnerはInternal TestFlight Version `1.2 (84)` Final Smokeでcold launch、Single QR共有、再共有、Receiver ScannerをALL PASSと判定した。先行Physical RCのCamera permission UI acceptanceも維持する。
- Build 83のprivacy failure、共有IDの早期保存、Receiver recovery flashをBuild 84 Product Source `8783c5e2ef4a73405ea6334c268422f6964fc920`で修正し、Official 101／102のcontractは変更していない。
- Product Owner承認後、Review Submission `935f4971-9fb9-43a9-ae28-7292bd693c7d`を提出した。Version 1.2のみ1 item、CueScore Pro item 0、Submission／App Versionは`WAITING_FOR_REVIEW`。
- Build 84は`VALID`／`APP_STORE_ELIGIBLE`／Internal `IN_BETA_TESTING`。metadata、Privacy、screenshots、CueScore Pro、price、availabilityは変更していない。release typeは`MANUAL`。

## Boundary

- Release、Automatic Release、External TestFlight、Build 85へ進まない。
- dirty local mirrorと旧worktreeへ触れず、External GitHubを正本とする。

## STOP

Documentation-only commitとExternal GitHub同期後STOP。次工程はApple審査結果後の判断。
