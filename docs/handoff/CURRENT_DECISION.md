# CueScore Current Decision

- Decision ID: `CUESCORE-I18N-AC13-VOICEOVER-RELEASE-REQUIREMENT-DECISION-043-20261021`
- Date: 2026-10-21
- Previous Decision（継続・AC-13の実音声境界だけ後続更新）: `CUESCORE-I18N-GLOSSARY-FINALIZATION-DECISION-042-20261018`（Decision 042／Official 109・129）。
- Preserved decision lineage: `CUESCORE-I18N-NATIVE-CAMERA-DECISION-040-20261018`、`CUESCORE-I18N-U11-CORRECTION-DECISION-039-20261017`、`CUESCORE-I18N-P1-FORMALIZATION-DECISION-034-20261013`、`CUESCORE-DYNAMIC-TYPE-DEFERRED-DECISION-20261012`、`CUESCORE-SETTINGS-UNIFIED-DESIGN-OFFICIAL-DECISION-20261012`、`CUESCORE-I18N-PHASE0-OFFICIAL-RELEASE-20261009`。
- Gate: `CUESCORE I18N — AC-13 VOICEOVER RELEASE REQUIREMENT REVISED / DOCUMENTATION ONLY`

## Product Owner Decision

- Official 108 AC-13のVoiceOver実音声聴取をP5／P6／リリース必須条件から外す。実音声は推奨の非ブロッキング確認とする。
- AC-13番号と受入31項目、静的／DOM・翻訳・`lang`・動的文言・フォーカス要件を維持する。既存VoiceOver対応・アクセシビリティ実装を削除・変更しない。

## Result

- Decision 043／Official 108 v1.1・130／Decision Log v2.19で限定改訂を正式記録する。
- 直前のP6台帳へ本Decisionだけを適用した集計はPASS 28／BLOCKED 1／NOT VERIFIED 2。P6全体をPASSにせず、P7を開始しない。

## Boundary / STOP

- VoiceOver実音声以外のNOT VERIFIED／BLOCKED項目は変更しない。実音声未確認は今後のP6 blockerとして扱わない。
- BLOCKED: Pro限定Backup Share Sheet実機到達、Build 84実機上書き更新。
- production source／Native／StoreKit／実機アプリ／Device／Apple操作、P6最終PASS、P7は実施しない。
