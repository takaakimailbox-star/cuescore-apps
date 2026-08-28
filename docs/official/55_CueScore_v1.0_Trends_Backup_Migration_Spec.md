# CueScore v1.0 — Trends Readability / Backup Migration Specification

Status: Adopted / Official  
Applies to: Decision 054

## Trends

- plot areaはleft 48／right 14／top 16／bottom 44の余白を確保する。
- Y軸はrateで100／75／50／25／0%、非rateでmetric scaleを表示する。
- X軸は試合日を表示し、密集時は最大およそ5labelへ間引く。1点はplot中央へ配置する。
- 欠損点は線を分断し、0、100%、同値、急変、insufficient dataを捏造しない。
- 390×844で横overflowを発生させない。

## Backup migration

- 対応schemaは1／2。Restore結果はschema 2として保存・再Backupする。
- Player ID、Match ID、`registeredPlayerId`をtrim済みstringへ正規化し、旧`playerId`／`uuid`／`matchId`をcanonical `id`へ移す。
- Player／Match IDの欠損または重複はRestore前にrejectする。Primary Playerは既存の0または1件契約を維持する。
- Replace／Mergeの双方が同じmigrationを通過してから既存transaction／rollback処理へ進む。
- 個別削除退避はdeleted Playerまたはdeleted Matchだけを含む。全件削除の全体退避は維持する。

## Compatibility

Match record、eventLog、分析データ、写真avatar、Category、Seasonは保持する。削除したPlayerを参照する歴史的Matchは従来どおり表示可能であり、一律orphan rejectしない。
