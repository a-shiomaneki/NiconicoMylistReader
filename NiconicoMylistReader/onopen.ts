/**
 * SpreadSheetを開いたときにonOpen()メソッドが呼ばれる．
 */

function onOpen(): void {
    let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    /* Spreadsheetにメニューを作成する．*/
    let entries = [
        {
            name: "マイリス取得",
            functionName: "getListedVideoInfoToTable"
        },
        {
            name: "データベース削除",
            functionName: "deleteTable"
        }
    ];
    spreadsheet.addMenu("マイリスリーダー", entries);
}

function deleteTable() {
    let controlSheet = new ControlSheet();
    let tableInfos = controlSheet.getTableInfos();
    if (tableInfos.videoInfoTable.id != "") {
        let videoInfoTable = new MylistTable();
        videoInfoTable.tableId = tableInfos.videoInfoTable.id;
        videoInfoTable.deleteTable();
        tableInfos.videoInfoTable.id = "";
        controlSheet.setTableIds(tableInfos);
    } 
}