namespace FusionTables {
    export interface Table {
        importRows(dbid: string, rowsBlob: GoogleAppsScript.Base.Blob): { [key: string]: string };
    }
    export interface FusionTables {
        Table: Table;
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
            } while (isDone == false);

            Logger.log(error);
            if (error.message.lastIndexOf("try again") > 0) {
                isDone = false;
            } else {
                throw error;
            }
        }
    } while (isDone == false);
}

const videoColTitle = ['updated', 'title', 'id', 'link', 'description', 'thumbnail_url', 'first_retrieve', 'length', 'view_counter', 'comment_num', 'mylist_counter', 'user_nickname', 'tag'];
const tagColTitle = ['id', 'tag'];
function createTable(name: string, columnTitle: string[]): void {
    let resource = {
        "name": name,
        "isExportable": false,
        "kind": "fusiontables#table",
    };
    let post = columnTitle.map(function (t: string) {
        let type;
        let formatPattern;
        switch (t) {
            case 'updated':
            case 'first_retrieve':
            case 'length':
                type = 'DATETIME';
                formatPattern = 'NONE';
                break;
            case 'link':
                type = 'STRING';
                formatPattern = 'STRING_LINK';
                break;
            case 'thumbnail_url':
                type = 'STRING';
                formatPattern = 'STRING_FOUR_LINE_IMAGE';
                break;
            case 'view_counter':
            case 'mylist_counter':
                type = 'NUMBER';
                formatPattern = 'NONE';
                break;
            default:
                type = 'STRING';
                formatPattern = 'NONE';
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
    let ids: string[] = {};
    if (rows != undefined) {
        if (rows.length >= 1) {
            rows.forEach((r) => {
                ids[r[0]] = r[1];
            });
        }
    }
    let results: Array<string> = [];
    videos.forEach((v) => {
        let id = v["id"];
        let update = ids[id];
        if (update == undefined) {
            results.push(v);
        }
    });

    return results;
}