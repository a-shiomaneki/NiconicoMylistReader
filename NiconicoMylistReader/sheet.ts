class DbInfoBase {
    filename: string;
    tableId: string;
    constructor() {
        this.filename = "";
        this.tableId = "";
    }
}
class DbInfo {
    videoInfoTable: DbInfoBase;
    tagInfoTable: DbInfoBase;
    constructor() {
        this.videoInfoTable = new DbInfoBase();
        this.tagInfoTable = new DbInfoBase();
    }
}
class WorkStatus {
    mylistId: string;
    lastUpdate: string;
    result: string;
    constructor(mylistId, lastUpdate, result) {
        this.mylistId = mylistId;
        this.lastUpdate = lastUpdate;
        this.result = result;
    }
}

class ControlSheet {
    sheet: GoogleAppsScript.Spreadsheet.Sheet;
    constructor() {
        this.sheet = SpreadsheetApp.getActive().getSheetByName("コントロールシート");
    }
    getMylistIds(): WorkStatus[] {
        let range = this.sheet.getRange(2, 1, this.sheet.getLastRow() - 1, 3);
        let lastResults = range.getValues().map((row) => row.map((col) => col.toString()));
        let workStatusies: WorkStatus[] = [];
        for (let result of lastResults) {
            if (result[0] == "") {
                break;
            }
            workStatusies.push(new WorkStatus(result[0], result[1], result[2]));
        }
        return workStatusies;
    }
    setResult(i: number, updated) {
        this.sheet.getRange(2 + i, 2, 1, 2).setValues([[updated, ""]]);
    }
    setError(i: number, error) {
        this.sheet.getRange(2 + i, 3).setValue(error);
    }
    getTableInfos() {
        let vs = this.sheet.getRange(2, 4, this.sheet.getLastRow() - 1, 3).getValues();
        let lastIndex = vs.length;
        for (let i = 0; i < vs.length; i++) {
            if (vs[i][0].toString() == "") {
                lastIndex = i;
            }
        }
        vs.splice(lastIndex);

        let infos = new DbInfo();
        for (let r of vs) {
            let dbType = r[0].toString();
            let filename = r[1].toString();
            let tableId = r[2].toString();
            let info: DbInfoBase = { "filename": filename, "tableId": tableId };
            infos[dbType] = info;
        }
        return infos;
    }
    setTableIds(dbInfos: DbInfo) {
        let range = this.sheet.getRange(2, 4, this.sheet.getLastRow() - 1, 3);
        let values = range.getValues().map((row) => row.map((col) => col.toString()));
        let lastIndex = values.length;
        for (let i = 0; i < values.length; i++) {
            if (values[i][0] == "") {
                break;
            }
        }
        values.splice(lastIndex);

        let tableIds = values.map((row) => {
            let type = row[0].toString();
            return [dbInfos[type].tableId];
        });
        this.sheet.getRange(2, 6, lastIndex, 1).setValues(tableIds);
    }
}
