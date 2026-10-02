# CueScore Current Decision

- Decision ID: `CUESCORE-1.2-PLAYER-LIST-CONTENT-FIT-20261002`
- Date: 2026-10-02
- Gate: `PLAYER LIST FEW-PLAYERS CONTENT FIT / PRODUCT OWNER PHYSICAL ACCEPTED / UNDISTRIBUTED`

## Result

- 少人数Player List cardを内容量に合わせ、最終Player row直後でcardを終了する。
- 多人数時の実scroll owner、Bottom Navigation clearance、Safe Area、sort、row／鉛筆1:1を維持する。
- 0／1／2／7／11／12 Players、検索結果1／2 Players、keyboard相当viewportを検証する。
- 既存Physical RCのBundle IDとdata containerを維持し、Version `1.2 (82)`をアンインストールなしで上書きinstallする。
- Product Source commit `f2cd1c769c96c1104caf33944eb35d65372f4a0e`を正本とし、Physical RCでProduct Owner Acceptance済みと記録する。

## Boundary

- Build 82の既存App Store eligible／Internal TestFlight artifactは修正前artifactとして変更せず、Version 1.2最終提出候補には使用しない。
- 次候補はBuild 83。本GateではBuild 83、Archive、Upload、TestFlight、App Store Connect、App Store Version 1.2は行わない。

## STOP

Stop after Product Source／DocumentationをGitHubへ固定する。Build 83作成、Archive、Upload、TestFlight、App Store Connectへ進まない。
