# NiconicoMylistReader

## これはなに？

ニコニコ動画の公開マイリストを[Google Spreadsheet][spreadsheet]に取り込む[Google App Script][gas] です．ニコニコ動画ではマイリスト内の動画を検索する機能がなく，マイリストしたにもかかわらず求める動画にたどり着くのが困難です．そこで，動画情報をGoogle Spreadsheet に取り込んでしまうことで，スプレッシートの検索機能で求める動画を探すできるようにする事を目的としています．

取り込むのはマイリスト内の動画情報だけで，動画ファイルを取り込むことはありません．
ただし，サムネ画像は取り込みます．

## UIの概要

- UIは[Google Spreadsheet][spreadsheet]と[FusionTables][fusiontables]で構成されています．
- Google Spreadsheet（シート名「コントロールシート」）はマイリストなどの設定値の保持します． コントロールシートにはカスタムメニュー「マイリストリーダー」があり，「マイリスト取得」や「データベース削除」などの作業をここから呼び出します．

![コントロールシート](./images/control_sheet.png =x200 "コントロールシート")

- データの閲覧や検索はGoogle FusionTablesで作成したデータベースで行います．

![マイリスト動画データベース](./images/movie_db.png =x200 "マイリスト動画データベース")

## 導入方法

1. マイリストIDの取得
    1. 取り込みたいマイリストのURLを調べておきます．
        
        **例**
        >http://www.nicovideo.jp/my/mylist/#/54869962
        >

1. Google Spread Sheetの準備
    1. マイリスト情報を取り込むGoogle Spreadsheetを用意します．
    1. **マイリスト情報**という名前のシートを作ります．
    1. A1セルに*マイリスト情報*と入力します．
    1. A2以降の列に取り込むマイリストID（複数可）を入力します．
    1. マイリストIDの名前のシートを新規作成します．
1. スクリプトの準備
    1. **ツール**メニューからスクリプトエディタを呼び出します．スクリプト名は任意でOK.
    1. **main.gs** 内のコードをエディタ内に貼り付けます．コードファイル名は自動で設定される**コード.gs**のままでも大丈夫です．

## 使い方

シートの**スクリプト**メニューに**取り込み**という項目ができるので，それを選択して実行します．数分後にマイリストID名のシート内に動画情報が現れます．

* 情報の含まれている列にフィルタを設定するとタグの検索に便利です．
* getAddDataメソッドに１日１回のトリガを設定すると，自動でリストを更新することができます．トリガの設定は，スクリプトエディタのツールバー，時計のボタンから設定します．

## 残されている問題

1. マイリスト内の動画が多いと規定の処理時間を越えてしまうためエラーとなってしまいます．一括処理できるのは，おおよそ1000動画以内のようです．

[gas]:https://developers.google.com/apps-script/
[spreadsheet]:https://developers.google.com/apps-script/reference/spreadsheet/
[fusiontables]:https://developers.google.com/apps-script/advanced/fusion-tables