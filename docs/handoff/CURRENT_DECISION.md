# CueScore Current Decision

- Decision ID: `CUESCORE-RESTORE-FIX-SOURCE-FORMALIZED-20261010`
- Date: 2026-10-10
- Previous Decision（継続・変更なし）: `CUESCORE-I18N-PHASE0-OFFICIAL-RELEASE-20261009`（Phase 0 Official Release。Official 107／108、Decision Log v2.7、S-B NOT VERIFIED、Decision Pending U3／U4／U6／U8／U9／U11は維持）
- Gate: `CUESCORE RESTORE FIX — SOURCE FORMALIZED / PHYSICAL REVIEW PENDING`

## Product Owner Decision

- 2026-10-09: 初回Break prompt復元（A）、未確定入力復元（B）、Back UX B案（確認ダイアログ）を承認。Back UX A案は不採用。
- 2026-10-10: Back確認ダイアログをVisual Accepted（「入力に戻る」黒背景・白文字、「閉じる」白背景・黒文字。順序・文言・処理は維持）。最終監査、Product Source commit、Documentation commit、External GitHub mainへのnon-force push、read-backまでを承認。

## Result

- Restore修正をProduct Source commit `74928978c80a505f59ba9e0c4f56fb9ff256984d`として固定し、Documentation／Evidenceを別commitで記録した。
- 既知の制約: Back確認で「閉じる」を選ぶとBreak結果が未記録になりうる（完全防止ではない）。次ラックpromptのBackは変更していない。

## Boundary / STOP

- P1統合、S-B flag=true、Build番号変更、Archive／Upload／TestFlight／App Store Connect／Release、Score RC変更は承認されていない。P1は`IMPLEMENTATION IN PROGRESS`／S-B flag=false／未統合を維持。
- Product Owner Physical PASSは未記録。Official仕様、Match／Snapshot schema、QR／Backup、IAP、Free／Proは変更しない。
- Restore修正のP1統合は、別Gateでfresh baselineから判断する。
