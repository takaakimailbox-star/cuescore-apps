# CueScore Current Decision

- Decision ID: `CUESCORE-I18N-NATIVE-CAMERA-DECISION-040-20261018`
- Date: 2026-10-18
- Previous Decision（継続・変更なし）: `CUESCORE-I18N-U11-CORRECTION-DECISION-039-20261017`（Decision 039／Official 123・124）。既存系列: `CUESCORE-I18N-P1-SOURCE-FORMALIZED-20261013`、`CUESCORE-I18N-P1-FORMALIZATION-DECISION-034-20261013`、`CUESCORE-DYNAMIC-TYPE-DEFERRED-DECISION-20261012`、`CUESCORE-SETTINGS-UNIFIED-DESIGN-OFFICIAL-DECISION-20261012`、`CUESCORE-I18N-PHASE0-OFFICIAL-RELEASE-20261009`。
- Gate: `CUESCORE I18N P6 — NATIVE CAMERA LOCALIZATION DECISION FORMALIZED`

## Product Owner Decision
- 2026-10-18、`NSCameraUsageDescription` のja／en／zh-Hans対応、未対応OS言語のja fallback、OS言語とアプリ手動言語の分離を承認。Decision 040／Official 125・126の発行後、許可範囲内のNative実装とSimulator検証、独立commit、non-force pushを承認。実機Build/install、Build 84上書き、Apple操作、P7は未承認。

## Result
- Decision 040／Official 125・126／Decision Log v2.16をDocumentation-onlyで発行。Decision 039の4設定値、過去FAIL記録、実機NOT VERIFIEDを保持し、Official 124 U11-R4への限定例外を明記した。Native実装はread-back後の独立commitで行う。

## Boundary / STOP
- 実機Build/install、既存アプリ上書き・削除、Build 84上書き、Apple Developer／ASC／TestFlight／Release、P7、Glossary確定は承認されていない。
- NOT VERIFIED: 実機の3言語permissionダイアログ、Build 84更新互換、App Store対応言語表示。
- U11の4値、Bundle ID、署名、Version／Build、Match／Snapshot schema、QR／Backup、IAP、Free／Pro、S-B=falseは変更しない。
