# CueScore Build 21 — App Store v1.0 RC Readiness Audit

監査日: 2026-08-30  
対象: Version 1.0 / Build 21  
停止条件: App Store Connectの「審査用に追加」および審査提出を実行しない

## RC固定

- Xcode `MARKETING_VERSION`: 1.0
- Xcode `CURRENT_PROJECT_VERSION`: 21
- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- 対象コミット: `2c296ad`（Build 21実機確認記録）
- Build 21のバイナリを変更するコード修正は行わない。

## 確認済み

- Build 21はTestFlight内部テストへ配信済み。
- 実機iPhoneで主要導線、6競技完走、バックアップ／復元、プレーヤー写真、オフライン利用を確認済み。
- 自動テスト: 276/276 PASS。
- App Store公開説明から非公開のサンプルデータ導線を削除し、Build 21の4タブ構成へ審査経路を更新した。
- 6.5インチ枠用スクリーンショット6枚を1242 × 2688 JPEG、alphaなしで準備した。
- Privacy Policy、Terms、Supportの公開URLとv1.0仕様が一致する。
- ログイン、課金、広告、トラッキング、自動クラウド同期、CSV入出力はv1.0の提供範囲外。

## App Store Connect監査結果

監査時点のVersion 1.0は「提出準備中」。以下は未入力または未設定だった。

- スクリーンショット
- Promotional Text、Description、Keywords、Support URL、Copyright
- Buildの紐付け
- App Review連絡先、Review Notes
- Content Rights、Primary Category、Age Rating
- Privacy Policy URL、App Privacy回答
- 初期価格、配信地域

また、審査用ログインが必要として選択されていたが、Build 21はログイン不要である。自動公開が選択されていたため、手動公開へ変更する。

## App Store Connect整備結果

以下を保存・公開した。

- 6.5インチスクリーンショット6枚（1242 × 2688 JPEG）
- Promotional Text、Description、Keywords、Support URL、Copyright
- TestFlightに保存済みの審査連絡先4項目を変更せずApp Review欄へ転記
- Build 21現行仕様に合わせたReview Notes
- Sign-in required: No
- Release: Manual
- Subtitle: `ビリヤードの試合・履歴・分析`
- Primary Category: Sports
- Secondary Category: Utilities
- Content Rights: 第三者コンテンツを含まない
- Age Rating: 4+
- Privacy Policy URL
- App Privacy: データの収集なし（公開済み）
- Price: Free
- Availability: 175地域すべて
- Mac／Apple Vision Pro互換配信: 無効

App Store Connectの「審査用に追加」は操作していない。

## Build 21紐付け監査

Version 1.0の「ビルドの追加」画面にはBuild 21が表示されるが、選択radioはdisabledだった。Build 12〜21も同様である。

Build 21の配信記録は`TestFlight (Internal Testing Only)`であり、この方式でアップロードされたBuildはApp Store顧客向けバージョンへ選択できない。Build番号21はAppleへ既にアップロード済みのため再利用できない。

したがって、Build 21をコード内容のRC基準として固定することはできるが、App Storeへ提出するバイナリには次の未使用Build番号（22以降）が必要である。同一ソースを通常のApp Store Connect配信としてArchive／Uploadし、処理後にVersion 1.0へ紐付ける必要がある。

## 登録方針

- Primary Category: Sports
- Secondary Category: Utilities
- Price: Free
- Availability: 全地域
- App Privacy: 開発者または第三者が利用可能な形で端末外へデータを送信・収集しない
- Content Rights: 第三者コンテンツを含まない
- Sign-in required: No
- Release: Manual
- iPhoneのみ。MacおよびApple Vision Proの互換配信は無効化する。

## 既知の注意点

- Build 21の設定画面には、release featureで無効化されたクラウド同期行のHTMLが残る。機能フラグにより操作・通信は開始されないが、CSSの表示優先度によって行が見える環境がある。Build 21固定のためバイナリ修正は行わず、App Storeスクリーンショットには使用しない。審査メモでは自動クラウド同期がv1.0非搭載であることを明示する。
- `ITSAppUsesNonExemptEncryption`はInfo.plistへ明示されていない。Build 21の輸出コンプライアンス回答は「非該当」で完了済み。将来ビルドで同回答を省略したい場合のみキー追加を検討する。

## 提出前に残す項目

- [x] App Review連絡担当者の既存4項目を確認・転記
- [x] App Store Connect上で登録方針を保存
- [x] App Privacy回答を公開
- [ ] App Store提出可能なBuild 22以降を通常配信用としてアップロード
- [ ] 提出可能BuildをVersion 1.0へ紐付け
- [ ] Build紐付け後の必須項目エラーが0件であることを再監査
- 「審査用に追加」は押さず、その直前で停止
