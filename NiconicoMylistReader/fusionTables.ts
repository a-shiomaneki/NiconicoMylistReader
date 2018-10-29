namespace FusionTables {
    export interface Table {
        importRows(dbid: string, rowsBlob: GoogleAppsScript.Base.Blob): { [key: string]: any };
        insert(resource: { [key: string]: any }): { [key: string]: any };
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

function storeData(str: string, dbid: string): void {
    let rowsBlob: GoogleAppsScript.Base.Blob;
    let isDone: boolean = true;

    do {
        try {
            rowsBlob = Utilities.newBlob(str, "application/octet-stream");
            FusionTables.Table.importRows(dbid, rowsBlob);
            isDone = true;
            Logger.log("importRows:OK");
        } catch (error) {
            do {
                try {
                    rowsBlob = Utilities.newBlob(str, "application/octet-stream");
                    FusionTables.Table.importRows(dbid, rowsBlob);
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

const videoColTitle: string[] = ["updated", "title", "id", "link", "description",
    "thumbnail_url", "first_retrieve", "length", "view_counter", "comment_num",
    "mylist_counter", "user_nickname", "tag"];
const tagColTitle: string[] = ["id", "tag"];
function createTable(name: string, columnTitle: string[]): void {
    let resource: { [key: string]: any } = {
        "name": name,
        "isExportable": false,
        "kind": "fusiontables#table",
    };
    let post: { [key: string]: any } = columnTitle.map(function (t: string) {
        let type: string;
        let formatPattern: string;
        switch (t) {
            case "updated":
            case "first_retrieve":
            case "length":
                type = "DATETIME";
                formatPattern = "NONE";
                break;
            case "link":
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
            default:
                type = "STRING";
                formatPattern = "NONE";
                break;
        }
        let c: { [key: string]: string } = {
            "name": t,
            "type": type,
            "formatPattern": formatPattern,
            "kind": "fusiontables#column"
        };
        return c;
    });

    resource.columns = post;
    return FusionTables.Table.insert(resource).tableId;
}

function getUpdatedVideos(key: string, videos): string[] {
    let sql = "SELECT id, updated FROM " + key + ";";
    let rows: string[] = FusionTables.Query.sql(sql).rows;
    let ids: { [key: string]: string } = {};
    if (rows != undefined) {
        if (rows.length >= 1) {
            rows.forEach((r) => {
                ids[r[0]] = r[1];
            });
        }
    }
    let results: string[] = [];
    videos.forEach((v: { [key: string]: string }) => {
        let id = v["id"];
        let update = ids[id];
        if (update == undefined) {
            results.push(v);
        }
    });

    return results;
}