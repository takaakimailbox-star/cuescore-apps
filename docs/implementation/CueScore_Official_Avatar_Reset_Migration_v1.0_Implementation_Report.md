# CueScore Official Avatar Reset & Migration v1.0 — Implementation Report

## 変更概要

- アプリ用アバターを「01. シンプル（丸頭）」1点へ統一
- 正式IDを `default_silhouette`、正式パスを `assets/icons/avatar/default/avatar_default_silhouette.png` に統一
- 人物・動物・花・ビリヤードボール・展開版アバター110ファイルを削除
- アバター／写真選択UIを停止し、新規登録時も共通シルエットを使用
- Player登録、Player一覧、Home、New Match、試合結果などの表示を共通画像へ接続

## データ移行

初回起動時、ローカルバックアップ復元時、クラウド復元時に全Playerを正規化する。Player ID、名前、メモ、登録日時、更新日時、最終使用日時などは保持し、旧avatar ID、パス、種類、画像Data URLだけを破棄して、次の現行データへ統一する。

```json
{"type":"default","id":"default_silhouette"}
```

試合履歴、分析、設定の保存キーとデータ構造は変更していない。

## PWA

App Shellから削除画像への参照を除去し、manifestを共通シルエット1点へ更新した。Service Worker版は `1.0-avatar-reset-v4`。

## 検証

- 23/23インラインJavaScript構文
- Service Worker構文
- 512×512・透過PNG
- manifestが`default_silhouette` 1件のみ
- HTML、Service Worker、manifestに旧画像パスが残っていないこと
- Player ID、名前、メモ、登録情報を保持し、旧アバターと写真Data URLだけを除去する移行モデル
- diff whitespace/errorチェック

## 削除について

旧アバター画像はGit管理下から削除したため、必要な場合はこの変更前のコミット履歴から復元できる。
