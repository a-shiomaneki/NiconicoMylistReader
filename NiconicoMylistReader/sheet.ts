class ControlSheet {
    sheet: GoogleAppsScript.Spreadsheet.Sheet;
    constructor() {
        this.sheet = SpreadsheetApp.getActive().getSheetByName("コントロールシート");
    }
    getMylistIds() {
        let r = this.sheet.getRange(2, 1, this.sheet.getLastRow() - 1, 3);
        let ids = r.getValues();
        return ids;
    }
    setResult(i: number, updated) {
        this.sheet.getRange(2 + i, 2, 1, 2).setValues([[updated, ""]]);
    }
    setError(i: number, error) {
        this.sheet.getRange(2 + i, 3).setValue(error);
    }
    getDbInfos() {
        let vs = this.sheet.getRange(2, 4, this.sheet.getLastRow() - 1, 3).getValues();
        let i: number;
        for (i = 0; i < vs.length; i++) {
            if (vs[i][0] == "") {
                break;
            }
        }
        vs.splice(i);

        let items = ["filename", "dbkey"];
        let infos = {};
        vs.forEach(function (r, i) {
            let key = r[0];
            r.shift();
            let rItems = {};
            items.forEach(function (item, j) {
                rItems[item] = r[j];
            });
            infos[key] = rItems;
        });
        return infos;
    }
    setDbKeys(dbInfos) {
        let vs = this.sheet.getRange(2, 4, this.sheet.getLastRow() - 1, 3).getValues();
        let i: number;
        for (i = 0; i < vs.length; i++) {
            if (vs[i][0] == "") {
                break;
            }
        }
        vs.splice(i);
        let rs = vs.map((row) => [dbInfos[row[0]].dbkey]);
        this.sheet.getRange(2, 6, vs.length, 1).setValues(rs);
    }
}

function setVideoInfos(id: string, rows: any) {
    let columnItems = ["マイリスト登録時間", "タイトル", "id", "URL",
        "サムネ", "投稿", "長さ", "再生", "マイリス",
        "投稿者", "タグ"];
    try {
        let sh = SpreadsheetApp.getActive().getSheetByName(id);
        rows.unshift(columnItems);
        let rg = sh.getRange(1, 1, rows.length, columnItems.length);
        rg.setValues(rows);
    } catch (error) {
        let e = error;
        Logger.log(e);
        throw e;
    }
}