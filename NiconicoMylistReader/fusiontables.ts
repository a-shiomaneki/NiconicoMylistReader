namespace FusionTables {
    export interface TableResource {
        "kind": "fusiontables#table",
        "tableId": string,
        "name": string,
        "columns": [
            ColumnResource
        ],
        "description": string,
        "isExportable": boolean,
        "attribution": string,
        "attributionLink": string,
        "baseTableIds": [
            string
        ],
        "sql": string
    }
    export interface ColumnResource {
        "kind": "fusiontables#column",
        "columnId": number,
        "name": string,
        "type": string,
        "baseColumn": {
            "tableIndex": number,
            "columnId": number
        }
    }
    export interface Table {
        importRows(tableId: string, rowsBlob: GoogleAppsScript.Base.Blob): { [key: string]: any };
        insert(resource: { [key: string]: any }): TableResource;
        remove(dbid: string): void;
    }
    export interface Query {
        sql(sql: string): { [key: string]: any };
    }
    export interface FusionTables {
        Table: Table;
        Query: Query;
    }
}
declare var FusionTables: FusionTables.FusionTables;

class MylistTable {
    tableId: string = "";
    static videoColTitle: string[] = ["title", "id", "link", "description",
        "thumbnail_url", "first_retrieve", "length", "view_counter", "comment_num",
        "mylist_counter", "user_nickname", "tag", "list_url", "entry_date"];
    static tagColTitle: string[] = ["id", "tag"];

    storeData(str: string): void {
        let rowsBlob: GoogleAppsScript.Base.Blob;
        let isDone: boolean = false;

        do {
            try {
                rowsBlob = Utilities.newBlob(str, "application/octet-stream");
                FusionTables.Table.importRows(this.tableId, rowsBlob);
                isDone = true;
                Logger.log("importRows:OK");
            } catch (error) {
                do {
                    try {
                        rowsBlob = Utilities.newBlob(str, "application/octet-stream");
                        FusionTables.Table.importRows(this.tableId, rowsBlob);
                        Logger.log("importRows:OK");
                    } catch (error) {
                        Logger.log(error);
                        if (error.message.lastIndexOf("try again") > 0) {
                            isDone = false;
                        } else {
                            throw error;
                        }
                    }
                } while (isDone === false);

                Logger.log(error);
                if (error.message.lastIndexOf("try again") > 0) {
                    isDone = false;
                } else {
                    throw error;
                }
            }
        } while (isDone === false);
    }
    createTable(name: string): string {
        let resource: { [key: string]: any } = {
            "name": name,
            "isExportable": false,
            "kind": "fusiontables#table",
        };
        let post: { [key: string]: any } = MylistTable.videoColTitle.map((name: string) => {
            let type: string;
            let formatPattern: string;
            let columnJsonSchema: string;
            switch (name) {
                case "first_retrieve":
                case "length":
                case "entry_date":
                    type = "DATETIME";
                    formatPattern = "NONE";
                    break;
                case "link":
                case "list_url":
                    type = "STRING";
                    formatPattern = "STRING_LINK";
                    break;
                case "thumbnail_url":
                    type = "STRING";
                    formatPattern = "STRING_FOUR_LINE_IMAGE";
                    break;
                case "view_counter":
                case "mylist_counter":
                    type = "NUMBER";
                    formatPattern = "NONE";
                    break;
                case "tag":
                    type = "STRING";
                    //formatPattern = "STRING_JSON_LIST";
                    formatPattern = "STRING_JSON_TEXT";
                    columnJsonSchema = "{ \"type\": \"array\" }";
                    break;
                default:
                    type = "STRING";
                    formatPattern = "NONE";
                    break;
            }
            let c: { [key: string]: string };
            if (formatPattern.match(/JSON/)) {
                c = {
                    "kind": "fusiontables#column",
                    "name": name,
                    "type": type,
                    "formatPattern": formatPattern,
                    "columnJsonSchema": columnJsonSchema
                }
            } else {
                c = {
                    "kind": "fusiontables#column",
                    "name": name,
                    "type": type,
                    "formatPattern": formatPattern
                }
            }
            return c;
        });

        resource.columns = post;
        let response = FusionTables.Table.insert(resource);
        this.tableId = response.tableId;
        return this.tableId;
    }
    getUpdatedVideos(videos): { [key: string]: string }[] {
        let sql = "SELECT id FROM " + this.tableId + ";";
        let rows: string[] = FusionTables.Query.sql(sql).rows;
        let ids: { [key: string]: string } = {};
        if (rows != undefined) {
            if (rows.length >= 1) {
                for (const row of rows) {
                    ids[row[0]] = row[1];
                }
            }
        }
        let results: { [key: string]: string }[] = [];
        for (const aVideo of videos) {
            let id = aVideo["id"];
            let update = ids[id];
            if (update == undefined) {
                results.push(aVideo);
            }
        }
        return results;
    }
    deleteTable(): void {
        if (this.tableId) {
            try {
                FusionTables.Table.remove(this.tableId);
            } catch (error) {
                let e = error;
                Logger.log(e);
                throw e;
            }
        }
    }
}

