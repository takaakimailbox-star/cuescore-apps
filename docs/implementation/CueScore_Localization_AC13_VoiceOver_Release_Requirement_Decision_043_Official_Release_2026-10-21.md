# CueScore Localization AC 13 VoiceOver Release Requirement Decision 043 Official Release

- Date: 2026-10-21
- Decision: 043
- Official: 108 v1.1 / 130
- Decision Log: v2.19
- Scope: VoiceOver実音声聴取をP5／P6／リリース必須条件から外す文書限定改訂

Product Ownerの明示承認に基づき、Official 108をv1.1へ限定改訂した。AC-13の番号と受入31項目を維持し、実音声聴取だけを推奨の非ブロッキング確認へ変更した。`aria-label`等の翻訳、`lang`、動的文言、フォーカス順、Modal focus、静的検査、DOM検査は必須のまま保持した。

Decision 043／Official 130／Decision Log v2.19を発行し、Decision 042 D042-4およびOfficial 109の発行時点説明のうちVoiceOver実音声をP6残項目とした部分だけを後続更新した。他OfficialのVoiceOver対応・アクセシビリティ要件は変更していない。

production source、翻訳catalog、Data／QR／Backup、Analytics、Free／Pro、StoreKit、Native、実機アプリ、TestFlight／ASC／Releaseは変更していない。VoiceOver実音声以外のP6残項目は変更せず、P6全体PASSとP7開始は宣言していない。

## Evidence

- 基準commit: `9979b3d51dc26c614a432312d62413402c18a8f7`
- Official 108受入ID: `AC-1`〜`AC-21`＋`AC-S1`〜`AC-S10`の31件を維持（削除・再採番なし）
- Decision Log v2.19: Decision 001〜043を連番で維持。39ページをrenderし、全ページの配置と新規Decision 043／変更履歴を確認
- Node regression: 1,159 tests／PASS 1,159／FAIL 0／SKIP 0
- Decision 043専用回帰: Official 130の一意性、31受入ID、AC-13静的／DOM要件、production／catalog／Native／StoreKit hash、P6未完了表示を検証
- 既存テスト保護: `tests/fixtures/p2/decision043-test-change-map.json`に旧→新hash、変更理由、skipなしを記録
- `git diff --check`: PASS
- production source／翻訳catalog／Native／StoreKit: byte-preserved（専用回帰テストで固定hash照合）
