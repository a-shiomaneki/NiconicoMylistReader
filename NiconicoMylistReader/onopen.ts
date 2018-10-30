/**
 * SpreadSheetを開いたときにonOpen()メソッドが呼ばれる．
 */

function onOpen(): void {
    let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    /* Spreadsheetにメニューを作成する．*/
    let entries = [{
        name: "取り込み",
        functionName: "getListedVideoInfoToTable"
    }];
    spreadsheet.addMenu("スクリプト", entries);
}