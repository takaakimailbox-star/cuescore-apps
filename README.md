# CueScore Rotation Scoreboard v1.0 Official Release

CueScore Rotation Scoreboardは、ローテーション競技用のスコアボードPWAです。

## 正式版

- Version: 1.0
- Release base: RC76
- Release date: 2026-07-24
- Primary target: iPhone portrait / Safari / Home Screen PWA

## 構成

- `index.html` — 正式Release HTML
- `manifest.webmanifest` — PWA manifest
- `sw.js` — Service Worker
- `icons/icon-180.png` — Apple touch icon
- `icons/icon-192.png` — PWA icon
- `icons/icon-512.png` — PWA icon

## 公開方法

GitHubリポジトリのルートへ、このフォルダ内のファイルを同じ構成で配置してください。
GitHub Pagesでは `index.html` が起点になります。

## Release QA

- 通常試合: 合格
- オフライン: 合格
- 中断復帰: 合格
- 連続試合: 合格
- PWA: 合格
- Safari: 合格
- iPhone: 合格

## PWA更新

Service Workerのアプリ版は `1.0`、キャッシュ名は `cuescore-rotation-v1.0` です。
次版公開時はHTML側の `PWA_VERSION` と `sw.js` の `APP_VERSION` を同じ値へ更新してください。
