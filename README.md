<p align="center">
  <img src="src/assets/logo/CueScore_Logo_Horizontal_Black.svg" width="308" alt="CueScore">
</p>

# CueScore Apps

CueScore Appsは、Rotation、9-Ball、10-Ball、14-1、JPA 9-Ball、3 Cushionを1つの体験で扱う統合PWAです。ユーザー向けブランドは「CueScore」です。

## 正式版

- Version: 1.0
- Initial release base: Rotation Scoreboard RC76
- Release date: 2026-07-24
- Primary target: iPhone portrait / Safari / Home Screen PWA

## 構成

- `index.html` — 正式Release HTML
- `manifest.webmanifest` — PWA manifest
- `sw.js` — Service Worker
- `src/assets/logo/` — Official Logo Master SVG（Horizontal / LogoMark、Black / White）

## Repository / Pages

- Repository: [takaakimailbox-star/cuescore-apps](https://github.com/takaakimailbox-star/cuescore-apps)
- GitHub Pages: [CueScore Apps](https://takaakimailbox-star.github.io/cuescore-apps/)

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

Service Workerのキャッシュ名は `cuescore-apps-*` です。
次版公開時はHTML側の `PWA_VERSION` と `sw.js` の `APP_VERSION` を同じ値へ更新してください。

## 保存データ互換

既存ユーザーのデータを保護するため、`rotationScoreboard.*` のLocalStorageキーは互換キーとして維持しています。新規JSONバックアップは `cuescore-apps-backup` 形式で出力し、旧 `rotation-scoreboard-backup` 形式も読み込めます。
