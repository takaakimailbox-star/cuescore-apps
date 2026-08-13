# CueScore Apps v1.0 Final RC Step 5 提出資料・CURRENT_STATE整合監査

監査日: 2026-08-13  
基準main: `24ad4ed5d2217a17607ec909f2e9943009d7abbf`

## 監査範囲

- `docs/CURRENT_STATE.md`
- `docs/README.md`
- `docs/official/app-store-v1.0/README.md`
- `docs/official/app-store-v1.0/submission/` 配下のApp Store Description、Keywords、Public URLs、Review Notes、Release Notes
- repo内の公開前TODO／未確定表現

## 横断監査結果

製品名、Version 1.0表記、6競技名称、プレーヤー写真、バックアップ／復元、オフライン、ログイン不要、課金不要、正式URL、公開メールは現行Release Scopeと矛盾しない。CSV、自動クラウド同期、試合共有はVersion 1.0非搭載／Laterとして扱う。

修正前に確認した不一致は次のとおり。

- `CURRENT_STATE.md`とApp Store READMEに、Step 4で確定済みのURLと公開用連絡先が未確定として残っていた。
- `CURRENT_STATE.md`に正式URLを「候補」とする古い現状表現が残っていた。
- App Store DescriptionとRelease Notesが、利用者向け正式表示「サンプルデータ」ではなく内部名称「Official Demo Data」を使用していた。
- Review Notesの提出前チェックで、実提出ビルドが未作成にもかかわらずOfficial Demo Data収録だけが完了扱いになっていた。
- Release NotesのDeferredに試合共有（Match Sharing）が記載されていなかった。

KeywordsとPublic URLsには修正を要する不一致を確認しなかった。過去Decision、過去Implementation Report、Git履歴相当の記録は当時の判断を示すため変更していない。

## 名称判断

- 内部正式名称・技術資料: Official Demo Data
- 現行UI・App Store利用者向け説明: サンプルデータ（英語Review NotesではSample Data）

この区別は既存`CURRENT_STATE.md`の「製品上『サンプルデータ』と表示」と現行UIテストから判断できるため、Product Ownerへの追加確認事項にはしていない。

## Final RC提出準備マトリクス

### A. 完了済み（Final RC / PWA段階）

- 6競技Release Scopeの確定とPWA実装
- プレーヤー写真、バックアップ／復元、サンプルデータ、オフライン利用経路のFinal RC実装
- CSV、自動クラウド同期、試合共有をLaterとする決定
- Privacy Policy、Terms of Use、Supportの正式URL確定
- 公開メール`cuescore.apps@gmail.com`、問い合わせ方法「メール」、問い合わせフォームVersion 1.0非採用の確定
- CURRENT_STATE、App Store README、提出資料の現時点での文書整合

### B. Product Owner確認待ち

- App Review連絡担当者の氏名・メール・電話番号
- ネイティブ／提出ビルド完成後の提出資料最終承認

### C. ネイティブ／提出ビルド段階

- ネイティブiOS提出ビルドの作成
- TestFlight
- App Store Connect登録
- 実提出ビルドでの6競技完走
- 実提出ビルドでのオフライン確認
- 実提出ビルドでのバックアップ／復元確認
- 実提出ビルドでのプレーヤー写真確認
- サンプルデータの収録と通常ユーザーデータからの分離確認
- ログイン不要・課金説明との一致確認
- 提出ビルドとPrivacy Policy、Terms of Use、Support、Review Notesの最終一致確認

## 自動テスト

- 全117件成功／失敗0／スキップ0

## 変更対象外

スコアリング、競技ルール、Player、History、Analytics、Backup／Restoreロジック、保存schema、localStorage、Undo、Game Result、Match Detail、サンプルデータ本体、PWA動作、ネイティブ化、TestFlight、App Store Connect登録は変更していない。
