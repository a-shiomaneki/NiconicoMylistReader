import { MylistTable } from "./fusiontables";
import { ControlSheet } from "./sheet";

function onInstall(e) {
    onOpen(e);
}

function onOpen(e) {
    if (e && e.authMode == ScriptApp.AuthMode.NONE) {
        var menu = SpreadsheetApp.getUi().createMenu("マイリストリーダー")
            .addItem("マイリスリーダー有効化", "askEnabled")
            .addToUi();
    } else {
        var trigger = SpreadsheetApp.getUi().createMenu("毎時取得トリガー")
            .addItem("トリガーを設定", "createTimeDrivenTriggers")
            .addItem("トリガーを削除", "deleteTrigger")
        var menu = SpreadsheetApp.getUi().createMenu("マイリストリーダー")
            .addItem("マイリス取得", "getListedVideoInfoToTable")
            .addSeparator()
            .addSubMenu(trigger)
            .addItem("データベース削除", "deleteTable")
            .addItem("コントロールシートの書式を設定", "setupControlSheet")
            .addToUi();
    }
}

function askEnabled() {
    let ui = SpreadsheetApp.getUi();
    ui.alert("マイリストリーダー", "マイリストリーダーが有効になりました．", ui.ButtonSet.OK);
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
    let controlSheet = new ControlSheet();
    controlSheet.setupControlSheet();
}

function createTimeDrivenTriggers() {
    deleteTrigger();
    ScriptApp.newTrigger("main")
        .timeBased()
        .everyHours(1)
        .create();
}

function deleteTrigger() {
    let allTriggers = ScriptApp.getProjectTriggers();
    for (let trigger of allTriggers) {
        ScriptApp.deleteTrigger(trigger);
    }
}