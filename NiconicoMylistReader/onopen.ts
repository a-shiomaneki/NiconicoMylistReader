import { MylistTable } from "./fusiontables";

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
        },
        {
            name: "コントロールシートの初期化",
            functionName: "setupControlSheet"
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

function setupControlSheet() {
    const mylistInfoColumnTitles = ["マイリスト", "タイトル", "ユーザー名", "マイリストアップデート", "動画最新登録", "処理", "処理状況"];
    const tableColumnTitles = ["データベース種別", "ファイル名", "データベースID", "処理状況"];
    const rowNum = 21;

    let sheet = new ControlSheet().sheet;
    let allRange = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());
    allRange.clearFormat();
    let allBandings = allRange.getBandings();
    for (let binding of allBandings) {
        binding.remove();
    }

    allRange.activate();
    sheet.setColumnWidths(1, 11, 135);
    allRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

    sheet.getRange(1, 1, 1, mylistInfoColumnTitles.length).setValues([mylistInfoColumnTitles]);
    let mylistInfoRange = sheet.getRange(1, 1, rowNum, mylistInfoColumnTitles.length)

    mylistInfoRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
    let mylistInfoBanding = mylistInfoRange.getBandings()[0];
    mylistInfoBanding.setHeaderRowColor('#4dd0e1')
        .setFirstRowColor('#ffffff')
        .setSecondRowColor('#e0f7fa')
        .setFooterRowColor(null);

    sheet.getRange(1, mylistInfoColumnTitles.length + 1, 1, tableColumnTitles.length).setValues([tableColumnTitles]);
    let tableRange = sheet.getRange(1, mylistInfoColumnTitles.length + 1, 3, tableColumnTitles.length)
    tableRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
    let tableBanding = tableRange.getBandings()[0];
    tableBanding.setHeaderRowColor('#f46524')
        .setFirstRowColor('#ffffff')
        .setSecondRowColor('#ffe6dd')
        .setFooterRowColor(null);

    sheet.setFrozenRows(1);
}