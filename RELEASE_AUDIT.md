# CueScore Rotation Scoreboard v1.0 Release Audit

監査日: 2026-07-24

## 修正内容

1. RC76 HTMLをVersion 1.0正式表記へ統一。
2. HTMLが参照するmanifest名とGitHub上の実ファイル名の不一致を修正。
   - 旧: HTML `manifest.webmanifest` / GitHub `manifest.json`
   - 新: `manifest.webmanifest` に統一
3. manifestの旧Prototype・Pro表現を正式製品名へ変更。
4. Service Workerの旧キャッシュ名を正式版へ変更。
5. HTMLの更新検知に必要な以下のメッセージ処理をService Workerへ追加。
   - `GET_VERSION`
   - `SKIP_WAITING`
   - `CUESCORE_VERSION_READY`
6. ナビゲーションはNetwork First + Offline fallbackへ変更。
7. 静的ファイルはCache Firstで保持。
8. アイコン実寸を確認。
   - 180×180
   - 192×192
   - 512×512
9. 透明部分があるためmanifestのpurposeは`any`とし、誤った`maskable`宣言を削除。
10. 旧READMEを正式Release内容へ更新。

## 維持した内部識別子

過去データ互換性や実装履歴を示す内部RC59識別子・コメントは、公開版表記とは別物のため必要箇所を維持しています。