//function storeData(str: string, dbid: string): void {
//    let rowsBlob: GoogleAppsScript.Base.Blob;
//    let isDone: boolean = false;

//    do {
//        try {
//            rowsBlob = Utilities.newBlob(str, "application/octet-stream");
//            FusionTables.Table.importRows(dbid, rowsBlob);
//            isDone = true;
//            Logger.log("importRows:OK");
//        } catch (error) {
//            do {
//                try {
//                    rowsBlob = Utilities.newBlob(str, "application/octet-stream");
//                    FusionTables.Table.importRows(dbid, rowsBlob);
//                    Logger.log("importRows:OK");
//                } catch (error) {
//                    Logger.log(error);
//                    if (error.message.lastIndexOf("try again") > 0) {
//                        isDone = false;
//                    } else {
//                        throw error;
//                    }
//                }
//            } while (isDone === false);

//            Logger.log(error);
//            if (error.message.lastIndexOf("try again") > 0) {
//                isDone = false;
//            } else {
//                throw error;
//            }
//        }
//    } while (isDone === false);
//}

//const videoColTitle: string[] = ["title", "id", "link", "description",
//    "thumbnail_url", "first_retrieve", "length", "view_counter", "comment_num",
//    "mylist_counter", "user_nickname", "tag", "list_url", "entry_date"];
//const tagColTitle: string[] = ["id", "tag"];
//function createTable(name: string, columnTitle: string[]): string {
//    let resource: { [key: string]: any } = {
//        "name": name,
//        "isExportable": false,
//        "kind": "fusiontables#table",
//    };
//    let post: { [key: string]: any } = columnTitle.map((name: string) => {
//        let type: string;
//        let formatPattern: string;
//        let columnJsonSchema: string;
//        switch (name) {
//            case "first_retrieve":
//            case "length":
//            case "entry_date":
//                type = "DATETIME";
//                formatPattern = "NONE";
//                break;
//            case "link":
//            case "list_url":
//                type = "STRING";
//                formatPattern = "STRING_LINK";
//                break;
//            case "thumbnail_url":
//                type = "STRING";
//                formatPattern = "STRING_FOUR_LINE_IMAGE";
//                break;
//            case "view_counter":
//            case "mylist_counter":
//                type = "NUMBER";
//                formatPattern = "NONE";
//                break;
//            case "tag":
//                type = "STRING";
//                //formatPattern = "STRING_JSON_LIST";
//                formatPattern = "STRING_JSON_TEXT";
//                columnJsonSchema = "{ \"type\": \"array\" }";
//                break;
//            default:
//                type = "STRING";
//                formatPattern = "NONE";
//                break;
//        }
//        let c: { [key: string]: string };
//        if (formatPattern.match(/JSON/)) {
//            c = {
//                "kind": "fusiontables#column",
//                "name": name,
//                "type": type,
//                "formatPattern": formatPattern,
//                "columnJsonSchema": columnJsonSchema
//            }
//        } else {
//            c = {
//                "kind": "fusiontables#column",
//                "name": name,
//                "type": type,
//                "formatPattern": formatPattern
//            }
//        }
//        return c;
//    });

//    resource.columns = post;
//    return FusionTables.Table.insert(resource).tableId;
//}

//function getUpdatedVideos(key: string, videos): { [key: string]: string }[] {
//    let sql = "SELECT id FROM " + key + ";";
//    let rows: string[] = FusionTables.Query.sql(sql).rows;
//    let ids: { [key: string]: string } = {};
//    if (rows != undefined) {
//        if (rows.length >= 1) {
//            for (const row of rows) {
//                ids[row[0]] = row[1];
//            }
//        }
//    }
//    let results: { [key: string]: string }[] = [];
//    for (const aVideo of videos) {
//        let id = aVideo["id"];
//        let update = ids[id];
//        if (update == undefined) {
//            results.push(aVideo);
//        }
//    }
//    return results;
//}

//function deleteTable(): void {
//    let controlSheet = new ControlSheet();
//    let tableInfos = controlSheet.getTableInfos();
//    if (tableInfos.videoInfoTable.id) {
//        try {
//            FusionTables.Table.remove(tableInfos.videoInfoTable.id);
//        } catch (error) {
//            let e = error;
//            Logger.log(e);
//            throw e;
//        }
//        tableInfos.videoInfoTable.id = "";
//        delete tableInfos.tagInfoTable;
//        controlSheet.setTableIds(tableInfos);
//    }
//}