class TableInfoBase {
    filename: string = "";
    id: string = "";
}
class TableInfo {
    videoInfoTable: TableInfoBase;
    tagInfoTable: TableInfoBase;
    static columnOffset: { [key: string]: number } = { "type": 0, "filename": 1, "id": 2 };
    constructor() {
        this.videoInfoTable = new TableInfoBase();
        this.tagInfoTable = new TableInfoBase();
    }
    static getColumnSize() {
        return Object.keys(this.columnOffset).length;
    }
}
class MylistInfo {
    idOrUrl: string = "";
    title: string = "";
    author: string = "";
    update: string = "";
    last_entry: string = "";
    processed: string = "";
    result: string = "";
    static columnOffset: { [key: string]: number } = {
        "idOrUrl": 0, "title": 1, "author": 2,
        "update": 3, "last_entry": 4, "processed": 5, "result": 6
    };
    static getColumnSize() {
        return Object.keys(this.columnOffset).length;
    }
}

class ControlSheet {
    sheet: GoogleAppsScript.Spreadsheet.Sheet;
    mylistInfoOffset: number;
    tableInfoOffset: number;
    constructor() {
        this.sheet = SpreadsheetApp.getActive().getSheetByName("コントロールシート");
        this.mylistInfoOffset = 0;
        let offsets: number[] = [];
        for (let key in MylistInfo.columnOffset) {
            offsets.push(MylistInfo.columnOffset[key]);
        }
        let maxCol = Math.max.apply(null, offsets);
        this.tableInfoOffset = maxCol + 1;
    }
    getMylistInfoWithResults(): MylistInfo[] {
        let mylistInfos: MylistInfo[] = [];
        let range = this.sheet.getRange(2, this.mylistInfoOffset + 1, this.sheet.getLastRow() - 1, MylistInfo.getColumnSize());
        let lastResults = range.getValues().map((row) => row.map((col) => col.toString()));
        const o = MylistInfo.columnOffset;
        for (let result of lastResults) {
            if (result[o["idOrUrl"]] == "") {
                break;
            }
            let mylistInfo = new MylistInfo();
            for (let key in MylistInfo.columnOffset) {
                mylistInfo[key] = result[o[key]];
            }
            mylistInfos.push(mylistInfo);
        }
        return mylistInfos;
    }
    setlastEntryDate(i: number, last_entry: string) {
        this.sheet.getRange(2 + i, this.mylistInfoOffset + MylistInfo.columnOffset["last_entry"] + 1, 1,1).
            setValues([[last_entry]]);
    }
    setMylistInfo(i: number, title: string, author: string, updated: string) {
        this.sheet.getRange(2 + i, this.mylistInfoOffset + MylistInfo.columnOffset["title"] + 1, 1,3).
            setValues([[title, author, updated]]);
    }
    setResult(i: number, processed: string, result: string) {
        this.sheet.getRange(2 + i, this.mylistInfoOffset + MylistInfo.columnOffset["processed"] + 1, 1, 2).
            setValues([[processed, result]]);
        SpreadsheetApp.flush();
    }
    getTableInfos() {
        let range = this.sheet.getRange(2, this.tableInfoOffset + 1, this.sheet.getLastRow() - 1, TableInfo.getColumnSize());
        let values = range.getValues().map((row) => row.map((col) => col.toString()));
        const o = TableInfo.columnOffset;
        let lastIndex = values.length;
        for (let i = 0; i < values.length; i++) {
            if (values[i][o["type"]] == "") {
                lastIndex = i;
            }
        }
        values.splice(lastIndex);

        let infos = new TableInfo();
        for (let r of values) {
            let info = new TableInfoBase();
            let type = "";
            for (let key in o) {
                if (key == "type") {
                    type = r[o[key]];
                } else {
                    info[key] = r[o[key]];
                }
            }
            infos[type] = info;
        }
        return infos;
    }
    setTableIds(tableInfos: TableInfo) {
        let range = this.sheet.getRange(2, this.tableInfoOffset + 1, this.sheet.getLastRow() - 1, TableInfo.getColumnSize());
        let values = range.getValues().map((row) => row.map((col) => col.toString()));
        const o = TableInfo.columnOffset;
        let lastIndex = values.length;
        for (let i = 0; i < values.length; i++) {
            if (values[i][o["type"]] == "") {
                lastIndex = i;
                break;
            }
        }
        values.splice(lastIndex);

        let tableIds = values.map((row) => {
            let type = row[o["type"]];
            return [tableInfos[type].id];
        });
        this.sheet.getRange(2, this.tableInfoOffset + TableInfo.columnOffset["id"] + 1, lastIndex, 1).setValues(tableIds);
    }
}
