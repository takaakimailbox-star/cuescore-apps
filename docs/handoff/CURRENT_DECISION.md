# CueScore Current Decision

- Decision ID: `CUESCORE-I18N-PHASE0-OFFICIAL-RELEASE-20261009`
- Date: 2026-10-09
- Gate: `CUESCORE I18N PHASE 0 — OFFICIAL RELEASE PUBLISHED`

## Product Owner Decision

- 2026-10-09、Product OwnerはCueScore 3言語対応（ja／en／zh-Hans）Phase 0のOfficial正式発行を承認した。対象はLocalization Decision 031、Official 107、Official 108、Official Design Decision Log v2.7。
- 2026-10-08に承認済みのD1〜D10・U10、保存データ不変、QR共有互換性（V1〜V7、3×3言語組合せ、旧Build 84との双方向互換）、日本限定配信維持、Free／Pro contract維持を正式仕様として登録する。
- Documentation／Evidenceだけをcommitし、External GitHub mainへnon-force pushする。

## Result

- Decision 031／Official 107／Official 108／Decision Log v2.7を発行。Decision Log v2.6は保全し、Decision 001〜030は変更していない。
- P1 Implementation、Localization Implementation、Build、TestFlight、App Store Connect、Releaseは実施していない。
- Glossaryは`docs/proposals/`にDraftとして保管（Official 109は未作成）。

## Boundary / STOP

- 保存済み中断試合での言語切替（S-B）は、P1のruntime証明（C1〜C6、T-SW-1〜10）PASSまでNOT VERIFIED。FAILなら保守的制限を適用してSTOP。
- Decision Pending: U3／U4／U6／U8／U9／U11。独自判断で解決しない。
- Product source、Match schema、QR／Backup format、IAP、Free／Pro、Version 1.2 Build 84のRelease状態、Score RCを変更しない。
- P1 Implementationは別のProduct Owner承認まで開始しない。
