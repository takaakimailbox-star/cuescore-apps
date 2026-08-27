# CueScore v1.0 — Global Back / App Icon Decision

- Status: Official Decision
- Adopted: 2026-08-27
- Approval: Product Owner
- Clarifies: Official 048／049

## Decision

1. 左上Backの直接tapはedge Swipe Backのgesture trackingを開始しない。tapとswipeは表示中の同一Back controlを経由し、同一originへ戻る。
2. 共通edge Back対象には、Player／競技／相手／履歴／Match Detailに加え、現行の対戦相手別成績、Player履歴、全画面推移、Player起点分析のBack controlを含める。
3. 左上Back controlは48px基準（44px以上）の共通tap targetとし、透明layerや共通gesture処理でtapを失効させない。
4. CueScore App IconのSSOTは、正式アイコン更新履歴を持ち、Web manifest／apple-touch-iconが参照している`icons/cuescore-app-icon-512.png`の意匠とする。180px／192pxは同一icon familyの配布派生物とする。
5. iOS `AppIcon.appiconset`は上記SSOTの意匠から生成したopaque RGB 1024px PNGを使用する。Capacitor初期template iconはCueScore製品iconとして使用しない。

## Boundary

採点、競技ルール、saved-data schema、Backup／Restore、analytics formula、eligible判定は変更しない。active scoring中の終了確認やmodal closeは既存安全契約を維持する。新しいicon designは作らない。

## Verification Gate

主要なPlayer journeyについてtap Backとedge Swipe Backのorigin一致を自動検証する。direct Back tapがedge trackingの`pointer-events:none`を開始しないこと、全対象が44px以上であること、Web／Home Screen／iOS／Archive icon参照を検証する。実iPhoneでのtap応答とTestFlight iconの目視確認前はPASS扱いにしない。
