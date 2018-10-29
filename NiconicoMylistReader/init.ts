/**
 * SpreadSheetを開いたときにメニューを作成する．
 */

function onOpen():void {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let entries = [{
    name : "取り込み",
      functionName: "getListedVideoInfoToTable"
  }];
  spreadsheet.addMenu("スクリプト", entries);
}