# CueScore Current UI Visual Issue Audit — 2026-08-26

## 確認できたこと

- 主監査22画像はすべて`390 × 844 px`で、横幅条件は統一されている。
- Player情報から6競技詳細へ到達でき、各タイトルと競技文脈が維持される。
- 5指標のpopupは同じ詳細文脈上で開き、閉じる操作を持つ。
- 対戦相手別成績は対戦数順／勝率順を切り替えられ、相手固定履歴とMatch Detailへ進める。
- Deep Rival AnalysisやMatch Analysisは通常v1.0導線に露出していない。

## レビュー時に重点確認する点

- 長いPlayer名・長い相手名の省略と情報優先順位
- popupのY軸、X軸、point calloutが小さい画面でも判読できるか
- Match Detailの縦方向情報量と、主要結果がfirst viewで理解できるか
- Back controlの見た目と、階層タイトルから戻り先を予測できるか
- `—`が「0」ではなく「判定不能」と伝わるか

## 未判定

- Safe Area、native status bar、実iPhoneのfont rendering
- Swipe Backとtap Backの体感応答
- keyboard、camera、photo library、file chooserなどOS所有UI
- Gameplayの押下領域、lock/unlock、履歴、near-completion、結果画面

未判定項目はPASS扱いにしない。
