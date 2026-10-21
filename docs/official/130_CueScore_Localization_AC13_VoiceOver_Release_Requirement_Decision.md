# 130 CueScore Localization AC 13 VoiceOver Release Requirement Decision

**状態: Adopted / Official。** Product Ownerの明示承認（2026-10-21）に基づき同日発行。

## 1 番号と対象

- 直前はDecision 042／Official 129／Decision Log v2.18。本決定は未使用の**Decision 043**、本書は未使用の**Official 130**、Decision Logは**v2.19**。
- 対象はOfficial 108 v1.0のAC-13に含まれていたVoiceOver実音声聴取のリリース必須性だけとする。
- Official 108はv1.1へ限定改訂する。AC-13の番号とAC-1〜21／AC-S1〜S10の合計31項目は維持し、削除・統合・再採番しない。

## 2 Product Owner Decision

### D043-1 実音声確認の扱い

VoiceOverの実音声聴取を、P5／P6／P7およびリリースの必須合格条件から外す。実音声確認は推奨の非ブロッキング確認とし、未実施または音声を確認できないことだけを理由にAC-13をFAIL／BLOCKED／NOT VERIFIEDへしない。

### D043-2 AC-13の必須条件

AC-13は次を必須条件として維持する。

- `aria-label`／`alt`／`title`／`placeholder`の3言語翻訳と許可リスト外の日本語取り残し0。
- `html lang`と表示言語の一致。
- `aria-live`等の動的文言が文単位テンプレートであること。
- フォーカス順とModal focus挙動が日本語版と同一であること。
- 静的検査とDOM検査による確認。

### D043-3 製品保護

既存のVoiceOver対応、アクセシビリティ属性、翻訳、`lang`更新、`aria-live`、フォーカス順、Modal focus、画面遷移を削除・弱体化・変更しない。本決定は製品実装の削除許可ではない。

### D043-4 他Officialとの関係

- Official 108 v1.1がAC-13の現行正本。Decision 043はDecision 042 D042-4およびOfficial 109の発行時点説明のうち、VoiceOver実音声をP6残項目とした部分だけを後続更新する。
- Official 110／111のVoiceOver対応、Official 101／102およびMatch Sharing関連文書のアクセシビリティ要件は変更しない。
- Dynamic Type、Native/PWA言語解決、Pro／StoreKit、Backup Share Sheet、Build 84 binary同一性など、VoiceOver実音声以外の未完了項目は本決定で変更しない。

### D043-5 不変条件

production source、翻訳catalog、既存日本語表示、保存データ、Match／Snapshot schema、Player Identity、QR／Backup／CSV、Analytics、Free／Pro、IAP Product ID、S-B=`false`、Native設定、Version／Buildを変更しない。Device、実機アプリ、Apple Developer、StoreKit、TestFlight、App Store Connect、Releaseを操作しない。

## 3 P6判定への適用

AC-13の静的／DOM必須条件がPASSであれば、VoiceOver実音声が未確認でもAC-13をPASSと判定できる。P6全体のPASSは、AC-13以外の現行必須条件がすべて満たされた場合に限る。本決定だけでP6全体PASSまたはP7開始を宣言しない。

## 4 発行

Documentation-onlyで発行する。Official 108 v1.1、Decision Log v2.19、SSOT、変更履歴、文書テストを同一変更で同期する。
