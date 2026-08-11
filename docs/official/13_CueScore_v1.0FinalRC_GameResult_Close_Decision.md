# CueScore Apps v1.0 Final RC — Game Result Modal右上Close廃止

Status: 採用  
決定日: 2026年8月11日  
Authority: Product Owner採用決定  
対象: Game Result Modal

## 決定

Game Result Modalの右上Close（×）を廃止する。試合進行へ戻る正式操作は、Modal内の「試合へ戻る」ボタンだけとする。

「ホームへ戻る」「もう一度対戦する」は維持する。BackdropタップおよびEscapeではGame Resultを閉じない。

## 維持する仕様

- 中央Modal
- 画面左右16pt相当の余白
- 最大幅560pt
- 角丸28pt
- Fade＋Scale
- 背面操作不可
- Game Resultの既存表示内容と3つの操作ボタン

Race Picker、Break Modal、Player関連Modal、Settings系Overlay、Result以外のModal／PickerのClose仕様は変更しない。

## 採用理由

Game Resultには試合進行へ戻る目的が明示された「試合へ戻る」ボタンがあり、右上Closeと役割が重複していた。戻り操作をラベル付きの正式経路へ一本化し、終了後の選択肢を明確にする。

## Official Design Decision Log v1.3追記案

### Decision 019｜Game Result Modalの右上Closeを廃止

- 判断日：2026年8月11日
- 対象：CueScore Apps v1.0 Final RC Game Result Modal
- 当時の課題：右上Closeと「試合へ戻る」が同じ復帰処理を持ち、操作の意味が重複していた。
- 設計意図：試合進行へ戻る操作を明示的なラベル付きボタンへ一本化する。
- 採用案：Game Resultに限り右上Closeを廃止し、「試合へ戻る」を唯一の試合復帰経路とする。Homeと再対戦は維持する。
- 不採用案：右上Closeを残す案は役割重複のため不採用。BackdropタップやEscapeによる暗黙Closeも採用しない。
- 影響範囲：Game Resultのみ。その他ModalのClose規則、保存形式、競技ルール、統計定義は変更しない。
- 最終決定・現在の有効性：有効。Product Owner採用済み。

## Official Release更新対象

次回の正式文書改訂で、Game Resultを一般Modal Close規則の例外として追補する必要がある。

- `02_CueScore_Design_System_v2.0_Official_Release.docx`
  - 「10. Dialog, Modal and Sheet」のResult Modal右上Close記述
  - Modal分類表の「右上Close」一般規定
  - Close／Backの用途表。ただし一般Modal規則自体は維持する。
- `04_CueScore_UI_Components_v1.0_Official_Release.docx`
  - 「11. Result Card」のResult／Detail右上Close共通記述
  - `UIC-REQ-030` のResult／Detail Close位置共通化要件
  - 「12. Modal」のEscape相当／Close記述
  - `UIC-REQ-032` の全Modal右上Close必須要件

既存Official Release文書は本決定では直接変更しない。Detail ModalおよびGame Result以外のModalに対する一般Close規則は維持する。
