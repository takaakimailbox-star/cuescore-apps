# CueScore公式サイト GitHub Pages v1 実装記録

日付: 2026-09-03

## Status

- Proposal: 既存GitHub PagesをCueScore公式サイトへ更新
- Adopted: Product Owner承認済み
- Implemented: `main /docs`に完成版を実装

## 前提差異と公開構成

依頼書作成時の「root `index.html`は空」という前提に対し、実装開始時latest main `023c6cf449336b7dd1259f3ffe6a4d36725adb4c`のroot `index.html`はCueScoreアプリruntimeだった。アプリを上書きせず、GitHub Pagesの公開元を`main /docs`へ分離する構成を採用した。

## 実装内容

- Hero、Core Value、対応ゲーム、Feature Showcase、Privacy、Final CTA、Footerの1ページ構成。
- App Store正式URLは未確定のため、CTAはリンクなしの「App Store 公開予定」。
- 実装済みのRotation、9-Ball、10-Ball、JPA 9-Ball、14-1、3 Cushionのみ掲載。
- 現行demo/sample dataで生成した390×844 Home／New Match／Player UIと、正式採用済みHistory UIを掲載。
- Support／Privacy／Termsは既存HTML、CSS、renderer、Official Markdownを再利用し、公開URLを維持。
- canonical／Open Graph／description／favicon／semantic landmark／visible focus／reduced motionを実装。

## 検証

- responsive: 390×844、393×852、430×932、768、1440
- horizontal overflow: 全幅0
- broken image: 0
- local relative link／asset: すべて解決
- Support／Privacy／Terms: Official Markdown render成功
- console error: 0
- automated test: `347 pass / 0 fail / 0 skipped`
- root app runtime、iOS Build 47: 変更なし

## リリース境界

- site commit: `d60fd9900b11ba3f8a68bc011954da4dd8625c83`
- GitHub Pages source: `main /docs`
- GitHub Pages build: `1191510806` / `built`
- 公開URL: `https://takaakimailbox-star.github.io/cuescore-apps/`
- 公開root／Support／Privacy／TermsをHTTPS実URLで確認済み
- GitHub Pagesのみ
- TestFlight作成なし
- App Store Review提出なし
