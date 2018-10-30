/**
 * SpreadSheetを開いたときにメニューを作成する．
 */
function onOpen() {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var entries = [{
            name: "取り込み",
            functionName: "getListedVideoInfoToTable"
        }];
    spreadsheet.addMenu("スクリプト", entries);
}
//# sourceMappingURL=init.js.map