# CueScore App Store v1.0 文書整合確認

確認日: 2026-08-09

## 結論

公式Markdown一式は、既存Decision 015「安定化→PWA完成→App Store化を優先」と整合する。バックアップ/復元、プレーヤー写真、オフライン、6競技、履歴・分析をv1.0に含める方針も既存Architectureと現行実装の方向性に一致する。

CSVとクラウド同期の差分は、App Store v1.0 release profileで非提供にすることで解消した。既存コードは将来再有効化できるよう保持する。

## 整合を確認した項目

- Decision 015の公開優先順位。
- Product Architectureのオフライン、回復性、Privacy by Design。
- バックアップ/復元およびプレーヤー写真の実装経路。
- 6競技、試合履歴、分析、Undo、Official Demo Data。
- 公開用文書とApp Store提出資料の分離管理。

## 矛盾・差分

### CSV

v1.0公式文書どおりCSV入出力をLaterとし、release profileで無効化した。設定・データ管理のCSV UIは非表示。JSONバックアップは維持する。

### クラウド同期

v1.0公式文書どおり自動クラウド同期をLaterとし、release profileで無効化した。関連UIを非表示にし、自動保存・再同期処理は機能フラグで停止する。manifestから利用可能表記を削除した。

### Official Demo Data

提出ビルドへ収録する方針を確定し、Review Notesへ反映した。通常データとの完全分離を維持する。本番向け名称・導線はProduct Owner承認待ち。

## 未確定項目

Privacy Policy URL、Support URL、公開用連絡先、App Review担当者情報は推測で記入していない。公開用HTMLは用意したが、App Store Connectの最終URLとして承認していない。

## 今回行っていないこと

- ネイティブiOS化、Xcodeプロジェクト作成
- TestFlight配布、App Store Connect登録、本審査提出
- CSVまたはクラウド同期機能の削除・仕様変更

## 次の工程

1. 未確定URLと公開用連絡先を確定。
2. CSV・クラウド同期をv1.0提出ビルドで非提供にする方法を確定。
3. Official Demo Dataの本番収録可否を確定。
4. 公開HTMLを正式URLで公開し、リンクとモバイル表示を確認。
5. 6競技完走、保存互換、Undo、バックアップ/復元、写真、オフラインの回帰テスト計画を確定。
